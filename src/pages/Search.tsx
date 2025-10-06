import { Header } from "@/components/Header";
import { Input } from "@/components/ui/input";
import { Search as SearchIcon } from "lucide-react";

const Search = () => {
  return (
    <div className="min-h-screen pb-24">
      <Header />
      
      <main className="pt-20 px-4 md:px-6">
        <div className="max-w-7xl mx-auto space-y-6">
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2">Search</h1>
            <p className="text-muted-foreground">Find games, players, and more</p>
          </div>

          <div className="relative">
            <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search for games..."
              className="pl-12 h-14 text-lg bg-glass/10 backdrop-blur-md border-glass-border/20"
            />
          </div>

          <div className="text-center py-16 text-muted-foreground">
            <p>Start typing to search...</p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Search;
