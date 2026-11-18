import assert from "node:assert/strict";
import { test } from "node:test";
import { isAllowedImageUrl, paiseToRupeesInput, ProductInput, rupeesToPaise } from "../lib/admin/schemas";
import { formatPaise, formatQuantity, orderMessage } from "../lib/format";
import { slugify } from "../lib/slug";

test("rupees typed by the admin become whole paise", () => {
  assert.equal(rupeesToPaise("180"), 18000);
  assert.equal(rupeesToPaise("180.5"), 18050);
  assert.equal(rupeesToPaise("1,250.75"), 125075);
  assert.equal(rupeesToPaise("12.345"), null);
  assert.equal(rupeesToPaise("abc"), null);
  assert.equal(rupeesToPaise("-5"), null);
  assert.equal(paiseToRupeesInput(18000), "180");
  assert.equal(paiseToRupeesInput(18050), "180.50");
});

test("prices are shown as Indian rupees", () => {
  assert.equal(formatPaise(34000), "₹340");
  assert.equal(formatPaise(125000), "₹1,250");
  assert.equal(formatPaise(10000000), "₹1,00,000");
  assert.equal(formatPaise(34050), "₹340.50");
});

test("WhatsApp message names the dish, portion, amount and price", () => {
  assert.equal(
    orderMessage("Chicken Sukka", { portionName: "Medium", quantity: "500", unit: "g", pricePaise: 34000 }),
    "Hello! I am interested in ordering Chicken Sukka (Medium, 500 g), priced at ₹340."
  );
  assert.equal(
    orderMessage("Kori Rotti", { portionName: "Plate", quantity: null, unit: null, pricePaise: 15000 }),
    "Hello! I am interested in ordering Kori Rotti (Plate), priced at ₹150."
  );
  assert.equal(formatQuantity("1.5", "kg"), "1.5 kg");
  assert.equal(formatQuantity(null, "g"), "");
});

test("slugs are URL-safe", () => {
  assert.equal(slugify("Chicken Gravy & Kori Rotti"), "chicken-gravy-and-kori-rotti");
  assert.equal(slugify("  Neer Dosé!! "), "neer-dose");
  assert.equal(slugify("!!!"), "item");
});

test("only the site's own photo URLs are accepted", () => {
  assert.ok(isAllowedImageUrl("/images/chicken-sukka.jpg"));
  assert.ok(isAllowedImageUrl("/media/0b6f2f0e-8d7c-4a8e-9d55-1f2a3b4c5d6e.webp"));
  assert.ok(isAllowedImageUrl("https://abc123.public.blob.vercel-storage.com/products/x.webp"));
  assert.ok(!isAllowedImageUrl("https://evil.example.com/x.jpg"));
  assert.ok(!isAllowedImageUrl("javascript:alert(1)"));
  assert.ok(!isAllowedImageUrl("/media/../../etc/passwd"));
});

const validProduct = {
  name: "Chicken Sukka",
  subtitle: "",
  shortDescription: "Dry coastal chicken with roasted coconut.",
  description: "",
  categoryId: null,
  imageUrl: null,
  imageAlt: "",
  additionalImages: [],
  isVeg: false,
  spiceLevel: 3,
  isFeatured: true,
  isAvailable: true,
  isPublished: true,
  sortOrder: 0,
  variants: [{ portionName: "Small", quantity: "250", unit: "g", pricePaise: 18000, description: "", isAvailable: true }],
};

test("product validation accepts a normal dish and rejects bad input", () => {
  assert.ok(ProductInput.safeParse(validProduct).success);
  assert.ok(!ProductInput.safeParse({ ...validProduct, isAdmin: true }).success, "unknown fields are rejected");
  assert.ok(!ProductInput.safeParse({ ...validProduct, name: "" }).success);
  assert.ok(!ProductInput.safeParse({ ...validProduct, spiceLevel: 7 }).success);
  const bad = ProductInput.safeParse({ ...validProduct, variants: [{ ...validProduct.variants[0], pricePaise: 0 }] });
  assert.ok(!bad.success);
  assert.deepEqual(bad.error.issues[0].path, ["variants", 0, "pricePaise"]);
  assert.ok(!ProductInput.safeParse({ ...validProduct, imageUrl: "https://evil.example.com/a.jpg" }).success);
});
