import type { Metadata } from "next";
import { Inter, Geist_Mono } from "next/font/google";
import "./globals.css";
import { QueryProvider } from "@/lib/query-provider";
import { AuthProvider } from "@/lib/auth/AuthProvider";

/**
 * The UI typeface. `--font-sans-face` is deliberately named after its role
 * rather than the family, so swapping the face is a one-line change here —
 * globals.css maps it into the `--font-sans` theme token and never needs to
 * know which family is in use. It must NOT be called `--font-sans`: that is
 * the theme token itself, and a self-reference resolves to empty and drops
 * the whole app to the browser's default serif.
 */
const sans = Inter({
  variable: "--font-sans-face",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ResumeAId",
  description: "ResumeAId writes tailored resumes and files your job applications automatically.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // The font variables live on <html>, not <body>: globals.css applies
    // `font-sans` to <html>, so the custom properties must be in scope there.
    <html lang="en" className={`${sans.variable} ${geistMono.variable}`}>
      <body className="antialiased">
        <QueryProvider>
          <AuthProvider>{children}</AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
