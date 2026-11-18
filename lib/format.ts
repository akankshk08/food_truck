/** Shared display helpers for prices and portions (used by the public menu and the admin). */

const INR_WHOLE = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });
const INR_PAISE = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", minimumFractionDigits: 2 });

/** 34000 → "₹340", 34050 → "₹340.50" */
export function formatPaise(paise: number): string {
  return paise % 100 === 0 ? INR_WHOLE.format(paise / 100) : INR_PAISE.format(paise / 100);
}

/** ("500", "g") → "500 g"; ("2", "pcs") → "2 pcs"; no amount → "". */
export function formatQuantity(quantity: string | null, unit: string | null): string {
  return quantity ? [quantity, unit].filter(Boolean).join(" ") : "";
}

export type PortionForMessage = { portionName: string; quantity: string | null; unit: string | null; pricePaise: number };

/** "Hello! I am interested in ordering Chicken Sukka (Medium, 500 g), priced at ₹340." */
export function orderMessage(productName: string, portion: PortionForMessage): string {
  const details = [portion.portionName, formatQuantity(portion.quantity, portion.unit)].filter(Boolean).join(", ");
  return `Hello! I am interested in ordering ${productName}${details ? ` (${details})` : ""}, priced at ${formatPaise(portion.pricePaise)}.`;
}
