import { useState } from "react";
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
    <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2 mb-8">
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
      {categories.map((category) => (
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
  );
};
