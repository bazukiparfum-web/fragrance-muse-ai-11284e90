import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { CartProvider } from "@/contexts/CartContext";
import { QuizProvider } from "@/contexts/QuizContext";
import { useCartSync } from "@/hooks/useCartSync";
import ScrollToTop from "./components/ScrollToTop";

// Entry routes stay eager so first paint never waits on a second request.
import Index from "./pages/Index";


// Everything else is split out of the initial bundle.
const Auth = lazy(() => import("./pages/Auth"));
const Cart = lazy(() => import("./pages/Cart"));
const Checkout = lazy(() => import("./pages/Checkout"));
const Account = lazy(() => import("./pages/Account"));
const QuizLanding = lazy(() => import("./pages/QuizLanding"));
const GiftCards = lazy(() => import("./pages/GiftCards"));
const QuizForYourself = lazy(() => import("./pages/QuizForYourself"));
const QuizForSomeoneElse = lazy(() => import("./pages/QuizForSomeoneElse"));
const QuizResults = lazy(() => import("./pages/QuizResults"));
const ScentDetail = lazy(() => import("./pages/ScentDetail"));
const ProductDetail = lazy(() => import("./pages/ProductDetail"));
const SharedFragrance = lazy(() => import("./pages/SharedFragrance"));
const Collection = lazy(() => import("./pages/Collection"));
const Business = lazy(() => import("./pages/Business"));
const ScentCoaching = lazy(() => import("./pages/ScentCoaching"));
const Ingredients = lazy(() => import("./pages/Ingredients"));
const About = lazy(() => import("./pages/About"));
const Privacy = lazy(() => import("./pages/legal/Privacy"));
const Terms = lazy(() => import("./pages/legal/Terms"));
const Shipping = lazy(() => import("./pages/legal/Shipping"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const AdminRoute = lazy(() => import("./components/AdminRoute"));
const AdminLayout = lazy(() => import("./components/admin/AdminLayout"));
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const AdminNotes = lazy(() => import("./pages/admin/AdminNotes"));
const AdminQuestions = lazy(() => import("./pages/admin/AdminQuestions"));
const AdminRules = lazy(() => import("./pages/admin/AdminRules"));
const AdminIngredients = lazy(() => import("./pages/admin/AdminIngredients"));
const AdminScents = lazy(() => import("./pages/admin/AdminScents"));
const AdminConsultations = lazy(() => import("./pages/admin/AdminConsultations"));
const AdminReviews = lazy(() => import("./pages/admin/AdminReviews"));
const AdminOrders = lazy(() => import("./pages/admin/AdminOrders"));
const AdminProductionQueue = lazy(() => import("./pages/admin/AdminProductionQueue"));
const AdminPumps = lazy(() => import("./pages/admin/AdminPumps"));
const AdminFormulas = lazy(() => import("./pages/admin/AdminFormulas"));
const AdminUsers = lazy(() => import("./pages/admin/AdminUsers"));
const AdminCustomers = lazy(() => import("./pages/admin/AdminCustomers"));
const AdminCustomerDetail = lazy(() => import("./pages/admin/AdminCustomerDetail"));
const AdminTesting = lazy(() => import("./pages/admin/AdminTesting"));
const ShopifyRedirectSetup = lazy(() => import("./pages/admin/ShopifyRedirectSetup"));
const AdminWaitlist = lazy(() => import("./pages/admin/AdminWaitlist"));
const NotFound = lazy(() => import("./pages/NotFound"));
const FindYourSignatureScent = lazy(() => import("./pages/guides/FindYourSignatureScent"));
const PerfumeNotesExplained = lazy(() => import("./pages/guides/PerfumeNotesExplained"));
const AIPerfumeVsTraditional = lazy(() => import("./pages/guides/AIPerfumeVsTraditional"));
const CustomPerfumeIndia = lazy(() => import("./pages/seo/CustomPerfumeIndia"));
const UniquePerfume = lazy(() => import("./pages/seo/UniquePerfume"));
const NichePerfumeIndia = lazy(() => import("./pages/seo/NichePerfumeIndia"));
const CarFresheners = lazy(() => import("./pages/CarFresheners"));
const CarFreshenerDetail = lazy(() => import("./pages/CarFreshenerDetail"));
const OrderConfirmation = lazy(() => import("./pages/OrderConfirmation"));
const Unsubscribe = lazy(() => import("./pages/Unsubscribe"));

const BazukiCartDrawer = lazy(() => import("./components/cart/BazukiCartDrawer"));
const ZukiChat = lazy(() => import("./components/zuki/ZukiChat"));
const ShopifyDebugPanel = lazy(() => import("./components/dev/ShopifyDebugPanel"));
const CheckoutTestChecklist = lazy(() => import("./components/dev/CheckoutTestChecklist"));

const queryClient = new QueryClient();

const RouteFallback = () => (
  <div className="min-h-screen" style={{ backgroundColor: "#0A0805" }} aria-busy="true" />
);

const AppInner = () => {
  useCartSync();
  return (
    <>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <ScrollToTop />
        <Suspense fallback={<RouteFallback />}>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/home" element={<Navigate to="/" replace />} />

            <Route path="/auth" element={<Auth />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/shop/cart" element={<Cart />} />
            <Route path="/shop/car-fresheners" element={<CarFresheners />} />
            <Route path="/shop/car-fresheners/:handle" element={<CarFreshenerDetail />} />
            <Route path="/shop/checkout" element={<Checkout />} />
            <Route path="/shop/account" element={<Account />} />
            <Route path="/shop/account/scents/:id" element={<ScentDetail />} />
            <Route path="/account" element={<Navigate to="/shop/account" replace />} />
            <Route path="/business" element={<Business />} />
            <Route path="/scent-coaching" element={<ScentCoaching />} />
            <Route path="/ingredients" element={<Ingredients />} />
            <Route path="/about" element={<About />} />
            <Route path="/legal/privacy" element={<Privacy />} />
            <Route path="/legal/terms" element={<Terms />} />
            <Route path="/legal/shipping" element={<Shipping />} />
            <Route path="/collection" element={<Collection />} />
            <Route path="/collection/:id" element={<ScentDetail />} />
            <Route path="/products/:handle" element={<ProductDetail />} />
            <Route path="/product/:handle" element={<ProductDetail />} />
            <Route path="/shared/fragrance/:shareToken" element={<SharedFragrance />} />
            <Route path="/shop/quiz" element={<QuizLanding />} />
            <Route path="/shop/quiz/for-yourself" element={<QuizForYourself />} />
            <Route path="/shop/quiz/for-someone-else" element={<QuizForSomeoneElse />} />
            <Route path="/shop/quiz/results" element={<QuizResults />} />
            <Route path="/gift-cards" element={<GiftCards />} />
            <Route path="/guide/find-your-signature-scent" element={<FindYourSignatureScent />} />
            <Route path="/guide/perfume-notes-explained" element={<PerfumeNotesExplained />} />
            <Route path="/guide/ai-perfume-vs-traditional" element={<AIPerfumeVsTraditional />} />
            <Route path="/custom-perfume-india" element={<CustomPerfumeIndia />} />
            <Route path="/unique-perfume" element={<UniquePerfume />} />
            <Route path="/niche-perfume-india" element={<NichePerfumeIndia />} />
            <Route path="/order-confirmation" element={<OrderConfirmation />} />
            <Route path="/unsubscribe" element={<Unsubscribe />} />
            <Route path="/coming-soon" element={<Navigate to="/" replace />} />

            <Route path="/scent-library" element={<Navigate to="/collection" replace />} />
            <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
              <Route index element={<AdminDashboard />} />
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="notes" element={<AdminNotes />} />
              <Route path="questions" element={<AdminQuestions />} />
              <Route path="rules" element={<AdminRules />} />
              <Route path="ingredients" element={<AdminIngredients />} />
              <Route path="scents" element={<AdminScents />} />
              <Route path="consultations" element={<AdminConsultations />} />
              <Route path="reviews" element={<AdminReviews />} />
              <Route path="orders" element={<AdminOrders />} />
              <Route path="production-queue" element={<AdminProductionQueue />} />
              <Route path="pumps" element={<AdminPumps />} />
              <Route path="formulas" element={<AdminFormulas />} />
              <Route path="users" element={<AdminUsers />} />
              <Route path="customers" element={<AdminCustomers />} />
              <Route path="customers/:id" element={<AdminCustomerDetail />} />
              <Route path="testing" element={<AdminTesting />} />
              <Route path="waitlist" element={<AdminWaitlist />} />
              <Route path="shopify-redirect-setup" element={<ShopifyRedirectSetup />} />
            </Route>
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
      <Suspense fallback={null}>
        <BazukiCartDrawer />
        <ZukiChat />
      </Suspense>

      {(import.meta.env.DEV ||
        (typeof window !== 'undefined' &&
          new URLSearchParams(window.location.search).get('debug') === '1')) && (
        <Suspense fallback={null}>
          <ShopifyDebugPanel />
          <CheckoutTestChecklist />
        </Suspense>
      )}
    </>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <QuizProvider>
        <CartProvider>
          <AppInner />
        </CartProvider>
      </QuizProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
