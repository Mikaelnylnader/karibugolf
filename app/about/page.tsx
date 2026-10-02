
import type { Metadata } from "next";
import type { CSSProperties } from "react";
import Image from "next/image";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import AboutScrollShell from "@/components/about-scroll-shell";
import "../shop/scrollcraft.css";
import "./scrollcraft.css";

export const metadata: Metadata = {
  title: "About Karibu Golf | Golf for East Africa",
  description: "Meet Karibu Golf, based in Nairobi and serving golfers across East Africa with equipment, apparel, personal help and special orders.",
};

const promises = [
  {
    label: "THE KIT",
    title: "Equipment, apparel and essentials.",
    copy: "Clubs, clothing, footwear and the accessories that help you feel ready for a day on the course.",
  },
  {
    label: "THE CONVERSATION",
    title: "Personal service from real people.",
    copy: "Talk through your questions, preferences and the options available with a team that listens first.",
  },
  {
    label: "THE REACH",
    title: "Special orders and East Africa delivery.",
    copy: "We source equipment from around the world and help arrange delivery across East Africa. Contact us to discuss your country and location.",
  },
];

export default function About() {
  return <main className="about-scroll-page" id="page-content">
    <AboutScrollShell>
      <section className="about-aperture-hero" data-about-hero data-sc-act="pin" data-sc-span="2.8">
        <div className="sc-stage about-aperture-stage" data-sc-stage data-sc-spotlight data-about-aperture>
          <div className="about-hero-course" data-sc-parallax="-0.75">
            <Image unoptimized fill priority sizes="100vw" src="/images/hero.jpg" alt="A golf course at sunrise in Nairobi" />
          </div>
          <div className="about-hero-edge" aria-hidden="true" />
          <div className="about-hero-word" aria-hidden="true" data-sc-parallax="-0.22">WELCOME</div>
          <figure className="about-aperture-media" data-sc-parallax="0.38">
            <Image unoptimized fill priority sizes="100vw" src="/images/golf-moment.jpg" alt="A golfer following through after a drive" />
          </figure>
          <div className="about-aperture-rings" aria-hidden="true"><i /><i /><i /></div>
          <div className="about-hero-copy" data-sc-cue="0 0.76 0 0.18">
            <p className="about-kicker">ABOUT KARIBU</p>
            <h1 data-sc-kinetic="lines">A GAME FOR<br /><em>EVERYONE.</em></h1>
            <p>Golf brings people together. We’re here to help you find your place in it.</p>
          </div>
          <div className="about-hero-arrival" data-sc-cue="0.64 1 0.12 0">
            <Image unoptimized src="/images/karibu-badge.svg" alt="" width={52} height={52} />
            <p><strong>KARIBU MEANS WELCOME.</strong><span>Nairobi · East Africa</span></p>
          </div>
        </div>
      </section>

      <section className="about-origin sc-section">
        <div className="about-origin-grid sc-wrap">
          <div className="about-origin-heading" data-sc-in data-sc-stagger="60">
            <p className="about-kicker">WHERE WE BEGIN</p>
            <h2>BASED IN NAIROBI.<br /><em>OPEN TO EAST AFRICA.</em></h2>
          </div>
          <div className="about-origin-copy" data-sc-in data-sc-stagger="55">
            <p>Karibu Golf brings together golf equipment, apparel and accessories from leading brands, with personal assistance when you need a hand choosing.</p>
            <p>Whether you’re taking your first steps into golf or looking for something for your next round, the experience should feel welcoming.</p>
            <span>A question deserves a conversation.</span>
          </div>
          <figure className="about-origin-photo" data-sc-reveal="left" data-sc-reveal-at="0.06 0.72">
            <Image unoptimized fill sizes="(max-width: 760px) 100vw, 62vw" src="/images/fairway-aerial.jpg" alt="An aerial view of a green fairway and bunkers" />
            <figcaption>THE GAME HAS MANY ENTRANCES. THERE SHOULD ALWAYS BE ROOM FOR ONE MORE.</figcaption>
          </figure>
        </div>
      </section>

      <section className="about-people-belief" data-sc-act="pin" data-sc-span="2.2">
        <div className="sc-stage about-belief-stage" data-sc-stage>
          <div className="about-belief-orbit" aria-hidden="true"><i /><i /></div>
          <p className="about-belief-label">WHAT MATTERS</p>
          <div className="about-belief-copy about-belief-copy-one" data-sc-cue="0 0.54 0 0.22">
            <h2>MORE THAN<br /><em>THE GEAR.</em></h2>
          </div>
          <div className="about-belief-copy about-belief-copy-two" data-sc-cue="0.40 0.88 0.16 0.18">
            <h2>IT’S THE<br /><em>PEOPLE.</em></h2>
          </div>
          <p className="about-belief-detail" data-sc-cue="0.74 1 0.12 0">A new golfer deserves a place to start. An experienced player deserves honest help finding what comes next.</p>
        </div>
      </section>

      <section className="about-promises" data-sc-act="pan" data-sc-span="4.8">
        <div className="sc-stage about-promises-stage" data-sc-stage>
          <div className="about-promises-rail" data-sc-pan="0.04">
            <header className="about-promise-intro">
              <p className="about-kicker">WHAT WE PROVIDE</p>
              <h2>YOUR GAME.<br /><em>OUR COMMITMENT.</em></h2>
              <ArrowDownRight aria-hidden="true" />
            </header>
            {promises.map((promise, index) => <article className="about-promise" style={{ "--promise-at": index * 0.13 + 0.12 } as CSSProperties} key={promise.label}>
              <span>{promise.label}</span>
              <h3>{promise.title}</h3>
              <p>{promise.copy}</p>
              <b aria-hidden="true">{String(index + 1).padStart(2, "0")}</b>
            </article>)}
            <div className="about-promise-resolve">
              <Image unoptimized src="/images/karibu-badge.svg" alt="" width={78} height={78} />
              <p>From the first question to the next round.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="about-circle-close" data-about-close>
        <div className="about-close-arcs" aria-hidden="true"><i /><i /><i /></div>
        <div className="about-close-copy" data-sc-in data-sc-stagger="65">
          <p className="about-kicker">THE DOOR IS OPEN</p>
          <h2>YOUR NEXT CHAPTER<br /><em>STARTS HERE.</em></h2>
          <p>Tell us what you play, what you’re looking for or where you need it delivered. We’ll take it from there.</p>
          <a href="/contact">Let’s talk golf <ArrowUpRight size={24} /></a>
        </div>
      </section>
      <div className="sc-grain" aria-hidden="true" />
    </AboutScrollShell>
  </main>;
}
