import type { Metadata } from 'next';
import { Barlow_Condensed, DM_Sans } from 'next/font/google';
import './globals.css';
import SiteNav from '@/components/site-nav';
import SiteFooter from '@/components/site-footer';
const display = Barlow_Condensed({variable:'--font-display',subsets:['latin'],weight:['500','600','700','800'],display:'swap'});
const body = DM_Sans({variable:'--font-body',subsets:['latin'],display:'swap'});
export const metadata: Metadata = {
 title:'Karibu Golf East Africa | Out here. All in.',
 description:'Discover golf equipment, apparel, essentials and personal service from Karibu Golf, based in Nairobi and serving golfers across East Africa.',
 // This layout is the public storefront. Local builds are also uploaded to
 // production, so NETLIFY's build-time environment is not an indexing gate.
 // The separate admin/API paths remain excluded by the exported robots.txt.
 robots:{index:true,follow:true},
 icons:{icon:'/images/karibu-badge.svg'}
};
export default function RootLayout({children}:Readonly<{children:React.ReactNode}>) {
 return <html lang="en"><body className={display.variable+" "+body.variable}><SiteNav/>{children}<SiteFooter/></body></html>;
}
