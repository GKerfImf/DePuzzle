import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { ClerkProvider } from "@clerk/clerk-react";

function getClerkKey() {
  return (
    import.meta.env.VITE_CLERK_PUBLISHABLE_KEY ??
    process.env.VITE_CLERK_PUBLISHABLE_KEY
  );
}

const PUBLISHABLE_KEY = getClerkKey();
if (!PUBLISHABLE_KEY) {
  throw new Error("Missing Publishable Key");
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
    <App />
  </ClerkProvider>,
);
