import { Button } from "@/components/ui/button";

export const Hero = () => {
  return (
    <section className="pt-32 pb-12 px-4 md:px-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-primary mb-4 tracking-tight">
          Welcome to the arcade of the future
        </h1>
        <p className="text-xl md:text-2xl text-foreground/80 mb-4 max-w-2xl">
          A vibe-native web3 arcade. Play like it's 2125.
        </p>
        <p className="text-sm md:text-base text-foreground/60 mb-8 max-w-2xl">
          Where every character gets an NFT birth certificate.
        </p>
        <Button variant="arcade" size="lg" className="text-lg px-8 py-6 h-auto">
          ENTER THE ARCADE
        </Button>
      </div>
    </section>
  );
};
