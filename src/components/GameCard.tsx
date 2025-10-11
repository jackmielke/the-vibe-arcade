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
  likeCount?: number;
  commentCount?: number;
}

export const GameCard = ({ id, title, description, platforms, image, rank, creatorProfile, isAnonymous, likeCount, commentCount }: GameCardProps) => {
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
          {!isAnonymous && creatorProfile && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/profile`); // TODO: navigate to creator's profile when we have profile pages per user
              }}
              className="flex-shrink-0 hover:opacity-80 transition-opacity"
            >
              <img 
                src={creatorProfile.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${creatorProfile.username}`}
                alt={creatorProfile.username}
                className="w-8 h-8 rounded-full border-2 border-glass-border/20"
              />
            </button>
          )}
          <div className="flex gap-2 flex-1">
            {platforms.map((platform) => (
              <Badge key={platform} variant="secondary" className="bg-muted/50 text-xs">
                {platform}
              </Badge>
            ))}
          </div>
          <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
            <LikeButton gameId={id} initialLikeCount={likeCount} />
            <CommentCount gameId={id} initialCommentCount={commentCount} />
          </div>
        </div>
      </div>
    </div>
  );
};
