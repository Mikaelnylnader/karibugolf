import Image from 'next/image';
import LessonsMotion from '@/components/lessons-motion';
import LessonChapters from '@/components/lesson-chapters';
export const booking = (lesson: string) =>
  'https://wa.me/254116416105?text=' +
  encodeURIComponent(
    "Hi Karibu Golf, I'm interested in " +
      lesson +
      ' with Mikael. What times and Nairobi locations are available?',
  );
export default function GolfLessons() {
  return (
    <main className="golf-lessons" id="page-content">
      <LessonsMotion>
        <a className="lessons-skip" href="#lessons">
          Skip coaching intro
        </a>
        <section
          className="lessons-hero"
          aria-labelledby="lessons-title"
          data-sc-act="pin"
          data-sc-span="2.05"
          data-lesson-scene="hero"
        >
          <div className="lessons-hero-stage" data-sc-stage>
            <div className="lessons-fairway">
              <Image
                unoptimized
                src="/images/fairway-aerial.jpg"
                alt="Sunlight falling across a golf fairway"
                width={2400}
                height={1599}
                priority
              />
            </div>
            <div className="lessons-light-plane" aria-hidden="true" />
            <svg
              className="lessons-swing-arc"
              viewBox="0 0 1440 900"
              fill="none"
              aria-hidden="true"
            >
              <path
                className="swing-arc-ground"
                d="M780 770 C670 620 770 210 1080 220 C1390 230 1390 620 1070 760"
              />
              <path
                className="swing-arc-draw"
                pathLength="1"
                d="M780 770 C670 620 770 210 1080 220 C1390 230 1390 620 1070 760"
              />
            </svg>
            <div className="lessons-hero-copy">
              <p className="lesson-kicker">PRIVATE GOLF COACHING · NAIROBI</p>
              <h1 id="lessons-title">
                <span>YOUR GAME.</span>
                <em>ONLY BETTER.</em>
              </h1>
              <p className="hero-lead">
                Improve your golf. Play with more confidence.
              </p>
              <p className="hero-description">
                Personal coaching with Mikael Nylander. For your first swing, a
                better short game, or a score you’re proud of.
              </p>
              <div className="lesson-actions">
                <a
                  className="lesson-button"
                  href={booking('a 30-minute Swing Assessment (KSh 2,500)')}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Book a swing assessment <span>KSh 2,500</span>
                </a>
                <a className="lesson-text-link" href="#lessons">
                  Explore the lessons
                </a>
              </div>
              <p className="hero-credibility">
                Professional playing experience.
                <br />
                Coaching across Sweden, Shanghai & Nairobi.
              </p>
            </div>
            <div className="lessons-hero-second" aria-hidden="true">
              <p className="lesson-kicker">IMPROVE YOUR GOLF.</p>
              <h2>
                <span>PLAY WITH MORE</span>
                <em>CONFIDENCE.</em>
              </h2>
              <p>Personal coaching with Mikael Nylander.</p>
            </div>
            <figure className="lessons-print">
              <Image
                unoptimized
                src="/images/founder/mikael-volvo-china-open-tee-off.webp"
                alt="Mikael Nylander playing a tee shot at Volvo China Open qualifying"
                width={1536}
                height={1024}
                priority
              />
              <div className="lessons-seal" aria-hidden="true">
                <Image
                  unoptimized
                  src="/images/karibu-badge.svg"
                  alt=""
                  width={80}
                  height={80}
                />
              </div>
              <figcaption>MIKAEL NYLANDER · GOLFER. COACH. FOUNDER.</figcaption>
            </figure>
            <p className="hero-bottom">
              A BETTER GAME STARTS WITH YOU.
              <span>BEGINNERS · JUNIORS · EXPERIENCED PLAYERS</span>
            </p>
          </div>
        </section>
        <LessonChapters />
      </LessonsMotion>
    </main>
  );
}
