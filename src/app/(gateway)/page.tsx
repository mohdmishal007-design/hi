import type { Metadata } from "next";
import { defaultLocale } from "@/lib/i18n";

export const metadata: Metadata = {
  title: "Lonestar Shipping Saudi Arabia",
  robots: { index: false, follow: true },
  alternates: { languages: { en: "/en/", ar: "/ar/", "x-default": `/${defaultLocale}/` } },
};

// Picks the first of the visitor's browser languages that the site offers; English otherwise.
const route = `(function(){var l=navigator.languages||[navigator.language||""];var to="${defaultLocale}";for(var i=0;i<l.length;i++){var c=String(l[i]).slice(0,2).toLowerCase();if(c==="ar"||c==="en"){to=c;break;}}location.replace("/"+to+"/"+location.search+location.hash);})();`;

export default function Gateway() {
  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: route }} />
      <noscript>
        <meta httpEquiv="refresh" content={`0; url=/${defaultLocale}/`} />
      </noscript>
      <div className="grid min-h-svh place-items-center p-6">
        <nav aria-label="Language" className="flex gap-4">
          <a className="btn btn-quiet" href="/en/" hrefLang="en" lang="en">
            English
          </a>
          <a className="btn btn-quiet" href="/ar/" hrefLang="ar" lang="ar">
            العربية
          </a>
        </nav>
      </div>
    </>
  );
}
