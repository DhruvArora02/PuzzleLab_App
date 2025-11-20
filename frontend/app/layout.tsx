import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SettingsProvider } from "@/contexts/SettingsContext";
import Link from "next/link";
import Image from "next/image"; // imported to add the image
import { Settings } from "@/components/Settings";
import { NavBar } from "@/components/NavBar";

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

export const metadata: Metadata = {
    title: "Puzzle Lab",
    description: "Create and share crossword puzzles!",
    icons: {
        icon: [
            { url: "/favicon.ico" },
            { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
            { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
        ],
        apple: { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
        other: [
            { rel: "android-chrome", url: "/android-chrome-192x192.png", sizes: "192x192", type: "image/png" },
            { rel: "android-chrome", url: "/android-chrome-512x512.png", sizes: "512x512", type: "image/png" },
        ],
    },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} antialiased`}
    >
      <head>
        {/* Set dark mode before the page mounts to prevent flicker */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const storedSettings = localStorage.getItem('settings');
                                if (storedSettings) {
                                    const parsed = JSON.parse(storedSettings);
                                    const theme = parsed.theme;
                                    if (theme && theme !== "default") {
                                    document.documentElement.classList.add('theme-' + theme);
                                    }
                                }
              } catch (e) {}
            `,
          }}
        />
      </head>
      <body className="min-h-screen bg-background text-foreground">
      {/* <body className="min-h-screen bg-[var(--background)] text-[var(--foreground)]"> */}
      <SettingsProvider>
            <NavBar />
          {/* Main content (all pages) */}
          {children}
        </SettingsProvider>
      </body>
    </html>
  );
}