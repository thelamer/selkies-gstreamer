import { create } from 'zustand';

declare global {
	class WebRTCDemo {
		constructor(signalling: any, element: HTMLVideoElement | HTMLAudioElement, id: number);
		signalling: any;
		element: HTMLVideoElement | HTMLAudioElement;
		input: WebRTCInput;
		peerConnection: any;
		cursor_cache: Map<string, string>;
		forceTurn: boolean;
		rtcPeerConfig: RTCConfiguration;
		playStream: () => void;
		connect: () => void;
		reset: () => void;
		sendDataChannelMessage: (message: string) => void;
		getConnectionStats: () => Promise<any>;
		_setStatus: (message: string) => void;
		_setError: (message: string) => void;
		// Event handlers
		onconnectionstatechange?: (state: string) => void;
		ondatachannelopen?: () => void;
		ondatachannelclose?: () => void;
		onplaystreamrequired?: () => void;
		onlatencymeasurement?: (latency_ms: number) => void;
		onsystemstats?: (stats: any) => void;
		oncursorchange?: (handle: string, curdata: string, hotspot: { x: number; y: number } | null, override: string | null) => void;
		onsystemaction?: (action: string) => void;
		ongpustats?: (data: { load: number; memory_total: number; memory_used: number }) => void;
	}

	class WebRTCDemoSignalling {
		constructor(url: URL);
		disconnect: () => void;
		onstatus?: (message: string) => void;
		onerror?: (message: string) => void;
		ondisconnect?: () => void;
		ondebug?: (message: string) => void;
	}
}

// Helper functions
const stringToBase64 = (str: string) => {
    return btoa(decodeURIComponent(encodeURIComponent(str)));
};

// Types for the store state
interface ConnectionStats {
	connectionStatType: string;
	connectionLatency: number;
	connectionVideoLatency: number;
	connectionAudioLatency: number;
	connectionAudioCodecName: string;
	connectionAudioBitrate: number;
	connectionPacketsReceived: number;
	connectionPacketsLost: number;
	connectionBytesReceived: string;
	connectionBytesSent: string;
	connectionCodec: string;
	connectionVideoDecoder: string;
	connectionResolution: string;
	connectionFrameRate: number;
	connectionVideoBitrate: number;
	connectionAvailableBandwidth: string;
}

interface GPUStats {
	gpuLoad: number;
	gpuMemoryTotal: number;
	gpuMemoryUsed: number;
}

interface CPUStats {
	serverCPUUsage: number;
	serverMemoryTotal: number;
	serverMemoryUsed: number;
}

interface GamepadState {
	gamepadState: string;
	gamepadName: string;
}

interface WebRTCState {
	// WebRTC References
	webrtc: any;
	audio_webrtc: any;
	signalling: any;
	audio_signalling: any;
	videoElement: HTMLVideoElement | null;
	audioElement: HTMLAudioElement | null;

	// Application Settings
	appName: string;
	videoBitRate: number;
	videoBitRateOptions: Array<{ text: string; value: number }>;
	videoFramerate: number;
	videoFramerateOptions: Array<{ text: string; value: number }>;
	audioBitRate: number;
	audioBitRateOptions: Array<{ text: string; value: number }>;
	showStart: boolean;
	showDrawer: boolean;

	// Logging and Status
	logEntries: string[];
	debugEntries: string[];
	status: string;
	loadingText: string;
	clipboardStatus: string;
	windowResolution: [number, number] | null;
	encoderName: string;

	// State Objects

	gamepad: GamepadState;
	connectionStat: ConnectionStats;
	gpuStat: GPUStats;
	cpuStat: CPUStats;
	serverLatency: number;

	// Display Settings
	resizeRemote: boolean;
	scaleLocal: boolean;
	debug: boolean;
	turnSwitch: boolean;

	// Publishing State
	publishingAllowed: boolean;
	publishingIdle: boolean;
	publishingError: string;
	publishingAppName: string;
	publishingAppDisplayName: string;
	publishingAppDescription: string;
	publishingAppIcon: string;
	publishingValid: boolean;
}

interface WebRTCActions {
	// Event Handlers
	handleConnectionStateChange: (state: string, type: 'video' | 'audio') => void;
	handleDataChannelOpen: () => void;
	handleDataChannelClose: () => void;
	handleSystemAction: (action: string) => void;
	handleClipboardContent: (content: string) => void;
	handleCursorChange: (handle: string, curdata: string, hotspot: any, override: string) => void;
	handleSystemStats: (stats: any) => void;
	handleGPUStats: (data: any) => void;
	initializeWebRTC: () => void;
	checkPublishing: () => void;

	// Parameter Management
	getIntParam: (name: string, defaultValue: number) => number;
	setIntParam: (name: string, value: number) => void;
	getBoolParam: (name: string, defaultValue: boolean) => boolean;
	setBoolParam: (name: string, value: boolean) => void;
	getUsername: () => string;

	// Core Actions
	enterFullscreen: () => void;
	playStream: () => void;
	enableClipboard: () => void;
	publish: () => void;

	// State Setters
	setVideoBitRate: (value: number) => void;
	setVideoFramerate: (value: number) => void;
	setResizeRemote: (value: boolean) => void;
	setScaleLocal: (value: boolean) => void;
	setAudioBitRate: (value: number) => void;
	setTurnSwitch: (value: boolean) => void;
	setDebug: (value: boolean) => void;
	setShowDrawer: (value: boolean) => void;
	
	// Log Actions
	addLogEntry: (entry: string) => void;
	addDebugEntry: (entry: string) => void;
	
	// State Update Actions
	updateConnectionStat: (stat: Partial<ConnectionStats>) => void;
	updateGPUStat: (stat: Partial<GPUStats>) => void;
	updateCPUStat: (stat: Partial<CPUStats>) => void;
	updateGamepad: (gamepad: GamepadState) => void;
}

interface WebRTCInput {
	getWindowResolution: () => [number, number];
	getCursorScaleFactor: (options?: { remoteResolutionEnabled?: boolean }) => void;
	attach: () => void;
	detach: () => void;
	enterFullscreen: () => void;
	attach_context: () => void;
	detach_context: () => void;
	// Event handlers
	ongamepadconnected?: (gamepad_id: string) => void;
	ongamepaddisconnected?: () => void;
	onmenuhotkey?: () => void;
	onresizeend?: () => void;
}

const isClient = typeof window !== 'undefined';

const getInitialAppName = () => {
    if (!isClient) return "webrtc";
    return window.location.pathname.endsWith("/") ? 
        window.location.pathname.split("/")[1] : 
        "webrtc";
};

const useAppStore = create<WebRTCState & WebRTCActions>((set, get) => ({
	// WebRTC References
	webrtc: null,
	audio_webrtc: null,
	signalling: null,
	audio_signalling: null,
	videoElement: null,
	audioElement: null,

	// Initial State
	appName: getInitialAppName(),
	videoBitRate: 8000,
	videoBitRateOptions: [
		{ text: '250 kbps', value: 250 },
		{ text: '500 kbps', value: 500 },
		{ text: '1 mbps', value: 1000 },
		{ text: '2 mbps', value: 2000 },
		{ text: '4 mbps', value: 4000 },
		{ text: '8 mbps', value: 8000 },
		{ text: '16 mbps', value: 16000 },
		{ text: '20 mbps', value: 20000 },
		{ text: '25 mbps', value: 25000 },
		{ text: '30 mbps', value: 30000 },
		{ text: '40 mbps', value: 40000 },
		{ text: '50 mbps', value: 50000 },
		{ text: '60 mbps', value: 60000 },
		{ text: '75 mbps', value: 75000 },
		{ text: '80 mbps', value: 80000 },
		{ text: '100 mbps', value: 100000 },
		{ text: '150 mbps', value: 150000 },
		{ text: '200 mbps', value: 200000 },
		{ text: '300 mbps', value: 300000 },
		{ text: '400 mbps', value: 400000 },

	],
	videoFramerate: 60,
	videoFramerateOptions: [
		{ text: '10 fps', value: 10 },
		{ text: '15 fps', value: 15 },
		{ text: '30 fps', value: 30 },
		{ text: '45 fps', value: 45 },
		{ text: '60 fps', value: 60 },
		{ text: '75 fps', value: 75 },
		{ text: '90 fps', value: 90 },
		{ text: '100 fps', value: 100 },
		{ text: '120 fps', value: 120 },
		{ text: '144 fps', value: 144 },
		{ text: '165 fps', value: 165 },
		{ text: '180 fps', value: 180 },
		{ text: '200 fps', value: 200 },
		{ text: '240 fps', value: 240 },
	],
	audioBitRate: 128000,
	audioBitRateOptions: [
		{ text: '24 kb/s', value: 24000 },
		{ text: '32 kb/s', value: 32000 },
		{ text: '48 kb/s', value: 48000 },
		{ text: '64 kb/s', value: 64000 },
		{ text: '96 kb/s', value: 96000 },
		{ text: '128 kb/s', value: 128000 },
		{ text: '192 kb/s', value: 192000 },
		{ text: '256 kb/s', value: 256000 },
		{ text: '320 kb/s', value: 320000 },
		{ text: '510 kb/s', value: 510000 },
	],
	showStart: false,
	showDrawer: false,
	logEntries: [],
	debugEntries: [],
	status: 'connecting',
	loadingText: '',
	clipboardStatus: 'disabled',
	windowResolution: null,
	encoderName: "",
	gamepad: {
		gamepadState: 'disconnected',
		gamepadName: 'none',
	},
	connectionStat: {
		connectionStatType: "unknown",
		connectionLatency: 0,
		connectionVideoLatency: 0,
		connectionAudioLatency: 0,
		connectionAudioCodecName: "NA",
		connectionAudioBitrate: 0,
		connectionPacketsReceived: 0,
		connectionPacketsLost: 0,
		connectionBytesReceived: "0 MBytes",
		connectionBytesSent: "0 MBytes",
		connectionCodec: "unknown",
		connectionVideoDecoder: "unknown",
		connectionResolution: "",
		connectionFrameRate: 0,
		connectionVideoBitrate: 0,
		connectionAvailableBandwidth: "0 mbps"
	},
	gpuStat: {
		gpuLoad: 0,
		gpuMemoryTotal: 0,
		gpuMemoryUsed: 0
	},
	cpuStat: {
		serverCPUUsage: 0,
		serverMemoryTotal: 0,
		serverMemoryUsed: 0
	},
	serverLatency: 0,
	resizeRemote: true,
	scaleLocal: false,
	debug: false,
	turnSwitch: false,
	publishingAllowed: false,
	publishingIdle: false,
	publishingError: "",
	publishingAppName: "",
	publishingAppDisplayName: "",
	publishingAppDescription: "",
	publishingAppIcon: "",
	publishingValid: false,

	// Parameter Management Actions
	getIntParam: (name, defaultValue) => {
		if (!isClient) return defaultValue;
		const prefixedKey = `${get().appName}_${name}`;
		return parseInt(window.localStorage.getItem(prefixedKey) || defaultValue.toString());
	},

	setIntParam: (name, value) => {
		if (!isClient || value === null) return;
		const prefixedKey = `${get().appName}_${name}`;
		window.localStorage.setItem(prefixedKey, value.toString());
	},

	getBoolParam: (name, defaultValue) => {
		if (!isClient) return defaultValue ?? false;
		const prefixedKey = `${get().appName}_${name}`;
		const value = window.localStorage.getItem(prefixedKey);
		if (value === null) {
			return defaultValue ?? false;
		}
		return value.toLowerCase() === "true";
	},

	setBoolParam: (name, value) => {
		if (!isClient || value === null) return;
		const prefixedKey = `${get().appName}_${name}`;
		window.localStorage.setItem(prefixedKey, value.toString());
	},

	getUsername: () => {
		if (!isClient) return "webrtc";
		const getCookieValue = (name: string) => {
			const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
			return match ? match[2] : '';
		};
		return (getCookieValue(`broker_${get().appName}`) || "webrtc").split("#")[0];
	},

	// Core Actions
	enterFullscreen: () => {
		if (!isClient) return;
		const state = get();
		if (state.webrtc?.input?.enterFullscreen) {
			if (state.showDrawer) {
				set({ showDrawer: false });
			}
			state.webrtc.input.enterFullscreen();
		}
	},

	playStream: () => {
		const state = get();
		state.webrtc?.playStream();
		state.audio_webrtc?.playStream();
		set({ showStart: false });
	},

	enableClipboard: () => {
		const state = get();
		navigator.clipboard.readText()
			.then(() => {
				set({ clipboardStatus: 'enabled' });
				state.webrtc?.sendDataChannelMessage("cr");
			})
			.catch(err => {
				state.webrtc?._setError('Failed to read clipboard contents: ' + err);
			});
	},

initializeWebRTC: () => {
    if (!isClient) {
        console.log("initializeWebRTC: Not running in a client environment, exiting.");
        return;
    }
    console.log("initializeWebRTC: Starting WebRTC initialization...");

    // Add PWA service worker registration
    if ('serviceWorker' in navigator) {
        console.log("initializeWebRTC: Service worker API is available in navigator.");
        navigator.serviceWorker.register('./sw.js?ts=CACHE_VERSION')
            .then(registration => {
                console.log('initializeWebRTC: Service worker registered successfully:', registration);
            })
            .catch(error => {
                console.error('initializeWebRTC: Service worker registration failed:', error);
            });
    } else {
        console.log("initializeWebRTC: Service worker API is NOT available in navigator.");
    }

    const videoElement = document.getElementById("stream") as HTMLVideoElement;
    const audioElement = document.getElementById("audio_stream") as HTMLAudioElement;

    if (!videoElement) {
        console.error("initializeWebRTC: ERROR! Video element with ID 'stream' not found in the DOM!");
    } else {
        console.log("initializeWebRTC: Video element 'stream' found:", videoElement);
    }

    if (!audioElement) {
        console.error("initializeWebRTC: ERROR! Audio element with ID 'audio_stream' not found in the DOM!");
    } else {
        console.log("initializeWebRTC: Audio element 'audio_stream' found:", audioElement);
    }

    if (!videoElement || !audioElement) {
        console.error("initializeWebRTC: One or both of video/audio elements are missing, aborting initialization.");
        return; // Stop further execution if elements are missing
    }

    // Add video element loadeddata event listener
    videoElement.addEventListener('loadeddata', () => {
        console.log("initializeWebRTC: 'loadeddata' event fired on video element. Calling getCursorScaleFactor.");
        get().webrtc?.input?.getCursorScaleFactor();
    });
    console.log("initializeWebRTC: 'loadeddata' event listener added to video element.");

    set({ videoElement, audioElement });
    console.log("initializeWebRTC: videoElement and audioElement state updated.");

    // Initialize WebRTC connections
    const protocol = location.protocol === "http:" ? "ws://" : "wss://";
    const pathname = window.location.pathname.slice(0, window.location.pathname.lastIndexOf("/") + 1);
    const baseURL = new URL(protocol + window.location.host + pathname + get().appName + "/signalling/");
    console.log("initializeWebRTC: Signalling baseURL constructed:", baseURL.href);

    console.log("initializeWebRTC: Creating WebRTCDemoSignalling for video signalling...");
    const signalling = new window.WebRTCDemoSignalling(baseURL);
    console.log("initializeWebRTC: WebRTCDemoSignalling for video created:", signalling);

    console.log("initializeWebRTC: Creating WebRTCDemo for video...");
    const webrtc = new window.WebRTCDemo(signalling, videoElement, 1);
    console.log("initializeWebRTC: WebRTCDemo for video created:", webrtc);

    console.log("initializeWebRTC: Creating WebRTCDemoSignalling for audio signalling...");
    const audio_signalling = new window.WebRTCDemoSignalling(baseURL);
    console.log("initializeWebRTC: WebRTCDemoSignalling for audio created:", audio_signalling);

    console.log("initializeWebRTC: Creating WebRTCDemo for audio...");
    const audio_webrtc = new window.WebRTCDemo(audio_signalling, audioElement, 3);
    console.log("initializeWebRTC: WebRTCDemo for audio created:", audio_webrtc);

    set({ signalling, webrtc, audio_signalling, audio_webrtc });
    console.log("initializeWebRTC: signalling, webrtc, audio_signalling, audio_webrtc state updated.");

    // Get initial window resolution
    const initialResolution = webrtc.input.getWindowResolution();
    set({ windowResolution: initialResolution });
    console.log("initializeWebRTC: Initial window resolution obtained:", initialResolution);

    if (get().scaleLocal === false && initialResolution) {
        console.log("initializeWebRTC: Applying initial video element style based on resolution and scaleLocal=false.");
        webrtc.element.style.width = `${initialResolution[0]/window.devicePixelRatio}px`;
        webrtc.element.style.height = `${initialResolution[1]/window.devicePixelRatio}px`;
        console.log(`initializeWebRTC: Video element style width set to: ${webrtc.element.style.width}, height set to: ${webrtc.element.style.height}`);
    } else {
        console.log("initializeWebRTC: scaleLocal is true or initialResolution is not available, skipping initial video element style adjustment.");
    }

    console.log("initializeWebRTC: Fetching TURN configuration from ./turn...");
    fetch("./turn")
        .then(response => {
            console.log("initializeWebRTC: TURN config fetch response received:", response);
            if (!response.ok) {
                console.error("initializeWebRTC: TURN config fetch failed with status:", response.status, response.statusText);
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then((config) => {
            console.log("initializeWebRTC: TURN config JSON parsed successfully:", config);
            webrtc.forceTurn = get().turnSwitch;
            audio_webrtc.forceTurn = get().turnSwitch;
            console.log("initializeWebRTC: forceTurn set for webrtc and audio_webrtc based on turnSwitch state.");

            if (config.iceServers && config.iceServers.length > 1) {
                get().addDebugEntry("[app] using TURN servers: " + config.iceServers[1].urls.join(", "));
                console.log("initializeWebRTC: Using TURN servers:", config.iceServers[1].urls.join(", "));
            } else {
                get().addDebugEntry("[app] no TURN servers found.");
                console.log("initializeWebRTC: No TURN servers found in config.");
            }

            webrtc.rtcPeerConfig = config;
            audio_webrtc.rtcPeerConfig = config;
            console.log("initializeWebRTC: rtcPeerConfig set for webrtc and audio_webrtc.");

            console.log("initializeWebRTC: Calling webrtc.connect()...");
            webrtc.connect();
            console.log("initializeWebRTC: webrtc.connect() called.");

            console.log("initializeWebRTC: Calling audio_webrtc.connect()...");
            audio_webrtc.connect();
            console.log("initializeWebRTC: audio_webrtc.connect() called.");

        })
        .catch(error => {
            console.error("initializeWebRTC: ERROR fetching or processing TURN config:", error);
        });

    // Add window focus/blur handlers
    window.addEventListener('focus', () => {
        console.log("initializeWebRTC: Window 'focus' event detected. Sending 'kr' (keyboard reset) and clipboard request.");
        // Reset keyboard to avoid stuck keys
        webrtc.sendDataChannelMessage("kr");

        // Send clipboard contents
        navigator.clipboard.readText()
            .then(text => {
                console.log("initializeWebRTC: Clipboard text read successfully, sending 'cw' message.");
                webrtc.sendDataChannelMessage("cw," + stringToBase64(text));
            })
            .catch(err => {
                console.warn("initializeWebRTC: Failed to read clipboard contents (this might be normal if clipboard access is not granted):", err);
                webrtc._setStatus('Failed to read clipboard contents: ' + err);
            });
    });
    console.log("initializeWebRTC: 'focus' event listener added to window.");

    window.addEventListener('blur', () => {
        console.log("initializeWebRTC: Window 'blur' event detected. Sending 'kr' (keyboard reset).");
        // Reset keyboard to avoid stuck keys
        webrtc.sendDataChannelMessage("kr");
    });
    console.log("initializeWebRTC: 'blur' event listener added to window.");

    console.log("initializeWebRTC: WebRTC initialization process started. Check console logs for further steps and potential errors.");
},
	handleConnectionStateChange: (state, type) => {
		const store = get();
		if (type === 'video') {
			if (state === "connected") {
				store.webrtc?.peerConnection?.getReceivers().forEach((receiver: any) => {
					let intervalLoop = setInterval(async () => {
						if (receiver.track.readyState !== "live" || receiver.transport.state !== "connected") {
							clearInterval(intervalLoop);
							return;
						} else {
							receiver.jitterBufferTarget = receiver.jitterBufferDelayHint = receiver.playoutDelayHint = 0;
						}
					}, 15);
				});
			}
		} else {
			if (state === "connected") {
				store.audio_webrtc?.peerConnection?.getReceivers().forEach((receiver: any) => {
					let intervalLoop = setInterval(async () => {
						if (receiver.track.readyState !== "live" || receiver.transport.state !== "connected") {
							clearInterval(intervalLoop);
							return;
						} else {
							receiver.jitterBufferTarget = receiver.jitterBufferDelayHint = receiver.playoutDelayHint = 0;
						}
					}, 15);
				});
			}
		}
		
		set({ status: state });
	},

	handleDataChannelOpen: () => {
		const state = get();
		if (!state.webrtc) return;

		// Bind gamepad handlers
		state.webrtc.input.ongamepadconnected = (gamepad_id: string) => {
			state.webrtc?._setStatus('Gamepad connected: ' + gamepad_id);
			set({ gamepad: { gamepadState: "connected", gamepadName: gamepad_id } });
		};

		state.webrtc.input.ongamepaddisconnected = () => {
			state.webrtc?._setStatus('Gamepad disconnected');
			set({ gamepad: { gamepadState: "disconnected", gamepadName: "none" } });
		};

		// Attach input handlers
		state.webrtc.input.attach();

		// Set up metrics interval
		setInterval(() => {
			const currentState = get();
			const stats = currentState.connectionStat;
			if (stats.connectionFrameRate === parseInt(stats.connectionFrameRate.toString(), 10)) {
				currentState.webrtc?.sendDataChannelMessage('_f,' + stats.connectionFrameRate);
			}
			if (stats.connectionLatency === parseInt(stats.connectionLatency.toString(), 10)) {
				currentState.webrtc?.sendDataChannelMessage('_l,' + stats.connectionLatency);
			}
		}, 5000);
	},

	handleDataChannelClose: () => {
		const state = get();
		state.webrtc?.input?.detach();
	},

	handleSystemAction: (action) => {
		const state = get();
		state.webrtc?._setStatus("Executing system action: " + action);

		if (action === 'reload') {
			setTimeout(() => {
				state.signalling?.disconnect();
			}, 700);
		} else if (action.startsWith('framerate')) {
			const framerateSetting = state.getIntParam("videoFramerate", 0);
			set({ videoFramerate: framerateSetting || parseInt(action.split(",")[1]) });
		} else if (action.startsWith('video_bitrate')) {
			const videoBitrateSetting = state.getIntParam("videoBitRate", 0);
			set({ videoBitRate: videoBitrateSetting || parseInt(action.split(",")[1]) });
		} else if (action.startsWith('audio_bitrate')) {
			const audioBitrateSetting = state.getIntParam("audioBitRate", 0);
			set({ audioBitRate: audioBitrateSetting || parseInt(action.split(",")[1]) });
		} else if (action.startsWith('resize')) {
			const resizeSetting = state.getBoolParam("resize", false);
			const newResizeValue = resizeSetting ?? (action.split(",")[1].toLowerCase() === 'true');
			set({ resizeRemote: newResizeValue });
			
			if (newResizeValue === false && state.getBoolParam("scaleLocal", false) === false) {
				set({ scaleLocal: true });
			}
		} else if (action.startsWith("resolution")) {
			const remote_res = action.split(",")[1];
			if (state.resizeRemote === true && state.webrtc?.element) {
				const [width, height] = remote_res.split("x").map(Number);
				if (!isNaN(width) && !isNaN(height)) {
					state.webrtc.element.style.width = `${width/window.devicePixelRatio}px`;
					state.webrtc.element.style.height = `${height/window.devicePixelRatio}px`;
					state.webrtc.input.getCursorScaleFactor({ remoteResolutionEnabled: true });
				}
			}

		} else if (action.startsWith("encoder")) {
			const encoderType = action.split(",")[1];
			set({ 
				encoderName: (encoderType.startsWith("nv") || encoderType.startsWith("va")) ? 
					`hardware (${encoderType})` : 
					`software (${encoderType})`
			});
		}
	},

	handleClipboardContent: (content) => {
		const state = get();
		if (state.clipboardStatus === 'enabled') {
			navigator.clipboard.writeText(content)
				.catch(err => {
					state.webrtc?._setStatus('Could not copy text to clipboard: ' + err);
				});
		}
	},

	handleCursorChange: (handle, curdata, hotspot, override) => {
		const state = get();
		if (!state.videoElement) return;

		if (parseInt(handle) === 0) {
			state.videoElement.style.cursor = "auto";
			return;
		}
		
		if (override) {
			state.videoElement.style.cursor = override;
			return;
		}

		if (!state.webrtc?.cursor_cache.has(handle)) {
			const cursor_url = "url('data:image/png;base64," + curdata + "')";
			state.webrtc.cursor_cache.set(handle, cursor_url);
		}

		const cursor_url = state.webrtc.cursor_cache.get(handle);
		state.videoElement.style.cursor = hotspot ? 
			`${cursor_url} ${hotspot.x} ${hotspot.y}, auto` : 
			`${cursor_url}, auto`;
	},

	handleSystemStats: (stats) => {
		const state = get();
		if (state.showDrawer && (stats.cpu_percent !== undefined || stats.mem_total !== undefined || stats.mem_used !== undefined)) {
			set({
				cpuStat: {
					serverCPUUsage: stats.cpu_percent?.toFixed(0) ?? state.cpuStat.serverCPUUsage,
					serverMemoryTotal: stats.mem_total ?? state.cpuStat.serverMemoryTotal,
					serverMemoryUsed: stats.mem_used ?? state.cpuStat.serverMemoryUsed
				}
			});
		}
	},

	handleGPUStats: (data) => {
		const state = get();
		if (state.showDrawer) {
			set({
				gpuStat: {
					gpuLoad: Math.round(data.load * 100),
					gpuMemoryTotal: data.memory_total,
					gpuMemoryUsed: data.memory_used
				}
			});
		}
	},

	publish: () => {
		const state = get();
		const data = {
			name: state.publishingAppName,
			displayName: state.publishingAppDisplayName,
			description: state.publishingAppDescription,
			icon: state.publishingAppIcon,
		};

		fetch(`./publish/${state.appName}`, {
			method: "POST",
			headers: { "content-type": "application/json" },
			body: JSON.stringify(data),
		})
			.then(response => response.json())
			.then(response => {
				if (response.code === 201) {
					set({ publishingIdle: false });
				} else {
					set({ publishingError: response.status });
				}
			});
	},

	// State Setters with Side Effects
	setVideoBitRate: (value) => {
		set({ videoBitRate: value });
		get().setIntParam("videoBitRate", value);
	},

	setVideoFramerate: (value) => {
		set({ videoFramerate: value });
		get().setIntParam("videoFramerate", value);
	},

	setResizeRemote: (value) => {
		set({ resizeRemote: value });
		get().setBoolParam("resizeRemote", value);
	},

	setScaleLocal: (value) => {
		set({ scaleLocal: value });
		get().setBoolParam("scaleLocal", value);
	},

	setAudioBitRate: (value) => {
		set({ audioBitRate: value });
		get().setIntParam("audioBitRate", value);
	},

	setTurnSwitch: (value) => {
		set({ turnSwitch: value });
		get().setBoolParam("turnSwitch", value);
	},

	setDebug: (value) => {
		set({ debug: value });
		get().setBoolParam("debug", value);
	},

	setShowDrawer: (value) => {
		set({ showDrawer: value });
	},

	// Log Actions
	addLogEntry: (entry) => {
		const now = new Date();
        const ts = now.getHours() + ":" + now.getMinutes() + ":" + now.getSeconds();
        const timestampedEntry = "[" + ts + "] " + entry;
        set(state => ({ logEntries: [...state.logEntries, timestampedEntry] }));
	},

	addDebugEntry: (entry) => {
		const now = new Date();
        const ts = now.getHours() + ":" + now.getMinutes() + ":" + now.getSeconds();
        const timestampedEntry = "[" + ts + "] " + entry;
        set(state => ({ debugEntries: [...state.debugEntries, timestampedEntry] }));
	},

	// State Update Actions
	updateConnectionStat: (stat) => {
		set(state => ({
			connectionStat: { ...state.connectionStat, ...stat }
		}));
	},

	updateGPUStat: (stat) => {
		set(state => ({
			gpuStat: { ...state.gpuStat, ...stat }
		}));
	},

	updateCPUStat: (stat) => {
		set(state => ({
			cpuStat: { ...state.cpuStat, ...stat }
		}));
	},

	updateGamepad: (gamepad) => {
		set({ gamepad });
	},

	checkPublishing: () => {
		const state = get();
		fetch("./publish/" + state.appName)
			.then((response) => response.json())
			.then((response) => {
				if (response.code < 400) {
					set({ 
						publishingAllowed: true,
						publishingIdle: true 
					});
				}
				if (response.code === 201) {
					set({ publishingIdle: false });
					setTimeout(() => {
						get().checkPublishing();
					}, 1000);
				}
			});
	},
}));

export default useAppStore;
