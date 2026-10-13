import Image from "next/image";

// Manufacturer guidance checked on 13 October 2026; these are not stock options.
const grinds = [
  { letter: "F", title: "Full swings", text: "A full sole for stable, square-face shots. Suits fuller swings and offers protection against digging.", image: "sm11-f-grind.webp" },
  { letter: "M", title: "Face versatility", text: "Heel, toe and trailing-edge relief let you vary the face angle around the green. A versatile option across changing lies.", image: "sm11-m-grind.webp" },
  { letter: "T", title: "Tight lies", text: "A narrow, low-bounce sole for firm turf and open-face shots. Favours precise delivery over forgiveness.", image: "sm11-t-grind.webp" },
  { letter: "S", title: "Square-face control", text: "A narrower sole with trailing-edge relief for smooth turf interaction, especially on square-face shots.", image: "sm11-s-grind.webp" },
  { letter: "D", title: "Steeper delivery", text: "Higher forward bounce with relief for face versatility. Helps golfers who dig on steeper swings or softer turf.", image: "sm11-d-grind.webp" },
  { letter: "K", title: "Bunker forgiveness", text: "A wide, cambered sole. SM11 offers 12° bounce for soft conditions and 6° for firmer turf and sand.", image: "sm11-k-grind.webp" },
];

export default function VokeyGrindGuide() {
  return <section className="vokey-grind-guide" id="wedge-grind-guide" aria-labelledby="vokey-guide-title" data-sc-act="flow">
    <header>
      <p className="micro">BOUNCE &amp; SOLE SHAPE</p>
      <h2 id="vokey-guide-title">WHAT THE NUMBERS<br/>AND LETTERS MEAN.</h2>
      <p>Bounce describes the angle between the leading edge and sole; grind describes the sole’s shape and relief. Both affect how the wedge moves through turf and sand.</p>
      <p className="vokey-code-example"><strong>58.04 T</strong><span>58° loft · 4° bounce · T grind</span></p>
    </header>
    <div className="vokey-bounce-scale" aria-label="General Vokey bounce guidance">
      <article><strong>4°–6°</strong><h3>Low bounce</h3><p>Firm turf, tighter lies and shallower swings.</p></article>
      <article><strong>7°–10°</strong><h3>Mid bounce</h3><p>Firm-to-normal turf and a more neutral delivery.</p></article>
      <article><strong>Over 10°</strong><h3>High bounce</h3><p>Softer ground, soft sand and steeper swings.</p></article>
    </div>
    <p className="vokey-guide-source">General guidance: <a href="https://www.vokey.com/explained/wedge-bounce" target="_blank" rel="noreferrer">Vokey’s bounce explanation ↗</a></p>
    <div className="vokey-grind-grid">
      {grinds.map(grind=><article key={grind.letter}>
        <Image unoptimized src={`/images/shop/clubs-editorial/${grind.image}`} alt={`Vokey SM11 ${grind.letter} grind with the sole highlighted in blue`} width={674} height={468}/>
        <div><p className="micro">{grind.letter} GRIND</p><h3>{grind.title}</h3><p>{grind.text}</p></div>
      </article>)}
    </div>
    <p className="vokey-guide-source">Grind guidance: <a href="https://www.titleist.com/vokey-design-wedges/behind-the-grinds" target="_blank" rel="noreferrer">Titleist — Behind the Grinds ↗</a></p>
    <aside><h3>Reference guide, not a stock list.</h3><p>Karibu’s planned models use F, M and T grinds in Tour Chrome or Jet Black. S, D, K and the additional pictured finish are manufacturer references, not extra order options. SM11 is not currently in stock.</p><p>Tell us your typical divot, bunker sand and usual shots when enquiring. We’ll confirm the exact model and future availability before you order.</p><a href="#product-order">Choose from the planned range ↑</a></aside>
  </section>;
}
