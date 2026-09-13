import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import ProgressBarProvider from "@/components/admin/ui/ProgressProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const personSchema = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: "Hamza Hanif",
  url: "https://hamzahanif.dev",
  jobTitle: "Full-Stack Developer",
  sameAs: [
    "https://github.com/itshamzahanif",
    "https://linkedin.com/in/itshamzahanif",
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <Script
        id="person-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }}
      />
      <body className="min-h-full flex flex-col">
        <ProgressBarProvider>{children}</ProgressBarProvider>
      </body>
    </html>
  );
}
