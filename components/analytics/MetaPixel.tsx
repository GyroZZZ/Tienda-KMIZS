"use client";

import Script from "next/script";
import { useSyncExternalStore } from "react";

import {
  getConsent,
  getServerConsent,
  subscribeConsent,
} from "@/components/analytics/consent-store";

/**
 * Pixel de Meta, cargado solo con consentimiento.
 *
 * Si la persona rechaza el aviso, no se descarga ningún script de Meta y los
 * eventos de `lib/analytics.ts` no salen del navegador.
 */
export function MetaPixel({ pixelId }: { pixelId: string }) {
  const consent = useSyncExternalStore(subscribeConsent, getConsent, getServerConsent);

  if (consent !== "granted") return null;

  return (
    <Script id="meta-pixel" strategy="afterInteractive">
      {`!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window,document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '${pixelId}');
fbq('track', 'PageView');`}
    </Script>
  );
}
