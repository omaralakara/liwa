import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./styles/fonts.css";
import "./styles/tokens.css";
import "./styles/global.css";
import "./styles/scenes.css";
import "./styles/nav.css";
import "./styles/sound.css";
import "./styles/hero.css";
import "./styles/editorial.css";
import "./styles/about.css";
import "./styles/gallery.css";
import "./styles/lightbox.css";
import "./styles/contact.css";
import "./styles/footer.css";
import "./styles/visit.css";
import App from "./App.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
