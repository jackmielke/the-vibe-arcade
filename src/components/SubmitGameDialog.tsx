import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Loader2, Upload, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const SubmitGameDialog = () => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingMetadata, setIsFetchingMetadata] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [playUrl, setPlayUrl] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [codebaseUrl, setCodebaseUrl] = useState("");

  // Auto-fetch metadata when URL is pasted or changed
  useEffect(() => {
    const timer = setTimeout(() => {
      if (playUrl && playUrl.startsWith('http')) {
        fetchMetadata();
      }
    }, 500); // Debounce for 500ms

    return () => clearTimeout(timer);
  }, [playUrl]);

  const fetchMetadata = async () => {
    if (!playUrl || !playUrl.startsWith('http')) {
      return;
    }

    setIsFetchingMetadata(true);
    try {
      const { data, error } = await supabase.functions.invoke('fetch-metadata', {
        body: { url: playUrl }
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

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error("Please upload an image file");
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be less than 5MB");
      return;
    }

    setIsUploadingImage(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
      const filePath = fileName;

      const { error: uploadError } = await supabase.storage
        .from('game-thumbnails')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('game-thumbnails')
        .getPublicUrl(filePath);

      setThumbnailUrl(publicUrl);
      toast.success("Image uploaded successfully!");
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error("Failed to upload image");
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleRemoveImage = () => {
    setThumbnailUrl("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
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
      const { data, error } = await supabase.from('games').insert({
        play_url: playUrl,
        title,
        description: description || null,
        thumbnail_url: thumbnailUrl || null,
        codebase_url: codebaseUrl || null,
        creator_id: null, // Anonymous submission
        status: 'pending'
      }).select().single();

      if (error) throw error;

      toast.success("Game submitted successfully! It will be reviewed soon.");
      
      // Reset form
      setPlayUrl("");
      setTitle("");
      setDescription("");
      setThumbnailUrl("");
      setCodebaseUrl("");
      setOpen(false);

      // Navigate to the game page
      if (data) {
        navigate(`/game/${data.id}`);
      }
    } catch (error) {
      console.error('Error submitting game:', error);
      toast.error("Failed to submit game. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="arcade" 
          size="lg" 
          className="gap-2 font-bold text-lg px-8 py-6 rounded-full shadow-[var(--glass-glow)] hover:shadow-[var(--glass-intense)] transition-all"
        >
          <Plus className="h-5 w-5" />
          Submit a Game
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
              <Input
                id="playUrl"
                type="url"
                placeholder="https://example.com/game"
                value={playUrl}
                onChange={(e) => setPlayUrl(e.target.value)}
                required
              />
              <Button
                type="button"
                variant="outline"
                onClick={fetchMetadata}
                disabled={isFetchingMetadata || !playUrl}
              >
                {isFetchingMetadata ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Auto-fill"
                )}
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              placeholder="Game title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Brief description of the game"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="thumbnailUpload">Cover Image</Label>
            {thumbnailUrl ? (
              <div className="relative">
                <img 
                  src={thumbnailUrl} 
                  alt="Game thumbnail preview" 
                  className="w-full h-48 object-cover rounded-md border border-border"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  className="absolute top-2 right-2"
                  onClick={handleRemoveImage}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div 
                className="border-2 border-dashed border-border rounded-md p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  {isUploadingImage ? "Uploading..." : "Click to upload image"}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  PNG, JPG, WEBP, GIF (max 5MB)
                </p>
              </div>
            )}
            <input
              ref={fileInputRef}
              id="thumbnailUpload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageUpload}
              disabled={isUploadingImage}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="codebaseUrl">Codebase URL (optional)</Label>
            <Input
              id="codebaseUrl"
              type="url"
              placeholder="https://github.com/username/repo"
              value={codebaseUrl}
              onChange={(e) => setCodebaseUrl(e.target.value)}
            />
            <p className="text-sm text-muted-foreground">
              Share your code so others can contribute and remix this project!
            </p>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                "Submit Game"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
