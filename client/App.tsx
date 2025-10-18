import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Provider } from "react-redux";
import { store } from "./store/store";
import { ThemeProvider } from "./contexts/ThemeContext";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import Settings from "./pages/Settings";
import Pricing from "./pages/Pricing";
import Profile from "./pages/Profile";
import ProfileNew from "./pages/ProfileNew";
import Billing from "./pages/Billing";
import NotFound from "./pages/NotFound";
import SocialExplore from "./pages/SocialExplore";
import SocialMessages from "./pages/SocialMessages";
import SocialNotifications from "./pages/SocialNotifications";
import SocialPostDetail from "./pages/SocialPostDetail";
import HomePostDetail from "./pages/HomePostDetail";
import ProfilePage from "./pages/ProfilePage";
import OtherProfilePage from "./pages/OtherProfilePage";
import ProfileConnections from "./pages/ProfileConnections";
import Updates from "./pages/Updates";
import Referrals from "./pages/Referrals";
import TestovayaPage from "./pages/Testovaya";
import FeedTest from "./pages/FeedTest";
import { ClientLayout } from "./components/ClientLayout/ClientLayout";

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 6000, refetchOnWindowFocus: false } },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <Provider store={store}>
      <ThemeProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Standard pages with ClientLayout */}
            <Route
              path="*"
              element={
                <ClientLayout>
                  <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/home" element={<FeedTest />} />
                    <Route path="/home/post/:postId" element={<HomePostDetail />} />
                    <Route path="/marketplace/test-home" element={<Index />} />
                    <Route path="/profile-page" element={<ProfilePage />} />
                    <Route
                      path="/other-profile"
                      element={<OtherProfilePage />}
                    />
                    <Route path="/social/explore" element={<SocialExplore />} />
                    <Route
                      path="/social/notifications"
                      element={<SocialNotifications />}
                    />
                    <Route
                      path="/social/messages"
                      element={<SocialMessages />}
                    />
                    <Route
                      path="/social/post/:postId"
                      element={<SocialPostDetail />}
                    />
                    <Route path="/pricing" element={<Pricing />} />
                    <Route path="/profile" element={<ProfileNew />} />
                    <Route path="/profile-old" element={<Profile />} />
                    <Route path="/billing" element={<Billing />} />
                    <Route path="/updates" element={<Updates />} />
                    <Route path="/referrals" element={<Referrals />} />
                    <Route path="/testovaya" element={<TestovayaPage />} />
                    <Route path="/settings" element={<Settings />} />
                    <Route path="/settings/language" element={<Settings />} />
                    <Route
                      path="/social/profile/:handle"
                      element={<OtherProfilePage />}
                    />
                    <Route
                      path="/social/profile/:handle/connections"
                      element={<ProfileConnections />}
                    />
                    {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </ClientLayout>
              }
            />
          </Routes>
        </BrowserRouter>
        </TooltipProvider>
      </ThemeProvider>
    </Provider>
  </QueryClientProvider>
);

createRoot(document.getElementById("root")!).render(<App />);
