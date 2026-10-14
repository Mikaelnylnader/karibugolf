"use client";
import { Check } from "lucide-react";
import { Dialog, DialogTrigger, DialogContent, DialogTitle, DialogDescription, DialogClose } from "@/components/ui/dialog";
import { rewards } from "@/lib/campaign";
import { useCampaignChoice } from "@/components/campaign-choice";

const compactBenefits=[
  ["Name on the Supporters Wall","Digital updates and behind-the-scenes access"],
  ["Full custom fitting and swing analysis","15% off your first gear order","Name on the Supporters Wall"],
  ["Full-set VIP fitting and regripping","Golf clinic with Mikael Nylander","Karibu Golf branded apparel"],
  ["Permanent Founding Sponsor recognition","Lifetime priority booking","Full fitting and two VIP clinic passes"],
];

export default function CampaignRewards() {
  const {choose}=useCampaignChoice();
  const revealComparison=()=>{
    const section=document.querySelector<HTMLElement>("[data-campaign-reward-timeline]");
    if(!section||section.closest<HTMLElement>(".campaign-scroll")?.dataset.rewardMotion!=="on")return;
    const top=section.getBoundingClientRect().top+scrollY;
    const destination=top+Math.max(section.offsetHeight-innerHeight,0)*.82;
    if(scrollY<destination-2)scrollTo({top:destination,behavior:"instant"});
  };
  return <div className="campaign-reward-grid" onFocusCapture={revealComparison}>
    {rewards.map((reward,index)=><article className={"campaign-reward "+(reward.id==="vip"?"campaign-reward-highlight":"")} key={reward.id}>
      <div className="campaign-reward-top"><span>PROPOSED REWARD</span><span>{reward.id==="vip"?"CLINIC + FITTING":"PRE-LAUNCH"}</span></div>
      <p className="campaign-reward-amount">{reward.amount}<span>USD</span></p>
      <h3>{reward.name}</h3>
      <p className="campaign-reward-line">{reward.line}</p>
      <ul>{reward.features.map((feature,featureIndex)=><li key={feature}><Check size={16} aria-hidden="true"/><span className="campaign-benefit-full">{feature}</span><span className="campaign-benefit-compact">{compactBenefits[index][featureIndex]}</span></li>)}</ul>
      <p className="campaign-reward-location">{reward.location}</p>
      <Dialog>
        <DialogTrigger className="campaign-reward-button" onClick={()=>choose(reward.id)} aria-label={"Preview "+reward.name+" reward"}>Preview this reward</DialogTrigger>
        <DialogContent className="campaign-reward-dialog">
          <p className="campaign-kicker">YOUR PLACE IN THE KARIBU STORY</p>
          <DialogTitle className="campaign-dialog-title">{reward.name}</DialogTitle>
          <p className="campaign-dialog-amount">{reward.amount} <span>USD · proposed contribution</span></p>
          <DialogDescription className="campaign-dialog-description">We’re preparing the crowdfunding campaign. This is a preview of the proposed reward; contributions and reservations are not open yet.</DialogDescription>
          <ul className="campaign-dialog-benefits">{reward.features.map(feature=><li key={feature}><Check size={18} aria-hidden="true"/><span>{feature}</span></li>)}</ul>
          <p className="campaign-dialog-note">{reward.location}. Final availability, delivery dates and redemption terms will be announced when the campaign launches.</p>
          <a className="campaign-button" href={"https://wa.me/254116416105?text="+encodeURIComponent("Hi Karibu Golf! I'd like to learn more about the proposed "+reward.name+" crowdfunding reward ("+reward.amount+" USD).")} target="_blank" rel="noopener noreferrer">Ask Karibu about this reward</a>
          <DialogClose className="campaign-dialog-back">Keep exploring rewards</DialogClose>
        </DialogContent>
      </Dialog>
    </article>)}
  </div>;
}
