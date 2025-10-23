import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "@/styles/globals.css";
import SessionProvider from "@/components/providers/SessionProvider";
import Script from "next/script";
import { Analytics } from '@vercel/analytics/react';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Casting Companion",
  description: "Find your next role",
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
    apple: '/favicon.svg',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* Meta Pixel Code */}
        <Script id="meta-pixel" strategy="afterInteractive">
          {`
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '616255887325867');
            fbq('track', 'PageView');
          `}
        </Script>
        <noscript>
          <img 
            height="1" 
            width="1" 
            style={{display: 'none'}}
            src="https://www.facebook.com/tr?id=616255887325867&ev=PageView&noscript=1"
            alt=""
          />
        </noscript>
      </head>
      <body className={inter.className}>
        <SessionProvider>
          {children}
        </SessionProvider>
        <Analytics />
      </body>
    </html>
  );
}
