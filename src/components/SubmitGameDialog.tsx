import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
export const SubmitGameDialog = () => {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingMetadata, setIsFetchingMetadata] = useState(false);
  const [playUrl, setPlayUrl] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [codebaseUrl, setCodebaseUrl] = useState("");
  const fetchMetadata = async () => {
    if (!playUrl) {
      toast.error("Please enter a game URL first");
      return;
    }
    setIsFetchingMetadata(true);
    try {
      const {
        data,
        error
      } = await supabase.functions.invoke('fetch-metadata', {
        body: {
          url: playUrl
        }
      });
      if (error) throw error;
      if (data) {
        setTitle(data.title || "");
        setDescription(data.description || "");
        setThumbnailUrl(data.thumbnail_url || "");
        toast.success("Metadata loaded successfully!");
      }
    } catch (error) {
      console.error('Error fetching metadata:', error);
      toast.error("Failed to fetch metadata. You can fill in the details manually.");
    } finally {
      setIsFetchingMetadata(false);
    }
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!playUrl || !title) {
      toast.error("Game URL and title are required");
      return;
    }
    setIsLoading(true);
    try {
      const {
        error
      } = await supabase.from('games').insert({
        play_url: playUrl,
        title,
        description: description || null,
        thumbnail_url: thumbnailUrl || null,
        codebase_url: codebaseUrl || null,
        creator_id: null,
        // Anonymous submission
        status: 'pending'
      });
      if (error) throw error;
      toast.success("Game submitted successfully! It will be reviewed soon.");

      // Reset form
      setPlayUrl("");
      setTitle("");
      setDescription("");
      setThumbnailUrl("");
      setCodebaseUrl("");
      setOpen(false);
    } catch (error) {
      console.error('Error submitting game:', error);
      toast.error("Failed to submit game. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };
  return <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="glass" size="sm" className="gap-2">
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">Submit</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Submit a Game</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="playUrl">Game URL *</Label>
            <div className="flex gap-2">
              <Input id="playUrl" type="url" placeholder="https://example.com/game" value={playUrl} onChange={e => setPlayUrl(e.target.value)} required />
              <Button type="button" variant="outline" onClick={fetchMetadata} disabled={isFetchingMetadata || !playUrl}>
                {isFetchingMetadata ? <Loader2 className="h-4 w-4 animate-spin" /> : "Auto-fill"}
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input id="title" placeholder="Game title" value={title} onChange={e => setTitle(e.target.value)} required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" placeholder="Brief description of the game" value={description} onChange={e => setDescription(e.target.value)} rows={3} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="thumbnailUrl">Cover Image URL</Label>
            <Input id="thumbnailUrl" type="url" placeholder="https://example.com/image.jpg" value={thumbnailUrl} onChange={e => setThumbnailUrl(e.target.value)} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="codebaseUrl">Codebase URL (optional)</Label>
            <Input id="codebaseUrl" type="url" placeholder="https://github.com/username/repo" value={codebaseUrl} onChange={e => setCodebaseUrl(e.target.value)} />
            <p className="text-sm text-muted-foreground">Share your code so others can contribute and remix this project!</p>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </> : "Submit Game"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>;
};