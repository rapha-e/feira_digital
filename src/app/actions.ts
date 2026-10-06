"use server";

import {
  recordWhatsAppClick,
  recordStoreView,
  getAllBusinessesAdmin,
  updateBusinessAdmin,
  deleteBusinessAdmin,
  createCategoryAdmin,
  updateCategoryAdmin,
  deleteCategoryAdmin,
  updateProductAdmin,
  deleteProductAdmin,
  getCategories,
} from "@/lib/data";
import { Business, Category, Product } from "@/types";

export async function trackWhatsAppClick(businessId: string) {
  if (!businessId) return;
  await recordWhatsAppClick(businessId);
}

export async function trackStoreView(businessId: string) {
  if (!businessId) return;
  await recordStoreView(businessId);
}

// Actions Administrativas
export async function adminLoadData() {
  const [businesses, categories] = await Promise.all([
    getAllBusinessesAdmin(),
    getCategories(),
  ]);
  return { businesses, categories };
}

export async function adminUpdateBusiness(id: string, updates: Partial<Business>) {
  return await updateBusinessAdmin(id, updates);
}

export async function adminDeleteBusiness(id: string) {
  return await deleteBusinessAdmin(id);
}

export async function adminCreateCategory(name: string, slug: string, icon?: string) {
  return await createCategoryAdmin({ name, slug, icon });
}

export async function adminUpdateCategory(id: string, updates: Partial<Category>) {
  return await updateCategoryAdmin(id, updates);
}

export async function adminDeleteCategory(id: string) {
  return await deleteCategoryAdmin(id);
}

export async function adminUpdateProduct(id: string, updates: Partial<Product>) {
  return await updateProductAdmin(id, updates);
}

export async function adminDeleteProduct(id: string) {
  return await deleteProductAdmin(id);
}
