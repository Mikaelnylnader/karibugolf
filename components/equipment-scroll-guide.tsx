'use client';
/* oxlint-disable next/no-img-element, next/no-html-link-for-pages -- Static export uses authored catalogue paths and native anchors. */

import { type CSSProperties, useMemo, useState } from 'react';
import { ArrowLeft, ArrowUpRight } from 'lucide-react';

type Instrument = 'flight' | 'ladder' | 'turf' | 'load' | 'contact' | 'field';
type Choice = { label: string; title: string; body: string; note: string };
type Decision = { title: string; kicker: string; body: string };
type Guide = {
  room: string;
  intro: string;
  question: string;
  lensTitle: string;
  lensBody: string;
  instrument: Instrument;
  decisions: Decision[];
  choices: Choice[];
};

const flightGuide: Guide = {
  room: 'THE FLIGHT LAB',
  intro:
    'Build a playable window first. Head shape, loft and shaft should work together around your delivery, not around a logo.',
  question: 'What should the next shot do?',
  lensTitle: 'BUILD A WINDOW, NOT A NUMBER.',
  lensBody:
    'Better players tune launch, spin and strike pattern together. The longest single shot matters less than a flight that starts where expected and stays useful when contact moves across the face.',
  instrument: 'flight',
  decisions: [
    {
      kicker: '01 / LAUNCH',
      title: 'Start height',
      body: 'Loft and delivery create the launch window. More loft can help carry, while a lower window can suit speed and wind when strike is reliable.',
    },
    {
      kicker: '02 / SPIN',
      title: 'Hold the curve',
      body: 'Spin keeps a shot in the air, but too much can climb and lose distance. Too little can flatten the flight and reduce carry.',
    },
    {
      kicker: '03 / STRIKE',
      title: 'Protect the miss',
      body: 'Impact location changes speed, launch and curvature. Choose the head that keeps your common miss playable, not only the centre strike.',
    },
  ],
  choices: [
    {
      label: 'More carry',
      title: 'Raise the playable window',
      body: 'Begin with enough loft and a head that makes centre contact easier. Confirm the result with launch and landing, not loft printed on the sole alone.',
      note: 'Start: forgiveness plus playable loft',
    },
    {
      label: 'Straighter',
      title: 'Stabilise the starting line',
      body: 'Look at strike pattern and face delivery first. A draw-biased or more stable head can help, but setup and shaft fit still shape the result.',
      note: 'Start: protect the common miss',
    },
    {
      label: 'Lower flight',
      title: 'Control height and spin',
      body: 'A lower-spin build can suit a fast, centred strike. Keep enough launch and spin to carry the ball and hold the intended line.',
      note: 'Start: test the full flight, not peak speed',
    },
  ],
};

const ironGuide: Guide = {
  room: 'THE SET ROOM',
  intro:
    'Choose the set that makes your normal strike useful. Shape, sole and set makeup should create repeatable gaps from the longest iron to the scoring clubs.',
  question: 'Where does your set need help?',
  lensTitle: 'CONTROL CHANGES THROUGH THE SET.',
  lensBody:
    'A useful iron set does not need every head to behave identically. Longer clubs can prioritise launch and stability, while shorter clubs can prioritise flight, turf control and precise distance.',
  instrument: 'ladder',
  decisions: [
    {
      kicker: '01 / HEAD',
      title: 'Choose the help',
      body: 'Compact heads offer a precise view and feedback. Larger, perimeter-weighted heads can protect speed and direction when strike varies.',
    },
    {
      kicker: '02 / SOLE',
      title: 'Read the turf',
      body: 'Sole width, leading edge and bounce affect how the club enters and exits the ground. The right sole keeps impact moving through the ball.',
    },
    {
      kicker: '03 / SET',
      title: 'Map the gaps',
      body: 'Loft labels do not guarantee useful spacing. Build around carry distances and consider hybrids, utility irons or mixed heads where the top of the set gets crowded.',
    },
  ],
  choices: [
    {
      label: 'More help',
      title: 'Protect launch and speed',
      body: 'Begin with a more stable cavity, a wider sole and a set makeup that replaces the hardest long irons with easier-launching options.',
      note: 'Start: game-improvement or blended set',
    },
    {
      label: 'Balanced',
      title: 'Blend help with control',
      body: 'Players-distance or compact cavity designs can retain a clean address view while adding launch and speed protection through the middle of the set.',
      note: 'Start: players-distance or combo set',
    },
    {
      label: 'More control',
      title: 'Prioritise flight and feedback',
      body: 'A compact head can suit a consistent strike and a player who wants trajectory control. Keep the long end honest, even if that means a blended set.',
      note: 'Start: compact cavity or blade blend',
    },
  ],
};

const wedgeGuide: Guide = {
  room: 'THE SCORING ROOM',
  intro:
    'Wedges are a system of loft, bounce and grind. Build useful yardage gaps, then choose soles that match your turf, sand and delivery.',
  question: 'How does the club meet the ground?',
  lensTitle: 'THE SOLE IS PART OF THE SHOT.',
  lensBody:
    'Skilled wedge play is not simply more spin. Predictable strike, launch and ground contact matter first. Different soles can make the same loft behave very differently from fairway, rough and sand.',
  instrument: 'turf',
  decisions: [
    {
      kicker: '01 / LOFT',
      title: 'Build the spacing',
      body: 'Start from the pitching wedge you actually play, then create carry gaps that cover full swings and the partial shots you rely on.',
    },
    {
      kicker: '02 / BOUNCE',
      title: 'Manage depth',
      body: 'Bounce helps the leading edge resist digging. More can help steeper delivery and softer ground, while less can suit shallow delivery and firmer lies.',
    },
    {
      kicker: '03 / GRIND',
      title: 'Open the face',
      body: 'Heel, toe and trailing-edge relief change how the sole sits when the face opens. Choose versatility only where your short-game shots need it.',
    },
  ],
  choices: [
    {
      label: 'Soft turf',
      title: 'Use the ground as support',
      body: 'More effective bounce and a fuller sole can keep the head from digging in soft fairways or fluffy sand.',
      note: 'Start: mid to higher bounce',
    },
    {
      label: 'Mixed',
      title: 'Cover the normal week',
      body: 'A versatile mid-bounce sole is a sensible centre point when conditions and shot types change through the round.',
      note: 'Start: versatile mid bounce',
    },
    {
      label: 'Firm turf',
      title: 'Keep the leading edge close',
      body: 'Lower effective bounce or more sole relief can suit firm lies and a shallow strike, provided the club still has enough forgiveness for sand and rough.',
      note: 'Start: lower bounce or relieved grind',
    },
  ],
};

const carryGuide: Guide = {
  room: 'THE CARRY PLAN',
  intro:
    'Choose a bag around how the round moves. Weight, balance, stand, dividers and pocket access matter more than a long feature list.',
  question: 'How does your bag travel?',
  lensTitle: 'PACK FOR THE ROUND YOU PLAY.',
  lensBody:
    'The best bag keeps its weight stable, the clubs easy to reach and the essentials where you can find them without stopping play. A walking setup and a cart setup solve different problems.',
  instrument: 'load',
  decisions: [
    {
      kicker: '01 / CARRY',
      title: 'Balance the weight',
      body: "For walking, strap geometry and where the load sits can matter as much as the bag's listed weight.",
    },
    {
      kicker: '02 / ACCESS',
      title: 'Reach what matters',
      body: 'Water, glove, range finder, rain layer and valuables should be accessible in the way you actually use the bag.',
    },
    {
      kicker: '03 / BASE',
      title: 'Match the transport',
      body: 'Stand, cart and travel bags use different bases, structures and storage. Pick the format before comparing pockets.',
    },
  ],
  choices: [
    {
      label: 'I walk',
      title: 'Keep it light and balanced',
      body: 'Prioritise a stable stand, comfortable dual straps and enough storage for weather without carrying unused bulk.',
      note: 'Start: stand or carry bag',
    },
    {
      label: 'I ride',
      title: 'Keep pockets visible',
      body: 'A cart bag can add structure, dividers and storage. Check that the strap channel and pocket layout still work when mounted.',
      note: 'Start: cart-focused layout',
    },
    {
      label: 'I travel',
      title: 'Protect the whole setup',
      body: 'Travel structure, wheel quality, handles and closure protection matter first. Leave room for shoes and soft padding without overloading the case.',
      note: 'Start: structured travel bag',
    },
  ],
};

const contactGuide: Guide = {
  room: 'THE CONTACT LAB',
  intro:
    'Feel starts at contact. Material, compression, cover, texture and fit should support the shot you need and the conditions you play.',
  question: 'What should contact feel like?',
  lensTitle: 'CONSISTENCY BEATS A SINGLE PERFECT HIT.',
  lensBody:
    'Good players protect the contact they can repeat. The right ball, glove or grip should remain predictable across a full round, changing weather and less-than-perfect swings.',
  instrument: 'contact',
  decisions: [
    {
      kicker: '01 / FEEL',
      title: 'Read the feedback',
      body: 'Soft and firm are sensations, not complete performance categories. Judge feel alongside launch, spin, control and comfort.',
    },
    {
      kicker: '02 / WEATHER',
      title: 'Plan for moisture',
      body: 'Heat, rain and sweat change traction and material behaviour. Choose the contact surface for the conditions you actually face.',
    },
    {
      kicker: '03 / FIT',
      title: 'Remove movement',
      body: 'A glove or grip that shifts in the hand asks for extra pressure. Fit should feel secure without creating tension.',
    },
  ],
  choices: [
    {
      label: 'More feel',
      title: 'Prioritise clear feedback',
      body: 'Begin with premium materials and a precise fit. Keep enough durability and weather performance for the rounds you play most.',
      note: 'Start: responsive, close-fitting build',
    },
    {
      label: 'All round',
      title: 'Balance feel and durability',
      body: 'Choose a construction that stays consistent across practice and play, with enough traction for heat and light moisture.',
      note: 'Start: versatile everyday option',
    },
    {
      label: 'Wet weather',
      title: 'Let moisture create grip',
      body: 'Rain-specific materials and textures can become more secure when wet. Carry the pair or backup that matches the conditions.',
      note: 'Start: weather-specific contact',
    },
  ],
};

const ballGuide: Guide = {
  room: 'THE BALL LAB',
  intro:
    'Fit the ball from the green backwards. Cover, construction and compression should give you useful short-game control without giving away the flight you need through the bag.',
  question: 'Where should the ball help most?',
  lensTitle: 'PLAY ONE FLIGHT YOU CAN LEARN.',
  lensBody:
    'Changing models changes launch, spin and feel across every club. A consistent ball lets you learn how chips release, wedges stop and full shots move in the wind.',
  instrument: 'contact',
  decisions: [
    {
      kicker: '01 / GREEN',
      title: 'Start with control',
      body: 'Test chips, pitches and bunker shots first. A urethane cover generally gives more short-game spin and feedback than a firmer distance cover.',
    },
    {
      kicker: '02 / IRONS',
      title: 'Read the window',
      body: 'The ball should launch and spin into a predictable carry window with the clubs you use to attack greens.',
    },
    {
      kicker: '03 / DRIVER',
      title: 'Protect the flight',
      body: 'Confirm that driver launch and spin stay playable. The fastest ball on one strike is less useful than a model that holds its line across normal contact.',
    },
  ],
  choices: [
    {
      label: 'Green control',
      title: 'Prioritise spin and feedback',
      body: 'Begin with a multilayer urethane model, then compare how it launches and releases on the short shots you actually play.',
      note: 'Start: tour-style urethane construction',
    },
    {
      label: 'Balanced',
      title: 'Blend control with durable speed',
      body: 'A mid-feel multilayer ball can offer a useful middle ground for golfers who want predictable flight without the firmest response.',
      note: 'Start: balanced multilayer model',
    },
    {
      label: 'Easy distance',
      title: 'Launch with less effort',
      body: 'A firmer, lower-spin distance construction can help create speed and a straighter full-shot flight. Confirm that the short-game release still suits you.',
      note: 'Start: distance-focused construction',
    },
  ],
};

const juniorGuide: Guide = {
  room: 'THE FIRST SET',
  intro:
    'Junior clubs should fit the player now. Correct length, manageable weight and a simple set makeup make it easier to build speed, balance and confidence.',
  question: 'What stage is the player at?',
  lensTitle: 'FIT THE CHILD, NOT THE AGE LABEL.',
  lensBody:
    'Height, strength and confidence develop at different rates. A shorter, lighter club that can be swung freely is more useful than a full bag built for growing into later.',
  instrument: 'load',
  decisions: [
    {
      kicker: '01 / HEIGHT',
      title: 'Set the length',
      body: "Use the maker's height range as the starting point. The player should be able to stand naturally without choking down excessively.",
    },
    {
      kicker: '02 / WEIGHT',
      title: 'Let it move',
      body: 'Light heads and shafts help a junior finish the swing in balance. Heavy clubs can teach compensation instead of speed.',
    },
    {
      kicker: '03 / MAKEUP',
      title: 'Keep it useful',
      body: 'A driver or fairway, one or two irons, a wedge and putter can cover early golf. Add clubs when real distance gaps appear.',
    },
  ],
  choices: [
    {
      label: 'First swings',
      title: 'Make contact feel possible',
      body: 'Choose the lightest simple set that fits current height, with forgiving heads and only the clubs needed for lessons and short rounds.',
      note: 'Start: compact starter set',
    },
    {
      label: 'Growing game',
      title: 'Add useful distance gaps',
      body: 'A larger junior set can introduce another iron or wood while keeping the same light, height-matched build.',
      note: 'Start: height-matched full junior set',
    },
    {
      label: 'Course ready',
      title: 'Check every club still fits',
      body: 'For a confident junior, map carry gaps and replace outgrown clubs rather than stretching posture or grip to keep an old set in play.',
      note: 'Start: fitted set makeup',
    },
  ],
};

const shoeGuide: Guide = {
  room: 'THE WALK TEST',
  intro:
    'Golf shoes have to walk, rotate and hold their platform for hours. Fit the foot first, then choose traction and weather protection for the courses you play.',
  question: 'What does the shoe need to protect?',
  lensTitle: 'COMFORT IS PERFORMANCE LATE IN THE ROUND.',
  lensBody:
    'A stable shoe should not require extra tension from the feet or legs. Heel hold, forefoot room, cushioning and traction all need to remain comfortable after kilometres of walking.',
  instrument: 'field',
  decisions: [
    {
      kicker: '01 / FIT',
      title: 'Lock the heel',
      body: 'The heel should stay secure while the toes have room to spread. Check fit in the socks you actually wear for golf.',
    },
    {
      kicker: '02 / TRACTION',
      title: 'Match the ground',
      body: 'Spiked soles add bite in wet or sloped conditions. Spikeless soles trade some aggression for versatility and an easier walk off the course.',
    },
    {
      kicker: '03 / WEATHER',
      title: 'Keep the foot dry',
      body: 'Waterproof construction matters in dew and rain, but breathability matters in heat. Choose around your most common conditions.',
    },
  ],
  choices: [
    {
      label: 'Long walks',
      title: 'Prioritise fit and cushioning',
      body: 'Begin with heel security, forefoot room and a stable midsole. A lighter spikeless build can suit firm, mostly dry walking rounds.',
      note: 'Start: walking comfort and stable fit',
    },
    {
      label: 'Wet ground',
      title: 'Add traction and protection',
      body: 'Choose waterproof construction and an outsole that keeps its grip on wet grass, side slopes and soft ground.',
      note: 'Start: waterproof, traction-led build',
    },
    {
      label: 'One shoe',
      title: 'Balance course and everyday use',
      body: 'A supportive spikeless shoe can move easily between practice, travel and the course while retaining enough lateral stability for the swing.',
      note: 'Start: versatile spikeless build',
    },
  ],
};

const apparelGuide: Guide = {
  room: 'THE COURSE WARDROBE',
  intro:
    'Build around movement and climate. The right golf layer stays comfortable through the swing, sun, wind and the temperature changes of a full round.',
  question: 'What conditions are you dressing for?',
  lensTitle: 'LAYER FOR THE ROUND, NOT THE FIRST TEE.',
  lensBody:
    'Course clothing should move without adjustment and manage heat or weather as the round changes. Fit, fabric and layering matter before small styling details.',
  instrument: 'field',
  decisions: [
    {
      kicker: '01 / MOVE',
      title: 'Protect the swing',
      body: 'Shoulders, waist and hips need room to rotate without excess fabric moving across the body.',
    },
    {
      kicker: '02 / HEAT',
      title: 'Manage the climate',
      body: 'Breathable, quick-drying fabric helps in warm rounds. Sun coverage and a comfortable collar can matter over several hours.',
    },
    {
      kicker: '03 / LAYER',
      title: 'Prepare the change',
      body: 'A light midlayer or packable shell should add warmth or protection without restricting rotation.',
    },
  ],
  choices: [
    {
      label: 'Hot day',
      title: 'Keep the layer light',
      body: 'Prioritise breathable, quick-drying fabric and a fit that stays off the body while moving.',
      note: 'Start: lightweight performance fabric',
    },
    {
      label: 'Changing day',
      title: 'Build a simple layer system',
      body: 'Use a comfortable base with a light layer that packs easily and can be added without changing the swing.',
      note: 'Start: base plus flexible midlayer',
    },
    {
      label: 'Wind or rain',
      title: 'Add protection without bulk',
      body: 'Choose a shell or jacket that blocks the conditions while leaving enough room through the shoulders and arms.',
      note: 'Start: stretch weather layer',
    },
  ],
};

const fieldGuide: Guide = {
  room: 'THE COURSE KIT',
  intro:
    'Choose the tool or layer that removes friction from the round. Fit, weather, access and reliable information matter more than novelty.',
  question: 'What needs to become easier?',
  lensTitle: 'THE BEST KIT DISAPPEARS IN USE.',
  lensBody:
    'Useful course equipment earns its place by being comfortable, quick to read and dependable when conditions change. If it interrupts the routine, it is solving the wrong problem.',
  instrument: 'field',
  decisions: [
    {
      kicker: '01 / FIT',
      title: 'Move without adjustment',
      body: 'Shoes and clothing should stay comfortable through walking, rotation and changing temperatures without repeated readjustment.',
    },
    {
      kicker: '02 / WEATHER',
      title: 'Prepare the layer',
      body: 'Build for sun, wind, rain and heat before comparing styling details. The right layer extends the round.',
    },
    {
      kicker: '03 / ROUTINE',
      title: 'Keep it available',
      body: 'Distance tools and accessories should be quick to reach, simple to read and easy to return to the same place.',
    },
  ],
  choices: [
    {
      label: 'Comfort',
      title: 'Protect the full round',
      body: 'Start with fit, pressure points and freedom of movement. The best choice should still feel natural late in the day.',
      note: 'Start: fit and walking comfort',
    },
    {
      label: 'Weather',
      title: 'Prepare for change',
      body: 'Choose coverage, traction and materials around the conditions you meet most, then add packability and style.',
      note: 'Start: conditions first',
    },
    {
      label: 'Precision',
      title: 'Make information immediate',
      body: 'For distance tools and small accessories, prioritise a clear read, reliable handling and a place in the bag that never changes.',
      note: 'Start: simple, repeatable routine',
    },
  ],
};

const guideBySlug: Record<string, Guide> = {
  drivers: flightGuide,
  woods: flightGuide,
  hybrids: flightGuide,
  golf_irons: ironGuide,
  wedges: wedgeGuide,
  bags: carryGuide,
  junior_sets: juniorGuide,
  balls: ballGuide,
  gloves: contactGuide,
  grips: contactGuide,
  range_finders: fieldGuide,
  accessories: fieldGuide,
  mens_shoes: shoeGuide,
  womens_shoes: shoeGuide,
  hats_and_caps: apparelGuide,
  mens_polos: apparelGuide,
  mens_pants: apparelGuide,
  mens_jackets: apparelGuide,
  mens_shorts: apparelGuide,
  womens_polos: apparelGuide,
  womens_skirts: apparelGuide,
  womens_pants: apparelGuide,
  womens_dresses: apparelGuide,
  womens_jackets: apparelGuide,
  womens_tops: apparelGuide,
};

function FitInstrument({ kind, choice }: { kind: Instrument; choice: number }) {
  const flightPaths = [
    'M24 168 C92 62 208 56 306 126',
    'M24 172 C110 108 222 102 306 142',
    'M24 174 C112 132 224 130 306 154',
  ];
  return (
    <div
      className={`equipment-instrument equipment-instrument--${kind}`}
      style={{ '--fit-choice': choice } as CSSProperties}
      aria-hidden="true"
    >
      <svg viewBox="0 0 330 220">
        <path
          className="equipment-grid"
          d="M24 178 H306 M58 35 V190 M164 35 V190 M270 35 V190"
        />
        {kind === 'flight' && (
          <>
            <path className="equipment-flight" d={flightPaths[choice]} />
            <circle cx="24" cy="172" r="7" />
          </>
        )}
        {kind === 'ladder' &&
          [0, 1, 2, 3, 4, 5].map((item) => (
            <rect
              className="equipment-ladder-bar"
              x={42 + item * 43}
              y={150 - item * (15 + choice * 4)}
              width="25"
              height={28 + item * (15 + choice * 4)}
              rx="2"
              key={item}
            />
          ))}
        {kind === 'turf' && (
          <>
            <path
              className="equipment-turf"
              d="M24 157 C95 142 226 164 306 148"
            />
            <path
              className="equipment-sole"
              d={
                choice === 0
                  ? 'M108 128 Q165 166 222 126'
                  : choice === 1
                    ? 'M108 135 Q165 160 222 134'
                    : 'M108 142 Q165 154 222 141'
              }
            />
          </>
        )}
        {kind === 'load' &&
          [0, 1, 2, 3].map((item) => (
            <rect
              className="equipment-load"
              x={56 + item * 58}
              y={70 + Math.abs(choice - (item % 3)) * 13}
              width="40"
              height={104 - Math.abs(choice - (item % 3)) * 13}
              rx="18"
              key={item}
            />
          ))}
        {kind === 'contact' &&
          [0, 1, 2, 3, 4].map((item) => (
            <circle
              className="equipment-contact"
              cx={75 + item * 45}
              cy={116 + (item % 2) * 18}
              r={13 + (choice === item % 3 ? 8 : 0)}
              key={item}
            />
          ))}
        {kind === 'field' && (
          <>
            <path
              className="equipment-field"
              d={`M34 ${166 - choice * 24} H296`}
            />
            {[0, 1, 2, 3, 4, 5, 6].map((item) => (
              <path
                className="equipment-tick"
                d={`M${46 + item * 39} 164 V${item % 2 ? 142 : 132}`}
                key={item}
              />
            ))}
          </>
        )}
      </svg>
    </div>
  );
}
export default function EquipmentScrollGuide({
  categorySlug,
  categoryLabel,
  categoryImage,
  departmentSlug,
  departmentLabel,
  productCount,
}: {
  categorySlug: string;
  categoryLabel: string;
  categoryImage: string;
  departmentSlug: string;
  departmentLabel: string;
  productCount: number;
}) {
  const guide = guideBySlug[categorySlug] ?? fieldGuide;
  const [choice, setChoice] = useState(1);
  const active = useMemo(() => guide.choices[choice], [guide, choice]);

  return (
    <>
      <section
        className={`category-object-hero equipment-object-hero equipment-object-hero--${guide.instrument}`}
        id={categorySlug}
        data-kit-category={categorySlug}
        data-sc-act="pin"
        data-sc-span="1.85"
        data-sc-dwell="0.18"
      >
        <div
          className="sc-stage equipment-hero-stage"
          data-sc-stage
          data-sc-spotlight
        >
          <figure
            className="equipment-hero-photo"
            aria-hidden="true"
            data-sc-parallax="-0.48"
          >
            <img src={categoryImage} alt="" fetchPriority="high" />
          </figure>
          <div
            className="equipment-hero-field"
            aria-hidden="true"
            data-sc-parallax="-0.16"
          >
            <svg viewBox="0 0 900 700" preserveAspectRatio="none">
              <path d="M-60 520 C170 350 310 610 540 430 S820 310 980 390" />
              <path d="M-80 600 C190 420 360 680 600 500 S850 390 980 470" />
            </svg>
          </div>
          <div
            className="equipment-hero-measure"
            aria-hidden="true"
            data-sc-parallax="0.42"
          >
            <span />
            <i />
            <b />
          </div>
          <div className="equipment-hero-shade" aria-hidden="true" />
          <div
            className="category-object-copy equipment-object-copy"
            data-sc-cue="0 0.82 0 0.22"
          >
            <a
              className="department-back-link"
              href={`/shop/${departmentSlug}`}
            >
              <ArrowLeft size={17} /> {departmentLabel}
            </a>
            <p className="micro">{guide.room}</p>
            <h1 data-sc-kinetic="lines">{categoryLabel.toUpperCase()}.</h1>
            <p>{guide.intro}</p>
            <div>
              <span>
                {productCount} {productCount === 1 ? 'product' : 'products'}{' '}
                listed
              </span>
              <a href="#category-decisions">
                Choose a starting point <ArrowUpRight size={18} />
              </a>
            </div>
          </div>
        </div>
      </section>

      <section
        className="equipment-decision-rail"
        id="category-decisions"
        data-sc-act="pan"
        data-sc-span="2.75"
      >
        <div className="sc-stage equipment-decision-stage" data-sc-stage>
          <div className="equipment-decision-track" data-sc-pan="0.05">
            <header>
              <p className="micro">THREE DECISIONS</p>
              <h2>
                READ THE
                <br />
                CATEGORY.
              </h2>
              <p>
                Start with what changes the shot or the round. Features only
                matter when they support that job.
              </p>
            </header>
            {guide.decisions.map((decision) => (
              <article key={decision.kicker}>
                <p className="micro">{decision.kicker}</p>
                <h3>{decision.title}</h3>
                <p>{decision.body}</p>
              </article>
            ))}
            <footer>
              <p className="micro">NEXT / YOUR FIT LINE</p>
              <p>{guide.question}</p>
              <a href="#fit-line">
                Set your priority <ArrowUpRight size={18} />
              </a>
            </footer>
          </div>
        </div>
      </section>

      <section className="equipment-lens" data-sc-act="flow">
        <div data-sc-in>
          <p className="micro">THE PRACTICAL LENS</p>
          <h2>{guide.lensTitle}</h2>
          <p>{guide.lensBody}</p>
        </div>
      </section>

      <section
        className={`equipment-fit-line equipment-fit-line--${guide.instrument}`}
        id="fit-line"
        data-sc-act="flow"
      >
        <header data-sc-in>
          <p className="micro">KARIBU FIT LINE</p>
          <h2>{guide.question.toUpperCase()}</h2>
          <p>
            Choose the description closest to your game. This is a useful place
            to begin, then confirm it with the actual product and your normal
            conditions.
          </p>
        </header>
        <div className="equipment-fit-workbench" data-sc-in>
          <div
            className="equipment-fit-controls"
            aria-label={`Choose a ${categoryLabel.toLowerCase()} priority`}
          >
            {guide.choices.map((item, index) => (
              <button
                type="button"
                aria-pressed={choice === index}
                onClick={() => setChoice(index)}
                key={item.label}
              >
                <span>{item.label}</span>
                <small>{item.title}</small>
              </button>
            ))}
          </div>
          <FitInstrument kind={guide.instrument} choice={choice} />
          <div className="equipment-fit-result" aria-live="polite">
            <p className="micro">{active.label.toUpperCase()}</p>
            <h3>{active.title}</h3>
            <p>{active.body}</p>
            <strong>{active.note}</strong>
            <a href="#products">
              See the Karibu collection <ArrowUpRight size={18} />
            </a>
          </div>
        </div>
        <p className="equipment-fit-note" data-sc-in>
          Starting point only. A fitting, product test or conversation with the
          Karibu team can confirm the final choice.
        </p>
      </section>
    </>
  );
}
