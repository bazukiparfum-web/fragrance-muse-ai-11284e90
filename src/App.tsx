import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CartProvider } from "@/contexts/CartContext";
import { QuizProvider } from "@/contexts/QuizContext";
import Index from "./pages/Index";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Account from "./pages/Account";
import Auth from "./pages/Auth";
import QuizLanding from "./pages/QuizLanding";
import QuizForYourself from "./pages/QuizForYourself";
import QuizForSomeoneElse from "./pages/QuizForSomeoneElse";
import QuizResults from "./pages/QuizResults";
import ScentDetail from "./pages/ScentDetail";
import SharedFragrance from "./pages/SharedFragrance";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminNotes from "./pages/admin/AdminNotes";
import AdminQuestions from "./pages/admin/AdminQuestions";
import AdminRules from "./pages/admin/AdminRules";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <QuizProvider>
        <CartProvider>
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
              <Route path="/shared/fragrance/:shareToken" element={<SharedFragrance />} />
              <Route path="/shop/quiz" element={<QuizLanding />} />
              <Route path="/shop/quiz/for-yourself" element={<QuizForYourself />} />
              <Route path="/shop/quiz/for-someone-else" element={<QuizForSomeoneElse />} />
              <Route path="/shop/quiz/results" element={<QuizResults />} />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/notes" element={<AdminNotes />} />
              <Route path="/admin/questions" element={<AdminQuestions />} />
              <Route path="/admin/rules" element={<AdminRules />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </CartProvider>
      </QuizProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
