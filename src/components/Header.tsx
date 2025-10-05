import { Search, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const Header = () => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto flex items-center justify-end gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="Search games"
            className="pl-10 bg-glass/10 backdrop-blur-md border-glass-border/20 text-foreground placeholder:text-muted-foreground"
          />
        </div>
        <Button variant="glass" className="gap-2">
          <Plus className="h-5 w-5" />
          <span className="hidden sm:inline">SUBMIT GAME</span>
        </Button>
      </div>
    </header>
  );
};
