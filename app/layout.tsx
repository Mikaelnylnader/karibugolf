import type { Metadata } from 'next';
import { Barlow_Condensed, DM_Sans } from 'next/font/google';
import './globals.css';
import SiteNav from '@/components/site-nav';
import SiteFooter from '@/components/site-footer';
const display = Barlow_Condensed({variable:'--font-display',subsets:['latin'],weight:['500','600','700','800'],display:'swap'});
const body = DM_Sans({variable:'--font-body',subsets:['latin'],display:'swap'});
export const metadata: Metadata = {
 title:'Karibu Golf | Out here. All in.',
 description:'A love for golf. A place for you. Discover golf equipment, apparel, essentials and personal service from Karibu Golf Kenya.',
 robots:process.env.NETLIFY ? {index:true,follow:true} : {index:false,follow:false},
 icons:{icon:'/images/karibu-badge.svg'}
};
export default function RootLayout({children}:Readonly<{children:React.ReactNode}>) {
 return <html lang="en"><body className={display.variable+" "+body.variable}><SiteNav/>{children}<SiteFooter/></body></html>;
}
