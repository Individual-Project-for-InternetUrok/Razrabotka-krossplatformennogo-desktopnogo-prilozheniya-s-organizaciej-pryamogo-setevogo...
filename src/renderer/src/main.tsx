import "./assets/main.css";

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import { Toaster } from "sonner";
import ErrorHandler from "./components/ErrorHandler";

createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <App />
        <ErrorHandler />
        <Toaster />
    </StrictMode>
);
