/**
 * The LIWA Safari mark. The artwork is the client's logo exactly as supplied
 * (public/brand/liwa-logo-source.jpg); liwa-mark.png is the same shapes with the
 * white ground keyed out, so the mark can sit on photography in any brand colour.
 * Nothing in the letterforms or frame was redrawn.
 */
type Props = { className?: string; title?: string };

export function Mark({ className, title = "LIWA Safari" }: Props) {
  return (
    <span className={["mark", className ?? ""].join(" ").trim()} role="img" aria-label={title} />
  );
}
