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

interface Comment {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  profiles: {
    username: string;
    avatar_url: string;
  } | null;
}

export const GameComments = ({ gameId }: GameCommentsProps) => {
  const [newComment, setNewComment] = useState("");
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setCurrentUserId(user?.id || null);
  };

  const { data: comments = [], isLoading } = useQuery({
    queryKey: ['comments', gameId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('comments')
        .select(`
          id,
          content,
          created_at,
          user_id,
          profiles(username, avatar_url)
        `)
        .eq('game_id', gameId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching comments:', error);
        throw error;
      }
      return data as Comment[];
    },
  });

  const createCommentMutation = useMutation({
    mutationFn: async (content: string) => {
      if (!currentUserId) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('comments')
        .insert({ 
          game_id: gameId, 
          user_id: currentUserId, 
          content 
        })
        .select(`
          id,
          content,
          created_at,
          user_id,
          profiles(username, avatar_url)
        `)
        .single();

      if (error) {
        console.error('Error creating comment:', error);
        throw error;
      }
      return data as Comment;
    },
    onMutate: async (content) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['comments', gameId] });

      // Snapshot previous value
      const previousComments = queryClient.getQueryData<Comment[]>(['comments', gameId]);

      // Optimistically update with temporary comment
      const { data: { user } } = await supabase.auth.getUser();
      const { data: profile } = await supabase
        .from('profiles')
        .select('username, avatar_url')
        .eq('id', currentUserId!)
        .single();

      const optimisticComment: Comment = {
        id: `temp-${Date.now()}`,
        content,
        created_at: new Date().toISOString(),
        user_id: currentUserId!,
        profiles: profile || { username: 'You', avatar_url: '' }
      };

      queryClient.setQueryData<Comment[]>(
        ['comments', gameId],
        (old = []) => [optimisticComment, ...old]
      );

      return { previousComments };
    },
    onSuccess: () => {
      setNewComment("");
      queryClient.invalidateQueries({ queryKey: ['comments', gameId] });
      toast({
        title: "Comment posted",
        description: "Your comment has been added",
      });
    },
    onError: (error, _, context) => {
      // Rollback on error
      if (context?.previousComments) {
        queryClient.setQueryData(['comments', gameId], context.previousComments);
      }
      console.error('Comment mutation error:', error);
      toast({
        title: "Error",
        description: "Failed to post comment. Please try again.",
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

      if (error) {
        console.error('Error deleting comment:', error);
        throw error;
      }
    },
    onMutate: async (commentId) => {
      await queryClient.cancelQueries({ queryKey: ['comments', gameId] });
      const previousComments = queryClient.getQueryData<Comment[]>(['comments', gameId]);

      // Optimistically remove comment
      queryClient.setQueryData<Comment[]>(
        ['comments', gameId],
        (old = []) => old.filter(c => c.id !== commentId)
      );

      return { previousComments };
    },
    onSuccess: () => {
      toast({
        title: "Comment deleted",
        description: "Your comment has been removed",
      });
    },
    onError: (error, _, context) => {
      if (context?.previousComments) {
        queryClient.setQueryData(['comments', gameId], context.previousComments);
      }
      console.error('Delete mutation error:', error);
      toast({
        title: "Error",
        description: "Failed to delete comment",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentUserId) {
      toast({
        title: "Sign in required",
        description: "Please sign in to comment",
      });
      navigate('/auth');
      return;
    }

    const trimmedComment = newComment.trim();
    if (!trimmedComment) {
      toast({
        title: "Empty comment",
        description: "Please enter a comment",
        variant: "destructive",
      });
      return;
    }

    createCommentMutation.mutate(trimmedComment);
  };

  return (
    <div className="space-y-6" id="comments-section">
      <h2 className="text-2xl font-bold text-foreground">Comments</h2>

      {/* Comment Form */}
      <form onSubmit={handleSubmit} className="space-y-3">
        <Textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder={currentUserId ? "Share your thoughts..." : "Sign in to comment"}
          className="min-h-[100px] bg-glass/10 border-glass-border/20"
          disabled={!currentUserId || createCommentMutation.isPending}
        />
        <Button
          type="submit"
          disabled={!currentUserId || !newComment.trim() || createCommentMutation.isPending}
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
          comments.map((comment) => (
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
                {currentUserId === comment.user_id && (
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
