import { Timestamp } from 'firebase/firestore';
export interface Organization {
  id: string;
  name: string;
  createdAt: Date;
  ownerId: string; // firebase user ID who created the org
}
export interface Member {
    id: string;
    name: string;
    email: string;
    orgId: string; // reference to the organization
    role: 'admin' | 'member';
    phoneNumber?: string;
    createdAt?: Timestamp;
  }

  export interface Fee {
    id: string;
    name: string;
    amount: number;
    dueDate: Date;
    memberIds: string[]; // Members who need to pay this fee
    orgId: string; // Reference to the organization
  }
  
  export type PaymentMethod = 'CASH' | 'CHECK' | 'VENMO' | 'ZELLE' | 'CREDIT_CARD' | 'OTHER';

export interface FeeAssignment {
    id: string;
    feeId: string;
    memberId: string;
    isPaid: boolean;
    paidAmount?: number;
    paidDate?: Date;
    paymentMethod?: PaymentMethod;
    notes?: string;
  } 

  export interface Organization {
    id: string,
    name: string,
  }

  export interface Transaction {
    id: string,
    type: string,
    amount: number, 
    category: string,
    description?: string,
    date: Date,
    createdAt: Date,
    createdBy: Date, // Firebase UUID of authenticated users
    orgId: string // UUID of Organization
    receiptURL: string
  }