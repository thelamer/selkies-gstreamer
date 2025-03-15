import { motion, AnimatePresence } from "framer-motion";
import { Video, Volume2, Info, ChevronUp } from "lucide-react"; 
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import useAppStore from '@/lib/store/app';
import React from "react";

// StatItem Component
interface StatItemProps {
    label: string;
    value: string | number;
}

const StatItem = ({ label, value }: StatItemProps) => (
    <div className="flex justify-between items-center py-1">
        <span className="text-sm text-muted-foreground">{label}</span>
        <span className="text-sm font-medium">{value}</span>
    </div>
);

interface StatsTopBarProps {
    toggleStats: () => void;
}

export function StatsTopBar({ toggleStats }: StatsTopBarProps) {
    const [showDetails, setShowDetails] = React.useState(false);
    const { connectionStat, videoBitRate, audioBitRate } = useAppStore();

    const toggleDetails = () => {
        setShowDetails((prev) => !prev);
    };

    return (
        <>
            <motion.div
                initial={{ y: "-100%" }}
                animate={{ y: 0 }}
                exit={{ y: "-100%" }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="fixed top-0 left-0 right-0 mx-auto z-50 w-fit rounded-lg border bg-background/80 backdrop-blur-sm shadow-lg"
            >
                <div className="flex items-center space-x-4 px-4 py-2">
                    <div className="flex items-center space-x-2">
                        <Video className="h-4 w-4 text-primary" />
                        <div className="text-sm">
                            <span className="font-medium">{connectionStat.connectionResolution}</span>
                            <span className="text-muted-foreground"> @ </span>
                            <span className="font-medium">{connectionStat.connectionFrameRate} FPS</span>
                        </div>
                        <div className="text-sm">
                            <span className="text-muted-foreground">Bitrate: </span>
                            <span className="font-medium">{videoBitRate / 1000} Mbps</span>
                        </div>
                    </div>
                    <Separator orientation="vertical" className="h-6" />
                    <div className="flex items-center space-x-2">
                        <Volume2 className="h-4 w-4 text-primary" />
                        <div className="text-sm">
                            <span className="text-muted-foreground">Sample Rate: </span>
                            <span className="font-medium">48 kHz</span>
                        </div>
                        <div className="text-sm">
                            <span className="text-muted-foreground">Bitrate:</span>
                            <span className="font-medium">{audioBitRate / 1000} kbps</span>
                        </div>
                    </div>
                    <div className="flex items-center space-x-1">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={toggleDetails}
                        >
                            <Info className="h-4 w-4" />
                            <span className="sr-only">Toggle stats</span>
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={toggleStats}
                        >
                            <ChevronUp className="h-4 w-4" />
                            <span className="sr-only">Hide stats</span>
                        </Button>
                    </div>
                </div>
            </motion.div>

            <StatsDetails show={showDetails} />
        </>
    );
}

interface StatsDetailsProps {
    show: boolean;
}

const StatsDetails: React.FC<StatsDetailsProps> = ({ show }) => {
    const { connectionStat, status, encoderName, windowResolution } = useAppStore();

    return (
        <AnimatePresence>
            {show && (
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="fixed top-12 left-0 right-0 mx-auto z-20 w-fit"
                >
                    <Card className="w-[300px]">
                        <Tabs defaultValue="connection" className="w-full">
                            <TabsList className="grid w-full grid-cols-3">
                                <TabsTrigger value="connection">Connection</TabsTrigger>
                                <TabsTrigger value="video">Video</TabsTrigger>
                                <TabsTrigger value="audio">Audio</TabsTrigger>
                            </TabsList>

                            <TabsContent value="connection">
                            <CardContent className="space-y-1">
                                <StatItem label="Connection State" value={status} />
                                <StatItem label="Connection Type" value={connectionStat.connectionStatType} />
                                <StatItem label="Packets Received" value={connectionStat.connectionPacketsReceived} />
                                <StatItem label="Packets Lost" value={connectionStat.connectionPacketsLost} />
                                <StatItem label="Bytes Received" value={connectionStat.connectionBytesReceived} />
                                <StatItem label="Bytes Sent" value={connectionStat.connectionBytesSent} />
                            </CardContent>
                        </TabsContent>
                            <TabsContent value="video">
                                <CardContent className="space-y-1">
                                    <StatItem label="Latency" value={`${connectionStat.connectionVideoLatency} ms`} />
                                    <StatItem label="Video Codec" value={connectionStat.connectionCodec} />
                                    <StatItem label="Video Encoder" value={encoderName} />
                                    <StatItem label="Window Size" value={`${windowResolution?.[0]}x${windowResolution?.[1]}`} />
                                    <StatItem label="Framerate" value={`${connectionStat.connectionFrameRate} fps`} />
                                    <StatItem label="Bitrate" value={`${connectionStat.connectionVideoBitrate} mbps`} />
                                    <StatItem label="Available Bandwidth" value={connectionStat.connectionAvailableBandwidth} />
                                </CardContent>
                            </TabsContent>
                            <TabsContent value="audio">
                                <CardContent className="space-y-1">
                                    <StatItem label="Latency" value={`${connectionStat.connectionAudioLatency} ms`} />
                                    <StatItem label="Codec" value={connectionStat.connectionAudioCodecName} />
                                    <StatItem label="Bitrate" value={`${connectionStat.connectionAudioBitrate} kbps`} />
                                </CardContent>
                            </TabsContent>
                        </Tabs>
                    </Card>
                </motion.div>
            )}
        </AnimatePresence>
    );
};