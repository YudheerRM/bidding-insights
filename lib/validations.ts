import { z } from 'zod';

// Base schemas
export const emailSchema = z.string().email("Please enter a valid email address");
export const passwordSchema = z.string()
  .min(8, "Password must be at least 8 characters")
  .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, "Password must contain at least one uppercase letter, one lowercase letter, and one number");

export const phoneSchema = z.string()
  .refine((val) => !val || /^[+]?[\d\s\-\(\)]+$/.test(val), "Please enter a valid phone number")
  .refine((val) => !val || val.replace(/\s|-|\(|\)/g, '').length >= 10, "Phone number must be at least 10 digits");

// Sign in schema
export const signInSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Password is required"),
});

// Base sign up schema (without refine so it can be extended)
const baseSignUpSchemaFields = {
  email: emailSchema,
  password: passwordSchema,
  confirmPassword: z.string(),
  name: z.string().min(2, "Name must be at least 2 characters"),
  userType: z.enum(['government_official', 'bidder', 'admin', 'viewer']),
  companyName: z.string().optional(),
  phoneNumber: phoneSchema.optional(),
  address: z.string().optional(),
};

// Base sign up schema with password confirmation validation
export const baseSignUpSchema = z.object(baseSignUpSchemaFields).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

// Base schemas for each user type (without refine for discriminated union)
const governmentOfficialBaseSchema = z.object({
  ...baseSignUpSchemaFields,
  userType: z.literal('government_official'),
  department: z.string().min(2, "Department is required"),
  position: z.string().min(2, "Position is required"),
  governmentId: z.string().min(5, "Government ID is required"),
});

const bidderBaseSchema = z.object({
  ...baseSignUpSchemaFields,
  userType: z.literal('bidder'),
  companyName: z.string().min(2, "Company name is required"),
  businessRegistrationNumber: z.string().min(5, "Business registration number is required"),
  taxId: z.string().min(5, "Tax ID is required"),
  bidderCategory: z.string().min(2, "Bidder category is required"),
  certifications: z.string().optional(),
  subscriptionTier: z.enum(['basic', 'premium', 'enterprise']).default('basic'),
});

const adminBaseSchema = z.object({
  ...baseSignUpSchemaFields,
  userType: z.literal('admin'),
  department: z.string().min(2, "Department is required"),
  position: z.string().min(2, "Position is required"),
});

const viewerBaseSchema = z.object({
  ...baseSignUpSchemaFields,
  userType: z.literal('viewer'),
});

// Exported schemas with password validation
export const governmentOfficialSchema = governmentOfficialBaseSchema.refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export const bidderSchema = bidderBaseSchema.refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export const adminSchema = adminBaseSchema.refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export const viewerSchema = viewerBaseSchema.refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

// Union schema for sign up (uses base schemas without refine)
export const signUpSchema = z.discriminatedUnion('userType', [
  governmentOfficialBaseSchema,
  bidderBaseSchema,
  adminBaseSchema,
  viewerBaseSchema,
]).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

// Profile update schema
export const profileUpdateSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").optional(),
  companyName: z.string().optional(),
  phoneNumber: phoneSchema.optional(),
  address: z.string().optional(),
  department: z.string().optional(),
  position: z.string().optional(),
  businessRegistrationNumber: z.string().optional(),
  taxId: z.string().optional(),
  bidderCategory: z.string().optional(),
  certifications: z.string().optional(),
});

// Password reset schema
export const passwordResetSchema = z.object({
  email: emailSchema,
});

// Change password schema
export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: passwordSchema,
  confirmNewPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmNewPassword, {
  message: "Passwords don't match",
  path: ["confirmNewPassword"],
});

// Types
export type SignInInput = z.infer<typeof signInSchema>;
export type SignUpInput = z.infer<typeof signUpSchema>;
export type GovernmentOfficialInput = z.infer<typeof governmentOfficialSchema>;
export type BidderInput = z.infer<typeof bidderSchema>;
export type AdminInput = z.infer<typeof adminSchema>;
export type ViewerInput = z.infer<typeof viewerSchema>;
export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>;
export type PasswordResetInput = z.infer<typeof passwordResetSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;