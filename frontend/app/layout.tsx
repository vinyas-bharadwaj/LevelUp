import type { Metadata } from "next";
import "./globals.css";



export const metadata: Metadata = {
  title: "LevelUp",
  description: "Enhance your skills with LevelUp courses",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
