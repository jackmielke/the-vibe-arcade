export const VibePriceCard = () => {
  return (
    <div className="inline-flex items-center gap-2 bg-glass/10 backdrop-blur-xl border border-glass-border/20 rounded-full px-3 py-1.5 shadow-[var(--glass-glow)] hover:bg-glass/20 transition-all">
      <div className="text-xs text-muted-foreground font-medium">$VIBE</div>
      <div className="text-sm font-bold text-primary">2.15</div>
      <div className="text-xs text-accent font-medium">+12.5%</div>
    </div>
  );
};
