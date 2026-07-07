import { supabase, IMAGE_BUCKET } from "./supabase";

export interface DbCategory { id: string; name: string; image_url: string | null; }
export interface DbItem { id: string; name: string; category: string; price: number; image_url: string | null; }

// ---------- Categories ----------

export async function getCategories(): Promise<DbCategory[]> {
  const { data, error } = await supabase.from("categories").select("*").order("created_at");
  if (error) throw error;
  return data ?? [];
}

// Insert a category, or update its image if the name already exists
export async function upsertCategory(name: string, imageUrl: string | null): Promise<void> {
  const { error } = await supabase.from("categories").upsert({ name, image_url: imageUrl }, { onConflict: "name" });
  if (error) throw error;
}

export async function deleteCategory(name: string): Promise<void> {
  const { error } = await supabase.from("categories").delete().ilike("name", name);
  if (error) throw error;
}

// ---------- Items ----------

export async function getItems(): Promise<DbItem[]> {
  const { data, error } = await supabase.from("items").select("*").order("created_at");
  if (error) throw error;
  return data ?? [];
}

export async function addItem(item: { name: string; category: string; price: number; imageUrl: string | null }): Promise<void> {
  const { error } = await supabase.from("items").insert({
    name: item.name, category: item.category, price: item.price, image_url: item.imageUrl,
  });
  if (error) throw error;
}

export async function deleteItemByName(name: string): Promise<void> {
  const { error } = await supabase.from("items").delete().ilike("name", name);
  if (error) throw error;
}

export async function deleteItemsByCategory(category: string): Promise<void> {
  const { error } = await supabase.from("items").delete().ilike("category", category);
  if (error) throw error;
}

// ---------- Image upload (Supabase Storage) ----------

export async function uploadImage(file: File): Promise<string> {
  const ext = file.name.split(".").pop() || "jpg";
  const path = `${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from(IMAGE_BUCKET).upload(path, file, { upsert: false });
  if (error) throw error;
  const { data } = supabase.storage.from(IMAGE_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}
