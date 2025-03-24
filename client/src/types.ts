
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
    role: 'ADMIN' | 'MEMBER';
  }
  export interface Fee {
    id: string;
    name: string;
    amount: number;
    dueDate: Date;
    memberIds: string[]; // Members who need to pay this fee
    orgId: string; // Reference to the organization
  }
  
  export interface FeeAssignment {
    id: string;
    feeId: string;
    memberId: string;
    isPaid: boolean;
    paidAmount?: number;
    paidDate?: Date;
    transactionId?: string;
  } 