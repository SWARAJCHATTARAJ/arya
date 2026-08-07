import { Share_Tech_Mono, Rajdhani } from "next/font/google";
import "./globals.css";

const shareTechMono = Share_Tech_Mono({
  weight: '400',
  variable: "--font-share-tech-mono",
  subsets: ["latin"],
});

const rajdhani = Rajdhani({
  weight: ['400', '500', '600', '700'],
  variable: "--font-rajdhani",
  subsets: ["latin"],
});

export const metadata = {
  title: "Arya JARVIS HUD",
  description: "Personal Voice Assistant HUD",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Arya",
  },
};

export const viewport = {
  themeColor: "#4ff0ff",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${shareTechMono.variable} ${rajdhani.variable} h-full antialiased bg-[#050708]`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
