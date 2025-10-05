import { Button } from "@/components/ui/button";

export const Hero = () => {
  return (
    <section className="pt-32 pb-12 px-4 md:px-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-primary mb-4 tracking-tight">
          THE VIBE
          <br />
          ARCADE
        </h1>
        <p className="text-xl md:text-2xl text-foreground/80 mb-8 max-w-2xl">
          An open-source gaming platform where anyone can play and create their own games
        </p>
        <Button variant="arcade" size="lg" className="text-lg px-8 py-6 h-auto">
          ENTER THE ARCADE
        </Button>
      </div>
    </section>
  );
};
