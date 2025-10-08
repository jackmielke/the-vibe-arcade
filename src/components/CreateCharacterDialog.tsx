import { useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ImageCropper } from "@/components/ImageCropper";
import { toast } from "sonner";
import { Plus, Upload } from "lucide-react";

export const CreateCharacterDialog = () => {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [cropperImage, setCropperImage] = useState<string | null>(null);
  const [isCropperOpen, setIsCropperOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    image_url: "",
  });

  const handleImageSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be less than 5MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const imageDataUrl = e.target?.result as string;
      setCropperImage(imageDataUrl);
      setIsCropperOpen(true);
    };
    reader.readAsDataURL(file);
  };

  const handleCropComplete = async (croppedImageBlob: Blob) => {
    setIsUploading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const fileName = `character-${user.id}-${Date.now()}.png`;
      const { error: uploadError, data } = await supabase.storage
        .from("avatars")
        .upload(fileName, croppedImageBlob, {
          contentType: "image/png",
          upsert: false,
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("avatars")
        .getPublicUrl(fileName);

      setFormData({ ...formData, image_url: publicUrl });
      setPreviewImage(publicUrl);
      setIsCropperOpen(false);
      toast.success("Image uploaded!");
    } catch (error: any) {
      toast.error(error.message || "Failed to upload image");
    } finally {
      setIsUploading(false);
    }
  };

  const handleCropCancel = () => {
    setIsCropperOpen(false);
    setCropperImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) {
      const fakeEvent = {
        target: { files: [file] }
      } as any;
      handleImageSelect(fakeEvent);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error("You must be logged in to create characters");
        return;
      }

      // Use the uploaded image or generate a default avatar
      const imageUrl = formData.image_url || 
        `https://api.dicebear.com/7.x/bottts/svg?seed=${formData.name}&backgroundColor=60a5fa,34d399,f472b6`;

      const { error } = await supabase.from("nfts").insert({
        name: formData.name,
        description: formData.description,
        image_url: imageUrl,
        total_supply: 1,
        creator_id: user.id,
      });

      if (error) throw error;

      toast.success("Character created successfully!");
      setOpen(false);
      setFormData({
        name: "",
        description: "",
        image_url: "",
      });
      setPreviewImage("");
    } catch (error: any) {
      toast.error(error.message || "Failed to create character");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(newOpen) => {
      setOpen(newOpen);
      if (!newOpen) {
        // Reset form when dialog closes
        setFormData({ name: "", description: "", image_url: "" });
        setPreviewImage("");
      }
    }}>
      <DialogTrigger asChild>
        <Button variant="default" size="lg" className="gap-2 flex-shrink-0">
          <Plus className="h-5 w-5" />
          Create Character
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg bg-glass/95 backdrop-blur-xl border-glass-border/30">
        <DialogHeader>
          <DialogTitle>Create New Character</DialogTitle>
          <DialogDescription>
            Design your character for VIBE ARCADE
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Character Image</Label>
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              className="relative group cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="w-32 h-32 mx-auto rounded-full bg-glass/10 backdrop-blur-md border-2 border-glass-border/20 overflow-hidden hover:border-accent transition-all flex items-center justify-center">
                {previewImage ? (
                  <img 
                    src={previewImage} 
                    alt="Character preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-center p-4">
                    <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-xs text-muted-foreground">
                      Drop image or click
                    </p>
                  </div>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                className="hidden"
              />
            </div>
            <p className="text-xs text-muted-foreground text-center">
              Upload an image or leave empty for auto-generated avatar
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Character Name *</Label>
            <Input
              id="name"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Cyber Ninja"
              maxLength={100}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Tell us about your character..."
              rows={3}
              maxLength={500}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || isUploading} className="flex-1">
              {isSubmitting ? "Creating..." : isUploading ? "Uploading..." : "Create Character"}
            </Button>
          </div>
        </form>
        
        {isCropperOpen && cropperImage && (
          <ImageCropper
            image={cropperImage}
            onCropComplete={handleCropComplete}
            onCancel={handleCropCancel}
            isOpen={isCropperOpen}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};
