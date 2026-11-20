# Diffuser pages: suggest only diffusers and diffuser fragrance oils

## What changes
- On a **diffuser** product page, both "Similar to this mood" and "You Might Also Love" will show only diffusers and diffuser fragrance oils, never perfumes.
- The product you are viewing is never suggested to itself.
- Perfume and other product pages stay as they are. They still exclude diffusers.
- If no other diffuser or oil exists yet, that section stays hidden instead of showing perfumes.

## How products are recognised
- **Diffuser:** the product has the `diffuser` tag in Shopify. This already drives the Business page.
- **Diffuser fragrance oil:** the product has a `diffuser-oil` tag, or its name or product type contains "oil".
- I couldn't open your Shopify product list to check these. Your Shopify login has expired. Please make sure each oil has the `diffuser-oil` tag or "Oil" in its name.

## Order of suggestions
- **Similar to this mood:** first the products closest in mood to the one you're viewing, then a mix of diffusers and oils.
- **You Might Also Love:** up to 3 items. When possible this includes at least one oil and one other diffuser, so shoppers see something to refill with.

## Technical details
- Add a small helper in `src/lib/shopify.ts`, `isDiffuserFamily(product)`, which checks the tag, product type and title.
- On the product page, work out `isDiffuser` and pass a `family` prop ("diffuser" | "default") to `SimilarMoodCarousel` and `RelatedProducts`.
- For diffuser pages, fetch with the query `tag:diffuser OR tag:diffuser-oil OR title:*oil* OR product_type:*oil*`, then filter with the helper. Keep the existing `NOT tag:diffuser` query for other pages.
- Add a unit test for `isDiffuserFamily`: a diffuser is included, an oil is included, a perfume is excluded.
