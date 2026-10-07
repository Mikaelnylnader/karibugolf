import Image from 'next/image';
/* eslint-disable next/no-html-link-for-pages -- Native links keep the static export independent of an RSC prefetch server. */
import { Check, MapPin, MessageCircle } from 'lucide-react';
import LessonGoals from '@/components/lesson-goals';
import LessonFaq from '@/components/lesson-faq';
const booking = (lesson: string) =>
  'https://wa.me/254116416105?text=' +
  encodeURIComponent(
    "Hi Karibu Golf, I'm interested in " +
      lesson +
      ' with Mikael. What times and Nairobi locations are available?',
  );
const mainLessons = [
  {
    name: 'Swing Assessment',
    price: '2,500',
    duration: '30 MINUTES',
    label: 'YOUR FIRST STEP',
    description: 'Understand your swing and leave with a clear starting point.',
    features: [
      'A look at your current swing',
      'Your goals and improvement priorities',
      'Advice on your next coaching step',
    ],
    button: 'Book an assessment',
  },
  {
    name: 'Private Lesson',
    price: '6,000',
    duration: '50–60 MINUTES',
    label: 'ONE SESSION. YOUR GAME.',
    description:
      'Personal attention on the part of your game that needs it most.',
    features: [
      'One-to-one coaching with Mikael',
      'Focused practice and useful drills',
      'A clear direction for your next session',
    ],
    button: 'Book a private lesson',
  },
  {
    name: '4-Lesson Improvement Package',
    price: '20,000',
    duration: '4 FOCUSED SESSIONS',
    label: 'BEST VALUE',
    description: 'Build on each lesson. Make time for lasting improvement.',
    features: [
      'Four personalised coaching sessions',
      'A plan built around your goals',
      'Progression from one session to the next',
    ],
    button: 'Book the four-lesson package',
    featured: true,
  },
];
const moreLessons = [
  {
    title: 'Junior Lesson',
    duration: '45–50 minutes',
    description: 'An encouraging start and sound fundamentals.',
    price: 'KSh 3,500',
  },
  {
    title: 'Two-Person Lesson',
    duration: '60 minutes',
    description: 'Learn together, with individual attention.',
    price: 'KSh 4,000',
    extra: 'per person',
  },
  {
    title: 'Short Game & Scoring',
    duration: '90 minutes',
    description: 'Chipping, pitching, putting and better decisions.',
    price: 'KSh 8,500',
  },
  {
    title: '9-Hole Playing Lesson',
    duration: '9 holes',
    description: 'Take your practice onto the course.',
    price: 'KSh 12,000',
    extra: 'plus course fees',
  },
];
export default function LessonChapters() {
  return (
    <>
      <section
        id="lessons"
        className="lesson-section light-section goals-section"
        data-sc-act="flow"
        data-lesson-scene="goals"
        data-scroll-device="kinetic"
      >
        <div className="section-heading">
          <div>
            <p className="lesson-kicker">
              COACHING THAT MEETS YOU WHERE YOU ARE
            </p>
            <h2>
              <span data-sc-kinetic="lines" data-sc-cue="0.04 1 0.22 0.02">
                YOUR NEXT
              </span>
              <em data-sc-kinetic="lines" data-sc-cue="0.08 1 0.22 0.02">
                GOOD SHOT.
              </em>
            </h2>
          </div>
          <p>
            You don’t need the perfect swing to get started. Just a goal, a
            little curiosity, and coaching that makes sense to you.
          </p>
        </div>
        <LessonGoals />
      </section>
      <section
        id="coach"
        className="lesson-section coach-section"
        data-sc-act="pin"
        data-lesson-scene="coach"
        data-lesson-pin
        data-scroll-device="photographic-reveal"
      >
        <div className="lesson-stage coach-stage">
          <div className="coach-copy">
          <p className="lesson-kicker">MEET YOUR COACH · MIKAEL NYLANDER</p>
          <h2>
            A LIFE
            <br />
            IN <em>THE GAME.</em>
          </h2>
          <p className="coach-lead">
            Playing experience. A coach’s eye.
            <br />A practical way forward.
          </p>
          <p>
            Mikael brings professional playing experience and international
            coaching across Sweden, Shanghai and Nairobi to every lesson.
          </p>
          <p>
            The aim is simple: understand the player, make the advice clear, and
            work on changes you can use when you play. Whether you’re starting
            out or finding your next level, the lesson starts with your game.
          </p>
          <div className="coach-signoff">
            <span>SWEDEN · SHANGHAI · NAIROBI</span>
            <a
              className="lesson-text-link"
              href={booking('private golf coaching')}
              target="_blank"
              rel="noopener noreferrer"
            >
              Talk to Mikael
            </a>
          </div>
          </div>
          <figure
            className="coach-photograph"
            data-sc-reveal="left"
            data-sc-reveal-at="0.04 0.36"
          >
            <div className="coach-image-window">
              <Image
                unoptimized
                src="/images/founder/mikael-volvo-china-open-walking.webp"
                alt="Mikael Nylander walking the course at Volvo China Open qualifying"
                width={1536}
                height={1024}
              />
            </div>
            <figcaption>
              A lifetime on the course.
              <span>Mikael Nylander at Volvo China Open qualifying.</span>
            </figcaption>
          </figure>
        </div>
      </section>
      <section
        id="assessment"
        className="lesson-section assessment-section"
        data-sc-act="pin"
        data-lesson-scene="assessment"
        data-lesson-pin
        data-scroll-device="drawn-path"
      >
        <div className="lesson-stage assessment-stage">
          <div>
          <p className="lesson-kicker">START HERE · 30 MINUTES</p>
          <h2>
            LET’S FIND
            <br />
            <em>YOUR START.</em>
          </h2>
          <p>
            Before you commit to a programme, take a closer look at your game. A
            swing assessment is the easiest way to meet Mikael, identify your
            priorities and choose a useful next step.
          </p>
          <a
            className="lesson-button dark-button"
            href={booking('a 30-minute Swing Assessment (KSh 2,500)')}
            target="_blank"
            rel="noopener noreferrer"
          >
            Book your swing assessment
          </a>
          </div>
          <div className="assessment-price">
          <span>KSh</span>
          <strong>2,500</strong>
          <p>
            One conversation.
            <br />A clearer direction.
          </p>
          </div>
          <div className="assessment-path" aria-hidden="true">
          <svg viewBox="0 0 1000 100" fill="none" preserveAspectRatio="none">
            <path
              className="assessment-path-ground"
              d="M20 76 C160 76 180 24 350 24 S620 76 680 76 S880 24 980 24"
            />
            <path
              className="assessment-path-draw"
              pathLength="1"
              d="M20 76 C160 76 180 24 350 24 S620 76 680 76 S880 24 980 24"
            />
          </svg>
          </div>
          <ol className="assessment-steps">
          <li>
            <span>01</span>
            <div>
              <h3>Bring your game.</h3>
              <p>Tell us what you want to improve.</p>
            </div>
          </li>
          <li>
            <span>02</span>
            <div>
              <h3>Find your focus.</h3>
              <p>Look at your swing and the key priorities.</p>
            </div>
          </li>
          <li>
            <span>03</span>
            <div>
              <h3>Take the next step.</h3>
              <p>Choose the coaching that suits you.</p>
            </div>
          </li>
          </ol>
        </div>
      </section>
      <section
        id="pricing"
        className="lesson-section pricing-section"
        data-sc-act="flow"
        data-lesson-scene="pricing-more"
        data-scroll-device="card-rack"
      >
        <div
          className="pricing-scroll"
          data-lesson-scene="pricing-rack"
          data-lesson-pin
        >
          <div className="lesson-stage pricing-stage">
            <div className="section-heading">
          <div>
            <p className="lesson-kicker">THE LESSONS · CLEAR PRICING IN KSh</p>
            <h2>
              MAKE IT
              <br />
              <em>YOUR GAME.</em>
            </h2>
          </div>
          <p>
            Try an assessment, focus on one lesson, or make a plan for steady
            progress. Choose your session and arrange it directly with Mikael.
          </p>
            </div>
            <div className="lesson-price-grid" data-pricing-cards>
          {mainLessons.map((lesson) => (
            <article
              className={
                'lesson-price-card' +
                (lesson.featured ? ' featured-lesson' : '')
              }
              key={lesson.name}
              data-pricing-card
            >
              <div className="price-card-top">
                <span>{lesson.label}</span>
                <span>{lesson.duration}</span>
              </div>
              <p className="lesson-price">
                <span>KSh</span>
                {lesson.price}
              </p>
              <h3>{lesson.name}</h3>
              <p className="price-description">{lesson.description}</p>
              <ul>
                {lesson.features.map((feature) => (
                  <li key={feature}>
                    <Check size={17} aria-hidden="true" />
                    {feature}
                  </li>
                ))}
              </ul>
              <a
                className="lesson-button"
                href={booking(lesson.name + ' (KSh ' + lesson.price + ')')}
                target="_blank"
                rel="noopener noreferrer"
              >
                {lesson.button}
              </a>
            </article>
          ))}
            </div>
          </div>
        </div>
        <div className="more-lessons-heading">
          <h3>More ways to work on your game.</h3>
          <p>For junior golfers, practice partners and better scoring.</p>
        </div>
        <div className="more-lessons">
          {moreLessons.map((lesson) => (
            <article key={lesson.title} data-sc-in>
              <div>
                <h3>{lesson.title}</h3>
                <p>{lesson.description}</p>
              </div>
              <span className="lesson-duration">{lesson.duration}</span>
              <div className="lesson-row-price">
                <strong>{lesson.price}</strong>
                {lesson.extra && <span>{lesson.extra}</span>}
              </div>
              <a
                className="lesson-text-link"
                href={booking(
                  lesson.title +
                    ' (' +
                    lesson.price +
                    (lesson.extra ? ' ' + lesson.extra : '') +
                    ')',
                )}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={'Book ' + lesson.title + ' on WhatsApp'}
              >
                Book on WhatsApp
              </a>
            </article>
          ))}
        </div>
        <p className="pricing-note">
          <MapPin size={17} aria-hidden="true" />
          Sessions are arranged in Nairobi. Confirm the venue, availability and
          any venue or equipment costs when you book.
        </p>
      </section>
      <section
        id="corporate"
        className="lesson-section corporate-section"
        data-sc-act="pin"
        data-lesson-scene="corporate"
        data-lesson-pin
        data-scroll-device="split-intertitle"
      >
        <div className="lesson-stage corporate-stage">
          <div className="corporate-title">
          <p className="lesson-kicker">CORPORATE GOLF EXPERIENCES</p>
          <h2>
            <span>GOOD GOLF.</span>
            <em>GREAT COMPANY.</em>
          </h2>
          </div>
          <div className="corporate-copy">
          <p className="corporate-lead">
            Get your team out of the office.
            <br />
            Bring them into the game.
          </p>
          <p>
            Beginner-friendly clinics for company teams, client entertainment,
            tournament preparation and corporate events. A welcoming
            introduction, with practical coaching for everyone.
          </p>
          <dl className="corporate-facts">
            <div>
              <dt>THE GROUP</dt>
              <dd>6–10 players</dd>
            </div>
            <div>
              <dt>THE SESSION</dt>
              <dd>90 minutes</dd>
            </div>
          </dl>
          <p className="corporate-price">
            <span>From</span> KSh 30,000
          </p>
          <p className="corporate-note">
            Final pricing depends on group size, venue, equipment and travel.
          </p>
          <a
            className="lesson-button dark-button"
            href={booking(
              'a Corporate Golf Clinic (from KSh 30,000) for our team',
            )}
            target="_blank"
            rel="noopener noreferrer"
          >
            Request a corporate clinic
          </a>
          </div>
        </div>
      </section>
      <aside
        className="equipment-section"
        data-sc-act="flow"
        data-lesson-scene="equipment"
        data-scroll-device="lateral-reveal"
      >
        <span className="lesson-kicker">COACHING + EQUIPMENT ADVICE</span>
        <div>
          <h3>
            Your swing. Your clubs.
            <br />
            An honest conversation.
          </h3>
          <p>
            Not sure whether the problem is your swing or your equipment? We’ll
            help you understand what actually needs changing before you spend
            money on new clubs.
          </p>
          <a className="lesson-text-link" href="/shop/">
            Explore the Karibu Golf shop
          </a>
        </div>
      </aside>
      <section
        id="questions"
        className="lesson-section faq-section"
        data-sc-act="flow"
        data-lesson-scene="questions"
        data-scroll-device="staggered-list"
      >
        <div>
          <p className="lesson-kicker">BEFORE YOUR FIRST SESSION</p>
          <h2>
            A FEW THINGS
            <br />
            <em>TO KNOW.</em>
          </h2>
          <p>Got a different question? Ask Mikael directly.</p>
          <a
            className="lesson-text-link"
            href={booking('learning more about golf coaching')}
            target="_blank"
            rel="noopener noreferrer"
          >
            Ask on WhatsApp
          </a>
        </div>
        <div data-sc-in>
          <LessonFaq />
        </div>
      </section>
      <section
        id="book"
        className="lesson-section booking-section"
        data-sc-act="pin"
        data-lesson-scene="book"
        data-lesson-pin
        data-scroll-device="resolved-close"
      >
        <div className="lesson-stage booking-stage">
          <div className="booking-ring" aria-hidden="true" />
          <p className="lesson-kicker">YOUR NEXT ROUND STARTS HERE</p>
          <h2>
            LET’S PLAY
            <br />
            <em>BETTER GOLF.</em>
          </h2>
          <div className="booking-bottom">
            <p>
              Tell Mikael a little about your game.
              <br />
              We’ll find a good place to start.
            </p>
            <a
              className="lesson-button"
              href={booking('booking a golf lesson')}
              target="_blank"
              rel="noopener noreferrer"
            >
              <MessageCircle size={20} aria-hidden="true" />
              Book on WhatsApp
            </a>
          </div>
          <p className="booking-detail">
            PRIVATE COACHING · JUNIOR GOLF · CORPORATE CLINICS
            <br />
            NAIROBI, KENYA
          </p>
        </div>
      </section>
    </>
  );
}
