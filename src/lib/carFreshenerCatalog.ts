import {
  fetchShopifyProducts,
  fetchShopifyProductByHandle,
  type ShopifyProduct,
} from "@/lib/shopify";
import { CAR_FRESHENERS, type CarFreshener } from "@/data/carFresheners";

export interface CarFreshenerListItem {
  /** Route handle used in URL — Shopify handle if present, else local id */
  handle: string;
  name: string;
  tagline: string;
  notes: string[];
  price: number;
  currency: string;
  accentHsl: string;
  image: string;
  images: string[];
  /** Present only when backed by a real Shopify product */
  shopify?: ShopifyProduct;
  variantId?: string;
}

function fromPlaceholder(item: CarFreshener): CarFreshenerListItem {
  return {
    handle: item.id,
    name: item.name,
    tagline: item.tagline,
    notes: item.notes,
    price: item.price,
    currency: "INR",
    accentHsl: item.accentHsl,
    image: item.image,
    images: item.images ?? [item.image],
  };
}

function fromShopify(p: ShopifyProduct): CarFreshenerListItem {
  const local = CAR_FRESHENERS.find((f) => f.id === p.node.handle);
  const firstVariant = p.node.variants.edges[0]?.node;
  const shopifyImages = p.node.images.edges.map((e) => e.node.url).filter(Boolean);
  const images = shopifyImages.length > 0
    ? shopifyImages
    : local?.image
      ? [local.image]
      : [];
  const image = images[0] ?? "";
  return {
    handle: p.node.handle,
    name: p.node.title,
    tagline: local?.tagline ?? p.node.description?.slice(0, 120) ?? "",
    notes: local?.notes ?? [],
    price: firstVariant
      ? parseFloat(firstVariant.price.amount)
      : parseFloat(p.node.priceRange.minVariantPrice.amount),
    currency:
      firstVariant?.price.currencyCode ??
      p.node.priceRange.minVariantPrice.currencyCode ??
      "INR",
    accentHsl: local?.accentHsl ?? "43 56% 55%",
    image,
    images,
    shopify: p,
    variantId: firstVariant?.id,
  };
}

/** Returns real Shopify products tagged `car-freshener`, or falls back to placeholders when none exist. */
export async function fetchCarFreshenerCatalog(): Promise<CarFreshenerListItem[]> {
  try {
    const products = await fetchShopifyProducts(50, "tag:car-freshener");
    if (products && products.length > 0) {
      return products.map(fromShopify);
    }
  } catch (err) {
    console.warn("[carFreshenerCatalog] Shopify fetch failed, using placeholders", err);
  }
  return CAR_FRESHENERS.map(fromPlaceholder);
}

/** Looks up a single freshener by handle. Prefers Shopify, falls back to placeholder. */
export async function getCarFreshenerByHandle(
  handle: string,
): Promise<CarFreshenerListItem | null> {
  try {
    const product = await fetchShopifyProductByHandle(handle);
    if (product) {
      // fetchShopifyProductByHandle returns unwrapped node; rewrap for shared type
      return fromShopify({ node: product });
    }
  } catch (err) {
    console.warn("[carFreshenerCatalog] Shopify handle fetch failed", err);
  }
  const local = CAR_FRESHENERS.find((f) => f.id === handle);
  return local ? fromPlaceholder(local) : null;
}
