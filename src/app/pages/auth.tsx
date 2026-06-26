import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { Button } from "@/app/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/app/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/app/components/ui/dialog";
import { Network, Github, Mail, Loader2, CheckCircle2 } from "lucide-react";
import { BackgroundWatermark } from "@/app/components/background-watermark";
import { SocialLoginButtons } from "@/app/components/social-login-buttons";
import { getApiErrorMessage } from "@/app/utils/api-error";
import { useAuth } from "@/app/contexts/auth-context";
import api from "@/app/services/api";
import { toast } from "sonner";

export default function AuthPage() {
  const navigate = useNavigate();
  const { login, register, loginWithProvider, isAuthenticated } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [showVerifyBanner, setShowVerifyBanner] = useState(false);
  const [forgotOpen, setForgotOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotSent, setForgotSent] = useState(false);

  useEffect(() => {
    if (isAuthenticated) navigate("/dashboard");
  }, [isAuthenticated, navigate]);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    try {
      await login(email, password);
      toast.success("Welcome back!");
      navigate("/dashboard");
    } catch (err: unknown) {
      toast.error(getApiErrorMessage(err, "Login failed. Please try again."));
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;
    if (password !== confirmPassword) {
      toast.error("Passwords do not match!");
      setIsLoading(false);
      return;
    }
    try {
      await register(name, email, password);
      setShowVerifyBanner(true);
    } catch (err: unknown) {
      toast.error(getApiErrorMessage(err, "Registration failed. Please try again."));
    } finally {
      setIsLoading(false);
    }
  };

  // BUG-11 fix: loginWithProvider is a redirect (void), not a Promise.
  // No await, no try/catch — the page navigates away immediately.
  const handleSocialLogin = (provider: "github" | "google") => {
    loginWithProvider(provider);
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotLoading(true);
    try {
      await api.post("/auth/forgot-password", { email: forgotEmail });
      setForgotSent(true);
    } catch (err: unknown) {
      toast.error(getApiErrorMessage(err, "Something went wrong. Try again later."));
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative">
      <BackgroundWatermark size="w-[500px]" />
      <div className="w-full max-w-md space-y-6">
        {/* Logo */}
        <div className="text-center">
          <Link to="/" className="inline-flex items-center gap-2 mb-2">
            <img src="/logo.png" alt="Smart IT Lab" className="w-8 h-8 hidden dark:block" />
            <img src="/logo-light.png" alt="Smart IT Lab" className="w-8 h-8 block dark:hidden" />
            <span className="font-mono text-2xl tracking-tight">Smart IT Lab</span>
          </Link>
          <p className="text-muted-foreground text-sm">Master Enterprise Networking</p>
        </div>

        {/* Verification banner */}
        {showVerifyBanner && (
          <div className="p-4 bg-[#F59E0B]/10 border border-[#F59E0B]/30 rounded-lg flex items-start gap-3">
            <Mail className="w-5 h-5 text-[#F59E0B] mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold text-[#F59E0B]">
                📧 Check your email to verify your account
              </p>
              <p className="text-xs text-[#94A3B8] mt-1">
                We've sent a verification link to your email. Please verify before logging in.
              </p>
            </div>
          </div>
        )}

        {/* Auth Card */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-2xl text-center">Welcome</CardTitle>
            <CardDescription className="text-center text-muted-foreground">
              Sign in to access your lab environment
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-muted">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="register">Register</TabsTrigger>
              </TabsList>

              <TabsContent value="login" className="space-y-4 mt-6">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">University Email</Label>
                    <Input id="email" name="email" type="email" placeholder="student@university.edu" className="font-mono" required />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password">Password</Label>
                      <button type="button" onClick={() => { setForgotOpen(true); setForgotSent(false); setForgotEmail(""); }} className="text-xs text-[#3B82F6] hover:text-[#2563EB]">
                        Forgot password?
                      </button>
                    </div>
                    <Input id="password" name="password" type="password" placeholder="••••••••" required />
                  </div>
                  <Button type="submit" className="w-full bg-[#3B82F6] hover:bg-[#2563EB] text-white" disabled={isLoading}>
                    {isLoading ? "Signing in..." : "Sign In"}
                  </Button>
                </form>

                <SocialLoginButtons onSocialLogin={handleSocialLogin} disabled={isLoading} />
              </TabsContent>

              <TabsContent value="register" className="space-y-4 mt-6">
                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input id="name" name="name" type="text" placeholder="Ahmed Hassan" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reg-email">University Email</Label>
                    <Input id="reg-email" name="email" type="email" placeholder="student@university.edu" className="font-mono" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reg-password">Password</Label>
                    <Input id="reg-password" name="password" type="password" placeholder="••••••••" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">Confirm Password</Label>
                    <Input id="confirm-password" name="confirmPassword" type="password" placeholder="••••••••" required />
                  </div>
                  <Button type="submit" className="w-full bg-[#00FF41] hover:bg-[#00DD35] text-[#0F172A] font-semibold" disabled={isLoading}>
                    {isLoading ? "Creating account..." : "Create Account"}
                  </Button>
                </form>

                <SocialLoginButtons onSocialLogin={handleSocialLogin} disabled={isLoading} />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <p className="text-center text-sm text-muted-foreground">
          By continuing, you agree to our{" "}
          <a href="#" className="text-[#3B82F6] hover:text-[#2563EB]">Terms of Service</a>{" "}
          and{" "}
          <a href="#" className="text-[#3B82F6] hover:text-[#2563EB]">Privacy Policy</a>
        </p>
      </div>

      {/* Forgot Password Dialog */}
      <Dialog open={forgotOpen} onOpenChange={setForgotOpen}>
        <DialogContent className="bg-card border-border sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Reset Password</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Enter your email and we'll send you a reset link.
            </DialogDescription>
          </DialogHeader>

          {forgotSent ? (
            <div className="py-6 text-center space-y-3">
              <CheckCircle2 className="w-12 h-12 text-[#00FF41] mx-auto" />
              <p className="text-foreground font-medium">Check your inbox</p>
              <p className="text-sm text-muted-foreground">If an account with that email exists, a password reset link has been sent.</p>
              <Button onClick={() => setForgotOpen(false)} className="mt-4 bg-[#3B82F6] hover:bg-[#2563EB] text-white">Done</Button>
            </div>
          ) : (
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="forgot-email">Email Address</Label>
                <Input id="forgot-email" type="email" value={forgotEmail} onChange={(e) => setForgotEmail(e.target.value)} placeholder="student@university.edu" className="font-mono" required />
              </div>
              <Button type="submit" className="w-full bg-[#3B82F6] hover:bg-[#2563EB] text-white" disabled={forgotLoading}>
                {forgotLoading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Sending...</> : "Send Reset Link"}
              </Button>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
