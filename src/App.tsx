import { useEffect } from "react";
import { SiteHeader } from "./components/SiteHeader";
import { Hero } from "./chapters/Hero";
import { Wild } from "./chapters/Wild";
import { Land } from "./chapters/Land";
import { Wonder } from "./chapters/Wonder";
import { Vision } from "./chapters/Vision";
import { Beyond } from "./chapters/Beyond";
import { Invitation } from "./chapters/Invitation";
import { cast } from "./data/cast";
import { initSmoothScroll } from "./lib/smooth";

/**
 * Seven chapters with a cinematic rhythm: two high peaks (I, II), a still (III),
 * a measured photo essay (IV), the second peak (V), a still on light ground (VI),
 * and a restrained close (VII).
 */
export default function App() {
  useEffect(() => initSmoothScroll(), []);

  return (
    <>
      <a className="skip-link" href="#invitation">
        Skip to contact
      </a>
      <SiteHeader />
      <main>
        <Hero image={cast.awakening.id} mobile={cast.awakening.mobile} dawn="dune-dawn" />
        <Wild image={cast.wild.id} mobile={cast.wild.mobile} />
        <Land image={cast.land.id} mobile={cast.land.mobile} position={cast.land.position} />
        <Wonder moments={cast.wonder} />
        <Vision image={cast.vision.id} mobile={cast.vision.mobile} />
        <Beyond
          image={cast.beyond.id}
          detail={cast.beyondDetail.id}
          position={cast.beyond.position}
          detailPosition={cast.beyondDetail.position}
        />
        <Invitation />
      </main>
    </>
  );
}
