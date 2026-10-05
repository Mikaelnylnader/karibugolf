
/* eslint-disable next/no-html-link-for-pages -- Static export uses native navigation without an RSC prefetch server. */
import type { Metadata } from "next";
import type { CSSProperties } from "react";
import Image from "next/image";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import AboutScrollShell from "@/components/about-scroll-shell";
import "../shop/scrollcraft.css";
import "./scrollcraft.css";

export const metadata: Metadata = {
  title: "About Karibu Golf | Mikael Nylander & Our Golf Community",
  description: "Meet founder Mikael Nylander, discover his professional golf and coaching experience, and explore Karibu Golf customer gatherings and driving range clinics in Nairobi.",
};

const clinicInquiry = "https://wa.me/254116416105?text=" + encodeURIComponent("Hi Karibu Golf! I'd like to hear about the next Nairobi driving range clinic and your customer VIP group.");

const clinicHighlights = [
  { title: "Practical coaching", copy: "Get hands-on swing tips and personal guidance from Mikael, whether you are new to golf or working on your next improvement." },
  { title: "Try the gear", copy: "Explore Karibu Golf clubs, balls and accessories firsthand, see the latest apparel, and talk through equipment and custom-fitting options." },
  { title: "Meet your golf community", copy: "Hit some balls, bring a friend and connect with beginners and experienced golfers in a relaxed, welcoming setting." },
  { title: "Stay part of the conversation", copy: "Ask to join our dedicated customer VIP group for future clinics, demo days, community updates and special offers." },
];

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
            <p>Our wider ambition is to help more people across East Africa get into golf. Alongside the shop, we are planning ways to support junior players, welcome new communities and make equipment easier to access. These programmes are future plans, not initiatives already running.</p>
            <span>A question deserves a conversation.</span>
            <a className="about-mission-link" href="/growing-the-game/">Explore our Growing the Game plans <ArrowUpRight size={18} aria-hidden="true" /></a>
          </div>
          <figure className="about-origin-photo" data-sc-reveal="left" data-sc-reveal-at="0.06 0.72">
            <Image unoptimized fill sizes="(max-width: 760px) 100vw, 62vw" src="/images/fairway-aerial.jpg" alt="An aerial view of a green fairway and bunkers" />
            <figcaption>THE GAME HAS MANY ENTRANCES. THERE SHOULD ALWAYS BE ROOM FOR ONE MORE.</figcaption>
          </figure>
        </div>
      </section>

      <section className="about-founder sc-section" id="founder" aria-labelledby="founder-title" data-about-founder>
        <div className="sc-wrap about-founder-grid">
          <header className="about-founder-heading" data-sc-in data-sc-stagger="55">
            <h2 id="founder-title">MEET OUR<br /><em>FOUNDER.</em></h2>
            <p className="about-founder-name">Mikael Nylander</p>
            <p className="about-founder-role">Founder, golfer and coach</p>
            <figure className="about-founder-photo about-founder-portrait" data-about-founder-photo data-photo-direction="-1">
              <div className="about-founder-photo-frame"><div className="about-founder-photo-window"><Image unoptimized src="/images/founder/mikael-volvo-china-open-tee-off.webp" alt="Mikael Nylander following through after a tee shot at Volvo China Open qualifying" width={1536} height={1024} sizes="(max-width: 860px) 100vw, 38vw" /></div></div>
              <figcaption><strong>On the tee.</strong><span>Mikael Nylander at Volvo China Open qualifying.</span></figcaption>
            </figure>
          </header>
          <div className="about-founder-story" data-sc-in data-sc-stagger="55">
            <p>Karibu Golf was founded by Mikael Nylander, with a lifelong dedication to the game and a simple ambition: to help more people enjoy golf.</p>
            <p>Mikael competed as a professional golfer in Sweden and made appearances at DP World Tour events in China, including the Volvo China Open. He has won several tournaments in Shanghai and multiple long-drive competitions, bringing firsthand experience of competitive golf to Karibu Golf.</p>
            <p>He went on to coach internationally in Shanghai, China, and Nairobi, Kenya. Combining tournament experience with hands-on instruction and a lifelong passion for the game, Mikael helps golfers of all skill levels build confidence, improve their play and choose equipment that works for them.</p>
          </div>
          <dl className="about-founder-journey" data-about-founder-trace data-sc-in data-sc-stagger="65">
            <div style={{ "--stop-at": 0 } as CSSProperties}><dt>Sweden</dt><dd>Professional playing experience</dd></div>
            <div style={{ "--stop-at": 0.42 } as CSSProperties}><dt>China</dt><dd>Volvo China Open, Shanghai tournament wins and coaching</dd></div>
            <div style={{ "--stop-at": 0.84 } as CSSProperties}><dt>Nairobi</dt><dd>Coaching, Karibu Golf and a growing community</dd></div>
          </dl>
        </div>
          <div className="sc-wrap about-founder-photos" aria-label="Photographs from Volvo China Open qualifying">
            <figure className="about-founder-photo" data-about-founder-photo data-photo-direction="1">
              <div className="about-founder-photo-frame"><div className="about-founder-photo-window"><Image unoptimized src="/images/founder/mikael-volvo-china-open-putting.webp" alt="Mikael Nylander putting on the green at Volvo China Open qualifying" width={1536} height={1024} sizes="(max-width: 860px) 100vw, 52vw" /></div></div>
              <figcaption><strong>On the green.</strong><span>Putting during Volvo China Open qualifying.</span></figcaption>
            </figure>
            <figure className="about-founder-photo" data-about-founder-photo data-photo-direction="-1">
              <div className="about-founder-photo-frame"><div className="about-founder-photo-window"><Image unoptimized src="/images/founder/mikael-volvo-china-open-walking.webp" alt="Mikael Nylander walking the course with another golfer at Volvo China Open qualifying" width={1536} height={1024} sizes="(max-width: 860px) 100vw, 40vw" /></div></div>
              <figcaption><strong>Between shots.</strong><span>Walking the course during Volvo China Open qualifying.</span></figcaption>
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

      <section className="about-community sc-section" id="community" aria-labelledby="community-title">
        <div className="sc-wrap">
         <div className="about-community-story-grid" data-about-community-grid>
          <header className="about-community-intro" data-sc-in data-sc-stagger="55">
            <h2 id="community-title">JOIN US<br /><em>ON THE RANGE.</em></h2>
            <p className="about-community-subtitle">Karibu Golf community gatherings &amp; driving range clinics in Nairobi</p>
            <p>Good equipment is just the beginning. When you buy from Karibu Golf, you’ll be invited to our upcoming community gatherings and driving range clinics in Nairobi, personally hosted and led by Mikael Nylander.</p>
            <p>Come to sharpen your swing, ask questions or simply enjoy the game with other people. Mikael brings his professional playing and international coaching experience directly to the range, sharing practical advice in an approachable setting.</p>
          </header>
          <figure className="about-community-photo" data-about-community-media>
            <div className="about-community-photo-window"><div className="about-community-photo-motion"><Image unoptimized fill sizes="(max-width: 860px) 100vw, 42vw" src="/images/golf-moment.jpg" alt="A golfer following through on a sunlit course" /></div></div>
            <figcaption>A SHARED LOVE OF THE GAME.</figcaption>
          </figure>
          <div className="about-community-highlights">
            {clinicHighlights.map((highlight) => <article key={highlight.title} data-sc-in data-sc-stagger="55"><h3>{highlight.title}</h3><p>{highlight.copy}</p></article>)}
          </div>
         </div>
          <div className="about-community-invitation">
            <div><h3>Your invitation starts here.</h3><p>Karibu Golf customers will be invited to these Nairobi events. Dates, venues and participation details will be announced through our social media channels and WhatsApp. Message us to ask about the next clinic and joining the customer VIP group.</p></div>
            <a href={clinicInquiry}>Ask about the next clinic <ArrowUpRight size={22} aria-hidden="true" /></a>
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
