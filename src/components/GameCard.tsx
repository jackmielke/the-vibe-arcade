import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { LikeButton } from "@/components/LikeButton";
import { CommentCount } from "@/components/CommentCount";

interface GameCardProps {
  id: string;
  title: string;
  description: string;
  platforms: string[];
  image: string;
  rank?: number;
  creatorProfile?: {
    username: string;
    avatar_url: string;
  } | null;
  isAnonymous?: boolean;
}

export const GameCard = ({ id, title, description, platforms, image, rank, creatorProfile, isAnonymous }: GameCardProps) => {
  const navigate = useNavigate();

  return (
    <div 
      className="bg-glass/20 backdrop-blur-xl border-2 border-glass-border/20 rounded-xl overflow-hidden hover:bg-glass/30 hover:scale-[1.02] transition-all duration-300 shadow-[var(--glass-glow)] hover:shadow-[var(--glass-intense)] group cursor-pointer"
      onClick={() => navigate(`/game/${id}`)}
    >
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
      <div className="p-4 space-y-3">
        <div>
          <h3 className="text-xl font-bold text-foreground mb-1 line-clamp-1">{title}</h3>
          <p className="text-sm text-muted-foreground line-clamp-2">{description}</p>
        </div>
        
        <div className="flex items-center justify-between gap-2">
          <div className="flex gap-2">
            {platforms.map((platform) => (
              <Badge key={platform} variant="secondary" className="bg-muted/50 text-xs">
                {platform}
              </Badge>
            ))}
          </div>
          <div className="flex items-center gap-1">
            <LikeButton gameId={id} />
            <CommentCount gameId={id} />
          </div>
        </div>

        {!isAnonymous && creatorProfile && (
          <div className="flex items-center gap-2 pt-2 border-t border-glass-border/10">
            <img 
              src={creatorProfile.avatar_url} 
              alt={creatorProfile.username}
              className="w-6 h-6 rounded-full"
            />
            <span className="text-xs text-muted-foreground">by {creatorProfile.username}</span>
          </div>
        )}
      </div>
    </div>
  );
};
