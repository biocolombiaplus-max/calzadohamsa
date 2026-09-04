import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from './firebase';

export async function uploadProductImage(file: File, productSlug: string): Promise<string> {
  const cleanName = file.name.replace(/[^a-zA-Z0-9.]/g, '-');
  const path = `products/${productSlug}/${Date.now()}-${cleanName}`;
  const storageRef = ref(storage, path);
  await uploadBytes(storageRef, file);
  return getDownloadURL(storageRef);
}

export async function deleteProductImage(url: string): Promise<void> {
  try {
    const storageRef = ref(storage, url);
    await deleteObject(storageRef);
  } catch {
    // La imagen ya no existe o la URL no pertenece a Storage: ignorar.
  }
}
