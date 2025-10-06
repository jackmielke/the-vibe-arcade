export const VibePriceCard = () => {
  return (
    <div className="inline-flex items-center gap-3 bg-glass/10 backdrop-blur-xl border border-glass-border/20 rounded-full px-4 py-2 shadow-[var(--glass-glow)] hover:bg-glass/20 transition-all">
      <div className="text-xs text-muted-foreground uppercase tracking-wider">$VIBE</div>
      <div className="text-2xl font-bold text-primary">2.15</div>
      <div className="text-xs text-accent font-medium">+12.5%</div>
    </div>
  );
};
