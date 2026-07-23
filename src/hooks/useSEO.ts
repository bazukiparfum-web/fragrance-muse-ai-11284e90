import { useEffect } from "react";

interface SEOOptions {
  title: string;
  description: string;
  image?: string;
  type?: "website" | "article" | "product";
  noindex?: boolean;
  canonical?: string;
}

/**
 * Lightweight SEO hook — sets <title>, description, canonical, OG and Twitter
 * tags on mount and restores prior values on unmount so route changes don't
 * leave stale metadata behind.
 */
export function useSEO({ title, description, image, type = "website", noindex, canonical }: SEOOptions) {

  useEffect(() => {
    const prevTitle = document.title;

    const upsertMeta = (selector: string, attr: "name" | "property", key: string, content: string) => {
      let el = document.head.querySelector<HTMLMetaElement>(selector);
      const created = !el;
      const previousContent = el?.getAttribute("content") ?? null;
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute(attr, key);
        document.head.appendChild(el);
      }
      el.setAttribute("content", content);
      return { el, created, previousContent };
    };

    const upsertLink = (rel: string, href: string) => {
      let el = document.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
      const created = !el;
      const previousHref = el?.getAttribute("href") ?? null;
      if (!el) {
        el = document.createElement("link");
        el.setAttribute("rel", rel);
        document.head.appendChild(el);
      }
      el.setAttribute("href", href);
      return { el, created, previousHref };
    };

    const url = canonical || `${window.location.origin}${window.location.pathname}`;
    const absImage = image
      ? image.startsWith("http")
        ? image
        : `${window.location.origin}${image}`
      : undefined;

    document.title = title;

    const restorers: Array<() => void> = [];

    const trackMeta = (r: ReturnType<typeof upsertMeta>) => {
      restorers.push(() => {
        if (r.created) r.el.remove();
        else if (r.previousContent !== null) r.el.setAttribute("content", r.previousContent);
      });
    };

    const trackLink = (r: ReturnType<typeof upsertLink>) => {
      restorers.push(() => {
        if (r.created) r.el.remove();
        else if (r.previousHref !== null) r.el.setAttribute("href", r.previousHref);
      });
    };

    trackMeta(upsertMeta('meta[name="description"]', "name", "description", description));
    trackLink(upsertLink("canonical", url));

    trackMeta(upsertMeta('meta[property="og:title"]', "property", "og:title", title));
    trackMeta(upsertMeta('meta[property="og:description"]', "property", "og:description", description));
    trackMeta(upsertMeta('meta[property="og:type"]', "property", "og:type", type));
    trackMeta(upsertMeta('meta[property="og:url"]', "property", "og:url", url));
    trackMeta(upsertMeta('meta[property="og:site_name"]', "property", "og:site_name", "Bazuki Perfumes"));
    trackMeta(upsertMeta('meta[property="og:locale"]', "property", "og:locale", "en_IN"));
    if (absImage) {
      trackMeta(upsertMeta('meta[property="og:image"]', "property", "og:image", absImage));
      trackMeta(upsertMeta('meta[property="og:image:width"]', "property", "og:image:width", "1200"));
      trackMeta(upsertMeta('meta[property="og:image:height"]', "property", "og:image:height", "630"));
      trackMeta(upsertMeta('meta[property="og:image:alt"]', "property", "og:image:alt", title));
    }

    trackMeta(upsertMeta('meta[name="twitter:card"]', "name", "twitter:card", absImage ? "summary_large_image" : "summary"));
    trackMeta(upsertMeta('meta[name="twitter:site"]', "name", "twitter:site", "@bazukiperfume"));
    trackMeta(upsertMeta('meta[name="twitter:title"]', "name", "twitter:title", title));
    trackMeta(upsertMeta('meta[name="twitter:description"]', "name", "twitter:description", description));
    if (absImage) {
      trackMeta(upsertMeta('meta[name="twitter:image"]', "name", "twitter:image", absImage));
      trackMeta(upsertMeta('meta[name="twitter:image:alt"]', "name", "twitter:image:alt", title));
    }

    return () => {
      document.title = prevTitle;
      restorers.forEach((r) => r());
    };
  }, [title, description, image, type]);
}
