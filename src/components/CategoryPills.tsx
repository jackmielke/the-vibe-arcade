import { useState } from "react";
import { Button } from "@/components/ui/button";
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
      <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2 flex-1">
        <Button
          variant={selectedCategory === null ? "arcade" : "glass"}
          size="lg"
          className="rounded-full px-6 whitespace-nowrap"
          onClick={() => setSelectedCategory(null)}
        >
          All Games
        </Button>
        {categories.slice(0, 5).map((category) => (
          <Button
            key={category.slug}
            variant={selectedCategory === category.slug ? "arcade" : "glass"}
            size="lg"
            className="rounded-full px-6 whitespace-nowrap"
            onClick={() => setSelectedCategory(category.slug)}
          >
            {category.name}
          </Button>
        ))}
      </div>
      
      {categories.length > 5 && (
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" size="lg" className="rounded-full px-4 gap-2 whitespace-nowrap">
              View All
              <ChevronRight className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>All Categories</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-3 mt-4">
              <Button
                variant={selectedCategory === null ? "arcade" : "glass"}
                size="lg"
                className="rounded-full"
                onClick={() => setSelectedCategory(null)}
              >
                All Games
              </Button>
              {categories.map((category) => (
                <Button
                  key={category.slug}
                  variant={selectedCategory === category.slug ? "arcade" : "glass"}
                  size="lg"
                  className="rounded-full"
                  onClick={() => setSelectedCategory(category.slug)}
                >
                  {category.name}
                </Button>
              ))}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};
