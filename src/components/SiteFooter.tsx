import { site } from "../data/site";

/**
 * The site footer, the same on both pages: the name and brand line, the one disclosure for the
 * photography, and the designer's credit. It holds a link, so a reveal animates its opacity only.
 */
export function SiteFooter() {
  return (
    <footer className="site-footer caption">
      <p className="site-footer__colophon">
        <span>{site.fullName}</span>
        <span>{site.descriptor}</span>
      </p>
      <p className="site-footer__disclosure" data-disclosure>
        {site.disclosure}
      </p>
      <p className="site-footer__credit">
        Designed by{" "}
        <a className="site-footer__credit-link" href={site.credit.href} target="_blank" rel="noopener noreferrer">
          {site.credit.name}
          <span className="visually-hidden"> (opens in a new tab)</span>
        </a>
      </p>
    </footer>
  );
}
