import { createRoot } from "react-dom/client";
import { HelmetProvider } from "react-helmet-async";
import App from "./App";
import "./index.css";
import { initTilt3D } from "./lib/tilt3d";
import { initInteractivity } from "./lib/interactivity";

initTilt3D();
initInteractivity();

createRoot(document.getElementById("root")).render(
  <HelmetProvider>
    <App />
  </HelmetProvider>,
);
