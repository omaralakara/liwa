import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./styles/fonts.css";
import "./styles/tokens.css";
import "./styles/global.css";
import "./styles/scenes.css";
import "./styles/nav.css";
import "./styles/sound.css";
import "./styles/footer.css";
import "./styles/visit.css";
import "./styles/packages.css";
import { PackagesPage } from "./pages/Packages";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <PackagesPage />
  </StrictMode>,
);
