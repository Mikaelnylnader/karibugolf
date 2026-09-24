import catalogData from "@/lib/catalog.generated.json";

export type CatalogProduct = {
  sku: string;
  slug: string;
  name: string;
  categorySlug: string;
  categoryLabel: string;
  description: string;
  priceKes: number;
  priceUsd: number;
  priceCny: number;
  sizes: string;
  colors: string;
  status: string;
  stock: string;
  featured: boolean;
  images: string[];
};

export type ShopCategory = {
  slug: string;
  label: string;
  description: string;
  image: string;
};

export type Department = {
  slug: string;
  label: string;
  eyebrow: string;
  description: string;
  image: string;
  categories: ShopCategory[];
};

const categoryDetails: Record<string, Pick<ShopCategory, "label" | "image">> = {
  drivers: { label: "Drivers", image: "/images/clubs.jpg" },
  woods: { label: "Fairway Woods", image: "/images/clubs.jpg" },
  hybrids: { label: "Hybrids", image: "/images/clubs.jpg" },
  golf_irons: { label: "Irons", image: "/images/categories/cat_golf_irons.jpg" },
  wedges: { label: "Wedges", image: "/images/categories/cat_wedges.jpg" },
  putters: { label: "Putters", image: "/images/categories/cat_putters.jpg" },
  mens_shoes: { label: "Men’s Shoes", image: "/images/categories/cat_mens_shoes.jpg" },
  womens_shoes: { label: "Women’s Shoes", image: "/images/categories/cat_mens_shoes.jpg" },
  mens_polos: { label: "Men’s Polos", image: "/images/apparel.jpg" },
  mens_pants: { label: "Men’s Trousers", image: "/images/apparel.jpg" },
  mens_jackets: { label: "Men’s Jackets", image: "/images/categories/cat_mens_jackets.jpg" },
  mens_shorts: { label: "Men’s Shorts", image: "/images/apparel.jpg" },
  womens_polos: { label: "Women’s Polos", image: "/images/apparel.jpg" },
  womens_skirts: { label: "Women’s Skirts", image: "/images/apparel.jpg" },
  womens_pants: { label: "Women’s Trousers", image: "/images/apparel.jpg" },
  womens_dresses: { label: "Women’s Dresses", image: "/images/apparel.jpg" },
  womens_jackets: { label: "Women’s Jackets", image: "/images/apparel.jpg" },
  womens_tops: { label: "Women’s Tops", image: "/images/apparel.jpg" },
  bags: { label: "Golf Bags", image: "/images/categories/cat_bags.jpg" },
  balls: { label: "Golf Balls", image: "/images/categories/cat_balls.jpg" },
  gloves: { label: "Gloves", image: "/images/categories/cat_gloves.jpg" },
  hats_and_caps: { label: "Hats & Caps", image: "/images/categories/cat_hats_and_caps.jpg" },
  grips: { label: "Grips", image: "/images/categories/cat_grips.jpg" },
  range_finders: { label: "Range Finders", image: "/images/categories/cat_range_finders.jpg" },
  accessories: { label: "Accessories", image: "/images/categories/cat_accessories.jpg" },
};

const categorySource = new Map(catalogData.categories.map((category) => [category.slug, category]));
const category = (slug: string): ShopCategory => {
  const source = categorySource.get(slug);
  const detail = categoryDetails[slug];
  return {
    slug,
    label: detail?.label ?? source?.label ?? slug,
    description: source?.description ?? "Explore this part of the Karibu Golf collection.",
    image: detail?.image ?? "/images/clubs.jpg",
  };
};

const department = (
  slug: string,
  label: string,
  eyebrow: string,
  description: string,
  image: string,
  categorySlugs: string[],
): Department => ({ slug, label, eyebrow, description, image, categories: categorySlugs.map(category) });

export const departments: Department[] = [
  department("clubs", "Clubs", "BUILD YOUR SET", "From the tee to the green, browse every club family in one place.", "/images/shop/clubs-v2.webp", ["drivers", "woods", "hybrids", "golf_irons", "wedges", "putters"]),
  department("shoes", "Shoes", "WALK THE COURSE", "Golf footwear selected for grip, comfort and long days on the course.", "/images/shop/shoes-v2.webp", ["mens_shoes", "womens_shoes"]),
  department("apparel", "Apparel", "WEAR YOUR GAME", "Performance layers and everyday golf style for women and men.", "/images/shop/apparel-v2.webp", ["mens_polos", "mens_pants", "mens_jackets", "mens_shorts", "womens_polos", "womens_skirts", "womens_pants", "womens_dresses", "womens_jackets", "womens_tops"]),
  department("bags", "Bags", "CARRY IT WELL", "Stand bags, travel bags and practical storage for every golf day.", "/images/shop/bags-v2.webp", ["bags"]),
  department("balls", "Balls", "PLAY YOUR BALL", "Golf balls for feel, control, distance and dependable performance.", "/images/shop/balls-v2.webp", ["balls"]),
  department("accessories", "Accessories", "ROUND ESSENTIALS", "Gloves, grips, hats, range finders and the details that complete your setup.", "/images/shop/accessories-v2.webp", ["gloves", "hats_and_caps", "grips", "range_finders", "accessories"]),
];

export const products = catalogData.products as CatalogProduct[];
export const departmentBySlug = (slug: string) => departments.find((item) => item.slug === slug);
export const categoryBySlug = (slug: string) => departments.flatMap((item) => item.categories).find((item) => item.slug === slug);
export const departmentForCategory = (slug: string) => departments.find((item) => item.categories.some((categoryItem) => categoryItem.slug === slug));
export const productsForCategory = (slug: string) => products.filter((product) => product.categorySlug === slug);
export const productsForDepartment = (slug: string) => {
  const selected = departmentBySlug(slug);
  const slugs = new Set(selected?.categories.map((item) => item.slug) ?? []);
  return products.filter((product) => slugs.has(product.categorySlug));
};
export const productBySlug = (slug: string) => products.find((product) => product.slug === slug);
export const formatKes = (value: number) => `KSh ${Math.round(value).toLocaleString("en-KE")}`;
