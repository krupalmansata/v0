import { ref, get, set, update, remove, child } from "firebase/database";
import { database } from "./firebase";

/**
 * Generic Utility to fetch data once
 * @param path Database path string
 */
export async function dbGet(path: string) {
  try {
    const dbRef = ref(database);
    const snapshot = await get(child(dbRef, path));
    if (snapshot.exists()) {
      return snapshot.val();
    } else {
      return null;
    }
  } catch (error) {
    console.error("Error getting data", error);
    throw error;
  }
}

/**
 * Generic Utility to set data (overwrite)
 * @param path Database path string
 * @param data Data to set
 */
export async function dbSet(path: string, data: any) {
  try {
    const dbRef = ref(database, path);
    await set(dbRef, data);
  } catch (error) {
    console.error("Error setting data", error);
    throw error;
  }
}

/**
 * Generic Utility to update data (merge)
 * @param path Database path string
 * @param data Data to merge
 */
export async function dbUpdate(path: string, data: any) {
  try {
    const dbRef = ref(database, path);
    await update(dbRef, data);
  } catch (error) {
    console.error("Error updating data", error);
    throw error;
  }
}

/**
 * Generic Utility to remove data
 * @param path Database path string
 */
export async function dbRemove(path: string) {
  try {
    const dbRef = ref(database, path);
    await remove(dbRef);
  } catch (error) {
    console.error("Error removing data", error);
    throw error;
  }
}
