/** End-to-end API tests. Run with `npm run test:api` (it starts a server with a throwaway database). */
import assert from "node:assert/strict";
import { test } from "node:test";
import sharp from "sharp";

const BASE = process.env.TEST_BASE_URL;
const ORIGIN = { Origin: BASE };
let cookie = "";

async function api(path, { method = "GET", json, body, headers = {}, auth = true } = {}) {
  const res = await fetch(BASE + path, {
    method,
    redirect: "manual",
    headers: {
      ...(method !== "GET" ? ORIGIN : {}),
      ...(json !== undefined ? { "Content-Type": "application/json" } : {}),
      ...(auth && cookie ? { Cookie: cookie } : {}),
      ...headers,
    },
    body: json !== undefined ? JSON.stringify(json) : body,
  });
  const text = await res.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    data = text;
  }
  return { status: res.status, data, headers: res.headers };
}
const publicPage = async () => (await fetch(BASE + "/")).text();

const dish = (over = {}) => ({
  name: "Test Prawn Ghee Roast",
  subtitle: "Kundapur style",
  shortDescription: "Juicy prawns tossed in a fiery ghee roast masala.",
  description: "Made with Byadgi chillies and ghee.",
  categoryId: null,
  imageUrl: null,
  imageAlt: "",
  additionalImages: [],
  isVeg: false,
  spiceLevel: 3,
  isFeatured: false,
  isAvailable: true,
  isPublished: true,
  sortOrder: 50,
  variants: [
    { portionName: "Small", quantity: "250", unit: "g", pricePaise: 18000, description: "", isAvailable: true },
    { portionName: "Medium", quantity: "500", unit: "g", pricePaise: 34000, description: "Serves 2", isAvailable: true },
    { portionName: "Large", quantity: "1", unit: "kg", pricePaise: 65000, description: "", isAvailable: false },
  ],
  ...over,
});

test("admin pages send visitors without a session to the login page", async () => {
  const res = await fetch(BASE + "/admin/products", { redirect: "manual" });
  assert.equal(res.status, 307);
  assert.match(res.headers.get("location"), /\/admin\/login$/);
  // A fake cookie gets past the first check but not the server-side session check.
  const faked = await fetch(BASE + "/admin/products", { redirect: "manual", headers: { Cookie: "csk_admin_session=fake" } });
  assert.ok([307, 200].includes(faked.status));
  const html = await faked.text();
  assert.ok(!html.includes("Search by dish name"), "product list must not render for a fake session");
});

test("admin API refuses requests without a session (401)", async () => {
  for (const [method, path] of [["GET", "/api/admin/products"], ["POST", "/api/admin/products"], ["DELETE", "/api/admin/products/1"], ["POST", "/api/admin/uploads"], ["GET", "/api/admin/categories"]]) {
    const r = await api(path, { method, auth: false, json: method === "GET" ? undefined : {} });
    assert.equal(r.status, 401, `${method} ${path}`);
  }
});

test("login rejects bad input, wrong passwords and cross-site requests", async () => {
  assert.equal((await api("/api/admin/login", { method: "POST", json: { email: "not-an-email", password: "x" } })).status, 400);
  assert.equal((await api("/api/admin/login", { method: "POST", json: { email: process.env.TEST_ADMIN_EMAIL, password: "x", role: "admin" } })).status, 400);
  const wrong = await api("/api/admin/login", { method: "POST", json: { email: process.env.TEST_ADMIN_EMAIL, password: "wrong-password" } });
  assert.equal(wrong.status, 401);
  assert.equal(wrong.data.error, "Wrong email or password.");
  const unknown = await api("/api/admin/login", { method: "POST", json: { email: "nobody@example.com", password: "wrong-password" } });
  assert.equal(unknown.data.error, wrong.data.error, "same message for unknown email");
  const crossSite = await api("/api/admin/login", { method: "POST", headers: { Origin: "https://evil.example.com" }, json: { email: process.env.TEST_ADMIN_EMAIL, password: process.env.ADMIN_PASSWORD } });
  assert.equal(crossSite.status, 403);
});

test("login succeeds and sets a secure session cookie", async () => {
  const r = await api("/api/admin/login", { method: "POST", json: { email: process.env.TEST_ADMIN_EMAIL, password: process.env.ADMIN_PASSWORD } });
  assert.equal(r.status, 200);
  const set = r.headers.get("set-cookie");
  assert.match(set, /csk_admin_session=/);
  assert.match(set, /HttpOnly/i);
  assert.match(set, /SameSite=lax/i);
  assert.match(set, /Secure/i);
  cookie = set.split(";")[0];
  assert.equal((await api("/api/admin/products")).status, 200);
});

test("changes from another website are blocked even when signed in", async () => {
  const r = await api("/api/admin/products", { method: "POST", headers: { Origin: "https://evil.example.com" }, json: dish() });
  assert.equal(r.status, 403);
  const noOrigin = await fetch(BASE + "/api/admin/products", { method: "POST", headers: { Cookie: cookie, "Content-Type": "application/json" }, body: JSON.stringify(dish()) });
  assert.equal(noOrigin.status, 403);
});

test("product validation: extra fields, bad prices, foreign photo URLs", async () => {
  assert.equal((await api("/api/admin/products", { method: "POST", json: { ...dish(), slug: "hack", id: 1 } })).status, 400);
  const badPrice = await api("/api/admin/products", { method: "POST", json: dish({ variants: [{ ...dish().variants[0], pricePaise: 0 }] }) });
  assert.equal(badPrice.status, 400);
  assert.ok(badPrice.data.fieldErrors["variants.0.pricePaise"], "error points at the exact portion price");
  assert.equal((await api("/api/admin/products", { method: "POST", json: dish({ imageUrl: "https://evil.example.com/x.jpg" }) })).status, 400);
  assert.equal((await api("/api/admin/products", { method: "POST", json: dish({ categoryId: 99999 }) })).status, 400);
});

let photoUrl;
test("photo upload: rejects non-images, accepts a real photo and converts it", async () => {
  const fake = new FormData();
  fake.append("file", new Blob(["<?php echo 'hi'; ?>"], { type: "image/jpeg" }), "evil.jpg");
  assert.equal((await api("/api/admin/uploads", { method: "POST", body: fake })).status, 400);

  const svg = new FormData();
  svg.append("file", new Blob(["<svg xmlns='http://www.w3.org/2000/svg'/>"], { type: "image/svg+xml" }), "x.svg");
  assert.equal((await api("/api/admin/uploads", { method: "POST", body: svg })).status, 400);

  const png = await sharp({ create: { width: 3000, height: 2000, channels: 3, background: "#7a3b1d" } }).png().toBuffer();
  const form = new FormData();
  form.append("file", new Blob([png], { type: "image/png" }), "dish.png");
  const r = await api("/api/admin/uploads", { method: "POST", body: form });
  assert.equal(r.status, 201);
  assert.match(r.data.url, /^\/media\/[a-f0-9-]{36}\.webp$/);
  photoUrl = r.data.url;
  const img = await fetch(BASE + photoUrl);
  assert.equal(img.status, 200);
  assert.equal(img.headers.get("content-type"), "image/webp");
  const meta = await sharp(Buffer.from(await img.arrayBuffer())).metadata();
  assert.equal(meta.width, 2000, "large photos are resized to 2000px");
  assert.equal((await fetch(BASE + "/media/../../etc/passwd")).status, 404);
});

let productId;
test("add product with photo and three portions → appears on the public menu", async () => {
  const created = await api("/api/admin/products", { method: "POST", json: dish({ imageUrl: photoUrl }) });
  assert.equal(created.status, 201);
  productId = created.data.id;

  const got = await api(`/api/admin/products/${productId}`);
  assert.equal(got.data.variants.length, 3);
  assert.deepEqual(got.data.variants.map((v) => v.pricePaise), [18000, 34000, 65000]);

  const html = await publicPage();
  assert.ok(html.includes("Test Prawn Ghee Roast"));
  assert.ok(html.includes("₹180") && html.includes("₹340") && html.includes("₹650"));
  assert.ok(html.includes(encodeURIComponent("Hello! I am interested in ordering Test Prawn Ghee Roast (Small, 250 g), priced at ₹180.")), "WhatsApp link carries the selected portion");
  assert.ok(html.includes(encodeURIComponent(photoUrl).replace(/%2F/g, "%2F")) || html.includes(photoUrl), "uploaded photo is used");
});

test("editing prices updates the public menu", async () => {
  const body = dish({ imageUrl: photoUrl });
  body.variants[0].pricePaise = 19900;
  assert.equal((await api(`/api/admin/products/${productId}`, { method: "PUT", json: body })).status, 200);
  const html = await publicPage();
  assert.ok(html.includes("₹199"));
  assert.ok(!html.includes("₹180<"), "old price is gone");
});

test("unavailable dishes show as unavailable; hidden dishes disappear", async () => {
  assert.equal((await api(`/api/admin/products/${productId}`, { method: "PATCH", json: { isAvailable: false } })).status, 200);
  let html = await publicPage();
  assert.ok(html.includes("Currently Unavailable"));

  assert.equal((await api(`/api/admin/products/${productId}`, { method: "PATCH", json: { isPublished: false } })).status, 200);
  html = await publicPage();
  assert.ok(!html.includes("Test Prawn Ghee Roast"), "unpublished dish is hidden");

  assert.equal((await api(`/api/admin/products/${productId}`, { method: "PATCH", json: { isPublished: "yes" } })).status, 400);
});

test("text typed in the admin can't inject scripts into the website", async () => {
  const evil = await api("/api/admin/products", { method: "POST", json: dish({ name: "Evil</script><script>alert(1)</script>", variants: [] }) });
  assert.equal(evil.status, 201);
  const html = await publicPage();
  assert.ok(!html.includes("<script>alert(1)</script>"));
  assert.equal((await api(`/api/admin/products/${evil.data.id}`, { method: "DELETE" })).status, 200);
});

test("search and category filter", async () => {
  const cat = await api("/api/admin/categories", { method: "POST", json: { name: "Seafood Test" } });
  assert.equal(cat.status, 201);
  const body = dish({ imageUrl: photoUrl, categoryId: cat.data.id });
  assert.equal((await api(`/api/admin/products/${productId}`, { method: "PUT", json: body })).status, 200);

  const byName = await api("/api/admin/products?q=prawn");
  assert.equal(byName.data.total, 1);
  assert.equal(byName.data.rows[0].portionCount, 3);
  assert.equal(byName.data.rows[0].startingPricePaise, 18000);
  assert.equal((await api("/api/admin/products?q=%25")).data.total, 0, "% is searched literally");
  assert.equal((await api(`/api/admin/products?category=${cat.data.id}`)).data.total, 1);

  assert.equal((await api("/api/admin/categories", { method: "POST", json: { name: "seafood test" } })).status, 409, "duplicate name");
  assert.equal((await api(`/api/admin/categories/${cat.data.id}`, { method: "DELETE" })).status, 409, "in use");
  assert.equal((await api(`/api/admin/categories/${cat.data.id}`, { method: "PATCH", json: { name: "Seafood" } })).status, 200);
});

test("deleting a dish removes it, its portions and its photo", async () => {
  assert.equal((await api(`/api/admin/products/${productId}`, { method: "DELETE" })).status, 200);
  assert.equal((await api(`/api/admin/products/${productId}`)).status, 404);
  assert.equal((await api(`/api/admin/products/${productId}`, { method: "DELETE" })).status, 404);
  assert.equal((await fetch(BASE + photoUrl)).status, 404, "uploaded photo file deleted");
  assert.equal((await api("/api/admin/products/abc")).status, 404);
});

test("the original three dishes were imported and are still on the menu", async () => {
  const html = await publicPage();
  for (const name of ["Chicken Sukka", "Chicken Gravy with Kori Rotti", "Mushroom Biryani"]) assert.ok(html.includes(name), name);
  assert.ok(html.includes("Signature Speciality"));
  assert.ok(html.includes("Coming Soon"), "no portions yet → Coming Soon, as before");
});

test("sign out ends the session", async () => {
  assert.equal((await api("/api/admin/logout", { method: "POST" })).status, 200);
  assert.equal((await api("/api/admin/products")).status, 401);
});

test("too many wrong passwords are rate limited (429)", async () => {
  let last;
  for (let i = 0; i < 9; i++) {
    last = await api("/api/admin/login", { method: "POST", auth: false, json: { email: "ratelimit@example.com", password: "wrong-password" } });
  }
  assert.equal(last.status, 429);
  assert.ok(Number(last.headers.get("retry-after")) > 0);
});
