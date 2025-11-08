import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Plus, Loader2, Upload, X, Rocket, ExternalLink, CheckCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Progress } from "@/components/ui/progress";

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
  const [isAnonymous, setIsAnonymous] = useState(false);
  
  // Token launch states
  const [launchToken, setLaunchToken] = useState(false);
  const [tokenTicker, setTokenTicker] = useState("");
  const [walletAddress, setWalletAddress] = useState("");
  const [tokenProgress, setTokenProgress] = useState(0);
  const [tokenProgressText, setTokenProgressText] = useState("");
  const [isLaunchingToken, setIsLaunchingToken] = useState(false);
  const [tokenLaunchSuccess, setTokenLaunchSuccess] = useState<{
    token_address: string;
    tx_hash: string;
  } | null>(null);

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

    if (launchToken && (!tokenTicker || !walletAddress)) {
      toast.error("Token ticker and wallet address are required for token launch");
      return;
    }

    if (launchToken && !thumbnailUrl) {
      toast.error("Cover image is required for token launch");
      return;
    }

    setIsLoading(true);
    let tokenData = null;

    try {
      // Launch token if requested
      if (launchToken) {
        setIsLaunchingToken(true);
        setTokenProgressText("Encoding auction...");
        setTokenProgress(50);

        const { data: tokenResult, error: tokenError } = await supabase.functions.invoke('launch-token', {
          body: {
            imageUrl: thumbnailUrl,
            title,
            description: description || `Token for ${title}`,
            ticker: tokenTicker,
            walletAddress,
            playUrl,
          }
        });

        if (tokenError) throw tokenError;
        if (!tokenResult.success) throw new Error(tokenResult.error);

        setTokenProgressText("Token launched successfully!");
        setTokenProgress(100);
        
        tokenData = {
          token_address: tokenResult.token_address,
          token_ticker: tokenTicker,
          token_tx_hash: tokenResult.tx_hash,
          token_launched_at: new Date().toISOString(),
        };

        setTokenLaunchSuccess({
          token_address: tokenResult.token_address,
          tx_hash: tokenResult.tx_hash,
        });
      }

      // Get current user session
      const { data: { session } } = await supabase.auth.getSession();
      
      const { data, error } = await supabase.from('games').insert({
        play_url: playUrl,
        title,
        description: description || null,
        thumbnail_url: thumbnailUrl || null,
        codebase_url: codebaseUrl || null,
        creator_id: session?.user?.id || null,
        is_anonymous: isAnonymous,
        status: 'approved',
        ...tokenData,
      }).select().single();

      if (error) throw error;

      if (!launchToken) {
        toast.success("Game submitted successfully!");
        
        // Reset form
        setPlayUrl("");
        setTitle("");
        setDescription("");
        setThumbnailUrl("");
        setCodebaseUrl("");
        setIsAnonymous(false);
        setLaunchToken(false);
        setTokenTicker("");
        setWalletAddress("");
        setOpen(false);

        // Navigate to the game page
        if (data) {
          navigate(`/game/${data.id}`);
        }
      }
    } catch (error) {
      console.error('Error submitting game:', error);
      toast.error("Failed to submit game. Please try again.");
      setTokenLaunchSuccess(null);
    } finally {
      setIsLoading(false);
      setIsLaunchingToken(false);
    }
  };

  const handleSuccessClose = () => {
    // Reset form
    setPlayUrl("");
    setTitle("");
    setDescription("");
    setThumbnailUrl("");
    setCodebaseUrl("");
    setIsAnonymous(false);
    setLaunchToken(false);
    setTokenTicker("");
    setWalletAddress("");
    setTokenLaunchSuccess(null);
    setTokenProgress(0);
    setTokenProgressText("");
    setOpen(false);
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
          <DialogTitle>
            {tokenLaunchSuccess ? "Token Launched Successfully!" : "Submit a Game"}
          </DialogTitle>
        </DialogHeader>
        
        {tokenLaunchSuccess ? (
          <div className="space-y-6 py-4">
            <div className="flex flex-col items-center justify-center space-y-4">
              <div className="rounded-full bg-green-500/20 p-3">
                <CheckCircle2 className="h-12 w-12 text-green-500" />
              </div>
              <h3 className="text-2xl font-bold">Token Launched Successfully!</h3>
              <p className="text-center text-muted-foreground">
                Your token has been successfully deployed to Base blockchain!
              </p>
            </div>

            <div className="space-y-3 rounded-lg border border-border p-4 bg-muted/50">
              <div>
                <p className="text-sm text-muted-foreground">Token Address</p>
                <p className="font-mono text-sm break-all">{tokenLaunchSuccess.token_address}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Transaction Hash</p>
                <p className="font-mono text-sm break-all">{tokenLaunchSuccess.tx_hash}</p>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => window.open(`https://basescan.org/tx/${tokenLaunchSuccess.tx_hash}`, '_blank')}
              >
                <ExternalLink className="mr-2 h-4 w-4" />
                View on BaseScan
              </Button>
              <Button
                type="button"
                className="flex-1"
                onClick={() => window.open(`https://app.long.xyz/tokens/${tokenLaunchSuccess.token_address}`, '_blank')}
              >
                <Rocket className="mr-2 h-4 w-4" />
                Trade on LONG
              </Button>
            </div>

            <Button
              type="button"
              variant="default"
              className="w-full"
              onClick={handleSuccessClose}
            >
              Visit game's page
            </Button>
          </div>
        ) : (
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

          <div className="flex items-center justify-between space-x-2 p-4 bg-glass/10 rounded-lg border border-glass-border/20">
            <div className="space-y-0.5">
              <Label htmlFor="anonymous" className="text-base">Submit anonymously</Label>
              <p className="text-sm text-muted-foreground">
                Your profile won't be shown on this game
              </p>
            </div>
            <Switch
              id="anonymous"
              checked={isAnonymous}
              onCheckedChange={setIsAnonymous}
            />
          </div>

          <div className="flex items-center justify-between space-x-2 p-4 bg-glass/10 rounded-lg border border-glass-border/20">
            <div className="space-y-0.5">
               <Label htmlFor="launchToken" className="text-base flex items-center gap-2">
                <Rocket className="h-4 w-4" />
                Launch Token
              </Label>
              <p className="text-sm text-muted-foreground">
                Create a token for your game on LONG
              </p>
            </div>
            <Switch
              id="launchToken"
              checked={launchToken}
              onCheckedChange={setLaunchToken}
            />
          </div>

          {launchToken && (
            <div className="space-y-4 p-4 bg-muted/50 rounded-lg border border-border">
              <div className="space-y-2">
                <Label htmlFor="tokenTicker">Token Ticker *</Label>
                <Input
                  id="tokenTicker"
                  placeholder="e.g., GAME"
                  value={tokenTicker}
                  onChange={(e) => setTokenTicker(e.target.value.toUpperCase())}
                  required={launchToken}
                  maxLength={10}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="walletAddress">Wallet Address *</Label>
                <Input
                  id="walletAddress"
                  placeholder="0x..."
                  value={walletAddress}
                  onChange={(e) => setWalletAddress(e.target.value)}
                  required={launchToken}
                />
                <p className="text-xs text-muted-foreground">
                  35% of the trading fees and 10% of the token supply will be allocated to this address
                </p>
              </div>

              {isLaunchingToken && (
                <div className="space-y-2">
                  <Progress value={tokenProgress} />
                  <p className="text-sm text-center text-muted-foreground">
                    {tokenProgressText}
                  </p>
                </div>
              )}
            </div>
          )}

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isLaunchingToken ? "Launching Token..." : "Submitting..."}
                </>
              ) : (
                <>
                  {launchToken && <Rocket className="mr-2 h-4 w-4" />}
                  {launchToken ? "Submit & Launch Token" : "Submit Game"}
                </>
              )}
            </Button>
          </div>
        </form>
        )}
      </DialogContent>
    </Dialog>
  );
};
