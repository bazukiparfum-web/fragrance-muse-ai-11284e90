import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Gift, User, Clock } from 'lucide-react';
import { useQuiz } from '@/contexts/QuizContext';
import { supabase } from '@/integrations/supabase/client';

const QuizLanding = () => {
  const navigate = useNavigate();
  const { setIsForGift, resetAnswers } = useQuiz();

  const handleForMyself = async () => {
    resetAnswers();
    setIsForGift(false);
    
    // Clear any stale quiz progress when starting fresh from landing page
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase
          .from('quiz_progress')
          .delete()
          .eq('user_id', user.id)
          .eq('quiz_type', 'myself');
      }
    } catch (error) {
      console.error('Error clearing progress:', error);
    }
    
    navigate('/shop/quiz/for-yourself');
  };

  const handleForSomeone = async () => {
    resetAnswers();
    setIsForGift(true);
    
    // Clear any stale quiz progress when starting fresh from landing page
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase
          .from('quiz_progress')
          .delete()
          .eq('user_id', user.id)
          .eq('quiz_type', 'someone_else');
      }
    } catch (error) {
      console.error('Error clearing progress:', error);
    }
    
    navigate('/shop/quiz/for-someone-else');
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="font-serif text-5xl md:text-6xl font-bold mb-6 heading-luxury">
            Create Your Signature Scent
          </h1>
          <p className="text-lg text-muted-foreground mb-4">
            Answer a few questions and let AI craft your perfect fragrance
          </p>
          
          <div className="flex items-center justify-center gap-2 text-muted-foreground mb-12">
            <Clock className="h-4 w-4" />
            <span>Estimated time: 2 minutes</span>
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            <button
              onClick={handleForMyself}
              className="group relative overflow-hidden rounded-lg border-2 border-border bg-card hover:border-accent transition-all duration-300 p-8 text-left hover-lift"
            >
              <div className="flex flex-col items-start gap-4">
                <div className="p-3 rounded-full bg-secondary">
                  <User className="h-8 w-8 text-foreground" />
                </div>
                <div>
                  <h3 className="font-serif text-2xl font-bold mb-2 heading-luxury">For Myself</h3>
                  <p className="text-muted-foreground">
                    Discover a scent that matches your unique personality and style
                  </p>
                </div>
              </div>
            </button>

            <button
              onClick={handleForSomeone}
              className="group relative overflow-hidden rounded-lg border-2 border-border bg-card hover:border-accent transition-all duration-300 p-8 text-left hover-lift"
            >
              <div className="flex flex-col items-start gap-4">
                <div className="p-3 rounded-full bg-secondary">
                  <Gift className="h-8 w-8 text-foreground" />
                </div>
                <div>
                  <h3 className="font-serif text-2xl font-bold mb-2 heading-luxury">For Someone Special</h3>
                  <p className="text-muted-foreground">
                    Find the perfect gift fragrance for someone you care about
                  </p>
                </div>
              </div>
            </button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default QuizLanding;
