import { RouterProvider } from "react-router";
import { router } from "@/app/routes";
import { AuthProvider } from "@/app/contexts/auth-context";
import { LabsProvider } from "@/app/contexts/labs-context";
import { ThemeProvider } from "@/app/contexts/theme-context";
import { LanguageProvider } from "@/app/contexts/language-context";
import { Toaster } from "@/app/components/ui/sonner";

export default function App() {
  return (
    // ThemeProvider is outermost so theme is available everywhere including auth pages
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          {/* LabsProvider must be inside AuthProvider so it can read isAuthenticated */}
          <LabsProvider>
            <RouterProvider router={router} />
            <Toaster />
          </LabsProvider>
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}
