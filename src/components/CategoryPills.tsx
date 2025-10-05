import { Button } from "@/components/ui/button";

const categories = ["Top Games", "Platformer", "Puzzle", "RPG", "Mobile"];

export const CategoryPills = () => {
  return (
    <div className="flex flex-wrap gap-3 mb-8">
      {categories.map((category) => (
        <Button
          key={category}
          variant="glass"
          size="lg"
          className="rounded-full px-6"
        >
          {category}
        </Button>
      ))}
    </div>
  );
};
