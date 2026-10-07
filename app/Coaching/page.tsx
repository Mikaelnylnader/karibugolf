import type { Metadata } from 'next';
import GolfLessons from '@/components/golf-lessons';
import './coaching.css';

export const metadata: Metadata = {
  title: 'Golf Coaching in Nairobi | Karibu Golf',
  description:
    'Private golf coaching in Nairobi with Mikael Nylander. Explore swing assessments, private lessons, junior golf coaching and corporate golf clinics.',
  alternates: { canonical: 'https://karibugolf.com/Coaching/' },
  openGraph: {
    title: 'Golf Coaching in Nairobi | Karibu Golf',
    description:
      'Personal golf coaching for beginners, juniors and experienced players in Nairobi, Kenya.',
    url: 'https://karibugolf.com/Coaching/',
    type: 'website',
    images: ['https://karibugolf.com/images/fairway-aerial.jpg'],
  },
};

const coachingSchema = {
  '@context': 'https://schema.org',
  '@type': 'Service',
  name: 'Karibu Golf Coaching',
  description:
    'Private golf lessons, swing assessments, junior coaching and corporate golf clinics in Nairobi.',
  url: 'https://karibugolf.com/Coaching/',
  areaServed: { '@type': 'City', name: 'Nairobi' },
  provider: {
    '@type': 'Organization',
    name: 'Karibu Golf East Africa',
    url: 'https://karibugolf.com/',
  },
  offers: [
    { '@type': 'Offer', name: 'Swing Assessment', price: '2500', priceCurrency: 'KES' },
    { '@type': 'Offer', name: 'Private Golf Lesson', price: '6000', priceCurrency: 'KES' },
    { '@type': 'Offer', name: 'Four-Lesson Improvement Package', price: '20000', priceCurrency: 'KES' },
  ],
};

export default function CoachingPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(coachingSchema).replaceAll('<', '\\u003c') }}
      />
      <GolfLessons />
    </>
  );
}
