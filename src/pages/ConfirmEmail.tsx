import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Mail, CheckCircle } from "lucide-react";
import vibeLogo from "@/assets/vibe-logo-white.png";

export default function ConfirmEmail() {
  const navigate = useNavigate();
  const [isVerified, setIsVerified] = useState(false);

  useEffect(() => {
    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        setIsVerified(true);
        setTimeout(() => {
          navigate("/");
        }, 2000);
      }
    });

    // Check if already signed in
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user?.email_confirmed_at) {
        navigate("/");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md bg-glass/95 backdrop-blur-xl border-glass-border/30">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <img src={vibeLogo} alt="Vibe" className="h-16 w-16" />
          </div>
          <CardTitle className="text-2xl">
            {isVerified ? "Email Verified!" : "Check Your Email"}
          </CardTitle>
          <CardDescription>
            {isVerified 
              ? "Redirecting you to the home page..." 
              : "We've sent you a confirmation link"
            }
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center space-y-6">
          {isVerified ? (
            <CheckCircle className="h-20 w-20 text-accent animate-in zoom-in duration-500" />
          ) : (
            <>
              <Mail className="h-20 w-20 text-accent animate-pulse" />
              <div className="text-center space-y-2">
                <p className="text-sm text-muted-foreground">
                  Please check your email and click the confirmation link to complete your registration.
                </p>
                <p className="text-xs text-muted-foreground">
                  Once confirmed, you'll be automatically signed in.
                </p>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
