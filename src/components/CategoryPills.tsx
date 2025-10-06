import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ChevronRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const CategoryPills = () => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('name, slug')
        .order('name');
      
      if (error) throw error;
      return data || [];
    },
  });

  return (
    <div className="flex items-center gap-3 mb-8">
      <div className="flex items-center gap-3 overflow-x-auto scrollbar-hide pb-2 flex-1">
        <button
          className={`
            px-6 py-3 rounded-full font-bold whitespace-nowrap transition-all duration-300
            ${selectedCategory === null 
              ? 'bg-gradient-to-r from-accent to-neon-purple text-primary-foreground shadow-[0_0_20px_rgba(168,85,247,0.5)] scale-105' 
              : 'bg-glass/30 backdrop-blur-md border border-glass-border/40 text-foreground/80 hover:bg-glass/50 hover:border-accent/50 hover:text-foreground'
            }
          `}
          onClick={() => setSelectedCategory(null)}
        >
          All Games
        </button>
        {categories.slice(0, 5).map((category) => (
          <button
            key={category.slug}
            className={`
              px-6 py-3 rounded-full font-bold whitespace-nowrap transition-all duration-300
              ${selectedCategory === category.slug
                ? 'bg-gradient-to-r from-accent to-neon-purple text-primary-foreground shadow-[0_0_20px_rgba(168,85,247,0.5)] scale-105' 
                : 'bg-glass/30 backdrop-blur-md border border-glass-border/40 text-foreground/80 hover:bg-glass/50 hover:border-accent/50 hover:text-foreground'
              }
            `}
            onClick={() => setSelectedCategory(category.slug)}
          >
            {category.name}
          </button>
        ))}
      </div>
      
      {categories.length > 5 && (
        <Dialog>
          <DialogTrigger asChild>
            <button className="px-6 py-3 rounded-full font-semibold whitespace-nowrap flex-shrink-0 bg-glass/20 backdrop-blur-md border border-glass-border/30 text-foreground/70 hover:bg-glass/40 hover:border-accent/40 hover:text-foreground transition-all duration-300 flex items-center gap-2">
              View All
              <ChevronRight className="h-4 w-4" />
            </button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px] bg-card/95 backdrop-blur-xl border-border">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold">All Categories</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-3 mt-4">
              <button
                className={`
                  px-6 py-3 rounded-full font-bold transition-all duration-300
                  ${selectedCategory === null
                    ? 'bg-gradient-to-r from-accent to-neon-purple text-primary-foreground shadow-[0_0_20px_rgba(168,85,247,0.5)]' 
                    : 'bg-glass/30 backdrop-blur-md border border-glass-border/40 text-foreground/80 hover:bg-glass/50 hover:border-accent/50'
                  }
                `}
                onClick={() => setSelectedCategory(null)}
              >
                All Games
              </button>
              {categories.map((category) => (
                <button
                  key={category.slug}
                  className={`
                    px-6 py-3 rounded-full font-bold transition-all duration-300
                    ${selectedCategory === category.slug
                      ? 'bg-gradient-to-r from-accent to-neon-purple text-primary-foreground shadow-[0_0_20px_rgba(168,85,247,0.5)]' 
                      : 'bg-glass/30 backdrop-blur-md border border-glass-border/40 text-foreground/80 hover:bg-glass/50 hover:border-accent/50'
                    }
                  `}
                  onClick={() => setSelectedCategory(category.slug)}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};
