"use client";
import { useCampaignChoice } from "@/components/campaign-choice";
import { rewards } from "@/lib/campaign";
export default function CampaignInvitation(){
 const {selected}=useCampaignChoice();
 const reward=rewards.find(item=>item.id===selected);
 const enquiry=reward?"Hi Karibu Golf! I'd like to learn more about the proposed "+reward.name+" crowdfunding reward ("+reward.amount+" USD).":"Hi Karibu Golf! I'd like to learn more about your upcoming crowdfunding campaign.";
 return <div className="campaign-invitation">
  <div className="campaign-invitation-heading"><h2>YOUR PLACE.<br/><em>OUR NEXT CHAPTER.</em></h2><p>A home for golf performance, community and opportunity. Built together, from Nairobi to East Africa.</p></div>
  <div className="campaign-invitation-choice" aria-live="polite">{reward?<><span>THE REWARD YOU EXPLORED</span><strong>{reward.name}</strong><p>{reward.amount} USD · proposed reward</p></>:<><span>THE INVITATION IS OPEN</span><strong>Find your place in the story.</strong><p>Explore our four proposed backer rewards.</p></>}</div>
  <div className="campaign-invitation-actions"><a className="campaign-button" href="#rewards">Explore rewards</a><a className="campaign-text-link" href={"https://wa.me/254116416105?text="+encodeURIComponent(enquiry)} target="_blank" rel="noopener noreferrer">Ask Karibu a question</a></div>
  <p className="campaign-invitation-status">Pre-launch preview. Payments and reservations are not open yet.</p>
 </div>;
}
