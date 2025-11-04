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
import { AuthProvider } from "./contexts/AuthContext";
import { ClientLayout } from "./components/ClientLayout/ClientLayout";
import { lazy, Suspense } from "react";
import { BrandedLoader } from "./components/common/BrandedLoader";

// Lazy load all pages for better performance and code splitting
const Index = lazy(() => import("./pages/Index"));
const OAuthCallback = lazy(() => import("./pages/OAuthCallback"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Settings = lazy(() => import("./pages/Settings"));
const Pricing = lazy(() => import("./pages/Pricing"));
const Profile = lazy(() => import("./pages/Profile"));
const ProfileNew = lazy(() => import("./pages/ProfileNew"));
const Billing = lazy(() => import("./pages/Billing"));
const NotFound = lazy(() => import("./pages/NotFound"));
const SocialExplore = lazy(() => import("./pages/SocialExplore"));
const SocialMessages = lazy(() => import("./pages/SocialMessages"));
const SocialNotifications = lazy(() => import("./pages/SocialNotifications"));
const SocialPostDetail = lazy(() => import("./pages/SocialPostDetail"));
const SocialPostPreview = lazy(() => import("./pages/SocialPostPreview"));
const SocialTweetComposer = lazy(() => import("./pages/SocialTweetComposer"));
const ProfilePage = lazy(() => import("./pages/ProfilePage"));
const OtherProfilePage = lazy(() => import("./pages/OtherProfilePage"));
const Updates = lazy(() => import("./pages/Updates"));
const Referrals = lazy(() => import("./pages/Referrals"));
const FeedTest = lazy(() => import("./pages/FeedTest"));
const ProfileConnections = lazy(() => import("./pages/ProfileConnections"));
const HomePostDetail = lazy(() => import("./pages/HomePostDetail"));
const CropTestPage = lazy(() => import("./pages/CropTestPage"));
const NewsPage = lazy(() => import("./pages/NewsPage"));
const NewsDetailPage = lazy(() => import("./pages/NewsDetailPage"));

// Admin pages
const AdminLayout = lazy(() => import("./components/admin/AdminLayout").then(m => ({ default: m.AdminLayout })));
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard").then(m => ({ default: m.AdminDashboard })));
const AdminNews = lazy(() => import("./pages/admin/AdminNews").then(m => ({ default: m.AdminNews })));
const AdminUsers = lazy(() => import("./pages/admin/AdminUsers").then(m => ({ default: m.AdminUsers })));
const AdminReports = lazy(() => import("./pages/admin/AdminReports").then(m => ({ default: m.AdminReports })));

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 6000, refetchOnWindowFocus: false } },
});


const App = () => (
  <QueryClientProvider client={queryClient}>
    <Provider store={store}>
      <ThemeProvider>
        <AuthProvider>
          <TooltipProvider>
          <Toaster />
          <Sonner />
        <BrowserRouter>
          <Suspense fallback={<BrandedLoader />}>
            <Routes>
              {/* Public test page without ClientLayout */}
              <Route path="/crop-test" element={<CropTestPage />} />
              
              {/* OAuth callback handler - must be public */}
              <Route path="/auth/callback" element={<OAuthCallback />} />
              
              {/* Admin panel with its own layout */}
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<AdminDashboard />} />
                <Route path="dashboard" element={<AdminDashboard />} />
                <Route path="news" element={<AdminNews />} />
                <Route path="users" element={<AdminUsers />} />
                <Route path="reports" element={<AdminReports />} />
              </Route>
              
              {/* Standard pages with ClientLayout */}
              <Route
                path="*"
                element={
                  <ClientLayout>
                    <Routes>
                    <Route path="/" element={<FeedTest />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/home" element={<FeedTest />} />
                    <Route path="/home/post/:postId" element={<HomePostDetail />} />
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
                      path="/social/compose-classic"
                      element={<SocialTweetComposer />}
                    />
                    <Route
                      path="/social/post/preview"
                      element={<SocialPostPreview />}
                    />
                    <Route
                      path="/social/post/:postId"
                      element={<SocialPostDetail />}
                    />
                    <Route path="/pricing" element={<Pricing />} />
                    <Route path="/profile" element={<ProfileNew />} />
                    <Route path="/profile/:handle" element={<OtherProfilePage />} />
                    <Route path="/profile-old" element={<Profile />} />
                    <Route path="/billing" element={<Billing />} />
                    <Route path="/updates" element={<Updates />} />
                    <Route path="/referrals" element={<Referrals />} />
                    <Route path="/feedtest" element={<FeedTest />} />
                    <Route path="/news" element={<NewsPage />} />
                    <Route path="/news/:id" element={<NewsDetailPage />} />
                    <Route path="/settings" element={<Settings />} />
                    <Route path="/settings/language" element={<Settings />} />
                    <Route
                      path="/social/profile/:handle"
                      element={<OtherProfilePage />}
                    />
                    <Route
                      path="/profile-connections/:handle"
                      element={<ProfileConnections />}
                    />
                    {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </ClientLayout>
              }
            />
            </Routes>
          </Suspense>
        </BrowserRouter>
          </TooltipProvider>
        </AuthProvider>
      </ThemeProvider>
    </Provider>
  </QueryClientProvider>
);

createRoot(document.getElementById("root")!).render(<App />);
