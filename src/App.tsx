import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import ConfirmEmail from "./pages/ConfirmEmail";
import Profile from "./pages/Profile";
import Game from "./pages/Game";
import Arcade from "./pages/Arcade";
import Export from "./pages/Export";
import Secret from "./pages/Secret";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <Toaster />
    <Sonner />
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/confirm-email" element={<ConfirmEmail />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/game/:id" element={<Game />} />
        <Route path="/arcade" element={<Arcade />} />
        <Route path="/export" element={<Export />} />
        <Route path="/secret" element={<Secret />} />
        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;
