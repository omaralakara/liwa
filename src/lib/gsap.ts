// Single GSAP registration point. Import `gsap` from here everywhere in the app
// so plugins are registered exactly once, before any component runs.

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { CustomEase } from "gsap/CustomEase";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger, SplitText, CustomEase, useGSAP);

// Phone address bars resize the viewport while scrolling; do not refresh pins for that.
ScrollTrigger.config({ ignoreMobileResize: true });

export { gsap, ScrollTrigger, SplitText, CustomEase, useGSAP };
