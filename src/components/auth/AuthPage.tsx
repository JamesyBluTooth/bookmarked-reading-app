import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { BookMarked, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetLoading, setResetLoading] = useState(false);
  const { toast } = useToast();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        toast({
          title: "Welcome back!",
          description: "You've successfully signed in.",
        });
      } else {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/`
        }
      });
        if (error) throw error;
        toast({
          title: "Account created!",
          description: "Welcome to Bookmarked.",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
        redirectTo: `${window.location.origin}/`,
      });
      
      if (error) throw error;
      
      toast({
        title: "Password reset email sent",
        description: "Check your email for a password reset link.",
      });
      setShowForgotPassword(false);
      setResetEmail("");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background relative">
      {/* Top bar with close button and sign up */}
      <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-center">
        <button className="text-muted-foreground hover:text-foreground transition-colors">
          <X className="w-6 h-6" />
        </button>
        {isLogin && (
          <Button 
            variant="ghost" 
            onClick={() => setIsLogin(false)}
            className="text-primary hover:text-primary/90 font-semibold"
          >
            SIGN UP
          </Button>
        )}
      </div>

      {/* Main content */}
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {isLogin ? (
            <div className="space-y-6">
              {/* Welcome header */}
              <div className="text-center space-y-6">
                <h1 className="text-3xl font-bold text-foreground">Welcome Back!</h1>
                
                {/* Avatar */}
                <div className="flex justify-center">
                  <div className="w-20 h-20 bg-gradient-to-br from-primary to-primary/70 rounded-full flex items-center justify-center ring-4 ring-primary/20">
                    <BookMarked className="w-10 h-10 text-primary-foreground" />
                  </div>
                </div>

                {/* Email display */}
                <div>
                  <p className="text-foreground font-medium">{email || "your@email.com"}</p>
                  <button
                    type="button"
                    onClick={() => setIsLogin(false)}
                    className="text-sm text-primary hover:text-primary/80 font-semibold transition-colors mt-1"
                  >
                    USE ANOTHER ACCOUNT
                  </button>
                </div>
              </div>

              {/* Login form */}
              <form onSubmit={handleAuth} className="space-y-4">
                <div className="relative">
                  <Input
                    id="password"
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="pr-24 h-12 text-base"
                  />
                  <button
                    type="button"
                    onClick={() => setShowForgotPassword(true)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground hover:text-primary transition-colors font-semibold"
                  >
                    FORGOT?
                  </button>
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full h-12 text-base font-semibold bg-primary hover:bg-primary/90" 
                  disabled={loading}
                >
                  {loading ? "LOADING..." : "SIGN IN"}
                </Button>
              </form>

              {/* Footer text */}
              <div className="text-center space-y-2 text-xs text-muted-foreground px-4">
                <p>
                  By signing in to Bookmarked, you agree to our{" "}
                  <a href="#" className="text-primary hover:underline">Terms</a> and{" "}
                  <a href="#" className="text-primary hover:underline">Privacy Policy</a>.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Sign up header */}
              <div className="text-center space-y-4">
                <div className="flex justify-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary/70 rounded-2xl flex items-center justify-center">
                    <BookMarked className="w-10 h-10 text-primary-foreground" />
                  </div>
                </div>
                <h1 className="text-3xl font-bold text-foreground">Get Started</h1>
                <p className="text-muted-foreground">Create an account to start tracking books</p>
              </div>

              {/* Sign up form */}
              <form onSubmit={handleAuth} className="space-y-4">
                <Input
                  id="email"
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-12 text-base"
                />
                <Input
                  id="password"
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-12 text-base"
                />
                <Button 
                  type="submit" 
                  className="w-full h-12 text-base font-semibold bg-primary hover:bg-primary/90" 
                  disabled={loading}
                >
                  {loading ? "LOADING..." : "SIGN UP"}
                </Button>
              </form>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => setIsLogin(true)}
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Already have an account? <span className="text-primary font-semibold">Sign in</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Forgot password dialog */}
      <Dialog open={showForgotPassword} onOpenChange={setShowForgotPassword}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Reset Password</DialogTitle>
            <DialogDescription>
              Enter your email address and we'll send you a link to reset your password.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleForgotPassword} className="space-y-4">
            <Input
              id="reset-email"
              type="email"
              placeholder="Email"
              value={resetEmail}
              onChange={(e) => setResetEmail(e.target.value)}
              required
              className="h-12"
            />
            <Button type="submit" className="w-full h-12 font-semibold" disabled={resetLoading}>
              {resetLoading ? "SENDING..." : "SEND RESET LINK"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
