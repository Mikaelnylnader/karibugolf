'use client';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
const goals = [
  {
    id: 'beginner',
    label: 'I’m new to golf',
    number: '01',
    title: 'A first swing. A proper start.',
    description:
      'Build a comfortable grip, a balanced setup and a repeatable swing. Learn the basics at your own pace, with clear advice you can take to the practice range.',
    focus: 'FOUNDATIONS · CONFIDENCE · COURSE ETIQUETTE',
    link: 'Start with an assessment',
    lesson: 'a beginner Swing Assessment (KSh 2,500)',
  },
  {
    id: 'improve',
    label: 'I want to improve',
    number: '02',
    title: 'Turn practice into progress.',
    description:
      'Find what is holding your game back. Work on ball striking, distance control or scoring, with a focused plan and practical drills between lessons.',
    focus: 'CONSISTENCY · SHORT GAME · LOWER SCORES',
    link: 'Explore the improvement package',
    lesson: 'the 4-Lesson Improvement Package (KSh 20,000)',
  },
  {
    id: 'junior',
    label: 'For a junior golfer',
    number: '03',
    title: 'Make their next swing a good one.',
    description:
      'Patient, encouraging coaching that makes learning enjoyable. Build sound fundamentals, good habits and confidence, with sessions shaped around your junior’s experience.',
    focus: 'FUNDAMENTALS · ENJOYMENT · GOOD HABITS',
    link: 'Ask about junior coaching',
    lesson: 'a Junior Lesson (KSh 3,500)',
  },
];
export default function LessonGoals() {
  return (
    <Tabs defaultValue="beginner" className="lesson-goals">
      <TabsList className="goal-tabs" aria-label="Your golf goals">
        {goals.map((goal) => (
          <TabsTrigger
            key={goal.id}
            value={goal.id}
            id={`lesson-goal-tab-${goal.id}`}
            aria-controls={`lesson-goal-panel-${goal.id}`}
          >
            {goal.label}
          </TabsTrigger>
        ))}
      </TabsList>
      {goals.map((goal) => (
        <TabsContent
          value={goal.id}
          key={goal.id}
          className="goal-panel"
          id={`lesson-goal-panel-${goal.id}`}
          aria-labelledby={`lesson-goal-tab-${goal.id}`}
        >
          <span className="goal-number" aria-hidden="true">
            {goal.number}
          </span>
          <div>
            <h3>{goal.title}</h3>
            <p>{goal.description}</p>
            <p className="goal-focus">{goal.focus}</p>
            <a
              className="lesson-text-link"
              href={
                goal.id === 'improve'
                  ? '#pricing'
                  : 'https://wa.me/254116416105?text=' +
                    encodeURIComponent(
                      "Hi Karibu Golf, I'm interested in " +
                        goal.lesson +
                        ' with Mikael. What times and Nairobi locations are available?',
                    )
              }
              target={goal.id === 'improve' ? undefined : '_blank'}
              rel={goal.id === 'improve' ? undefined : 'noopener noreferrer'}
            >
              {goal.link}
            </a>
          </div>
        </TabsContent>
      ))}
    </Tabs>
  );
}
