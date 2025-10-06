import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { Trash2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface GameCommentsProps {
  gameId: string;
}

export const GameComments = ({ gameId }: GameCommentsProps) => {
  const [newComment, setNewComment] = useState("");
  const [currentUser, setCurrentUser] = useState<any>(null);
  const { toast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  useEffect(() => {
    getCurrentUser();
  }, []);

  const getCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setCurrentUser(user);
  };

  const { data: comments = [], isLoading } = useQuery({
    queryKey: ['comments', gameId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('comments')
        .select(`
          *,
          profiles(username, avatar_url)
        `)
        .eq('game_id', gameId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
  });

  const createCommentMutation = useMutation({
    mutationFn: async (content: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('comments')
        .insert({ game_id: gameId, user_id: user.id, content });

      if (error) throw error;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['comments', gameId] });
      await queryClient.refetchQueries({ queryKey: ['comments', gameId] });
      setNewComment("");
      toast({
        title: "Comment added",
        description: "Your comment has been posted",
      });
    },
    onError: (error) => {
      console.error('Comment creation error:', error);
      toast({
        title: "Error",
        description: "Failed to post comment",
        variant: "destructive",
      });
    },
  });

  const deleteCommentMutation = useMutation({
    mutationFn: async (commentId: string) => {
      const { error } = await supabase
        .from('comments')
        .delete()
        .eq('id', commentId);

      if (error) throw error;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['comments', gameId] });
      await queryClient.refetchQueries({ queryKey: ['comments', gameId] });
      toast({
        title: "Comment deleted",
        description: "Your comment has been removed",
      });
    },
    onError: (error) => {
      console.error('Comment deletion error:', error);
      toast({
        title: "Error",
        description: "Failed to delete comment",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      toast({
        title: "Sign in required",
        description: "Please sign in to comment",
      });
      navigate('/auth');
      return;
    }

    if (!newComment.trim()) return;
    createCommentMutation.mutate(newComment);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-foreground">Comments</h2>

      {/* Comment Form */}
      <form onSubmit={handleSubmit} className="space-y-3">
        <Textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder={currentUser ? "Share your thoughts..." : "Sign in to comment"}
          className="min-h-[100px] bg-glass/10 border-glass-border/20"
          disabled={!currentUser}
        />
        <Button
          type="submit"
          disabled={!newComment.trim() || createCommentMutation.isPending}
          className="w-full sm:w-auto"
        >
          {createCommentMutation.isPending ? "Posting..." : "Post Comment"}
        </Button>
      </form>

      {/* Comments List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="text-center text-muted-foreground py-8">Loading comments...</div>
        ) : comments.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            No comments yet. Be the first to share your thoughts!
          </div>
        ) : (
          comments.map((comment: any) => (
            <div
              key={comment.id}
              className="bg-glass/10 backdrop-blur-xl border border-glass-border/20 rounded-lg p-4 space-y-2"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  {comment.profiles?.avatar_url && (
                    <img
                      src={comment.profiles.avatar_url}
                      alt={comment.profiles.username}
                      className="w-8 h-8 rounded-full"
                    />
                  )}
                  <div>
                    <p className="font-medium text-foreground">
                      {comment.profiles?.username || 'Anonymous'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                    </p>
                  </div>
                </div>
                {currentUser?.id === comment.user_id && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteCommentMutation.mutate(comment.id)}
                    disabled={deleteCommentMutation.isPending}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                )}
              </div>
              <p className="text-foreground/90 whitespace-pre-wrap">{comment.content}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
