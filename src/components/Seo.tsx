import { useEffect } from "react";

type SeoProps = {
  title: string;
  description?: string;
};

export function Seo({ title, description }: SeoProps) {
  useEffect(() => {
    const prevTitle = document.title;
    document.title = title.length > 60 ? `${title.slice(0, 57)}...` : title;

    let meta = document.querySelector('meta[name="description"]') as HTMLMetaElement | null;
    if (!meta) {
      meta = document.createElement('meta');
      meta.name = 'description';
      document.head.appendChild(meta);
    }
    if (description) {
      meta.content = description.slice(0, 160);
    }

    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.appendChild(canonical);
    }
    canonical.href = window.location.href;

    return () => {
      document.title = prevTitle;
    };
  }, [title, description]);

  return null;
}
