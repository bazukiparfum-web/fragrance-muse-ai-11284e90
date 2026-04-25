import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { CartProvider } from "@/contexts/CartContext";
import { QuizProvider } from "@/contexts/QuizContext";
import { useCartSync } from "@/hooks/useCartSync";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Account from "./pages/Account";
import QuizLanding from "./pages/QuizLanding";
import QuizForYourself from "./pages/QuizForYourself";
import QuizForSomeoneElse from "./pages/QuizForSomeoneElse";
import QuizResults from "./pages/QuizResults";
import ScentDetail from "./pages/ScentDetail";
import ProductDetail from "./pages/ProductDetail";
import SharedFragrance from "./pages/SharedFragrance";
import Collection from "./pages/Collection";
import Business from "./pages/Business";
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
import AdminUsers from "./pages/admin/AdminUsers";
import AdminTesting from "./pages/admin/AdminTesting";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const AppInner = () => {
  useCartSync();
  return (
    <>
      <Toaster />
      <Sonner />
      <BrowserRouter>
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
          <Route path="/legal/privacy" element={<Privacy />} />
          <Route path="/legal/terms" element={<Terms />} />
          <Route path="/legal/shipping" element={<Shipping />} />
          <Route path="/collection" element={<Collection />} />
          <Route path="/collection/:id" element={<ScentDetail />} />
          <Route path="/product/:handle" element={<ProductDetail />} />
          <Route path="/shared/fragrance/:shareToken" element={<SharedFragrance />} />
          <Route path="/shop/quiz" element={<QuizLanding />} />
          <Route path="/shop/quiz/for-yourself" element={<QuizForYourself />} />
          <Route path="/shop/quiz/for-someone-else" element={<QuizForSomeoneElse />} />
          <Route path="/shop/quiz/results" element={<QuizResults />} />
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
            <Route path="users" element={<AdminUsers />} />
            <Route path="testing" element={<AdminTesting />} />
          </Route>
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
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
