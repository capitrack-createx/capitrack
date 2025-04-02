import { z } from "zod";
import {
  isValidPhoneNumber,
  parsePhoneNumberWithError,
} from "libphonenumber-js";

export const InsertUserSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Invalid email address." }),
  password: z.string().min(8, { message: "Password must be at least 8 characters"}),
  phoneNumber: z.string().refine(
    isValidPhoneNumber,
    { message: "Invalid phone number, include extension +1"}
  ).transform((value) => parsePhoneNumberWithError(value).number.toString()).optional().or(z.literal('')),
  organizationName: z.string().min(2, { message: "Organization name must be at least 2 characters." }),
});

export const RoleEnum = z.enum(["owner", "admin", "member"]);

export const FeeSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2, { message: "Fee name must be at least 2 characters." }),
  amount: z.number().min(0, { message: "Amount must be greater than 0" }),
  dueDate: z.date(),
  memberIds: z.array(z.string()),
  orgId: z.string()
});

export const PaymentMethodEnum = z.enum([
  'CASH',
  'CHECK',
  'VENMO',
  'ZELLE',
  'CREDIT_CARD',
  'OTHER'
]);

export const FeeAssignmentSchema = z.object({
  id: z.string().optional(),
  feeId: z.string(),
  memberId: z.string(),
  isPaid: z.boolean(),
  paidDate: z.date().optional(),
  paymentMethod: PaymentMethodEnum.optional(),
  notes: z.string().optional()
});


export const InsertTransactionSchema = z.object({
  id: z.string().optional(),
  type: z.enum(["Income", "Expense"]),
  amount: z.preprocess((val) => {
    if (typeof val === "string") {
      return parseFloat(val);
    }
    return val;
  }, z.number().min(1, { message: "Amount is required" })),
  category: z.string().min(1, { message: "Category is required" }),
  description: z.string().optional(),
  date: z.string().optional().default(() => new Date().toISOString().split('T')[0]),
  createdAt: z.date().default(() => new Date()),
  createdBy: z.string(), // Firebase UUID of authenticated users
  orgId: z.string() // UUID of Organization
})


export const InsertMemberSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  orgId: z.string().min(5), // reference to the organization
  role: z.enum(['ADMIN', 'MEMBER']),
  phoneNumber: z.string().refine(
    isValidPhoneNumber,
    { message: "Invalid phone number, include extension +1"}
  ).transform((value) => parsePhoneNumberWithError(value).number.toString()).optional().or(z.literal('')),
  createdAt: z.date(),
})

export type InsertMember = z.infer<typeof InsertMemberSchema>;
export type InsertUser = z.infer<typeof InsertUserSchema>;
export type Role = z.infer<typeof RoleEnum>;
export type InsertTransaction = z.infer<typeof InsertTransactionSchema>;
export type Fee = z.infer<typeof FeeSchema>;
export type PaymentMethod = z.infer<typeof PaymentMethodEnum>;
export type FeeAssignment = z.infer<typeof FeeAssignmentSchema>;
