import { InsertUser } from "@shared/schema";
import { auth } from "@/firebase"; 
import { 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    signOut,
    onAuthStateChanged,
    User 
  } from "firebase/auth";
  
import { useState, useEffect } from "react";



export const signUp = async (user: InsertUser): Promise<User> => {
  const userCredential = await createUserWithEmailAndPassword(auth, user.email, user.password);
  return userCredential.user;
};

export const login = async (email: string, password: string): Promise<User> => {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
};
  
export const logout = async (): Promise<void> => {
await signOut(auth);
};
  
export function useAuth() {
    const [user, setUser] = useState<User | null>(auth.currentUser);
    const [loading, setLoading] = useState(true);
  
    useEffect(() => {
      const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
        setUser(firebaseUser);
        setLoading(false);
      });
      return unsubscribe;
    }, []);

    return { user, loading, logout };
}


