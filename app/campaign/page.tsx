import type { Metadata } from "next";
import Image from "next/image";


import CampaignChapters from "@/components/campaign-chapters";
import CampaignScrollShell from "@/components/campaign-scroll-shell";
import "./campaign.css";
import "./campaign-scroll.css";

export const metadata: Metadata = {
  title: "Karibu Golf Campaign | A Game for Everyone",
  description: "Explore Karibu Golf's pre-launch plans for a Nairobi fitting studio, fair-priced golf equipment and community programmes, with four proposed backer rewards.",
  alternates: { canonical: "https://karibugolf.com/campaign/" },
  openGraph: { title: "A Game for Everyone | Karibu Golf Campaign", description: "Help shape the next chapter of golf in East Africa. Explore our pre-launch plans and proposed rewards.", url: "https://karibugolf.com/campaign/", images: [{ url: "https://karibugolf.com/images/founder/mikael-volvo-china-open-tee-off.webp", width: 1536, height: 1024, alt: "Mikael Nylander at Volvo China Open qualifying" }] },
};
export default function Campaign() {
  return <main className="campaign" id="page-content">
    <CampaignScrollShell>
    <section className="campaign-hero" aria-labelledby="campaign-title" data-campaign-hero data-campaign-pin data-sc-act="pin" data-sc-span="2.1">
      <div className="sc-stage campaign-hero-stage" data-sc-stage>
        <div className="campaign-fairway-plane"><Image unoptimized src="/images/fairway-aerial.jpg" alt="Sunlight across a fairway, trees and bunkers" width={2400} height={1599} priority/></div>
        <div className="campaign-hero-copy">
          <p className="campaign-status" data-sc-cue="0 1 0 0"><span className="campaign-hero-status-inner">KARIBU GOLF · PRE-LAUNCH CAMPAIGN</span></p>
          <h1 id="campaign-title"><span data-sc-cue="0 1 0 0"><span className="campaign-hero-line campaign-hero-line-top">A GAME FOR</span></span><br/><em data-sc-cue="0 1 0 0"><span className="campaign-hero-line campaign-hero-line-accent">EVERYONE.</span></em></h1>
          <p className="campaign-hero-description" data-sc-cue="0 1 0 0"><span className="campaign-hero-description-inner">Help us build a Nairobi fitting studio, fair-priced golf gear and a bigger welcome for East Africa.</span></p>
          <div className="campaign-actions"><a className="campaign-button" href="#rewards" data-sc-cue="0 1 0 0">Explore rewards</a><a className="campaign-text-link" href="#founder" data-sc-cue="0 1 0 0">Our story</a></div>
        </div>
        <figure className="campaign-photographic-print"><Image unoptimized src="/images/founder/mikael-volvo-china-open-tee-off.webp" alt="Founder Mikael Nylander playing at Volvo China Open qualifying" width={1536} height={1024} priority/><figcaption>Mikael Nylander · A lifetime in the game.</figcaption></figure>
        <div className="campaign-near-seal" aria-hidden="true"><Image unoptimized src="/images/karibu-badge.svg" alt="" width={70} height={70}/></div>
      </div>
    </section>
    <CampaignChapters/>
    </CampaignScrollShell>
  </main>;
}
