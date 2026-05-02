import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { PlayerProvider } from "@/contexts/PlayerContext";
import { AppLayout } from "@/components/layout/AppLayout";
import { NowPlayingScreen } from "@/components/layout/NowPlayingScreen";
import { useEffect } from "react";

import Home from "@/pages/Home";
import Search from "@/pages/Search";
import GenreDetail from "@/pages/GenreDetail";
import CountryDetail from "@/pages/CountryDetail";
import Favorites from "@/pages/Favorites";
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient();

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/search" component={Search} />
      <Route path="/genre/:genre" component={GenreDetail} />
      <Route path="/country/:countrycode" component={CountryDetail} />
      <Route path="/favorites" component={Favorites} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  useEffect(() => {
    document.documentElement.classList.add("dark");
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <PlayerProvider>
          <NowPlayingScreen />
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <AppLayout>
              <Router />
            </AppLayout>
          </WouterRouter>
          <Toaster />
        </PlayerProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;