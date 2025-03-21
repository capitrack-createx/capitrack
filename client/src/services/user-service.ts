import { db } from "@/firebase";
import { InsertUser } from "@shared/schema";
import { doc, getDoc, setDoc } from "firebase/firestore";

export const createUserDocument = async (
    user: InsertUser, uid: string
  ) => {
    if (!user) return; // null user

    const userRef = doc(db, "users", uid);
    const docSnap = await getDoc(userRef);
    if (!docSnap.exists()) {
      try {
        await setDoc(userRef, {
          email: user.email,
          name: user.name,
          ...(user.phoneNumber ? {phoneNumber: user.phoneNumber} : {}),
        });
        // console.log("User document created.");
      } catch (error) {
        console.error("Error creating user document:", error);
        throw error;
      }
    }
  };