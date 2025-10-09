import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { AuthButton } from "@/components/AuthButton";
import { useNavigate } from "react-router-dom";
import vibeLogo from "@/assets/vibe-logo-white.png";
import { useState, useRef, useEffect } from "react";

export const Header = () => {
  const navigate = useNavigate();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchOpen]);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-glass-border/20">
      <div className="px-4 md:px-6 h-16 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
          <img src={vibeLogo} alt="Vibe" className="h-8 w-8 hover:scale-110 transition-transform" />
          <h1 className="text-xl md:text-2xl font-zen-dots text-primary tracking-tight">Vibe Arcade</h1>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Expandable Search */}
          <div className="relative flex items-center">
            {isSearchOpen ? (
              <div className="flex items-center gap-2 animate-fade-in">
                <Input
                  ref={searchInputRef}
                  placeholder="Search games..."
                  className="w-48 md:w-64 h-9 bg-glass/20 backdrop-blur-md border-glass-border/30 text-foreground placeholder:text-muted-foreground focus:border-accent/50 transition-all"
                  onBlur={() => {
                    // Delay closing to allow clicking inside input
                    setTimeout(() => setIsSearchOpen(false), 150);
                  }}
                />
                <button
                  onClick={() => setIsSearchOpen(false)}
                  className="p-2 hover:bg-glass/20 rounded-full transition-colors"
                  aria-label="Close search"
                >
                  <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsSearchOpen(true)}
                className="p-2 hover:bg-glass/20 rounded-full transition-all hover:scale-110"
                aria-label="Open search"
              >
                <Search className="h-5 w-5 text-muted-foreground hover:text-foreground transition-colors" />
              </button>
            )}
          </div>
          
          <AuthButton />
        </div>
      </div>
    </header>
  );
};
