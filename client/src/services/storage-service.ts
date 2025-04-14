

import { storage } from "@/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";


export async function uploadReceipt(file: File): Promise<string | undefined> {
    try {
        const storagePath = `receipts/${Date.now()}_${file.name}`;
        const fileRef = ref(storage, storagePath);
        // Upload the file
        await uploadBytes(fileRef, file);

        // Get and return the file's public URL
        const downloadURL = await getDownloadURL(fileRef);
        return downloadURL;
    } catch(error) {
        console.log(error)
    }
    return undefined;
  }