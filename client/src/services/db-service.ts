import { collection, addDoc, getDocs, query, where, doc, getDoc, Timestamp, updateDoc, onSnapshot, deleteDoc } from 'firebase/firestore';
import { db } from '@/firebase';
import type { Member, Organization, Fee, FeeAssignment, Transaction } from '@shared/types';
import { InsertMember, InsertTransaction } from '@shared/schema';

const convertTimestampToDate = (data: any): Date => {
  return (data.dueDate || data.paidDate || data.createdAt).toDate();
};

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ValidationError";
  }
}

export const dbService = {
  // Members
  async addMember(data: InsertMember): Promise<void> {
    try {
      // Check duplicate first
      const q = query(
        collection(db, 'members'),
        where('orgId', '==', data.orgId),
        where('email', '==', data.email)
      );
      const snapshot = await getDocs(q);
      if (snapshot.size > 0) {
        throw new ValidationError('Duplicate Member (email)')
      }
      await addDoc(collection(db, 'members'), data);
    } catch (error) {
      console.error('Error adding member:', error);
      if (error instanceof ValidationError) {
        throw error;
      }
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

  async deleteMember(memberId: string): Promise<void> {
    try {
      const memberRef = doc(db, 'members', memberId);
      await deleteDoc(memberRef);
    } catch (error) {
      console.error('Error deleting member:', error);
      throw new Error('Failed to delete member');
    }
  },

  async updateMember(memberId: string, data: Partial<InsertMember>): Promise<void> {
    try {
      const memberRef = doc(db, 'members', memberId);
      await updateDoc(memberRef, data);
    } catch (error) {
      console.error('Error updating member:', error);
      throw new Error('Failed to update member');
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

  // Fees
  async addFee(data: Omit<Fee, 'id'>): Promise<Fee> {
    try {
      if (!data.memberIds || data.memberIds.length === 0) {
        throw new Error('At least one member must be assigned to the fee');
      }

      const docRef = await addDoc(collection(db, 'fees'), {
        ...data,
        dueDate: Timestamp.fromDate(data.dueDate)
      });

      // Create fee assignments for each member
      await Promise.all(
        data.memberIds.map(memberId =>
          this.createFeeAssignment({
            feeId: docRef.id,
            memberId,
            isPaid: false
          })
        )
      );

      return { ...data, id: docRef.id };
    } catch (error) {
      console.error('Error adding fee:', error);
      throw new Error('Failed to add fee');
    }
  },

  async getFees(orgId: string): Promise<Fee[]> {
    try {
      const q = query(
        collection(db, 'fees'),
        where('orgId', '==', orgId)
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          ...data,
          id: doc.id,
          dueDate: convertTimestampToDate(data)
        } as Fee;
      });
    } catch (error) {
      console.error('Error getting fees:', error);
      return [];
    }
  },

  async deleteFee(feeId: string): Promise<void> {
    try {
      // Delete the fee document
      const feeRef = doc(db, 'fees', feeId);
      await deleteDoc(feeRef);

      // Delete all associated fee assignments
      const assignmentsRef = collection(db, 'feeAssignments');
      const q = query(assignmentsRef, where('feeId', '==', feeId));
      const snapshot = await getDocs(q);
      await Promise.all(snapshot.docs.map(doc => deleteDoc(doc.ref)));
    } catch (error) {
      console.error('Error deleting fee:', error);
      throw new Error('Failed to delete fee');
    }
  },


  async updateFee(feeId: string, data: Partial<Fee>): Promise<void> {
    try {
      const feeRef = doc(db, 'fees', feeId);
      
      // Create a copy of the data to modify
      const updateData: Partial<Fee> = { ...data };
      
      // Firestore will automatically convert Date to Timestamp
      await updateDoc(feeRef, updateData);
    } catch (error) {
      console.error('Error updating fee:', error);
      throw new Error('Failed to update fee');
    }
  },

  // Fee Assignments
  async createFeeAssignment(data: Omit<FeeAssignment, 'id'>): Promise<FeeAssignment> {
    try {
      const docRef = await addDoc(collection(db, 'feeAssignments'), {
        ...data,
        paidDate: data.paidDate ? Timestamp.fromDate(data.paidDate) : null
      });
      return { ...data, id: docRef.id };
    } catch (error) {
      console.error('Error creating fee assignment:', error);
      throw new Error('Failed to create fee assignment');
    }
  },

  async getFeeAssignments(feeId: string): Promise<FeeAssignment[]> {
    try {
      const q = query(
        collection(db, 'feeAssignments'),
        where('feeId', '==', feeId)
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          ...data,
          id: doc.id,
          paidDate: data.paidDate ? convertTimestampToDate(data) : undefined
        } as FeeAssignment;
      });
    } catch (error) {
      console.error('Error getting fee assignments:', error);
      return [];
    }
  },

  async getMemberFeeAssignments(memberId: string): Promise<FeeAssignment[]> {
    try {
      const q = query(
        collection(db, 'feeAssignments'),
        where('memberId', '==', memberId)
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          ...data,
          id: doc.id,
          paidDate: data.paidDate ? convertTimestampToDate(data) : undefined
        } as FeeAssignment;
      });
    } catch (error) {
      console.error('Error getting member fee assignments:', error);
      return [];
    }
  },

  async updateFeeAssignment(
    id: string,
    data: Partial<Pick<FeeAssignment, 'isPaid' | 'paidDate' | 'paymentMethod' | 'notes'>>
  ): Promise<void> {
    try {
      const docRef = doc(db, 'feeAssignments', id);
      const updateData: Record<string, any> = {};
      
      if (data.isPaid !== undefined) updateData.isPaid = data.isPaid;
      if (data.paidDate) updateData.paidDate = Timestamp.fromDate(data.paidDate);
      if (data.paymentMethod) updateData.paymentMethod = data.paymentMethod;
      if (data.notes !== undefined) updateData.notes = data.notes;

      console.log('Updating fee assignment with:', updateData);
      await updateDoc(docRef, updateData);
      if (data.isPaid && data.isPaid === true) {
        const feeAssignmentSnap = await getDoc(docRef);
        const feeAssignment = feeAssignmentSnap.data() as FeeAssignment;
        
        // Get the fee amount
        const feeRef = doc(db, 'fees', feeAssignment.feeId);
        const feeSnap = await getDoc(feeRef);
        const fee = feeSnap.data() as Fee;

        // Create revenue transaction
        await dbService.createTransactionDocument({
          type: "Revenue",
          amount: fee.amount,
          category: "Membership Fees",
          description: `Fee payment`,
          date: data.paidDate?.toISOString().split('T')[0] || new Date().toISOString().split('T')[0],
          createdAt: new Date(),
          createdBy: "system",
          orgId: fee.orgId,
        });
      }
    } catch (error) {
      console.error('Error updating fee assignment:', error);
      throw new Error('Failed to update fee assignment');
    }
  },

  // Transaction
  async createTransactionDocument (
    data: InsertTransaction
  ): Promise<void> {
    try {
      await addDoc(collection(db, 'transactions'), {

        ...data
      });

    } catch(error) {
      console.error('Error creating transaction:', error);
      throw new Error('Failed to create transaction');    
    }
  },

  subscribeToTransactions(
    orgId: string,
    callback: (transactions: Transaction[]) => void
  ) {
    const q = query(
      collection(db, "transactions"),
      where("orgId", "==", orgId)
    );
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const transactions: Transaction[] = [];
      snapshot.forEach((doc) => {
        transactions.push({ id: doc.id, ...doc.data() } as Transaction);
      });
      callback(transactions);
    });
    
    // Return the unsubscribe function for cleanup
    return unsubscribe;
  },  
};
