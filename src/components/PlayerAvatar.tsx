interface PlayerAvatarProps {
  name: string;
  avatar: string;
}

export const PlayerAvatar = ({ name, avatar }: PlayerAvatarProps) => {
  return (
    <div className="flex flex-col items-center gap-2 group">
      <div className="w-24 h-24 rounded-full bg-glass/10 backdrop-blur-md border-2 border-glass-border/20 overflow-hidden hover:border-accent transition-all hover:scale-110 shadow-glow">
        <img 
          src={avatar} 
          alt={name}
          className="w-full h-full object-cover"
        />
      </div>
      <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
        {name}
      </span>
    </div>
  );
};
