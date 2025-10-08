import { useState } from "react";
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
import { toast } from "sonner";
import { Plus } from "lucide-react";

export const CreateCharacterDialog = () => {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    image_url: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error("You must be logged in to create characters");
        return;
      }

      // Use the provided image URL or generate a default avatar
      const imageUrl = formData.image_url.trim() || 
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
    } catch (error: any) {
      toast.error(error.message || "Failed to create character");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
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

          <div className="space-y-2">
            <Label htmlFor="image_url">Image URL (Optional)</Label>
            <Input
              id="image_url"
              type="url"
              value={formData.image_url}
              onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
              placeholder="https://example.com/character.png"
            />
            <p className="text-xs text-muted-foreground">
              Leave empty to generate a random avatar
            </p>
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} className="flex-1">
              {isSubmitting ? "Creating..." : "Create Character"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
