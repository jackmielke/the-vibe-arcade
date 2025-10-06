import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ChevronDown } from "lucide-react";
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
      <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2 flex-1">
        <button
          className={`
            px-5 py-2.5 rounded-full text-sm font-medium whitespace-nowrap transition-all
            ${selectedCategory === null 
              ? 'bg-foreground/10 text-foreground' 
              : 'bg-transparent text-foreground/60 hover:text-foreground hover:bg-foreground/5'
            }
          `}
          onClick={() => setSelectedCategory(null)}
        >
          All Games
        </button>
        {categories.slice(0, 6).map((category) => (
          <button
            key={category.slug}
            className={`
              px-5 py-2.5 rounded-full text-sm font-medium whitespace-nowrap transition-all
              ${selectedCategory === category.slug
                ? 'bg-foreground/10 text-foreground' 
                : 'bg-transparent text-foreground/60 hover:text-foreground hover:bg-foreground/5'
              }
            `}
            onClick={() => setSelectedCategory(category.slug)}
          >
            {category.name}
          </button>
        ))}
      </div>

      {categories.length > 6 && (
        <Dialog>
          <DialogTrigger asChild>
            <button className="px-4 py-2.5 rounded-full text-sm font-medium whitespace-nowrap flex-shrink-0 bg-transparent text-foreground/60 hover:text-foreground hover:bg-foreground/5 transition-all flex items-center gap-1.5">
              <ChevronDown className="h-4 w-4" />
            </button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>All Categories</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-2 mt-4">
              <button
                className={`
                  px-4 py-2.5 rounded-lg text-sm font-medium transition-all text-left
                  ${selectedCategory === null
                    ? 'bg-foreground/10 text-foreground' 
                    : 'bg-transparent text-foreground/60 hover:text-foreground hover:bg-foreground/5'
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
                    px-4 py-2.5 rounded-lg text-sm font-medium transition-all text-left
                    ${selectedCategory === category.slug
                      ? 'bg-foreground/10 text-foreground' 
                      : 'bg-transparent text-foreground/60 hover:text-foreground hover:bg-foreground/5'
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
