import { useEffect, useState } from "react";
import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

interface CommentCountProps {
  gameId: string;
}

export const CommentCount = ({ gameId }: CommentCountProps) => {
  const [commentCount, setCommentCount] = useState(0);

  useEffect(() => {
    fetchCommentCount();
  }, [gameId]);

  const fetchCommentCount = async () => {
    const { count } = await supabase
      .from('comments')
      .select('*', { count: 'exact', head: true })
      .eq('game_id', gameId);

    setCommentCount(count || 0);
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      className="gap-2 hover:bg-primary/10"
    >
      <MessageCircle className="h-4 w-4 text-foreground/60" />
      <span className="text-sm text-foreground/80">{commentCount}</span>
    </Button>
  );
};
