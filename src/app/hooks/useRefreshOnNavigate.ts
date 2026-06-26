import { useEffect } from "react";
import { useLocation } from "react-router";

export function useRefreshOnNavigate(refresh: () => void) {
  const location = useLocation();

  useEffect(() => {
    refresh();
  }, [location.key]); // eslint-disable-line react-hooks/exhaustive-deps
}
