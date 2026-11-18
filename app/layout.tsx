import type { Metadata } from 'next';
import { Barlow_Condensed, DM_Sans } from 'next/font/google';
import './globals.css';
import SiteNav from '@/components/site-nav';
import SiteFooter from '@/components/site-footer';
import { pageMetadata, siteOrganization, siteWebsite } from '@/lib/site-seo';
const display = Barlow_Condensed({variable:'--font-display',subsets:['latin'],weight:['500','600','700','800'],display:'swap'});
const body = DM_Sans({variable:'--font-body',subsets:['latin'],display:'swap'});
export const metadata: Metadata = {
 ...pageMetadata('/', 'Golf Equipment Kenya & Lessons Nairobi | Karibu Golf', 'Explore golf clubs, apparel and accessories in Kenya, plus personal golf lessons in Nairobi. Confirm prices, availability and delivery with Karibu Golf.'),
 // This layout is the public storefront. Local builds are also uploaded to
 // production, so NETLIFY's build-time environment is not an indexing gate.
 // The separate admin/API paths remain excluded by the exported robots.txt.
 robots:{index:true,follow:true},
 icons:{icon:'/images/karibu-badge.svg'}
};
export default function RootLayout({children}:Readonly<{children:React.ReactNode}>) {
 return <html lang="en-KE"><body className={display.variable+" "+body.variable}><script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify({'@context':'https://schema.org','@graph':[siteOrganization,siteWebsite]}).replaceAll('<','\\u003c')}}/><a className="skip" href="#page-content">Skip to content</a><SiteNav/>{children}<SiteFooter/></body></html>;
}
