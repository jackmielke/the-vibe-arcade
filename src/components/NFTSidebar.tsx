interface NFTItem {
  id: string;
  image: string;
}

const nftItems: NFTItem[] = [
  { id: "1", image: "https://api.dicebear.com/7.x/bottts/svg?seed=alien1&backgroundColor=34d399" },
  { id: "2", image: "https://api.dicebear.com/7.x/bottts/svg?seed=fox1&backgroundColor=f472b6" },
  { id: "3", image: "https://api.dicebear.com/7.x/bottts/svg?seed=robot1&backgroundColor=60a5fa" },
];

export const NFTSidebar = () => {
  return (
    <aside className="hidden lg:block fixed right-6 top-32 space-y-6">
      <div className="bg-glass/10 backdrop-blur-md border border-glass-border/20 rounded-2xl p-6 shadow-glow">
        <h3 className="text-xl font-bold text-foreground mb-4 text-center">NFT</h3>
        <div className="space-y-4">
          {nftItems.map((nft) => (
            <div
              key={nft.id}
              className="w-24 h-24 rounded-2xl bg-glass/10 border border-glass-border/20 overflow-hidden hover:scale-110 transition-all shadow-glow cursor-pointer"
            >
              <img 
                src={nft.image} 
                alt={`NFT ${nft.id}`}
                className="w-full h-full object-cover"
              />
            </div>
          ))}
        </div>
        <p className="text-sm text-muted-foreground text-center mt-4">NFT</p>
      </div>
    </aside>
  );
};
