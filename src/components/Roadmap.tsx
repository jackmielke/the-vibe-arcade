import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const roadmapItems = [
  {
    title: "Character Evolution System",
    description: "Characters level up and evolve like Pokémon as they're used across games",
    status: "planned",
    icon: "🎮"
  },
  {
    title: "3D Character Models",
    description: "Every character NFT includes a GLB file for 3D representation in games",
    status: "planned",
    icon: "🎨"
  },
  {
    title: "Achievement Badges",
    description: "Characters earn on-chain badges and achievements that display on their NFT",
    status: "planned",
    icon: "🏆"
  },
  {
    title: "Physical Arcade Integration",
    description: "QR codes on characters unlock IRL arcade events and scavenger hunts",
    status: "planned",
    icon: "📱"
  },
  {
    title: "Cross-Game Character System",
    description: "Devs opt-in to let characters appear across multiple games automatically",
    status: "planned",
    icon: "🌐"
  }
];

export const Roadmap = () => {
  return (
    <section className="py-20 px-4 md:px-6 bg-gradient-to-b from-background to-background/50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <Badge variant="outline" className="mb-4 text-primary border-primary/50">
            THE FUTURE
          </Badge>
          <h2 className="text-4xl md:text-5xl font-black text-primary mb-4 tracking-tight">
            What's Coming Next
          </h2>
          <p className="text-lg text-foreground/60 max-w-2xl mx-auto">
            The arcade is just getting started. Here's where we're headed.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {roadmapItems.map((item, index) => (
            <Card 
              key={index}
              className="p-6 bg-card/50 backdrop-blur-sm border-primary/20 hover:border-primary/40 transition-all hover:transform hover:scale-105"
            >
              <div className="text-4xl mb-4">{item.icon}</div>
              <h3 className="text-xl font-bold text-primary mb-2">
                {item.title}
              </h3>
              <p className="text-sm text-foreground/70 mb-4">
                {item.description}
              </p>
              <Badge variant="secondary" className="text-xs">
                {item.status}
              </Badge>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
