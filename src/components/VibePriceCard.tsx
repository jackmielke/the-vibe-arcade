export const VibePriceCard = () => {
  return (
    <div className="bg-glass/20 backdrop-blur-xl border-2 border-glass-border/30 rounded-3xl p-8 shadow-[var(--glass-glow)] hover:shadow-[var(--glass-intense)] hover:bg-glass/30 transition-all duration-300 hover:scale-105">
      <div className="text-sm text-muted-foreground mb-2 uppercase tracking-wider font-semibold">$VIBE</div>
      <div className="text-6xl font-black text-primary drop-shadow-[0_0_10px_hsl(var(--primary)/0.5)]">2.15</div>
      <div className="mt-2 text-xs text-accent font-medium">+12.5% 24h</div>
    </div>
  );
};
