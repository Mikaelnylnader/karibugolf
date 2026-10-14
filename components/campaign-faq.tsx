"use client";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
const questions=[
  ["Can I contribute right now?","This is our pre-launch campaign preview. Payments and reward reservations are not open yet. The official crowdfunding link, funding goal and launch date will be shared when the campaign is ready."],
  ["Where will fittings and clinics take place?","The planned fitting studio and in-person experiences will be in Nairobi, Kenya. Confirmed venues, booking details and redemption dates will be published with the official campaign."],
  ["Can I support Karibu from outside Kenya?","Yes—our proposed Community Supporter tier is designed for supporters anywhere. Other tiers include experiences in Nairobi, so consider whether you can attend before choosing an in-person reward."],
  ["Are the community programmes already running?","The youth clinics, caddie and coach development programmes, and golf tourism collaborations described here are planned initiatives. This campaign is intended to help us build the resources to bring them to life."],
  ["What happens after the campaign launches?","The official campaign will explain the funding goal, timeline, reward terms and delivery plan. Until then, you can explore the proposed rewards and contact Karibu Golf with questions."],
];
export default function CampaignFaq(){return <Accordion className="campaign-faq-accordion">{questions.map(([question,answer],index)=><AccordionItem value={index} key={question}><AccordionTrigger>{question}</AccordionTrigger><AccordionContent><p>{answer}</p></AccordionContent></AccordionItem>)}</Accordion>;}
