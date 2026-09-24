import seoArticles from "../../content/seo-articles-2026.json";

export type BlogPost = {
  slug: string;
  tag: string;
  title: string;
  intro: string;
  image: string;
  alt: string;
  author?: string;
  seoTitle?: string;
  metaDescription?: string;
  content?: string;
  sections?: [string, string][];
};

const articleImages: Record<string, string> = {
  "beginner-golf-nairobi": "/images/golf-moment.jpg",
  "cost-of-golf-kenya-budget": "/images/fairway-aerial.jpg",
  "first-golf-clubs-kenya": "/images/shop/categories-v2/golf_irons.webp",
  "best-golf-courses-kenya": "/images/hero.jpg",
  "golf-etiquette-dress-code-kenya": "/images/shop/categories-v2/mens_polos.webp",
};

const researchedPosts: BlogPost[] = seoArticles.map((article) => ({
  slug: article.slug,
  tag: article.category.toUpperCase(),
  title: article.title,
  intro: article.excerpt,
  image: articleImages[article.slug] ?? article.cover_image,
  alt: article.cover_alt,
  author: article.author,
  seoTitle: article.seo_title,
  metaDescription: article.meta_description,
  content: article.content,
}));

const legacyPosts: BlogPost[] = [
  {
    slug: "your-first-round",
    tag: "GETTING STARTED",
    title: "Your first round. Your own pace.",
    intro: "A few simple ways to feel more at home when you’re new to the game.",
    image: "/images/golf-moment.jpg",
    alt: "A golfer following through on a swing",
    sections: [
      ["Start with a conversation", "Before you visit, ask the course or club about visitor arrangements, dress expectations, equipment hire and suitable times for beginners. Every venue does things a little differently. Knowing what to expect leaves you free to enjoy the day."],
      ["Keep the first day simple", "You don’t need to know everything at once. A practice session or a shorter round can give you room to get comfortable. If you want instruction, ask the venue about a qualified golf professional who can help you start."],
      ["Think about the people around you", "Be ready when it’s your turn, give other players space and follow the venue’s safety guidance. If you’re unsure about pace or etiquette, ask your playing partners. A little consideration goes a long way."],
      ["Make it your game", "Your first round isn’t a test you have to pass. Notice what you enjoy, ask questions and give yourself time. If you need help exploring equipment or clothing, the Karibu team is a message away."],
    ],
  },
  {
    slug: "before-you-choose-your-gear",
    tag: "FINDING YOUR FIT",
    title: "Before you choose your gear.",
    intro: "Begin with how you play, what you need and what feels comfortable.",
    image: "/images/fairway-aerial.jpg",
    alt: "Sunlit golf fairway viewed from above",
    sections: [
      ["Start with your own needs", "Think about how often you expect to play, what you already have and which parts of your setup you want to change. A clear wish list makes it easier to separate useful additions from things you can leave for later."],
      ["Set a comfortable budget", "Tell the person helping you what you’d like to spend. You can build a setup gradually instead of trying to buy everything at once. Prioritise the essentials for the way you plan to play."],
      ["Ask about fit and feel", "For clubs, ask about the available specifications and whether you can try them or arrange a fitting. For clothing and footwear, check sizing and comfort, as well as the seller’s exchange arrangements before you decide."],
      ["Bring your questions", "You don’t need to arrive with a model number. Tell us what you’re looking for, what you already use and what you’d like to improve about your setup. We’ll help you explore the options, including special orders."],
    ],
  },
  {
    slug: "ready-for-a-day-on-the-course",
    tag: "ON THE COURSE",
    title: "A little preparation. A better golf day.",
    intro: "Give yourself more time for the part you came for: being out there.",
    image: "/images/hero.jpg",
    alt: "A golf course surrounded by trees at sunrise",
    sections: [
      ["Check the details", "Confirm your tee time, arrival instructions and any venue requirements. Look at the local forecast and leave enough time to arrive without rushing. If you’re visiting somewhere new, check where to meet or sign in."],
      ["Give your bag a quick look", "Check that you have the equipment and accessories you plan to use. A few minutes spent checking gloves, balls and the contents of your bag can prevent an avoidable distraction later."],
      ["Dress for the day", "Choose comfortable golf clothing and footwear that suit the venue and the expected conditions. Keep any extra layer or weather protection easy to reach rather than buried at the bottom of your bag."],
      ["Leave room to enjoy it", "A round is also a chance to spend time outside and in good company. Prepare the basics, then let the day be about the game. For questions about gear, essentials or delivery, contact Karibu Golf."],
    ],
  },
];

export const posts: BlogPost[] = [...researchedPosts, ...legacyPosts];
