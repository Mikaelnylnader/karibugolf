
import type { Metadata } from "next";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
export const metadata:Metadata={title:"About Us | Karibu Golf"};
export default function About(){return <main className="inner-page about-page" id="page-content">
 <section className="page-intro"><p className="micro">ABOUT KARIBU</p><h1>A GAME FOR<br/><em>EVERYONE.</em></h1><div className="intro-bottom"><span>NAIROBI, KENYA</span><p>Golf brings people together. We’re here to help you find your place in it.</p></div></section>
 <div className="wide-photo"><Image unoptimized src="/images/golf-moment.jpg" alt="A golfer following through on a swing" width={1600} height={1067} priority/></div>
 <section className="editorial-section"><p className="section-label">KARIBU MEANS WELCOME.</p><div><h2>More than the gear.<br/><em>It’s the people.</em></h2><p>Karibu Golf is based in Nairobi and serves golfers across Kenya. We bring together golf equipment, apparel and accessories from leading brands, with personal assistance when you need a hand choosing.</p><p>Whether you’re taking your first steps into golf or looking for something for your next round, we believe the experience should feel welcoming. A question deserves a conversation. A new golfer deserves a place to start.</p><a className="editorial-link" href="/contact">Get to know us <ArrowUpRight size={20}/></a></div></section>
 <section className="about-offer"><h2>YOUR GAME.<br/><em>OUR COMMITMENT.</em></h2><div className="about-rows"><article><h3>Equipment, apparel & essentials</h3><p>Clubs, clothing, footwear and the accessories that help you feel ready for a day on the course.</p></article><article><h3>Personal service</h3><p>A real team to talk through your questions, preferences and the options available.</p></article><article><h3>Special orders & delivery</h3><p>We source equipment from around the world and arrange delivery across Kenya. Contact us to discuss what you need.</p></article></div></section>
 <section className="small-close"><h2>YOUR NEXT CHAPTER<br/><em>STARTS HERE.</em></h2><a href="/contact">Let’s talk golf <ArrowUpRight size={26}/></a></section>
 </main>;}
