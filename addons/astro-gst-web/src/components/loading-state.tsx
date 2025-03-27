import { LoaderCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import useAppStore from '@/lib/store/app';
import { useEffect } from 'react';

interface LoadingStateProps {
  className?: string;
}

export function LoadingState({ className }: LoadingStateProps) {
  const {
    status,
    showStart,
    loadingText,
    playStream,
    signalling,
    initializeWebRTC
  } = useAppStore();

  useEffect(() => {
    setTimeout(() => {
      initializeWebRTC();
    }, 1000);
  }, [initializeWebRTC]);

  const handleReload = () => {
    // Disconnect signalling before reload
    signalling?.disconnect();
    setTimeout(() => {
      window.location.reload();
    }, 700);
  };

  return (
    <div className={cn(
      "fixed inset-0 flex flex-col items-center justify-center",
      className
    )}>
      {status === 'failed' ? (
        <>
          <Button
            onClick={handleReload}
            variant="secondary"
          >
            reload
          </Button>
          <div className="mt-4 text-muted-foreground">Connection failed.</div>
        </>
      ) : (
        <>
          {status !== 'connected' && (
            <>
              <LoaderCircle className="h-12 w-12 animate-spin text-muted-foreground" />
              <div className="mt-4 text-muted-foreground">{loadingText || "Connecting..."}</div>
            </>
          )}

          {status === 'connected' && showStart && (
            <Button
              onClick={playStream}
              variant="secondary"
              className="mt-4"
            >
              Start
            </Button>
          )}
        </>
      )}
    </div>
  );
}
