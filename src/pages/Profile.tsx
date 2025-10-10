import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Session } from "@supabase/supabase-js";
import { Header } from "@/components/Header";
import { GameCard } from "@/components/GameCard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Camera, Loader2, Wallet } from "lucide-react";
import { toast } from "sonner";
import galaxyBg from "@/assets/galaxy-bg-hq.jpg";
import { ImageCropper } from "@/components/ImageCropper";
import { CreateNFTDialog } from "@/components/CreateNFTDialog";

export default function Profile() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [userGames, setUserGames] = useState<any[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isConnectingWallet, setIsConnectingWallet] = useState(false);
  const [cropperImage, setCropperImage] = useState<string | null>(null);
  const [isCropperOpen, setIsCropperOpen] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    display_name: "",
    bio: "",
    website_url: "",
  });

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/auth");
        return;
      }
      setSession(session);
      fetchProfile(session.user.id);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        navigate("/auth");
      } else {
        setSession(session);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const fetchProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (error) {
      toast.error("Failed to load profile");
      return;
    }

    setProfile(data);
    setFormData({
      username: data.username || "",
      display_name: data.display_name || "",
      bio: data.bio || "",
      website_url: data.website_url || "",
    });

    // Check if user is admin
    const { data: roleData } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .eq("role", "admin")
      .maybeSingle();

    setIsAdmin(!!roleData);

    // Fetch user's games
    const { data: games } = await supabase
      .from("games")
      .select("id, title, description, thumbnail_url, play_url, status")
      .eq("creator_id", userId)
      .order("created_at", { ascending: false });

    if (games) {
      setUserGames(games);
    }
  };

  const handleAvatarSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
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
    reader.onload = () => {
      setCropperImage(reader.result as string);
      setIsCropperOpen(true);
    };
    reader.readAsDataURL(file);
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleCropComplete = async (croppedImageBlob: Blob) => {
    if (!session) return;

    setIsUploadingAvatar(true);
    setIsCropperOpen(false);
    
    try {
      const fileName = `${session.user.id}/${Date.now()}.jpg`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(fileName, croppedImageBlob);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("avatars")
        .getPublicUrl(fileName);

      const { error: updateError } = await supabase
        .from("profiles")
        .update({ avatar_url: publicUrl })
        .eq("id", session.user.id);

      if (updateError) throw updateError;

      toast.success("Avatar updated successfully!");
      fetchProfile(session.user.id);
    } catch (error) {
      console.error("Error uploading avatar:", error);
      toast.error("Failed to upload avatar");
    } finally {
      setIsUploadingAvatar(false);
      setCropperImage(null);
    }
  };

  const handleCropCancel = () => {
    setIsCropperOpen(false);
    setCropperImage(null);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session) return;

    setIsLoading(true);

    const { error } = await supabase
      .from("profiles")
      .update({
        username: formData.username,
        display_name: formData.display_name,
        bio: formData.bio,
        website_url: formData.website_url,
      })
      .eq("id", session.user.id);

    if (error) {
      toast.error("Failed to update profile");
    } else {
      toast.success("Profile updated successfully!");
      fetchProfile(session.user.id);
    }

    setIsLoading(false);
  };

  const handleConnectWallet = async () => {
    if (!session) return;

    setIsConnectingWallet(true);
    try {
      if (!window.ethereum) {
        toast.error("Please install MetaMask to connect your wallet");
        return;
      }

      const accounts = await window.ethereum.request({ 
        method: 'eth_requestAccounts' 
      });
      const walletAddress = accounts[0];

      const { error } = await supabase
        .from("profiles")
        .update({ wallet_address: walletAddress })
        .eq("id", session.user.id);

      if (error) throw error;

      toast.success("Ethereum wallet connected successfully!");
      fetchProfile(session.user.id);
    } catch (error) {
      console.error("Error connecting wallet:", error);
      toast.error("Failed to connect wallet");
    } finally {
      setIsConnectingWallet(false);
    }
  };

  const getInitials = () => {
    if (profile?.username) {
      return profile.username[0].toUpperCase();
    }
    if (session?.user?.email) {
      return session.user.email[0].toUpperCase();
    }
    return "U";
  };

  return (
    <div className="relative min-h-screen">
      <div 
        className="fixed inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${galaxyBg})` }}
      />
      
      <Header />
      
      <main className="relative pt-24 px-4 pb-20">
        <div className="max-w-4xl mx-auto space-y-8">
          <Card className="bg-glass/95 backdrop-blur-xl border-glass-border/30">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                  <Avatar className="h-24 w-24 border border-foreground/20">
                    <AvatarImage src={profile?.avatar_url || ""} alt={profile?.username || session?.user?.email || "User"} />
                    <AvatarFallback className="bg-foreground/10 text-foreground font-bold text-2xl">
                      {getInitials()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                    {isUploadingAvatar ? (
                      <Loader2 className="h-6 w-6 text-white animate-spin" />
                    ) : (
                      <Camera className="h-6 w-6 text-white" />
                    )}
                  </div>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarSelect}
                  disabled={isUploadingAvatar}
                />
              </div>
              <CardTitle className="text-2xl">Your Profile</CardTitle>
              <CardDescription>Manage your account information</CardDescription>
            </CardHeader>
            
            <CardContent>
              <form onSubmit={handleUpdate} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={session?.user?.email || ""}
                    disabled
                    className="bg-glass/10 border-glass-border/20"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    type="text"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    className="bg-glass/10 border-glass-border/20"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="display_name">Display Name</Label>
                  <Input
                    id="display_name"
                    type="text"
                    value={formData.display_name}
                    onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
                    className="bg-glass/10 border-glass-border/20"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    className="bg-glass/10 border-glass-border/20 min-h-[100px]"
                    placeholder="Tell us about yourself..."
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="website_url">Website</Label>
                  <Input
                    id="website_url"
                    type="url"
                    value={formData.website_url}
                    onChange={(e) => setFormData({ ...formData, website_url: e.target.value })}
                    className="bg-glass/10 border-glass-border/20"
                    placeholder="https://yourwebsite.com"
                  />
                </div>

                <Button type="submit" disabled={isLoading} className="w-full">
                  {isLoading ? "Updating..." : "Update Profile"}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Ethereum Wallet Connection */}
          <Card className="bg-glass/95 backdrop-blur-xl border-glass-border/30">
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <Wallet className="h-5 w-5" />
                Ethereum Wallet
              </CardTitle>
              <CardDescription>
                Connect your Ethereum wallet to truly own your assets. You're not locked into this platform or any platform—it's your true wallet on the internet.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {profile?.wallet_address ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-4 bg-glass/10 border border-glass-border/20 rounded-lg">
                    <div>
                      <p className="text-sm text-muted-foreground">Connected Wallet</p>
                      <p className="font-mono text-sm mt-1">
                        {profile.wallet_address.slice(0, 6)}...{profile.wallet_address.slice(-4)}
                      </p>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={handleConnectWallet}
                      disabled={isConnectingWallet}
                    >
                      {isConnectingWallet ? "Connecting..." : "Change Wallet"}
                    </Button>
                  </div>
                </div>
              ) : (
                <Button 
                  onClick={handleConnectWallet}
                  disabled={isConnectingWallet}
                  className="w-full"
                >
                  {isConnectingWallet ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Connecting...
                    </>
                  ) : (
                    <>
                      <Wallet className="mr-2 h-4 w-4" />
                      Connect Ethereum Wallet
                    </>
                  )}
                </Button>
              )}
            </CardContent>
          </Card>

          {/* User's Games */}
          <Card className="bg-glass/95 backdrop-blur-xl border-glass-border/30">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-xl">My Submitted Games</CardTitle>
                <CardDescription>
                  Games you've submitted to Vibe Arcade
                </CardDescription>
              </div>
              {isAdmin && <CreateNFTDialog />}
            </CardHeader>
            <CardContent>
              {userGames.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  You haven't submitted any games yet.
                </p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {userGames.map((game) => (
                    <GameCard 
                      key={game.id}
                      id={game.id}
                      title={game.title}
                      description={game.description || ""}
                      platforms={[game.status]}
                      image={game.thumbnail_url || "/placeholder.svg"}
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
      
      {cropperImage && (
        <ImageCropper
          image={cropperImage}
          onCropComplete={handleCropComplete}
          onCancel={handleCropCancel}
          isOpen={isCropperOpen}
        />
      )}
    </div>
  );
}
