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
}

declare module 'webrtc-adapter' {
    const adapter: any; // Replace 'any' with the correct adapter type
    export default adapter;
}
