import { Badge } from "@/components/ui/badge";

interface GameCardProps {
  title: string;
  description: string;
  platforms: string[];
  image: string;
  rank?: number;
}

export const GameCard = ({ title, description, platforms, image, rank }: GameCardProps) => {
  return (
    <div className="bg-glass/20 backdrop-blur-xl border-2 border-glass-border/20 rounded-xl overflow-hidden hover:bg-glass/30 hover:scale-[1.02] transition-all duration-300 shadow-[var(--glass-glow)] hover:shadow-[var(--glass-intense)] group cursor-pointer">
      <div className="aspect-video bg-gradient-to-br from-accent/20 to-neon-cyan/20 relative overflow-hidden">
        <img 
          src={image} 
          alt={title}
          className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity"
        />
        {rank && (
          <span className="absolute top-2 left-2 text-3xl font-black text-primary/60 drop-shadow-lg">
            #{rank}
          </span>
        )}
      </div>
      <div className="p-4">
        <h3 className="text-xl font-bold text-foreground mb-1 line-clamp-1">{title}</h3>
        <p className="text-sm text-muted-foreground line-clamp-2 mb-2">{description}</p>
        <div className="flex gap-2">
          {platforms.map((platform) => (
            <Badge key={platform} variant="secondary" className="bg-muted/50 text-xs">
              {platform}
            </Badge>
          ))}
        </div>
      </div>
    </div>
  );
};
