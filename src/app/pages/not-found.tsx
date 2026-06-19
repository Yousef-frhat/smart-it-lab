import { useNavigate } from "react-router";
import { Button } from "@/app/components/ui/button";
import { Home, LayoutDashboard } from "lucide-react";

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#0F172A] flex items-center justify-center relative overflow-hidden select-none">
      {/* Scanline overlay */}
      <div
        className="pointer-events-none fixed inset-0 z-10"
        style={{
          background:
            "repeating-linear-gradient(0deg, rgba(0,0,0,0.15) 0px, rgba(0,0,0,0.15) 1px, transparent 1px, transparent 3px)",
        }}
      />

      {/* Floating grid dots background */}
      <div
        className="pointer-events-none fixed inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "radial-gradient(circle, #3B82F6 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      <div className="relative z-20 text-center px-6 max-w-2xl">
        {/* Glitch 404 */}
        <div className="relative mb-6">
          <h1
            className="text-[10rem] sm:text-[12rem] font-black leading-none text-[#3B82F6] tracking-tighter"
            style={{ textShadow: "0 0 60px rgba(59,130,246,0.35)" }}
          >
            <span className="inline-block animate-glitch-1">4</span>
            <span className="inline-block animate-glitch-2">0</span>
            <span className="inline-block animate-glitch-3">4</span>
          </h1>
        </div>

        {/* Subtitle */}
        <h2
          className="text-2xl sm:text-3xl font-bold tracking-[0.25em] mb-8"
          style={{
            fontFamily: "'Courier New', monospace",
            color: "#00FF41",
            textShadow: "0 0 20px rgba(0,255,65,0.4)",
          }}
        >
          LAB NOT FOUND
        </h2>

        {/* Terminal-style output */}
        <div className="text-left max-w-lg mx-auto mb-10 space-y-2 font-mono text-sm sm:text-base">
          <p className="text-[#EF4444]">
            <span className="text-[#94A3B8]">&gt;</span> ERROR: The requested
            lab environment does not exist
          </p>
          <p className="text-[#F59E0B]">
            <span className="text-[#94A3B8]">&gt;</span> Possible causes:
            invalid ID, lab deleted, or access denied
          </p>
          <p className="text-[#00FF41]">
            <span className="text-[#94A3B8]">&gt;</span> Returning to safe
            zone...
            <span className="inline-block w-2 h-5 bg-[#00FF41] ml-1 align-middle animate-blink" />
          </p>
        </div>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button
            onClick={() => navigate("/dashboard")}
            className="bg-[#3B82F6] hover:bg-[#2563EB] text-white px-6 py-3 text-base"
          >
            <LayoutDashboard className="w-5 h-5 mr-2" />
            Go to Dashboard
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate("/")}
            className="border-[#334155] text-[#94A3B8] hover:bg-[#1E293B] hover:text-white px-6 py-3 text-base"
          >
            <Home className="w-5 h-5 mr-2" />
            Go Home
          </Button>
        </div>
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes blink {
          0%, 49% { opacity: 1; }
          50%, 100% { opacity: 0; }
        }
        .animate-blink {
          animation: blink 1s step-end infinite;
        }
        @keyframes glitch-1 {
          0%, 92%, 100% { transform: translate(0); }
          93% { transform: translate(-3px, 2px); }
          95% { transform: translate(3px, -2px); }
          97% { transform: translate(-2px, -1px); }
        }
        @keyframes glitch-2 {
          0%, 90%, 100% { transform: translate(0); opacity: 1; }
          91% { transform: translate(4px, -3px); opacity: 0.8; }
          93% { transform: translate(-3px, 2px); opacity: 1; }
          95% { transform: translate(2px, 1px); opacity: 0.9; }
        }
        @keyframes glitch-3 {
          0%, 94%, 100% { transform: translate(0); }
          95% { transform: translate(2px, 3px); }
          97% { transform: translate(-4px, -1px); }
          99% { transform: translate(1px, -2px); }
        }
        .animate-glitch-1 { animation: glitch-1 4s infinite; }
        .animate-glitch-2 { animation: glitch-2 3.5s infinite; }
        .animate-glitch-3 { animation: glitch-3 4.5s infinite; }
      `}</style>
    </div>
  );
}
