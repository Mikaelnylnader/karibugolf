/* eslint-disable next/no-html-link-for-pages -- Published static pages use native navigation. */
import type { Metadata } from "next";
import Image from "next/image";
import { ArrowDown, ArrowUpRight } from "lucide-react";
import MissionScrollShell from "@/components/mission-scroll-shell";
import "../shop/scrollcraft.css";
import "./mission.css";

export const metadata: Metadata = {
  title: "Growing the Game in East Africa | Karibu Golf's Mission",
  description: "Discover Karibu Golf's mission: equipment and personal guidance today, with future plans for junior golf, grassroots access, affordable equipment and responsible reuse in East Africa.",
  alternates: { canonical: "https://karibugolf.com/growing-the-game/" },
};

const ambitions = [
  { id: "junior-golf", label: "Junior golf", title: "A first swing. A future in the game.", copy: "We want more young people to have a place to start, regardless of their background. Our long-term ambition is to help juniors access equipment, coaching and opportunities to develop their talent.", plan: "Explore partnerships for junior coaching, equipment support and, as the programme develops, tournament sponsorships and scholarships.", partner: "junior golf and talent development" },
  { id: "grassroots", label: "Community & grassroots", title: "Make the welcome wider.", copy: "Golf is easier to try when someone opens the door. We aim to work with schools, golf clubs and community organisations to create approachable introductions to the game across East Africa.", plan: "Develop beginner-friendly sessions and local partnerships that welcome new players, families and communities into golf.", partner: "school, club or community golf partnerships" },
  { id: "affordable-equipment", label: "Affordable equipment", title: "The right start, within reach.", copy: "We already help customers explore equipment options and special orders. Next, we want to make the first set easier to access, with options suited to different budgets and stages of the game.", plan: "Explore starter sets, trade-ins, refurbished equipment and used-club donations. Trade-in and donation programmes are not available yet.", partner: "starter equipment, future trade-ins or equipment donations" },
  { id: "responsible-golf", label: "Responsible golf", title: "More life in every club.", copy: "Our ambition is to encourage equipment that stays useful for longer, thoughtful purchasing and responsible reuse. We also want to learn from clubs and partners working to reduce waste around the game.", plan: "Build practical reuse and refurbishment options, and explore ways to support more responsible golf practices as our partnerships grow.", partner: "equipment reuse and responsible golf practices" },
];
const inquiry = (topic: string) => "https://wa.me/254116416105?text=" + encodeURIComponent(`Hi Karibu Golf! I'd like to discuss ${topic} for your future Growing the Game plans.`);

export default function GrowingTheGame() {
  return <main className="mission-page" id="page-content"><MissionScrollShell>
    <section className="mission-hero" data-mission-hero>
      <div className="mission-hero-copy">
        <p className="micro">OUR PURPOSE · NAIROBI TO EAST AFRICA</p>
        <h1><span>GROWING</span><span>THE <em>GAME.</em></span></h1>
        <p className="mission-lead">Better access to golf. More people who feel they belong.</p>
        <p>Karibu Golf is a shop with a bigger ambition: to help make golf more accessible, affordable and welcoming across East Africa.</p>
        <a className="mission-text-link" href="#our-plans">Explore our future plans</a>
      </div>
      <figure className="mission-hero-photo">
        <div className="mission-photo-window"><div className="mission-photo-plane"><Image unoptimized fill priority sizes="(max-width: 800px) 100vw, 43vw" src="/images/fairway-aerial.jpg" alt="A fairway winding between trees and bunkers, seen from above" /></div></div>
        <Image className="mission-photo-seal" unoptimized src="/images/karibu-badge.svg" alt="" width={100} height={100} />
        <figcaption>MORE WAYS INTO THE GAME.</figcaption>
      </figure>
    </section>

    <section className="mission-today" aria-labelledby="mission-today-title">
      <header data-sc-in><h2 id="mission-today-title">A SHOP.<br /><em>A PERSONAL APPROACH.</em></h2></header>
      <div data-sc-in data-sc-stagger="45">
        <p>Today, we provide golf equipment, apparel and essentials, with personal guidance when you are choosing your setup. Based in Nairobi, we help customers discuss special orders and delivery options across East Africa.</p>
        <p>Our founder, Mikael Nylander, brings professional playing and international coaching experience. Karibu Golf customers will also be invited to upcoming founder-led gatherings and range clinics in Nairobi, with dates and venues to be announced.</p>
        <div className="mission-today-links"><a href="/shop/stock/">Shop what’s in stock <ArrowUpRight size={18} aria-hidden="true" /></a><a href="/about/#community">Meet our community <ArrowUpRight size={18} aria-hidden="true" /></a></div>
      </div>
    </section>

    <section className="mission-plans" id="our-plans" aria-labelledby="mission-plans-title">
      <header className="mission-ledger-heading">
        <h2 id="mission-plans-title">OUR PLANS.<br /><em>MORE<br />POSSIBILITIES.</em></h2>
        <p>The initiatives below are future plans, not programmes already running. We have not launched junior sponsorships, scholarships, trade-ins or equipment donations. We will share participation details when any initiative is ready.</p>
        <nav aria-label="Explore our future plans">{ambitions.map((ambition) => <a key={ambition.id} href={`#${ambition.id}`}>{ambition.label}<ArrowDown size={14} aria-hidden="true" /></a>)}</nav>
      </header>
      <div className="mission-ledger-entries">{ambitions.map((ambition) => <article id={ambition.id} key={ambition.id} data-sc-in data-sc-stagger="40">
        <div className="mission-entry-label"><p className="micro">{ambition.label}</p><span>FUTURE PLAN</span></div>
        <h3>{ambition.title}</h3><p>{ambition.copy}</p>
        <div className="mission-plan-detail"><h4>What we want to build</h4><p>{ambition.plan}</p></div>
        <a className="mission-text-link" href={inquiry(ambition.partner)}>Discuss this idea with us <ArrowUpRight size={18} aria-hidden="true" /></a>
      </article>)}</div>
    </section>

    <section className="mission-growth" data-mission-growth aria-labelledby="mission-growth-title">
      <p className="micro">THE FUTURE WE WANT TO HELP BUILD</p>
      <h2 id="mission-growth-title"><span className="mission-growth-line"><span>MORE ACCESS.</span></span><span className="mission-growth-line"><span>MORE PLAYERS.</span></span><span className="mission-growth-line"><span><em>MORE OPPORTUNITIES.</em></span></span></h2>
      <svg className="mission-growth-path" viewBox="0 0 900 120" aria-hidden="true">
        <path className="mission-path-base" d="M24 60 C170 60 300 38 450 38 S760 60 876 60" />
        <path className="mission-path-drawn" pathLength="1" d="M24 60 C170 60 300 38 450 38 S760 60 876 60" />
        <g className="mission-growth-node mission-node-access"><circle cx="24" cy="60" r="13" /></g>
        <g className="mission-growth-node mission-node-players"><circle cx="450" cy="38" r="13" /></g>
        <g className="mission-growth-node mission-node-opportunities"><circle cx="876" cy="60" r="13" /></g>
      </svg>
      <p className="mission-growth-caption">A long-term ambition, built with people who care about the game. Commercial success should help us create opportunities beyond the next sale.</p>
    </section>

    <section className="mission-partner" aria-labelledby="mission-partner-title">
      <div data-sc-in><h2 id="mission-partner-title">HELP OPEN<br /><em>THE DOOR.</em></h2></div>
      <div className="mission-partner-copy" data-sc-in data-sc-stagger="50"><p>Are you a school, golf club, coach, equipment partner or community organisation in East Africa? Tell us what you see in your community and where you think we could work together.</p><p>You don’t need a finished proposal. A practical idea and a shared interest in welcoming more people into golf are a good place to start.</p><a href={inquiry("a partnership to help grow golf in East Africa")}>Talk about a partnership <ArrowUpRight size={22} aria-hidden="true" /></a><small>This is an invitation to discuss future collaboration, not an application for funding or an active donation programme.</small></div>
    </section>
  </MissionScrollShell></main>;
}
