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
});

export type InsertUser = z.infer<typeof InsertUserSchema>;
