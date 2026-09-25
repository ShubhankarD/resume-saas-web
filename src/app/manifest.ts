import type { MetadataRoute } from "next";

// Next's manifest file convention: this is auto-served at
// /manifest.webmanifest and auto-linked via <link rel="manifest">,
// no manual <link> tag needed. Content adapted from
// resumeaid-coming-soon/site.webmanifest, but background_color/theme_color
// are kept in sync with THIS app's own tokens (globals.css's :root), not
// resumeaid-coming-soon's dark brand doc — issue #17 switched this repo to
// a white/black palette while resumeaid-coming-soon deliberately keeps its
// dark look, so the two no longer share these values.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "ResumeAId",
    short_name: "ResumeAId",
    description: "ResumeAId writes tailored resumes and files your job applications automatically.",
    start_url: "/",
    display: "standalone",
    background_color: "#FFFFFF",
    theme_color: "#FFFFFF",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
