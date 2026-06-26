import { Button } from "@/app/components/ui/button";
import { Github, Mail } from "lucide-react";

interface SocialLoginButtonsProps {
  onSocialLogin: (provider: "github" | "google") => void;
  disabled?: boolean;
}

export function SocialLoginButtons({ onSocialLogin, disabled }: SocialLoginButtonsProps) {
  return (
    <>
      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="bg-card px-2 text-muted-foreground">OR CONTINUE WITH</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Button
          type="button"
          variant="outline"
          className="bg-background border-border hover:bg-muted"
          onClick={() => onSocialLogin("github")}
          disabled={disabled}
        >
          <Github className="w-4 h-4 mr-2" /> GitHub
        </Button>
        <Button
          type="button"
          variant="outline"
          className="bg-background border-border hover:bg-muted"
          onClick={() => onSocialLogin("google")}
          disabled={disabled}
        >
          <Mail className="w-4 h-4 mr-2" /> Google
        </Button>
      </div>
    </>
  );
}
