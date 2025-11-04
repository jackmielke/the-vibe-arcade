import { useState, useEffect } from "react";
import { Clock, ExternalLink, Sparkles } from "lucide-react";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";

export const BuildathonCountdown = () => {
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });
  const [isComplete, setIsComplete] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Calculate target date: Tomorrow at 3pm Argentina time (UTC-3)
  const getTargetDate = () => {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    // Set to 3pm Argentina time (15:00 ART = 18:00 UTC)
    tomorrow.setUTCHours(18, 0, 0, 0);
    
    return tomorrow;
  };

  useEffect(() => {
    setMounted(true);
    
    const calculateTimeLeft = () => {
      const target = getTargetDate();
      const now = new Date();
      const difference = target.getTime() - now.getTime();

      if (difference <= 0) {
        setIsComplete(true);
        return { hours: 0, minutes: 0, seconds: 0 };
      }

      const hours = Math.floor(difference / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      return { hours, minutes, seconds };
    };

    setTimeLeft(calculateTimeLeft());

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  if (!mounted) return null;

  const formatTime = (num: number) => String(num).padStart(2, '0');

  if (isComplete) {
    return (
      <HoverCard>
        <HoverCardTrigger asChild>
          <a
            href="https://youtube.com/live/placeholder"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-primary/20 to-accent/20 border border-primary/30 hover:border-primary/50 transition-all group animate-pulse"
          >
            <Sparkles className="h-4 w-4 text-primary animate-spin" style={{ animationDuration: '3s' }} />
            <span className="text-sm font-medium text-foreground">
              Buildathon Live Now!
            </span>
            <ExternalLink className="h-3 w-3 text-muted-foreground group-hover:text-foreground transition-colors" />
          </a>
        </HoverCardTrigger>
        <HoverCardContent className="w-64 bg-background/95 backdrop-blur-md border-glass-border/30">
          <div className="space-y-2">
            <p className="text-sm text-foreground/80">
              The Vibe Buildathon is happening now! Join the livestream to watch creators build amazing games.
            </p>
          </div>
        </HoverCardContent>
      </HoverCard>
    );
  }

  return (
    <HoverCard>
      <HoverCardTrigger asChild>
        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-glass/20 backdrop-blur-md border border-glass-border/30 hover:border-accent/50 transition-all cursor-pointer">
          <Clock className="h-4 w-4 text-primary" />
          <div className="flex items-center gap-1 text-sm font-medium text-foreground tabular-nums">
            <span>{formatTime(timeLeft.hours)}</span>
            <span className="text-muted-foreground">:</span>
            <span>{formatTime(timeLeft.minutes)}</span>
            <span className="text-muted-foreground">:</span>
            <span>{formatTime(timeLeft.seconds)}</span>
          </div>
        </div>
      </HoverCardTrigger>
      <HoverCardContent className="w-64 bg-background/95 backdrop-blur-md border-glass-border/30">
        <div className="space-y-3">
          <div className="flex items-start gap-2">
            <Sparkles className="h-5 w-5 text-primary mt-0.5" />
            <div>
              <h4 className="text-sm font-semibold text-foreground">Vibe Buildathon</h4>
              <p className="text-xs text-muted-foreground mt-1">
                Starts tomorrow at 3pm ART
              </p>
            </div>
          </div>
          <p className="text-sm text-foreground/80">
            Watch creators build amazing games live! The countdown will update when the livestream is available.
          </p>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
};
