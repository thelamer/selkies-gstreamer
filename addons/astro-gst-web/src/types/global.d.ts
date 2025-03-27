import { useAppStore } from '@/lib/scripts/app';

interface WebRTCConnection {
    forceTurn: boolean;
    addEventListener(event: string, callback: (...args: any[]) => void): void;
    removeEventListener(event: string, callback: (...args: any[]) => void): void;
}

declare global {
    interface Window {
        webrtc: WebRTCConnection;
        store: typeof useAppStore;
        adapter: any; // Replace 'any' with the correct adapter type
    }
    var Input: any;
    var GamepadManager: any;
}

declare module 'webrtc-adapter' {
    const adapter: any; // Replace 'any' with the correct adapter type
    export default adapter;
}
