import * as React from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { motion } from "framer-motion";
import { ModeToggle } from "@/components/ui/ModeToggle";
import {
	Check,
	ChevronLeft,
	ClipboardCopy,
	Gamepad2,
	Home,
	Maximize,
	User,
} from "lucide-react";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { TooltipProvider } from "@/components/ui/tooltip";

import { Logs } from "@/components/logs";
import { Settings } from "@/components/settings";
import { SystemMonitoring } from "@/components/system-monitoring";
import { StatsTopBar } from "@/components/statistics";
import useAppStore from '@/lib/store/app';
import { useEffect } from "react";
import ShortcutsMenu from "@/components/shortcuts-menu";

const menuItems = [
	"Video bitrate",
	"Video framerate",
	"Audio bitrate",
	"Logs",
	"Settings",
	"Statistics",
];

export function MenuComponent() {
	const {
		videoBitRate,
		videoBitRateOptions,
		videoFramerate,
		videoFramerateOptions,
		audioBitRate,
		audioBitRateOptions,
		setVideoBitRate,
		setVideoFramerate,
		setAudioBitRate
	} = useAppStore();

	const [isOpen, setIsOpen] = React.useState(false);
	const [showMonitoring, setShowMonitoring] = React.useState(false);
	const [showStats, setShowStats] = React.useState(false);

	useEffect(() => {
		const handleKeyDown = (event: KeyboardEvent) => {
			const { enterFullscreen } = useAppStore.getState();

			if (event.ctrlKey && event.shiftKey && event.key === "M") {
				event.preventDefault();
				setIsOpen((prev) => !prev);
			}

			if (event.ctrlKey && event.shiftKey && event.key === "F") {
				event.preventDefault();
				enterFullscreen();
			}

			let escapeTimer: NodeJS.Timeout;
			if (event.key === "Escape") {
				escapeTimer = setTimeout(() => {
					if (document.fullscreenElement) {
						enterFullscreen();
					}
				}, 500);
			}

			return () => {
				if (escapeTimer) {
					clearTimeout(escapeTimer);
				}
			};
		};

		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, []);

	// 1. Header Related Functions
	const renderHeaderComponents = () => {
		const { clipboardStatus, enableClipboard, gamepad, getUsername } = useAppStore();

		const renderMenuHeader = () => (
			<div className="flex items-center justify-between border-b p-2">
				<div className="flex gap-1">
					<Tooltip>
						<TooltipTrigger>
							<Button 
								variant="ghost" 
								size="icon" 
								className="h-8 w-8"
								onClick={clipboardStatus === 'enabled' ? undefined : enableClipboard}
							>
								<ClipboardCopy className="h-4 w-4" />
							</Button>
						</TooltipTrigger>
						<TooltipContent>
							{clipboardStatus === 'enabled' 
								? `Clipboard status: ${clipboardStatus}`
								: 'Enable clipboard access'
							}
						</TooltipContent>
					</Tooltip>
					<Tooltip>
						<TooltipTrigger>
							<Button variant="ghost" size="icon" className="h-8 w-8" asChild>
								<a href="./">
									<Home className="h-4 w-4" />
								</a>
							</Button>
						</TooltipTrigger>
						<TooltipContent>Return to launcher</TooltipContent>
					</Tooltip>
					<Tooltip>
						<TooltipTrigger>
							<Button variant="ghost" size="icon" className="h-8 w-8">
								<Gamepad2 className="h-4 w-4" />
							</Button>
						</TooltipTrigger>
						<TooltipContent>
							{gamepad.gamepadState === 'connected' 
								? `Gamepad connected: ${gamepad.gamepadName}`
								: 'Gamepad disconnected'
							}
						</TooltipContent>
					</Tooltip>
					<Tooltip>
						<TooltipTrigger>
							<Button variant="ghost" size="icon" className="h-8 w-8 ml-2">
								<User className="h-4 w-4" />
							</Button>
						</TooltipTrigger>
						<TooltipContent>Logged in as {getUsername()}</TooltipContent>
					</Tooltip>
				</div>
				<Button
					variant="ghost"
					size="icon"
					className="h-8 w-8"
					onClick={() => {
						if (document.fullscreenElement) {
							document.exitFullscreen();
						} else {
							document.documentElement.requestFullscreen();
						}
						setIsOpen(false);
					}}
				>
					<Maximize className="h-4 w-4" />
				</Button>
			</div>
		);

		return { menuHeader: renderMenuHeader() };
	};

	// 2. Menu Related Functions
	const renderMenuComponents = () => {
		const handleOptionSelect = (item: string, optionText: string) => {
			const option = (() => {
				switch (item) {
					case "Video bitrate": return videoBitRateOptions.find(opt => opt.text === optionText);
					case "Video framerate": return videoFramerateOptions.find(opt => opt.text === optionText);
					case "Audio bitrate": return audioBitRateOptions.find(opt => opt.text === optionText);
					default: return null;
				}
			})();

			if (option) {
				switch (item) {
					case "Video bitrate": setVideoBitRate(option.value); break;
					case "Video framerate": setVideoFramerate(option.value); break;
					case "Audio bitrate": setAudioBitRate(option.value); break;
				}
			}
		};

		const getDisplayText = (value: number, options: Array<{ text: string; value: number }>) => {
			const option = options.find(opt => opt.value === value);
			return option ? option.text : "";
		};

		const getOptionsForItem = (item: string) => {
			switch (item) {
				case "Video bitrate": return videoBitRateOptions.map(opt => opt.text);
				case "Video framerate": return videoFramerateOptions.map(opt => opt.text);
				case "Audio bitrate": return audioBitRateOptions.map(opt => opt.text);
				default: return [];
			}
		};

		const renderStatisticsMenuItem = () => {
			const renderStatsBar = () => (
				showStats && <StatsTopBar toggleStats={() => setShowStats(false)} />
			);

			const renderCheckbox = () => (
				<div className="flex items-center px-3 py-1.5">
					<Checkbox
						checked={showStats}
						onCheckedChange={(checked) => setShowStats(checked as boolean)}
					/>
					<span className="ml-2">Statistics</span>
				</div>
			);

			return {
				checkbox: renderCheckbox(),
				statsBar: renderStatsBar()
			};
		};
		const renderSystemMonitoring = () => {
			const renderCheckbox = () => (
				<div className="flex w-full items-center px-3 py-1.5 text-sm">
					<label htmlFor="show-monitoring" className="flex items-center space-x-2">
						<Checkbox
							id="show-monitoring"
							checked={showMonitoring}
							onCheckedChange={(checked) => setShowMonitoring(checked as boolean)}
						/>
						<span>Monitoring</span>
					</label>
				</div>
			);

			const renderWindow = () => showMonitoring && (
				<motion.div
					initial={{ opacity: 0, scale: 0.95 }}
					animate={{ opacity: 1, scale: 1 }}
					exit={{ opacity: 0, scale: 0.95 }}
					className="fixed top-4 right-4 origin-top-right"
				>
					<SystemMonitoring scale={1.8} />
				</motion.div>
			);

			return { checkbox: renderCheckbox(), window: renderWindow() };
		};

		const renderBitrateMenuItem = (item: string) => {
			const selectedValue = item === "Video bitrate" 
				? getDisplayText(videoBitRate, videoBitRateOptions)
				: item === "Video framerate"
					? getDisplayText(videoFramerate, videoFramerateOptions)
					: getDisplayText(audioBitRate, audioBitRateOptions);

			return (
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button variant="ghost" className="flex w-full items-center px-3 py-1.5 text-sm hover:bg-accent group">
							<ChevronLeft className="h-4 w-4 mr-2 flex-shrink-0" />
							<div className="flex flex-1 justify-between items-center">
								<span className="text-left">{item}</span>
								{/* <span className="text-muted-foreground text-xs">{selectedValue}</span> */}
							</div>
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent side="left" align="start" className="w-[140px]">
						<ScrollArea className="h-[200px]">
							{getOptionsForItem(item).map((option) => (
								<DropdownMenuItem
									key={option}
									onClick={(e) => {
										e.stopPropagation();
										handleOptionSelect(item, option);
									}}
									className="justify-between"
								>
									{option}
									{option === selectedValue && <Check className="h-4 w-4" />}
								</DropdownMenuItem>
							))}
						</ScrollArea>
					</DropdownMenuContent>
				</DropdownMenu>
			);
		};

		const renderMenuItem = (item: string) => {
			switch (item) {
				case "Logs": return <Logs key={item} />;
				case "Settings": return <Settings key={item} />;
				case "Statistics": return renderStatisticsMenuItem().checkbox;
				case "Video bitrate":
				case "Video framerate":
				case "Audio bitrate":
					return renderBitrateMenuItem(item);
				default: return null;
			}
		};

		const renderMenuContent = () => (
			<ScrollArea className="flex-grow py-2">
				{menuItems.map((item) => (
					<React.Fragment key={item}>
						{renderMenuItem(item)}
					</React.Fragment>
				))}
				{renderSystemMonitoring().checkbox}
				<ShortcutsMenu />
			</ScrollArea>
		);

		return {
			content: renderMenuContent(),
			monitoring: renderSystemMonitoring().window,
			statsBar: renderStatisticsMenuItem().statsBar
		};
	};

	// 3. Footer Related Functions
	const renderFooterComponents = () => {
		const renderMenuFooter = () => (
			<div className="border-t p-2">
				<div className="flex items-center justify-between">
					<a href="https://github.com/selkies-project/selkies-gstreamer" target="_blank" rel="noopener noreferrer">
						<img
							src="/horizontal.png"
							alt="footer Logo"
							className="h-7 object-contain"
						/>
						{/* <span className="text-lg font-semibold pl-4">Selkies</span> */}
					</a>
					<ModeToggle />
				</div>
			</div>
		);

		return { footer: renderMenuFooter() };
	};

	// 4. Utility Functions
	const renderMenuWrapper = () => {
		const renderMenuButton = () => (
			<Button
				variant="default"
				size="icon"
				className="absolute -left-8 top-1/2 -translate-y-1/2 rounded-l-lg border-r-0 shadow-md backdrop-blur-sm opacity-50 hover:opacity-100 transition-all duration-200"
				onClick={() => setIsOpen(!isOpen)}
			>
				<ChevronLeft className={`h-4 w-4 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} />
			</Button>
		);

		return (
			<div className="fixed right-0 top-1/2 -translate-y-1/2 z-50">
				<div className={`transition-transform duration-300 ${
					isOpen ? "translate-x-0" : "translate-x-[calc(100%+6px)]"
				}`}>
					{renderMenuButton()}
					<div className="min-w-[200px] max-w-[300px] border bg-background/80 backdrop-blur-sm rounded-l-lg shadow-lg flex flex-col">
						{renderHeaderComponents().menuHeader}
						{renderMenuComponents().content}
						{renderFooterComponents().footer}
					</div>
				</div>
			</div>
		);
	};

	// Main Render
	return (
		<TooltipProvider>
			<div className="h-screen w-screen">
				{renderMenuComponents().statsBar}
				{renderMenuComponents().monitoring}
				{renderMenuWrapper()}
			</div>
		</TooltipProvider>
	);
}