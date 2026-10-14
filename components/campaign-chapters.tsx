import Image from "next/image";
import CampaignRewards from "@/components/campaign-rewards";
import CampaignFaq from "@/components/campaign-faq";
import CampaignInvitation from "@/components/campaign-invitation";

export default function CampaignChapters() {
  return <>
    <section className="campaign-chapter mission-chapter" id="mission" data-sc-act="pin" data-campaign-pin data-campaign-mission data-sc-span="2.8" aria-labelledby="mission-title">
      <div className="sc-stage mission-stage" data-sc-stage>
        <div className="mission-introduction">
          <h2 id="mission-title">A better fit.<br/><em>A bigger welcome.</em></h2>
          <div className="mission-statement"><p>Golf is finding its next generation in East Africa. The equipment and expertise should grow with it.</p><p>Limited choice. Expensive imports. Off-the-rack clubs that don’t suit your swing. We’re building a better starting point.</p></div>
        </div>
        <div className="mission-plans">
          <article className="mission-scene mission-scene-fit"><span className="mission-scene-word" aria-hidden="true">FIT.</span><div><h3>A planned fitting studio.</h3><p>Loft and lie adjustments, regripping, reshafting and swing-weighting in Nairobi. Expert guidance, with the player at the centre.</p></div></article>
          <article className="mission-scene mission-scene-gear"><span className="mission-scene-word" aria-hidden="true">SOURCE.</span><div><h3>Premium gear. Fairer prices.</h3><p>Direct sourcing from leading international manufacturers, reducing unnecessary markups and opening up more choice across East Africa.</p></div></article>
          <article className="mission-scene mission-scene-community"><span className="mission-scene-word" aria-hidden="true">SHARE.</span><div><h3>A community, from day one.</h3><p>Founder-led demo days, clinics and on-course guidance at local clubs. A planned place to try equipment, ask questions and meet other golfers.</p></div></article>
        </div>
        <div className="mission-steps" aria-hidden="true"><span>The studio</span><span>The gear</span><span>The community</span><i/></div>
      </div>
    </section>

    <section className="campaign-chapter founder-chapter" id="founder" data-sc-act="pan" data-campaign-pan data-campaign-founder data-sc-span="2.6" aria-labelledby="founder-title">
      <div className="sc-stage founder-stage" data-sc-stage>
        <div className="founder-pan-track" data-sc-pan>
          <article className="founder-scene">
            <div className="founder-scene-copy"><p className="campaign-kicker">MEET MIKAEL NYLANDER</p><h2 id="founder-title">TOUR<br/><em>ROOTS.</em></h2><p>A lifetime in the game. Professional playing experience and appearances at DP World Tour events. International coaching in Sweden, Shanghai and Nairobi.</p><p>A lifelong understanding of what golfers need to feel confident.</p></div>
            <figure className="founder-document"><Image unoptimized src="/images/founder/mikael-volvo-china-open-tee-off.webp" alt="Mikael Nylander playing a tee shot at Volvo China Open qualifying" width={1536} height={1024}/><figcaption>Mikael Nylander at Volvo China Open qualifying.</figcaption></figure>
          </article>
          <article className="founder-scene founder-scene-next">
            <div className="founder-scene-copy"><p className="campaign-kicker">A NEW CHAPTER IN NAIROBI</p><h2>NAIROBI<br/><em>NEXT.</em></h2><p>More than 15 years in automotive engineering and international trade logistics bring technical precision and operational experience to the business behind the game.</p><p>Now, that experience is coming together around a fitting studio and a bigger welcome for East Africa’s golfers.</p></div>
            <figure className="founder-document"><Image unoptimized src="/images/founder/mikael-volvo-china-open-walking.webp" alt="Mikael Nylander walking the course at Volvo China Open qualifying" width={1536} height={1024}/><figcaption>A life in golf. Photograph from Volvo China Open qualifying.</figcaption></figure>
          </article>
        </div>
        <p className="founder-stage-signoff">GOLFER. COACH. FOUNDER.</p>
      </div>
    </section>
    <aside className="founder-quotation"><blockquote className="founder-quiet-quote"><p>“Golf should be approachable, expert-led, and accessible. Having played and coached around the world, I want to give every player in East Africa the equipment, fitting, and guidance they need to play their best game.”</p><cite>MIKAEL NYLANDER</cite></blockquote></aside>

    <section className="campaign-fitting" id="fitting" data-sc-act="pin" data-campaign-pin data-sc-span="3.7" data-campaign-fitting aria-labelledby="fitting-title">
      <div className="sc-stage campaign-fitting-stage" data-sc-stage>
        <h2 id="fitting-title">YOUR SWING.<br/><em>YOUR SETUP.</em></h2>
        <div className="fitting-image"><Image unoptimized src="/images/p790-face.jpg" alt="An iron face and shaft, shown as an equipment reference for the fitting process" width={900} height={900}/></div>
        <div className="fitting-label fitting-label-loft"><span>Loft & lie</span><i aria-hidden="true"/></div>
        <div className="fitting-label fitting-label-grip"><span>Shaft & grip</span><i aria-hidden="true"/></div>
        <div className="fitting-label fitting-label-weight"><span>Weight & feel</span><i aria-hidden="true"/></div>
        <div className="fitting-explanation"><p>Equipment shaped around the player.</p><p>Precise adjustments, the right components and personal guidance. True fitting starts with understanding your game.</p></div>
      </div>
    </section>

    <section className="campaign-chapter community-chapter" id="impact" data-sc-act="flow" aria-labelledby="impact-title">
      <div className="community-opening"><h2 id="impact-title"><span data-sc-cue="0 1 .1 0" data-sc-kinetic="words">OPEN DOORS.</span>{" "}<em data-sc-cue="0 1 .16 0" data-sc-kinetic="words">GROW THE GAME.</em></h2><p>Your support can build more than a fitting studio. These are the community initiatives we plan to develop as Karibu grows.</p></div>
      <div className="community-promise-wrap" data-campaign-promise><article className="community-promise"><h3>A first swing.<br/>A new possibility.</h3><p>Free and subsidised junior clinics to introduce young talent across Kenya to the game, with guidance and room to discover their potential.</p></article></div>
      <div className="community-promise-wrap" data-campaign-promise><article className="community-promise"><h3>Skills that stay<br/>in the community.</h3><p>Equipment access and professional fitting education for local caddies and aspiring junior coaches. More ways to progress through the sport.</p></article></div>
      <div className="community-promise-wrap" data-campaign-promise><article className="community-promise"><h3>East Africa,<br/>on the golf map.</h3><p>Collaborations with local initiatives to help visitors discover the region’s courses, communities and golf experiences.</p></article></div>
      <p className="community-status">Planned initiatives. Programme details and timing will develop alongside the studio.</p>
    </section>

    <section className="campaign-chapter backing-chapter" id="rewards" data-campaign-rewards aria-labelledby="rewards-title">
      <div className="backing-introduction"><h2 id="rewards-title">FIND YOUR PLACE.<br/><em>HELP BUILD OURS.</em></h2><p>From cheering us on to becoming a founding member, there’s a way to be part of the next chapter.</p></div>
      <div className="campaign-reward-timeline" data-sc-act="pin" data-campaign-pin data-campaign-desktop-pin data-campaign-reward-timeline data-sc-span="3.5">
      <div className="sc-stage campaign-rewards-stage" data-sc-stage>
        <CampaignRewards/>
        <p className="campaign-rewards-note">Proposed USD rewards. Final availability, fulfillment dates and terms will be published at launch. Payments and reservations are not open yet.</p>
      </div>
      </div>
    </section>
    <section className="campaign-chapter backing-details" data-sc-act="flow" aria-label="Campaign plans and questions">
      <div className="backing-priorities"><h3>What your support helps us build.</h3><ul><li>Workshop tools and a dedicated fitting space in Nairobi.</li><li>Direct sourcing and an opening selection of quality golf equipment.</li><li>The resources to develop demo days, junior clinics and local skills programmes.</li></ul></div>
      <div className="campaign-faq"><div><h2>A few things<br/><em>to know.</em></h2><a className="campaign-text-link" href="https://wa.me/254116416105" target="_blank" rel="noopener noreferrer">Ask Karibu a question</a></div><CampaignFaq/></div>
    </section>
    <section className="campaign-chapter invitation-chapter" data-sc-act="flow" aria-label="Join the Karibu Golf campaign"><CampaignInvitation/></section>
  </>;
}
