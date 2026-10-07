'use client';
import { useEffect, useRef, type ReactNode } from 'react';
export default function LessonsMotion({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    const pricing = root.querySelector<HTMLElement>('[data-pricing-cards]');
    const hero = root.querySelector<HTMLElement>('.lessons-hero');
    const scenes = Array.from(
      root.querySelectorAll<HTMLElement>('[data-lesson-scene]'),
    );
    const steps = Array.from(
      root.querySelectorAll<HTMLElement>('.assessment-steps li'),
    );
    const cards = pricing
      ? Array.from(pricing.querySelectorAll<HTMLElement>('[data-pricing-card]'))
      : [];
    const scrollWindow = window as typeof window & {
      ScrollCraft?: { mount: (element: HTMLElement) => { layout: () => void } };
    };
    let engine: { layout: () => void } | undefined;
    let alive = true;
    let frame = 0;
    const clamp = (n: number) => Math.max(0, Math.min(1, n));
    const update = () => {
      frame = 0;
      const off =
        reduced.matches ||
        innerWidth < 350 ||
        parseFloat(getComputedStyle(document.documentElement).fontSize) > 21;
      root.dataset.motion = off ? 'off' : 'on';
      if (hero) {
        const pinned =
          !off &&
          ((innerWidth >= 520 && innerHeight >= 560) ||
            (innerWidth < 520 && innerHeight >= 700));
        const travel = off
          ? 0
          : clamp(
              -hero.getBoundingClientRect().top /
                (pinned
                  ? Math.max(hero.offsetHeight - innerHeight, 1)
                  : Math.max(hero.offsetHeight * 0.72, innerHeight * 0.75)),
            );
        root.style.setProperty('--hero-travel', String(travel));
        root.style.setProperty('--hero-leave', String(clamp(travel * 2.8)));
        root.style.setProperty(
          '--hero-enter',
          String(clamp((travel - 0.27) * 2.4)),
        );
        root.style.setProperty(
          '--hero-inset',
          String(clamp((travel - 0.6) / 0.4)),
        );
        hero.dataset.heroState = travel > 0.46 ? 'second' : 'first';
        hero.dataset.scVerifyState = `hero-depth:${Math.round(travel * 1000)}`;
      }
      const headerHeight =
        document
          .querySelector<HTMLElement>('.persistent-nav')
          ?.getBoundingClientRect().height ?? 76;
      const spaciousPin = !off && innerWidth >= 1000 && innerHeight >= 720;
      const sceneStates = new Map<
        string,
        { journey: number; pinned: boolean }
      >();
      scenes.forEach((scene) => {
        if (scene === hero) return;
        const bounds = scene.getBoundingClientRect();
        const wantsPin = scene.hasAttribute('data-lesson-pin');
        const pricingPin = scene.dataset.lessonScene === 'pricing-rack';
        const pinned =
          wantsPin && spaciousPin && (!pricingPin || innerHeight >= 780);
        const focused = scene.contains(document.activeElement);
        const journey = off
          ? 1
          : focused
            ? 1
            : pinned
              ? clamp(
                  (headerHeight + innerHeight * 0.28 - bounds.top) /
                    Math.max(
                      scene.offsetHeight -
                        (innerHeight - headerHeight) +
                        innerHeight * 0.28,
                      1,
                    ),
                )
              : clamp(
                  (innerHeight * 0.82 - bounds.top) /
                    Math.max(scene.offsetHeight, innerHeight * 0.8),
                );
        const progress = off
          ? 1
          : pinned
            ? clamp(journey * 2.25)
            : clamp(
                (innerHeight * 0.9 - bounds.top) / (innerHeight * 0.72),
              );
        scene.style.setProperty('--scene-progress', progress.toFixed(4));
        scene.style.setProperty('--scene-journey', journey.toFixed(4));
        scene.dataset.lessonPinned = pinned ? 'true' : 'false';
        sceneStates.set(scene.dataset.lessonScene ?? '', { journey, pinned });
        scene.dataset.scVerifyState = `${scene.dataset.lessonScene}:${Math.round(progress * 1000)}:${Math.round(journey * 1000)}`;
        scene.dataset.scVerifyHold =
          progress === 1 && journey === 1 ? 'true' : 'false';
      });
      const assessmentState = sceneStates.get('assessment');
      steps.forEach((step) => {
        const index = steps.indexOf(step);
        const arrival =
          off || step.contains(document.activeElement)
            ? 1
            : assessmentState?.pinned
              ? clamp((assessmentState.journey - 0.16 - index * 0.18) / 0.22)
              : clamp(
                  (innerHeight * 0.9 - step.getBoundingClientRect().top) /
                    (innerHeight * 0.55),
                );
        step.style.setProperty('--step-progress', arrival.toFixed(4));
      });
      root.style.setProperty(
        '--page-progress',
        String(
          clamp(
            scrollY /
              Math.max(document.documentElement.scrollHeight - innerHeight, 1),
          ),
        ),
      );
      root.querySelectorAll<HTMLElement>('[data-arrival]').forEach((el) => {
        const arrival = off
          ? 1
          : clamp(
              (innerHeight * 0.94 - el.getBoundingClientRect().top) /
                (innerHeight * 0.65),
            );
        el.style.setProperty('--arrival', String(arrival));
      });
      if (pricing) {
        const pricingState = sceneStates.get('pricing-rack');
        // Layout coordinates stay unchanged by each card's own transform.
        // Reading transformed bounds here would feed the animation back into itself.
        const top = pricing.getBoundingClientRect().top;
        const grouped =
          cards.length > 1 &&
          Math.abs(cards[1].offsetTop - cards[0].offsetTop) < 4;
        const states: string[] = [];
        cards.forEach((card, index) => {
          const progress = pricingState?.pinned
            ? clamp((pricingState.journey - 0.08 - index * 0.16) / 0.3)
            : clamp(
                (innerHeight * 0.9 - (top + card.offsetTop)) /
                  (innerHeight * 0.71),
              );
          const staggered = pricingState?.pinned
            ? progress
            : grouped
              ? clamp((progress - index * 0.12) / 0.74)
              : progress;
          const arrival =
            off || card.contains(document.activeElement)
              ? 1
              : 1 - Math.pow(1 - staggered, 3);
          card.style.setProperty('--card-arrival', arrival.toFixed(4));
          card.style.setProperty(
            '--card-shift',
            pricingState?.pinned
              ? `${(1 - index) * Math.min(pricing.clientWidth * 0.29, 360)}px`
              : grouped
                ? `${(index - 1) * 36}px`
                : '0px',
          );
          card.style.setProperty(
            '--card-lift',
            `${pricingState?.pinned ? 85 + index * 24 : grouped ? 110 + index * 18 : 76}px`,
          );
          card.style.setProperty(
            '--card-turn',
            `${grouped ? (index - 1) * 4 : index % 2 ? 1.2 : -1.2}deg`,
          );
          states.push(String(Math.round(arrival * 1000)));
        });
        pricing.dataset.scVerifyState = `lesson-cards:${states.join('|')}`;
        pricing.dataset.scVerifyHold = states.every((state) => state === '1000')
          ? 'true'
          : 'false';
      }
    };
    const queue = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    const resize = () => {
      engine?.layout();
      queue();
    };
    const startEngine = () => {
      if (
        !alive ||
        !scrollWindow.ScrollCraft ||
        root.dataset.scrollcraftMounted
      )
        return;
      engine = scrollWindow.ScrollCraft.mount(root) as { layout: () => void };
      root.dataset.scrollcraftMounted = 'true';
      queue();
    };
    let script = document.querySelector<HTMLScriptElement>(
      'script[data-lessons-scrollcraft]',
    );
    if (scrollWindow.ScrollCraft) startEngine();
    else {
      if (!script) {
        script = document.createElement('script');
        script.src = '/scrollcraft/scrollcraft.js';
        script.dataset.lessonsScrollcraft = 'true';
        script.defer = true;
        document.body.appendChild(script);
      }
      script.addEventListener('load', startEngine, { once: true });
    }
    void document.fonts.ready
      .then(() => {
        if (alive) resize();
      })
      .catch(() => {});
    update();
    window.addEventListener('scroll', queue, { passive: true });
    window.addEventListener('resize', resize);
    root.addEventListener('focusin', queue);
    root.addEventListener('focusout', queue);
    reduced.addEventListener('change', queue);
    return () => {
      alive = false;
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', queue);
      window.removeEventListener('resize', resize);
      root.removeEventListener('focusin', queue);
      root.removeEventListener('focusout', queue);
      script?.removeEventListener('load', startEngine);
      reduced.removeEventListener('change', queue);
    };
  }, []);
  return (
    <div ref={ref} className="lessons-motion">
      {children}
    </div>
  );
}
