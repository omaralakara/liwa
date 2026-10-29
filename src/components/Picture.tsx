import { useState, type CSSProperties } from "react";
import { images, type ImageId } from "../data/assets";

type Props = {
  id: ImageId;
  /** Art-directed portrait crop served below 768px. */
  mobile?: ImageId;
  /** CSS sizes attribute, e.g. "100vw" or "(min-width: 1024px) 50vw, 100vw" */
  sizes?: string;
  /** Load eagerly and with high priority (first viewport only). */
  priority?: boolean;
  className?: string;
  /** object-position, e.g. "50% 40%" */
  position?: string;
  style?: CSSProperties;
};

function srcSetOf(asset: (typeof images)[ImageId]) {
  const widths = Object.keys(asset.files)
    .map(Number)
    .sort((a, b) => a - b);
  const files = asset.files as Record<string, string>;
  return {
    srcSet: widths.map((w) => `${files[String(w)]} ${w}w`).join(", "),
    fallback: files[String(widths[widths.length - 1])],
  };
}

/**
 * Responsive image with a reserved aspect ratio (no layout shift), an inline blur
 * placeholder painted before the real file arrives, lazy loading by default, and an
 * optional art-directed portrait crop for phones.
 */
export function Picture({ id, mobile, sizes = "100vw", priority = false, className, position, style }: Props) {
  const asset = images[id];
  const portrait = mobile ? images[mobile] : undefined;
  const [loaded, setLoaded] = useState(false);
  const main = srcSetOf(asset);

  return (
    <div
      className={["picture", loaded ? "is-loaded" : "", className ?? ""].join(" ").trim()}
      style={{
        aspectRatio: `${asset.width} / ${asset.height}`,
        backgroundImage: `url(${asset.placeholder})`,
        ...style,
      }}
      data-conceptual={asset.conceptual ? "true" : undefined}
    >
      <picture>
        {portrait && <source media="(max-width: 767px)" srcSet={srcSetOf(portrait).srcSet} sizes="100vw" />}
        <img
          src={main.fallback}
          srcSet={main.srcSet}
          sizes={sizes}
          alt={asset.alt}
          width={asset.width}
          height={asset.height}
          loading={priority ? "eager" : "lazy"}
          decoding={priority ? "sync" : "async"}
          fetchPriority={priority ? "high" : "auto"}
          onLoad={() => setLoaded(true)}
          style={position ? { objectPosition: position } : undefined}
        />
      </picture>
    </div>
  );
}
