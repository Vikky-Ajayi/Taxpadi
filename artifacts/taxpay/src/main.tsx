import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { setAuthTokenGetter } from "@workspace/api-client-react";

// Wire up the JWT token getter so every API request includes Authorization: Bearer <token>
setAuthTokenGetter(() => localStorage.getItem("taxpay_token"));

createRoot(document.getElementById("root")!).render(<App />);
