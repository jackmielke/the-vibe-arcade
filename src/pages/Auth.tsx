import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { BrowserProvider } from "ethers";
import vibeLogo from "@/assets/vibe-logo-white.png";

declare global {
  interface Window {
    ethereum?: any;
  }
}

export default function Auth() {
  const navigate = useNavigate();
  const [isConnecting, setIsConnecting] = useState(false);
  const [hasMetaMask, setHasMetaMask] = useState(false);

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
          <div className="flex justify-center mb-4">
            <img src={vibeLogo} alt="Vibe" className="h-16 w-16" />
          </div>
          <CardTitle className="text-2xl">Welcome to Vibe Arcade</CardTitle>
          <CardDescription>
            Connect your wallet to get started
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            onClick={connectMetaMask}
            disabled={isConnecting || !hasMetaMask}
            className="w-full"
            size="lg"
          >
            {isConnecting ? (
              "Connecting..."
            ) : !hasMetaMask ? (
              "Install MetaMask"
            ) : (
              <>
                <img 
                  src="https://upload.wikimedia.org/wikipedia/commons/3/36/MetaMask_Fox.svg" 
                  alt="MetaMask" 
                  className="w-6 h-6 mr-2"
                />
                Connect with MetaMask
              </>
            )}
          </Button>

          {!hasMetaMask && (
            <p className="text-sm text-muted-foreground text-center">
              Don't have MetaMask?{" "}
              <a
                href="https://metamask.io/download/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                Download it here
              </a>
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
