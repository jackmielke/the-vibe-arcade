import { Home, Gamepad2, Users, Search } from "lucide-react";
import { NavLink } from "react-router-dom";

export const BottomNav = () => {
  const navItems = [
    { icon: Home, label: "Home", path: "/" },
    { icon: Gamepad2, label: "Arcade", path: "/arcade" },
    { icon: Users, label: "Friends", path: "/friends" },
    { icon: Search, label: "Search", path: "/search" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-xl border-t border-glass-border/20 pb-safe">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-around h-16">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-all ${
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`
              }
            >
              <item.icon className="h-6 w-6" />
              <span className="text-xs font-medium">{item.label}</span>
            </NavLink>
          ))}
        </div>
      </div>
    </nav>
  );
};
