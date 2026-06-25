import React from "react";
import { createRoot } from "react-dom/client";
import * as Sentry from "@sentry/react";
import App from "./app/App.tsx";
import "./styles/index.css";

Sentry.init({
  dsn: "https://9ec3094913aa8c7ee426b9316c245e2e@o4511626487791616.ingest.de.sentry.io/4511626520952912",
  environment: import.meta.env.MODE,
  integrations: [
    Sentry.browserTracingIntegration(),
  ],
  tracesSampleRate: 1.0,
});

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
