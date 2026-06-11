import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { CartProvider } from "@/contexts/CartContext";
import { QuizProvider } from "@/contexts/QuizContext";
import { useCartSync } from "@/hooks/useCartSync";
import ScrollToTop from "./components/ScrollToTop";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Account from "./pages/Account";
import QuizLanding from "./pages/QuizLanding";
import GiftCards from "./pages/GiftCards";
import QuizForYourself from "./pages/QuizForYourself";
import QuizForSomeoneElse from "./pages/QuizForSomeoneElse";
import QuizResults from "./pages/QuizResults";
import ScentDetail from "./pages/ScentDetail";
import ProductDetail from "./pages/ProductDetail";
import SharedFragrance from "./pages/SharedFragrance";
import Collection from "./pages/Collection";
import Business from "./pages/Business";
import ScentCoaching from "./pages/ScentCoaching";
import Ingredients from "./pages/Ingredients";
import About from "./pages/About";
import Privacy from "./pages/legal/Privacy";
import Terms from "./pages/legal/Terms";
import Shipping from "./pages/legal/Shipping";
import ResetPassword from "./pages/ResetPassword";
import AdminRoute from "./components/AdminRoute";
import AdminLayout from "./components/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminNotes from "./pages/admin/AdminNotes";
import AdminQuestions from "./pages/admin/AdminQuestions";
import AdminRules from "./pages/admin/AdminRules";
import AdminIngredients from "./pages/admin/AdminIngredients";
import AdminScents from "./pages/admin/AdminScents";
import AdminConsultations from "./pages/admin/AdminConsultations";
import AdminReviews from "./pages/admin/AdminReviews";
import AdminOrders from "./pages/admin/AdminOrders";
import AdminProductionQueue from "./pages/admin/AdminProductionQueue";
import AdminPumps from "./pages/admin/AdminPumps";
import AdminFormulas from "./pages/admin/AdminFormulas";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminCustomers from "./pages/admin/AdminCustomers";
import AdminCustomerDetail from "./pages/admin/AdminCustomerDetail";
import AdminTesting from "./pages/admin/AdminTesting";
import ShopifyRedirectSetup from "./pages/admin/ShopifyRedirectSetup";
import NotFound from "./pages/NotFound";
import FindYourSignatureScent from "./pages/guides/FindYourSignatureScent";
import ShopifyDebugPanel from "./components/dev/ShopifyDebugPanel";
import BazukiCartDrawer from "./components/cart/BazukiCartDrawer";
import CheckoutTestChecklist from "./components/dev/CheckoutTestChecklist";
import OrderConfirmation from "./pages/OrderConfirmation";
import PerfumeNotesExplained from "./pages/guides/PerfumeNotesExplained";
import AIPerfumeVsTraditional from "./pages/guides/AIPerfumeVsTraditional";
import CustomPerfumeIndia from "./pages/seo/CustomPerfumeIndia";
import UniquePerfume from "./pages/seo/UniquePerfume";
import NichePerfumeIndia from "./pages/seo/NichePerfumeIndia";

const queryClient = new QueryClient();

const AppInner = () => {
  useCartSync();
  return (
    <>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/shop/cart" element={<Cart />} />
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
            <Route path="shopify-redirect-setup" element={<ShopifyRedirectSetup />} />
          </Route>
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
      <BazukiCartDrawer />
      {(import.meta.env.DEV ||
        (typeof window !== 'undefined' &&
          new URLSearchParams(window.location.search).get('debug') === '1')) && (
        <>
          <ShopifyDebugPanel />
          <CheckoutTestChecklist />
        </>
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
