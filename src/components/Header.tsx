import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { AuthButton } from "@/components/AuthButton";
import { useNavigate } from "react-router-dom";
import vibeLogo from "@/assets/vibe-logo-white.png";

export const Header = () => {
  const navigate = useNavigate();
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-glass-border/20">
      <div className="max-w-7xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between gap-4">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
            <img src={vibeLogo} alt="Vibe" className="h-8 w-8 hover:scale-110 transition-transform" />
            <h1 className="text-2xl md:text-3xl font-black text-primary tracking-tight">VIBE ARCADE</h1>
          </div>
          <div className="relative hidden md:block w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search games..."
              className="pl-9 h-9 bg-glass/10 backdrop-blur-md border-glass-border/20 text-foreground placeholder:text-muted-foreground"
            />
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <AuthButton />
        </div>
      </div>
    </header>
  );
};
