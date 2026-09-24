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
  drivers: { label: "Drivers", image: "/images/shop/categories-v2/drivers.webp" },
  woods: { label: "Fairway Woods", image: "/images/shop/categories-v2/woods.webp" },
  hybrids: { label: "Hybrids", image: "/images/shop/categories-v2/hybrids.webp" },
  golf_irons: { label: "Irons", image: "/images/shop/categories-v2/golf_irons.webp" },
  wedges: { label: "Wedges", image: "/images/shop/categories-v2/wedges.webp" },
  putters: { label: "Putters", image: "/images/shop/categories-v2/putters.webp" },
  mens_shoes: { label: "Men’s Shoes", image: "/images/shop/categories-v2/mens_shoes.webp" },
  womens_shoes: { label: "Women’s Shoes", image: "/images/shop/categories-v2/womens_shoes.webp" },
  mens_polos: { label: "Men’s Polos", image: "/images/shop/categories-v2/mens_polos.webp" },
  mens_pants: { label: "Men’s Trousers", image: "/images/shop/categories-v2/mens_pants.webp" },
  mens_jackets: { label: "Men’s Jackets", image: "/images/shop/categories-v2/mens_jackets.webp" },
  mens_shorts: { label: "Men’s Shorts", image: "/images/shop/categories-v2/mens_shorts.webp" },
  womens_polos: { label: "Women’s Polos", image: "/images/shop/categories-v2/womens_polos.webp" },
  womens_skirts: { label: "Women’s Skirts", image: "/images/shop/categories-v2/womens_skirts.webp" },
  womens_pants: { label: "Women’s Trousers", image: "/images/shop/categories-v2/womens_pants.webp" },
  womens_dresses: { label: "Women’s Dresses", image: "/images/shop/categories-v2/womens_dresses.webp" },
  womens_jackets: { label: "Women’s Jackets", image: "/images/shop/categories-v2/womens_jackets.webp" },
  womens_tops: { label: "Women’s Tops", image: "/images/shop/categories-v2/womens_tops.webp" },
  bags: { label: "Golf Bags", image: "/images/shop/categories-v2/bags.webp" },
  balls: { label: "Golf Balls", image: "/images/shop/categories-v2/balls.webp" },
  gloves: { label: "Gloves", image: "/images/shop/categories-v2/gloves.webp" },
  hats_and_caps: { label: "Hats & Caps", image: "/images/shop/categories-v2/hats_and_caps.webp" },
  grips: { label: "Grips", image: "/images/shop/categories-v2/grips.webp" },
  range_finders: { label: "Range Finders", image: "/images/shop/categories-v2/range_finders.webp" },
  accessories: { label: "Accessories", image: "/images/shop/categories-v2/accessories.webp" },
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
