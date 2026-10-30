import { useEffect } from "react";
import { SiteHeader } from "./components/SiteHeader";
import { Hero } from "./chapters/Hero";
import { About } from "./chapters/About";
import { Wild } from "./chapters/Wild";
import { Land } from "./chapters/Land";
import { Wonder } from "./chapters/Wonder";
import { Vision } from "./chapters/Vision";
import { Gallery } from "./chapters/Gallery";
import { Visit } from "./chapters/Visit";
import { Invitation } from "./chapters/Invitation";
import { Contact } from "./chapters/Contact";
import { cast } from "./data/cast";
import { initSmoothScroll, landOnHash } from "./lib/smooth";
import { getAmbience } from "./lib/ambience";

/**
 * Ten content areas with a cinematic rhythm: the pinned hero, the About diptych on one horizon,
 * the pinned safari peak, a still, a photo essay, the pinned resort reveal, the Gallery of still
 * photographs, the Book a Visit request on light ground, the emotional close and the practical
 * contact chapter with the site footer. Packages & Experiences is a separate page (src/pages).
 */
export default function App() {
  useEffect(() => initSmoothScroll(), []);
  // The desert ambience starts on the first gesture (browsers allow no earlier) unless switched off before.
  useEffect(() => getAmbience().armAutoStart(), []);
  useEffect(() => landOnHash(), []);

  return (
    <>
      <a className="skip-link" href="#contact">
        Skip to contact
      </a>
      <SiteHeader page="home" />
      <main>
        <Hero image={cast.awakening.id} mobile={cast.awakening.mobile} dawn="dune-dawn" />
        <About
          wild="wild-giraffe"
          wildMobile="wild-giraffe-portrait"
          wildHorizon={0.635}
          wildHorizonMobile={0.64}
          wildFocalX={0.7}
          wildFocalXMobile={0.55}
          wildFlip
          house="about-camp-dusk"
          houseMobile="about-camp-dusk-portrait"
          houseHorizon={0.64}
          houseHorizonMobile={0.65}
          lamp={{ x: 40, y: 75 }}
          lampMobile={{ x: 40, y: 76 }}
        />
        <Wild image={cast.wild.id} mobile={cast.wild.mobile} />
        <Land image={cast.land.id} mobile={cast.land.mobile} position={cast.land.position} />
        <Wonder moments={cast.wonder} />
        <Vision image={cast.vision.id} mobile={cast.vision.mobile} />
        <Gallery />
        <Visit />
        <Invitation />
        <Contact />
      </main>
    </>
  );
}
