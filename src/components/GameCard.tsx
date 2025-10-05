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
    <div className="bg-glass/10 backdrop-blur-md border border-glass-border/20 rounded-2xl overflow-hidden hover:bg-glass/20 hover:scale-105 transition-all duration-300 shadow-glow group">
      <div className="aspect-video bg-gradient-to-br from-accent/20 to-neon-cyan/20 relative overflow-hidden">
        <img 
          src={image} 
          alt={title}
          className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity"
        />
      </div>
      <div className="p-6">
        <div className="flex items-start gap-3 mb-3">
          {rank && (
            <span className="text-4xl font-black text-accent/40">#{rank}</span>
          )}
          <div className="flex-1">
            <h3 className="text-2xl font-bold text-foreground mb-2">{title}</h3>
            <div className="flex gap-2 mb-3">
              {platforms.map((platform) => (
                <Badge key={platform} variant="secondary" className="bg-muted/50">
                  {platform}
                </Badge>
              ))}
            </div>
          </div>
        </div>
        <p className="text-muted-foreground">{description}</p>
      </div>
    </div>
  );
};
