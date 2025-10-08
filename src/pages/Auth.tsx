import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { BrowserProvider } from "ethers";
import vibeLogo from "@/assets/vibe-logo-white.png";
import { ArrowLeft } from "lucide-react";

declare global {
  interface Window {
    ethereum?: any;
  }
}

export default function Auth() {
  const navigate = useNavigate();
  const [isConnecting, setIsConnecting] = useState(false);
  const [hasMetaMask, setHasMetaMask] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Check if user is already logged in
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate("/");
      }
    });

    // Check if MetaMask is installed
    setHasMetaMask(typeof window.ethereum !== 'undefined');
  }, [navigate]);

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error("Please fill in all fields");
      return;
    }

    if (isSignUp && password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setIsLoading(true);

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/`
          }
        });

        if (error) throw error;
        
        navigate("/confirm-email");
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;
        
        toast.success("Successfully signed in!");
        navigate("/");
      }
    } catch (error: any) {
      console.error("Auth error:", error);
      toast.error(error.message || "Authentication failed");
    } finally {
      setIsLoading(false);
    }
  };

  const connectMetaMask = async () => {
    if (!window.ethereum) {
      toast.error("MetaMask is not installed. Please install MetaMask to continue.");
      return;
    }

    setIsConnecting(true);

    try {
      // Request account access
      const provider = new BrowserProvider(window.ethereum);
      const accounts = await provider.send("eth_requestAccounts", []);
      const account = accounts[0];

      // Create a message to sign
      const message = `Sign this message to authenticate with Vibe Arcade.\n\nWallet: ${account}\nTimestamp: ${Date.now()}`;
      
      // Request signature
      const signer = await provider.getSigner();
      const signature = await signer.signMessage(message);

      // Send to backend for verification and authentication
      const { data, error } = await supabase.functions.invoke('metamask-auth', {
        body: {
          wallet_address: account,
          message,
          signature,
        },
      });

      if (error) throw error;

      if (data.session) {
        // Set the session
        await supabase.auth.setSession({
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token,
        });
        
        toast.success("Successfully connected!");
        navigate("/");
      }
    } catch (error: any) {
      console.error("MetaMask connection error:", error);
      toast.error(error.message || "Failed to connect with MetaMask");
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md bg-glass/95 backdrop-blur-xl border-glass-border/30">
        <CardHeader className="text-center">
          <div className="flex items-center justify-between mb-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/")}
              className="hover:bg-glass/20"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <img src={vibeLogo} alt="Vibe" className="h-16 w-16" />
            <div className="w-10" />
          </div>
          <CardTitle className="text-2xl">Welcome to Vibe Arcade</CardTitle>
          <CardDescription>
            {isSignUp ? "Create an account to get started" : "Sign in to continue"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleEmailAuth} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-glass/10 border-glass-border/20"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="bg-glass/10 border-glass-border/20"
              />
            </div>

            {isSignUp && (
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={6}
                  className="bg-glass/10 border-glass-border/20"
                />
              </div>
            )}

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full"
              size="lg"
            >
              {isLoading ? "Loading..." : isSignUp ? "Sign Up" : "Sign In"}
            </Button>
          </form>

          <div className="text-center">
            <Button
              variant="link"
              onClick={() => {
                setIsSignUp(!isSignUp);
                setConfirmPassword("");
              }}
              className="text-muted-foreground hover:text-primary"
            >
              {isSignUp ? "Already have an account? Sign in" : "Don't have an account? Sign up"}
            </Button>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <Separator className="w-full" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
            </div>
          </div>

          <div className="space-y-3">
            <Button
              onClick={() => toast.info("Coming soon!")}
              variant="outline"
              className="w-full opacity-60"
              size="lg"
            >
              <img 
                src="https://upload.wikimedia.org/wikipedia/commons/3/36/MetaMask_Fox.svg" 
                alt="MetaMask" 
                className="w-6 h-6 mr-2"
              />
              Continue with MetaMask
            </Button>

            <Button
              onClick={() => toast.info("Coming soon!")}
              variant="outline"
              className="w-full opacity-60"
              size="lg"
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
