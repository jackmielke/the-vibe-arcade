import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const CategoryPills = () => {
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
    <div className="flex flex-wrap gap-3 mb-8">
      <Button
        variant="glass"
        size="lg"
        className="rounded-full px-6"
      >
        All Games
      </Button>
      {categories.map((category) => (
        <Button
          key={category.slug}
          variant="glass"
          size="lg"
          className="rounded-full px-6"
        >
          {category.name}
        </Button>
      ))}
    </div>
  );
};
