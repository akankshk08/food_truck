import "server-only";
import { cache } from "react";
import type { MenuCardProduct } from "@/lib/menu-types";
import { getPublishedMenu } from "./products";

/**
 * The published menu for this request, loaded once and shared by the menu section,
 * footer and search-engine data. Returns null if the database can't be reached,
 * so the rest of the page still works.
 */
export const loadPublishedMenu = cache(async (): Promise<MenuCardProduct[] | null> => {
  try {
    return await getPublishedMenu();
  } catch (err) {
    console.error("Could not load the menu", err);
    return null;
  }
});
