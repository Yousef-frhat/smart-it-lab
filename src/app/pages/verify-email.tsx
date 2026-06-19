import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router";
import { Button } from "@/app/components/ui/button";
import { Network, Loader2, CheckCircle2, XCircle, Mail } from "lucide-react";
import api from "@/app/services/api";

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");

  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [resendEmail, setResendEmail] = useState("");
  const [resendLoading, setResendLoading] = useState(false);
  const [resendSent, setResendSent] = useState(false);

  useEffect(() => {
    if (!token) {
      setStatus("error");
      return;
    }
    api
      .post("/auth/verify-email", { token })
      .then(() => setStatus("success"))
      .catch(() => setStatus("error"));
  }, [token]);

  const handleResend = async () => {
    if (!resendEmail) return;
    setResendLoading(true);
    try {
      await api.post("/auth/resend-verification", { email: resendEmail });
      setResendSent(true);
    } catch {
      // still show success to prevent enumeration
      setResendSent(true);
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0F172A] flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-6">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-4">
          <Network className="w-7 h-7 text-[#00FF41]" />
          <span className="font-mono text-xl">Smart IT Lab</span>
        </div>

        {status === "loading" && (
          <div className="space-y-4">
            <Loader2 className="w-16 h-16 text-[#3B82F6] animate-spin mx-auto" />
            <p className="text-[#94A3B8]">Verifying your email...</p>
          </div>
        )}

        {status === "success" && (
          <div className="space-y-4">
            <div className="w-20 h-20 mx-auto rounded-full bg-[#00FF41]/10 flex items-center justify-center">
              <CheckCircle2 className="w-10 h-10 text-[#00FF41]" />
            </div>
            <h1 className="text-2xl font-bold text-white">Email Verified!</h1>
            <p className="text-[#94A3B8]">
              Your email has been verified successfully. You can now log in.
            </p>
            <Button
              onClick={() => navigate("/auth")}
              className="bg-[#3B82F6] hover:bg-[#2563EB] text-white px-8"
            >
              Go to Login
            </Button>
          </div>
        )}

        {status === "error" && (
          <div className="space-y-4">
            <div className="w-20 h-20 mx-auto rounded-full bg-[#EF4444]/10 flex items-center justify-center">
              <XCircle className="w-10 h-10 text-[#EF4444]" />
            </div>
            <h1 className="text-2xl font-bold text-white">Invalid or Expired Link</h1>
            <p className="text-[#94A3B8]">
              This verification link is invalid or has expired.
            </p>

            {/* Resend section */}
            {!resendSent ? (
              <div className="space-y-3 pt-4 border-t border-[#334155]">
                <p className="text-sm text-[#94A3B8]">Need a new link? Enter your email:</p>
                <input
                  type="email"
                  value={resendEmail}
                  onChange={(e) => setResendEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full px-3 py-2 bg-[#1E293B] border border-[#334155] rounded-md text-white placeholder:text-[#64748B] focus:outline-none focus:ring-2 focus:ring-[#3B82F6] font-mono text-sm"
                />
                <Button
                  onClick={handleResend}
                  disabled={resendLoading || !resendEmail}
                  className="w-full bg-[#F59E0B] hover:bg-[#D97706] text-[#0F172A] font-semibold"
                >
                  {resendLoading ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Sending...</>
                  ) : (
                    <><Mail className="w-4 h-4 mr-2" /> Resend Verification Email</>
                  )}
                </Button>
              </div>
            ) : (
              <div className="p-4 bg-[#00FF41]/10 border border-[#00FF41]/30 rounded-lg">
                <p className="text-sm text-[#00FF41]">
                  If that email exists and is unverified, a new link has been sent.
                </p>
              </div>
            )}

            <Button
              variant="outline"
              onClick={() => navigate("/auth")}
              className="border-[#334155] text-[#94A3B8] hover:bg-[#1E293B]"
            >
              Back to Login
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
