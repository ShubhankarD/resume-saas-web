import type { MetadataRoute } from "next";

// Next's manifest file convention: this is auto-served at
// /manifest.webmanifest and auto-linked via <link rel="manifest">,
// no manual <link> tag needed. Content adapted from
// resumeaid-coming-soon/site.webmanifest (the canonical source) —
// background_color/theme_color already match the brand's --color-charcoal.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "ResumeAId",
    short_name: "ResumeAId",
    description: "ResumeAId writes tailored resumes and files your job applications automatically.",
    start_url: "/",
    display: "standalone",
    background_color: "#1A1A1A",
    theme_color: "#1A1A1A",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
