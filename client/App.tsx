import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
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
const Billing = lazy(() => import("./pages/Billing"));
const NotFound = lazy(() => import("./pages/NotFound"));
const SocialExplore = lazy(() => import("./pages/SocialExplore"));
const SocialMessages = lazy(() => import("./pages/SocialMessages"));
const SocialNotifications = lazy(() => import("./pages/SocialNotifications"));
const SocialPostDetail = lazy(() => import("./pages/SocialPostDetail"));
const SocialPostPreview = lazy(() => import("./pages/SocialPostPreview"));
const SocialTweetComposer = lazy(() => import("./pages/SocialTweetComposer"));
const UnifiedProfilePage = lazy(() => import("./pages/UnifiedProfilePage"));
const Updates = lazy(() => import("./pages/Updates"));
const Referrals = lazy(() => import("./pages/Referrals"));
const FeedTest = lazy(() => import("./pages/FeedTest"));
const ProfileConnections = lazy(() => import("./pages/ProfileConnections"));
const HomePostDetail = lazy(() => import("./pages/HomePostDetail"));
const CropTestPage = lazy(() => import("./pages/CropTestPage"));
const NewsPage = lazy(() => import("./pages/NewsPage"));
const NewsDetailPage = lazy(() => import("./pages/NewsDetailPage"));

// Import redirect components
import { ProfileRedirect } from "./components/common/ProfileRedirect";
import { ProfileHandleRedirect } from "./components/common/ProfileHandleRedirect";
import { RouteDebugger } from "./components/common/RouteDebugger";

// Admin pages
const AdminLayout = lazy(() => import("./components/admin/AdminLayout").then(m => ({ default: m.AdminLayout })));
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard").then(m => ({ default: m.AdminDashboard })));
const AdminNews = lazy(() => import("./pages/admin/AdminNews").then(m => ({ default: m.AdminNews })));
const AdminUsers = lazy(() => import("./pages/admin/AdminUsers").then(m => ({ default: m.AdminUsers })));
const AdminReports = lazy(() => import("./pages/admin/AdminReports").then(m => ({ default: m.AdminReports })));

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 6000, refetchOnWindowFocus: false } },
});


const App = () => {
  console.log('[APP] App component rendering');
  
  return (
  <QueryClientProvider client={queryClient}>
    <Provider store={store}>
      <ThemeProvider>
        <AuthProvider>
          <TooltipProvider>
          <Toaster />
          <Sonner />
        <BrowserRouter>
          <RouteDebugger />
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
              
              {/* ClientLayout as layout route - all pages below use ClientLayout with Outlet */}
              <Route element={<ClientLayout />}>
                {/* Home / Feed */}
                <Route index element={<FeedTest />} />
                <Route path="home" element={<FeedTest />} />
                <Route path="home/post/:postId" element={<HomePostDetail />} />
                <Route path="feedtest" element={<FeedTest />} />
                
                {/* Dashboard & Settings - static routes above dynamic */}
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="settings" element={<Settings />} />
                <Route path="settings/language" element={<Settings />} />
                
                {/* Social routes */}
                <Route path="social/explore" element={<SocialExplore />} />
                <Route path="social/notifications" element={<SocialNotifications />} />
                <Route path="social/messages" element={<SocialMessages />} />
                <Route path="social/compose-classic" element={<SocialTweetComposer />} />
                <Route path="social/post/preview" element={<SocialPostPreview />} />
                <Route path="social/post/:postId" element={<SocialPostDetail />} />
                
                {/* Other static routes */}
                <Route path="pricing" element={<Pricing />} />
                <Route path="billing" element={<Billing />} />
                <Route path="updates" element={<Updates />} />
                <Route path="referrals" element={<Referrals />} />
                <Route path="news" element={<NewsPage />} />
                <Route path="news/:id" element={<NewsDetailPage />} />
                <Route path="profile-connections/:handle" element={<ProfileConnections />} />
                
                {/* Redirects for old profile routes */}
                <Route path="profile-page" element={<ProfileRedirect />} />
                <Route path="profile" element={<Navigate to="/settings" replace />} />
                <Route path="profile/:handle" element={<ProfileHandleRedirect />} />
                <Route path="social/profile/:handle" element={<ProfileHandleRedirect />} />
                
                {/* Legacy/deprecated routes */}
                <Route path="profile-old" element={<Profile />} />
                
                {/* Profile route with dynamic username parameter
                    NOTE: :username will match /@danil as username="@danil"
                    The @ is stripped in UnifiedProfilePage component */}
                <Route path=":username" element={<UnifiedProfilePage />} />
                
                {/* 404 catch-all - must be last */}
                <Route path="*" element={<NotFound />} />
              </Route>
            </Routes>
          </Suspense>
        </BrowserRouter>
          </TooltipProvider>
        </AuthProvider>
      </ThemeProvider>
    </Provider>
  </QueryClientProvider>
  );
};

createRoot(document.getElementById("root")!).render(<App />);
