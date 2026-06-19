import { useEffect } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import api from "@/app/services/api";
import { useAuth } from "@/app/contexts/auth-context";

/**
 * OAuth callback page — called after GitHub/Google redirect.
 *
 * Security Fix #5:
 * The backend NO LONGER puts the access token in the URL (?token=...).
 * Instead it sets a short-lived httpOnly cookie scoped to /api/auth/oauth-token.
 * This page calls GET /api/auth/oauth-token to exchange it once, then
 * the cookie is immediately cleared server-side.
 *
 * This prevents token exposure in:
 * - Browser history
 * - Server/proxy logs
 * - Referrer headers sent to third-party scripts
 */
export default function AuthCallback() {
  const navigate  = useNavigate();
  const { updateUser } = useAuth();

  useEffect(() => {
    // Security: check if there is still a legacy ?token= in the URL
    // (fallback for any cached redirect). Remove it immediately.
    const params = new URLSearchParams(window.location.search);
    const legacyToken = params.get("token");
    if (legacyToken) {
      // Clear it from the URL bar right away — don't leave it exposed
      window.history.replaceState({}, document.title, window.location.pathname);
    }

    // Exchange the one-time httpOnly cookie for the access token
    api
      .get("/auth/oauth-token", { withCredentials: true })
      .then(({ data }) => {
        const accessToken = data.data?.accessToken ?? legacyToken;
        if (!accessToken) throw new Error("No token received");

        localStorage.setItem("accessToken", accessToken);

        return api.get("/auth/me");
      })
      .then((res) => {
        const raw = res.data.data?.user ?? res.data.user;
        if (raw) {
          updateUser({
            id:        raw.id   ?? raw._id ?? "",
            name:      raw.name  ?? "",
            email:     raw.email ?? "",
            role:      raw.role  ?? "student",
            avatar:    raw.avatar,
            plan:      raw.plan  ?? "free",
            createdAt: raw.createdAt ?? new Date().toISOString(),
            streak:    raw.streak,
          });
        }
        navigate("/dashboard", { replace: true });
      })
      .catch(() => {
        localStorage.removeItem("accessToken");
        toast.error("OAuth login failed. Please try again.");
        navigate("/auth", { replace: true });
      });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div
      style={{ backgroundColor: "#0F172A" }}
      className="fixed inset-0 flex flex-col items-center justify-center gap-4"
    >
      <Loader2 className="w-10 h-10 text-[#3B82F6] animate-spin" />
      <p className="text-[#94A3B8] text-sm font-medium tracking-wide">
        Completing sign in...
      </p>
    </div>
  );
}
