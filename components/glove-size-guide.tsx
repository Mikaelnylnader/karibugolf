"use client";

import { useState } from "react";
import Image from "next/image";
import { Maximize2 } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

const guide = "/images/guides/mens-golf-glove-size-guide.png";
const alt = "Owner-supplied men's golf glove sizing illustration: numbered sizes 21 to 26, letter sizes XS to XXL, hand circumference and wrist-to-fingertip measurement. General reference, not a FootJoy or Titleist conversion chart.";

export default function GloveSizeGuide() {
  const [open, setOpen] = useState(false);
  return <section className="glove-size-guide" id="glove-size-guide" aria-labelledby="glove-size-guide-title" data-sc-act="flow">
    <header><p className="micro">GLOVE FITTING · BEFORE YOU ORDER</p><h2 id="glove-size-guide-title">FIND YOUR FIT.</h2><p>Start with your measurements. Confirm the model, size, glove hand and fit with Karibu Golf before ordering.</p></header>
    <div className="glove-size-guide-grid">
      <div className="glove-size-guide-copy" data-sc-in>
        <ol>
          <li><h3>Measure around your hand</h3><p>Wrap a tape around the knuckles and palm, excluding the thumb. Record the circumference in centimetres.</p></li>
          <li><h3>Use the right length measurement</h3><p>For FootJoy’s official chart, measure the middle finger from where it joins the palm to its tip. The supplied picture instead shows whole-hand length from the wrist crease; these are different measurements.</p></li>
          <li><h3>Confirm hand and fit</h3><p>Choose the hand you wear the glove on. Tell us your measurements and whether you normally wear regular or cadet fit. A size guide is not a list of sizes currently in stock.</p></li>
        </ol>
        <div className="glove-size-guide-warning"><h3>A guide, not a guaranteed conversion.</h3><p>The owner-supplied picture below is a general reference, not an official FootJoy or Titleist size chart. Numbered sizes do not map universally to letter sizes. Use the brand’s chart for the exact model and try the glove on where possible.</p></div>
        <p>Prefer inches? 1 inch = 2.54 cm. Send us your measurements and the glove model if you need help.</p>
        <a className="glove-fit-source" href="https://www.footjoy.com/fitting-men-gloves.html" target="_blank" rel="noreferrer">FootJoy official measuring guide ↗</a>
        <a className="glove-fit-source" href="https://www.footjoy.com/web/images/fitting/GloveFittingSystem.pdf" target="_blank" rel="noreferrer">FootJoy printable fitting tool ↗</a>
      </div>
      <figure className="glove-size-guide-figure" data-sc-in>
        <button className="glove-size-guide-image" type="button" onClick={() => setOpen(true)} aria-label="Enlarge men's glove size guide"><Image unoptimized src={guide} alt={alt} width={1254} height={1254}/><span><Maximize2 size={18}/> Enlarge guide</span></button>
        <figcaption>General reference supplied by Karibu Golf. Brand/model sizing takes precedence.</figcaption>
        <a href={guide} target="_blank" rel="noreferrer">Open full-size sizing picture ↗</a>
      </figure>
    </div>
    <Dialog open={open} onOpenChange={setOpen}><DialogContent className="glove-size-guide-dialog"><DialogTitle>Men’s glove size guide · General reference</DialogTitle><Image unoptimized src={guide} alt={alt} width={1254} height={1254}/><p>Not a brand-specific conversion chart. Confirm size, glove hand and fit before ordering.</p><a href={guide} target="_blank" rel="noreferrer">Open original at full size ↗</a></DialogContent></Dialog>
  </section>;
}
