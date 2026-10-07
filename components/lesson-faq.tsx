'use client';
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '@/components/ui/accordion';
const questions = [
  [
    'Can I book if I’ve never played before?',
    'Yes. Private coaching is suitable for complete beginners. Tell Mikael about your experience when you book, and your session will start with the fundamentals.',
  ],
  [
    'Where do lessons take place?',
    'Lessons are arranged in Nairobi. Confirm the practice venue or course with Mikael on WhatsApp before booking; the location depends on your session and availability.',
  ],
  [
    'Do I need my own golf clubs?',
    'If you have clubs, bring them. If you’re starting out or need equipment, mention that when booking so suitable arrangements can be confirmed in advance.',
  ],
  [
    'What happens in the swing assessment?',
    'The 30-minute assessment looks at your current swing and what you want to improve. You’ll discuss the main priorities and the coaching option that makes sense for your game.',
  ],
  [
    'Are course fees included?',
    'The 9-hole playing lesson is KSh 12,000 plus course fees. Confirm any venue charges, range balls, equipment arrangements or other costs before your session.',
  ],
  [
    'How do I book and pay?',
    'Use a WhatsApp booking button to tell Mikael which lesson interests you. Agree on a date, time, venue and payment details directly before your booking is confirmed.',
  ],
  [
    'Can you coach two people or a company team?',
    'Yes. A two-person lesson is KSh 4,000 per person for 60 minutes. Corporate clinics start from KSh 30,000 for a 90-minute session with 6–10 players; the final quote depends on the group and arrangements.',
  ],
];
export default function LessonFaq() {
  return (
    <div>
      <Accordion multiple={false} className="lesson-faq-list">
        {questions.map(([question, answer], i) => (
          <AccordionItem
            key={question}
            value={'question-' + i}
            data-arrival
          >
            <AccordionTrigger>{question}</AccordionTrigger>
            <AccordionContent>
              <p>{answer}</p>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
      <noscript>
        <style>{'.lesson-faq-list{display:none}'}</style>
        <div className="faq-static">
          {questions.map(([question, answer]) => (
            <div key={question}>
              <h3>{question}</h3>
              <p>{answer}</p>
            </div>
          ))}
        </div>
      </noscript>
    </div>
  );
}
