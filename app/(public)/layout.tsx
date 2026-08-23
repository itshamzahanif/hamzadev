import { PageViewTracker } from "@/components/analytics/PageViewTracker";
import { GoogleAnalytics } from "@next/third-parties/google";
import { getSettings } from "@/actions/settings";
import { Metadata } from "next";

const settings = await getSettings();

const siteUrl = settings.data?.siteUrl || "https://hamzahanif.dev";

const seoTitle =
  settings.data?.seoTitle || "Hamza Hanif | Full Stack Developer";

const seoDescription =
  settings.data?.seoDescription ||
  "Hamza Hanif is a full stack developer specializing in Next.js, React, Node.js, and Laravel.";

const ogImageUrl = settings.data?.ogImageUrl || "/og-image.png";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),

  title: seoTitle,

  description: seoDescription,

  alternates: {
    canonical: settings.data?.canonicalUrl || "/",
  },

  openGraph: {
    title: seoTitle,
    description: seoDescription,
    url: siteUrl,
    siteName: "Hamza Hanif",
    images: [
      {
        url: ogImageUrl,
        width: 1200,
        height: 630,
        alt: "Hamza Hanif — Full Stack Developer",
      },
    ],
    type: "website",
  },
};

const PublicLayout = ({ children }: LayoutProps<"/">) => {
  return (
    <>
      {children}
      {process.env.NODE_ENV === "production" && (
        <>
          <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID!} />
          <PageViewTracker />
        </>
      )}
    </>
  );
};

export default PublicLayout;
