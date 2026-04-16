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
import SharedFragrance from "./pages/SharedFragrance";
import Collection from "./pages/Collection";
import ResetPassword from "./pages/ResetPassword";
import AdminRoute from "./components/AdminRoute";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminNotes from "./pages/admin/AdminNotes";
import AdminQuestions from "./pages/admin/AdminQuestions";
import AdminRules from "./pages/admin/AdminRules";
import AdminIngredients from "./pages/admin/AdminIngredients";
import AdminScents from "./pages/admin/AdminScents";
import AdminConsultations from "./pages/admin/AdminConsultations";
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
          <Route path="/shop/cart" element={<Cart />} />
          <Route path="/shop/checkout" element={<Checkout />} />
          <Route path="/shop/account" element={<Account />} />
          <Route path="/shop/account/scents/:id" element={<ScentDetail />} />
          <Route path="/collection" element={<Collection />} />
          <Route path="/collection/:id" element={<ScentDetail />} />
          <Route path="/shared/fragrance/:shareToken" element={<SharedFragrance />} />
          <Route path="/shop/quiz" element={<QuizLanding />} />
          <Route path="/shop/quiz/for-yourself" element={<QuizForYourself />} />
          <Route path="/shop/quiz/for-someone-else" element={<QuizForSomeoneElse />} />
          <Route path="/shop/quiz/results" element={<QuizResults />} />
          <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
          <Route path="/admin/dashboard" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
          <Route path="/admin/notes" element={<AdminRoute><AdminNotes /></AdminRoute>} />
          <Route path="/admin/questions" element={<AdminRoute><AdminQuestions /></AdminRoute>} />
          <Route path="/admin/rules" element={<AdminRoute><AdminRules /></AdminRoute>} />
          <Route path="/admin/ingredients" element={<AdminRoute><AdminIngredients /></AdminRoute>} />
          <Route path="/admin/scents" element={<AdminRoute><AdminScents /></AdminRoute>} />
          <Route path="/admin/consultations" element={<AdminRoute><AdminConsultations /></AdminRoute>} />
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
