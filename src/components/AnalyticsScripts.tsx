"use client";

import React, { useState, useEffect } from "react";
import Script from "next/script";
import { GA_MEASUREMENT_ID, META_PIXEL_ID } from "@/lib/analytics";

export function AnalyticsScripts() {
  const [hasConsent, setHasConsent] = useState(false);

  useEffect(() => {
    try {
      const consent = localStorage.getItem("feira_lgpd_accepted");
      if (consent === "all") {
        setHasConsent(true);
      }
    } catch {
      // Ignora erro em ambientes sem localStorage
    }

    const handleConsentChange = (e: Event) => {
      const customEvent = e as CustomEvent<string>;
      if (customEvent.detail === "all") {
        setHasConsent(true);
      } else {
        setHasConsent(false);
      }
    };

    window.addEventListener("feira_lgpd_consent_change", handleConsentChange);
    return () => {
      window.removeEventListener("feira_lgpd_consent_change", handleConsentChange);
    };
  }, []);

  if (!hasConsent) {
    return null;
  }

  return (
    <>
      {/* Inicialização do dataLayer para Google Analytics & Google Ads */}
      <Script id="analytics-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          ${
            GA_MEASUREMENT_ID
              ? `gtag('config', '${GA_MEASUREMENT_ID}', { page_path: window.location.pathname });`
              : `// Google Analytics ID pendente de configuração em NEXT_PUBLIC_GA_MEASUREMENT_ID`
          }
        `}
      </Script>

      {/* Script oficial do Google Tag se o Measurement ID estiver presente */}
      {GA_MEASUREMENT_ID && (
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
          strategy="afterInteractive"
        />
      )}

      {/* Meta Pixel oficial se presente */}
      {META_PIXEL_ID && (
        <Script id="meta-pixel-init" strategy="afterInteractive">
          {`
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '${META_PIXEL_ID}');
            fbq('track', 'PageView');
          `}
        </Script>
      )}
    </>
  );
}
