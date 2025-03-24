import { collection, addDoc, getDocs, query, where, doc, getDoc, Timestamp, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import type { Member, Organization, Fee, FeeAssignment } from '../types';

export const dbService = {
  // Members
  async addMember(data: Omit<Member, 'id'>): Promise<Member> {
    try {
      const docRef = await addDoc(collection(db, 'members'), data);
      return { ...data, id: docRef.id };
    } catch (error) {
      console.error('Error adding member:', error);
      throw new Error('Failed to add member');
    }
  },

  async getMembers(orgId: string): Promise<Member[]> {
    try {
      const q = query(
        collection(db, 'members'),
        where('orgId', '==', orgId)
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Member));
    } catch (error) {
      console.error('Error getting members:', error);
      return [];
    }
  },

  // Organizations
  async createOrganization(data: Omit<Organization, 'id'>): Promise<Organization> {
    try {
      const docRef = await addDoc(collection(db, 'organizations'), {
        ...data,
        createdAt: Timestamp.fromDate(data.createdAt)
      });
      return { ...data, id: docRef.id };
    } catch (error) {
      console.error('Error creating organization:', error);
      throw new Error('Failed to create organization');
    }
  },

  async getOrganization(id: string): Promise<Organization | null> {
    try {
      const docRef = doc(db, 'organizations', id);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        return null;
      }

      const data = docSnap.data();
      return {
        ...data,
        id: docSnap.id,
        createdAt: data.createdAt.toDate()
      } as Organization;
    } catch (error) {
      console.error('Error getting organization:', error);
      return null;
    }
  },

  async getUserOrganization(userId: string): Promise<Organization | null> {
    try {
      const q = query(
        collection(db, 'organizations'),
        where('ownerId', '==', userId)
      );
      const snapshot = await getDocs(q);
      
      if (snapshot.empty) {
        return null;
      }

      const doc = snapshot.docs[0];
      const data = doc.data();
      return {
        ...data,
        id: doc.id,
        createdAt: data.createdAt.toDate()
      } as Organization;
    } catch (error) {
      console.error('Error getting user organization:', error);
      return null;
    }
  },
};
