'use client';
/* oxlint-disable next/no-img-element, next/no-html-link-for-pages -- Existing local catalogue imagery and static-export routes use authored paths. */

import { type CSSProperties, useState } from 'react';
import { ArrowLeft, ArrowUpRight } from 'lucide-react';

type StrokeKey = 'straight' | 'slight' | 'strong';

const shapes = [
  {
    key: 'blade',
    index: '01',
    title: 'Blade',
    image: '/images/products/scotty-cameron-studio-style-newport-hero.png',
    text: 'A compact, traditional head with a clean topline. Blades reward golfers who like a precise look, clear face awareness and a head that can release naturally through an arcing stroke.',
    note: 'Compact address view · neck controls toe flow',
  },
  {
    key: 'wide',
    index: '02',
    title: 'Wide blade',
    image: '/images/products/scotty-cameron-studio-style-newport-plus-hero.png',
    text: 'A wider footprint bridges blade and mallet. It keeps familiar blade proportions while creating more room to move weight outward for stability and a calmer view behind the ball.',
    note: 'Traditional shape · added footprint',
  },
  {
    key: 'mallet',
    index: '03',
    title: 'Mallet',
    image: '/images/products/lab-golf-oz1-custom-putter-black-address.png',
    text: 'A larger head makes alignment features easier to see and gives designers more freedom to place mass away from the centre. That can improve stability when impact misses the exact middle.',
    note: 'Visible alignment · high stability potential',
  },
  {
    key: 'zero-torque',
    index: '04',
    title: 'Zero torque',
    image: '/images/products/lab-golf-df3-custom-putter-black-address.png',
    text: "A shaft-axis and centre-of-gravity concept designed to reduce the head's tendency to twist during the stroke. The feel and setup are distinctive, so testing the actual build matters.",
    note: 'Low rotational torque · fit the setup',
  },
];

const strokes: Record<
  StrokeKey,
  {
    label: string;
    title: string;
    path: string;
    rotate: number;
    summary: string;
    start: string;
  }
> = {
  straight: {
    label: 'Straighter',
    title: 'Low face rotation',
    path: 'M28 164 C104 164 216 164 292 164',
    rotate: 0,
    summary:
      'A face-balanced or very low toe-flow build is a practical starting point when the face stays quiet and the path feels straighter.',
    start:
      'Start with a face-balanced mallet, centre-shafted design or a fitted zero-torque model.',
  },
  slight: {
    label: 'Slight arc',
    title: 'Natural release',
    path: 'M28 178 C104 132 216 132 292 178',
    rotate: -6,
    summary:
      'Many golfers create a modest arc. A plumbing neck or another medium toe-flow build can support that natural opening and closing without forcing it.',
    start:
      'Start with a blade, wide blade or mallet built for slight arc. Let aim and feel decide the head shape.',
  },
  strong: {
    label: 'Stronger arc',
    title: 'More toe flow',
    path: 'M28 198 C100 82 220 82 292 198',
    rotate: -13,
    summary:
      'A stronger arc usually needs more freedom for the toe to release. Hosel position and toe hang matter more here than the simple blade-or-mallet label.',
    start:
      'Start with a heel-shafted or flow-neck option, then confirm start line, speed and comfort in a fitting.',
  },
};

function TourMarkers({
  kind,
  count,
}: {
  kind: 'blade' | 'mallet';
  count: number;
}) {
  return (
    <div
      className={`putter-tour-markers putter-tour-markers--${kind}`}
      aria-hidden="true"
    >
      {Array.from({ length: count }, (_, index) => (
        <span key={index} style={{ '--marker-i': index } as CSSProperties} />
      ))}
    </div>
  );
}
export default function PutterScrollGuide({
  productCount,
}: {
  productCount: number;
}) {
  const [stroke, setStroke] = useState<StrokeKey>('slight');
  const activeStroke = strokes[stroke];

  return (
    <>
      <section
        className="category-object-hero putter-object-hero"
        id="putters"
        data-kit-category="putters"
        data-sc-act="pin"
        data-sc-span="2.2"
        data-sc-dwell="0.24"
      >
        <div
          className="sc-stage putter-hero-stage"
          data-sc-stage
          data-sc-spotlight
        >
          <figure
            className="putter-hero-green"
            aria-hidden="true"
            data-sc-parallax="-0.58"
          >
            <img
              src="/images/shop/categories-v2/putters.webp"
              alt=""
              fetchPriority="high"
            />
          </figure>
          <div
            className="putter-hero-contours"
            aria-hidden="true"
            data-sc-parallax="-0.2"
          >
            <svg viewBox="0 0 900 700" preserveAspectRatio="none">
              <path d="M-40 530 C180 420 280 610 520 470 S820 300 960 420" />
              <path d="M-60 590 C170 470 330 660 560 510 S840 360 980 470" />
              <path d="M-30 650 C230 520 360 720 620 560 S860 430 980 540" />
            </svg>
          </div>
          <figure
            className="putter-hero-head"
            aria-hidden="true"
            data-sc-parallax="0.34"
          >
            <img
              src="/images/products/scotty-cameron-studio-style-newport-hero.png"
              alt=""
              fetchPriority="high"
            />
          </figure>
          <div
            className="putter-hero-line"
            aria-hidden="true"
            data-sc-parallax="0.58"
          >
            <span />
            <i />
          </div>
          <div className="putter-hero-shade" aria-hidden="true" />

          <div
            className="category-object-copy putter-object-copy"
            data-sc-cue="0 0.83 0 0.22"
          >
            <a className="department-back-link" href="/shop/clubs">
              <ArrowLeft size={17} /> Clubs
            </a>
            <p className="micro">THE PUTTING ROOM</p>
            <h1 data-sc-kinetic="lines">PUTTERS.</h1>
            <p>
              Choose the head you can aim, the balance your stroke can return,
              and the feel that controls your distance.
            </p>
            <div>
              <span>{productCount} putters listed</span>
              <a href="#putter-shapes">
                Find your shape <ArrowUpRight size={18} />
              </a>
            </div>
          </div>
        </div>
      </section>

      <section
        className="putter-shape-spectrum"
        id="putter-shapes"
        data-sc-act="pan"
        data-sc-span="3.5"
      >
        <div className="sc-stage putter-spectrum-stage" data-sc-stage>
          <div className="putter-shape-rail" data-sc-pan="0.05">
            <header className="putter-shape-intro">
              <p className="micro">HEAD SHAPE / 01</p>
              <h2>
                FOUR WAYS
                <br />
                TO FRAME
                <br />
                THE LINE.
              </h2>
              <p>
                Head shape changes what you see at address and what the designer
                can do with mass. It is the beginning of a fit, not the whole
                answer.
              </p>
            </header>
            {shapes.map((shape) => (
              <article
                className={`putter-shape-card putter-shape-card--${shape.key}`}
                key={shape.key}
              >
                <figure>
                  <img
                    src={shape.image}
                    alt={`${shape.title} putter example`}
                    loading="lazy"
                  />
                </figure>
                <div>
                  <p className="micro">
                    {shape.index} / {shape.note}
                  </p>
                  <h3>{shape.title}</h3>
                  <p>{shape.text}</p>
                </div>
              </article>
            ))}
            <footer className="putter-shape-outro">
              <p className="micro">FIT THE WHOLE BUILD</p>
              <p>
                Neck, shaft axis, toe flow, length, lie, loft, grip and
                alignment all change how a putter behaves for you.
              </p>
              <a href="#stroke-fit">
                Match a starting point <ArrowUpRight size={18} />
              </a>
            </footer>
          </div>
        </div>
      </section>

      <section className="putter-tour-question" data-sc-act="flow">
        <div data-sc-in>
          <p className="micro">THE TOUR QUESTION</p>
          <h2>
            WHAT IS USED
            <br />
            MOST ON TOUR?
          </h2>
          <p>
            Right now, the clearest answer is mallets. The useful question is
            why.
          </p>
        </div>
      </section>

      <section
        className="putter-tour-balance"
        data-sc-act="pin"
        data-sc-span="3.1"
        data-sc-dwell="0.34"
      >
        <div className="sc-stage putter-tour-stage" data-sc-stage>
          <div className="putter-tour-heading" data-sc-cue="0 0.34 0 0.26">
            <p className="micro">2025 PGA TOUR WINNERS</p>
            <h2>
              THE BAG
              <br />
              TIPPED.
            </h2>
            <p>
              Across 46 events and 47 winners, PGA TOUR reported 35 wins with
              mallets and 12 with blades.
            </p>
          </div>

          <div
            className="putter-tour-board"
            aria-label="2025 PGA TOUR winners by putter shape: 35 mallet and 12 blade"
          >
            <div className="putter-tour-side putter-tour-side--mallet">
              <div>
                <span>35</span>
                <strong>Mallet winners</strong>
              </div>
              <TourMarkers kind="mallet" count={35} />
            </div>
            <div className="putter-tour-divider" aria-hidden="true">
              <span />
            </div>
            <div className="putter-tour-side putter-tour-side--blade">
              <div>
                <span>12</span>
                <strong>Blade winners</strong>
              </div>
              <TourMarkers kind="blade" count={12} />
            </div>
          </div>

          <div
            className="putter-tour-reading"
            data-sc-cue="0.52 0.96 0.25 0.14"
          >
            <p>
              Mallets give designers a larger footprint for alignment and more
              room to push weight away from the centre. Tour players cited
              alignment, setup consistency, launch and speed control. Blades
              still win, and a fitted blade remains the right tool for many
              strokes.
            </p>
            <p>
              At the end of 2025, all ten players at the top of the Official
              World Golf Ranking were using mallets. That is a Tour trend, not a
              fitting rule.
            </p>
            <a href="https://www.pgatour.com/article/news/equipment-report/2025/11/25/why-pros-are-switching-to-mallet-putters-scottie-scheffler-tommy-fleetwood-ben-griffin-taylormade-spider-scotty-cameron-odyssey-lab">
              Source: PGA TOUR Equipment Report, 25 Nov 2025{' '}
              <ArrowUpRight size={15} />
            </a>
          </div>
        </div>
      </section>

      <section className="putter-stroke-fit" id="stroke-fit" data-sc-act="flow">
        <header data-sc-in>
          <p className="micro">STROKE / STARTING POINT</p>
          <h2>
            FIT THE
            <br />
            ROTATION.
          </h2>
          <p>
            Your head shape should make aiming comfortable. Your neck and
            balance should make returning the face feel natural. Choose the path
            closest to your stroke to see where to begin.
          </p>
        </header>
        <div className="putter-fit-workbench" data-sc-in>
          <div
            className="putter-fit-controls"
            aria-label="Select a putting stroke shape"
          >
            {(Object.keys(strokes) as StrokeKey[]).map((key) => (
              <button
                type="button"
                aria-pressed={stroke === key}
                onClick={() => setStroke(key)}
                key={key}
              >
                <span>{strokes[key].label}</span>
                <small>{strokes[key].title}</small>
              </button>
            ))}
          </div>
          <div className="putter-fit-visual" aria-hidden="true">
            <svg viewBox="0 0 320 230">
              <path className="putter-fit-grid" d="M20 164 H300 M160 28 V210" />
              <path className="putter-fit-path" d={activeStroke.path} />
              <circle cx="160" cy="164" r="9" />
              <g
                className="putter-fit-head"
                style={
                  {
                    '--fit-rotate': `${activeStroke.rotate}deg`,
                  } as CSSProperties
                }
              >
                <rect x="117" y="150" width="86" height="22" rx="4" />
                <path d="M160 150 V101" />
              </g>
            </svg>
            <span>Start line</span>
          </div>
          <div className="putter-fit-result" aria-live="polite">
            <p className="micro">
              {activeStroke.label.toUpperCase()} /{' '}
              {activeStroke.title.toUpperCase()}
            </p>
            <h3>{activeStroke.summary}</h3>
            <p>{activeStroke.start}</p>
            <a href="#products">
              See the Karibu collection <ArrowUpRight size={18} />
            </a>
          </div>
        </div>
        <footer data-sc-in>
          <p>
            These are starting points, not diagnoses. PING&apos;s current
            fitting system likewise separates straight, slight-arc and
            strong-arc stroke types, with different hosels and head shapes
            across each group.
          </p>
          <a href="https://eu.ping.com/en-gb/discover-ping/news/new-scottsdale-putters-offer-feel-forgiveness-custom-fitting">
            Read the fitting reference <ArrowUpRight size={15} />
          </a>
        </footer>
      </section>
    </>
  );
}
