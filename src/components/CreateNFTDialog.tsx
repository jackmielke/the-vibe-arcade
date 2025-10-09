import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Plus } from "lucide-react";

export const CreateNFTDialog = () => {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    image_url: "",
    game_id: "",
    total_supply: "100",
  });

  const { data: games = [] } = useQuery({
    queryKey: ["games"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("games")
        .select("id, title")
        .eq("status", "approved")
        .order("title");
      
      if (error) throw error;
      return data;
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error("You must be logged in to create NFTs");
        return;
      }

      const { error } = await supabase.from("nfts").insert({
        name: formData.name,
        description: formData.description,
        image_url: formData.image_url,
        game_id: formData.game_id || null,
        total_supply: parseInt(formData.total_supply),
        creator_id: user.id,
      });

      if (error) throw error;

      toast.success("NFT created successfully!");
      setOpen(false);
      setFormData({
        name: "",
        description: "",
        image_url: "",
        game_id: "",
        total_supply: "100",
      });
    } catch (error: any) {
      toast.error(error.message || "Failed to create NFT");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="glass" size="lg" className="gap-2">
          <Plus className="h-5 w-5" />
          Create NFT
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-glass/95 backdrop-blur-xl border-glass-border/30">
        <DialogHeader>
          <DialogTitle>Create New NFT</DialogTitle>
          <DialogDescription>
            Create a new NFT for your game collection
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">NFT Name *</Label>
            <Input
              id="name"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Founder Edition #1"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe this NFT..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="image_url">Image URL *</Label>
            <Input
              id="image_url"
              required
              type="url"
              value={formData.image_url}
              onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
              placeholder="https://example.com/nft-image.png"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="game_id">Associated Game (Optional)</Label>
            <Select
              value={formData.game_id}
              onValueChange={(value) => setFormData({ ...formData, game_id: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a game" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">No game association</SelectItem>
                {games.map((game) => (
                  <SelectItem key={game.id} value={game.id}>
                    {game.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="total_supply">Total Supply *</Label>
            <Input
              id="total_supply"
              required
              type="number"
              min="1"
              value={formData.total_supply}
              onChange={(e) => setFormData({ ...formData, total_supply: e.target.value })}
              placeholder="100"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} className="flex-1">
              {isSubmitting ? "Creating..." : "Create NFT"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
