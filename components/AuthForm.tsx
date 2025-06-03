"use client";

import React, { useState } from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Eye, EyeOff, Loader2, Building2, Shield, User, Eye as ViewIcon } from "lucide-react";
import { toast } from "sonner";

interface AuthFormProps {
  type: "sign-in" | "sign-up";
  schema: z.ZodSchema<any>;
  defaultValues?: Record<string, any>;
  onSubmit: (data: any) => Promise<void>;
}

const AuthForm = ({ type, schema, defaultValues, onSubmit }: AuthFormProps) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [selectedUserType, setSelectedUserType] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  // Helper function to safely get error message
  const getErrorMessage = (fieldName: string) => {
    const error = errors[fieldName];
    if (!error) return null;
    if (typeof error === 'string') return error;
    if (typeof error === 'object' && 'message' in error && typeof error.message === 'string') {
      return error.message;
    }
    return null;
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: defaultValues || {},
  });

  const userType = watch("userType");

  const handleFormSubmit = async (data: any) => {
    setIsLoading(true);
    try {
      if (type === "sign-in") {
        const result = await signIn("credentials", {
          email: data.email,
          password: data.password,
          redirect: false,
        });

        if (result?.error) {
          toast.error("Invalid credentials. Please try again.");
        } else {
          toast.success("Signed in successfully!");
          router.push("/dashboard");
        }
      } else {
        await onSubmit(data);
      }
    } catch (error) {
      toast.error("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const getUserTypeIcon = (type: string) => {
    switch (type) {
      case "government_official":
        return <Shield className="w-4 h-4" />;
      case "bidder":
        return <Building2 className="w-4 h-4" />;
      case "admin":
        return <Shield className="w-4 h-4" />;
      case "viewer":
        return <ViewIcon className="w-4 h-4" />;
      default:
        return <User className="w-4 h-4" />;
    }
  };

  const getUserTypeDescription = (type: string) => {
    switch (type) {
      case "government_official":
        return "For government employees and officials";
      case "bidder":
        return "For companies and individuals participating in bids";
      case "admin":
        return "For system administrators";
      case "viewer":
        return "For read-only access to public information";
      default:
        return "";
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center">
          {type === "sign-in" ? "Sign In" : "Create Account"}
        </CardTitle>
        <CardDescription className="text-center">
          {type === "sign-in"
            ? "Enter your credentials to access your account"
            : "Choose your account type and fill in your details"}
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          {/* User Type Selection (Sign Up Only) */}
          {type === "sign-up" && (
            <div className="space-y-2">
              <Label htmlFor="userType">Account Type</Label>
              <Select
                onValueChange={(value) => {
                  setSelectedUserType(value);
                  setValue("userType", value);
                }}
                value={selectedUserType}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select account type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="government_official">
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4" />
                      <div>
                        <div>Government Official</div>
                        <div className="text-xs text-muted-foreground">
                          For government employees and officials
                        </div>
                      </div>
                    </div>
                  </SelectItem>
                  <SelectItem value="bidder">
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4" />
                      <div>
                        <div>Bidder</div>
                        <div className="text-xs text-muted-foreground">
                          For companies participating in bids
                        </div>
                      </div>
                    </div>
                  </SelectItem>
                  <SelectItem value="admin">
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4" />
                      <div>
                        <div>Administrator</div>
                        <div className="text-xs text-muted-foreground">
                          For system administrators
                        </div>
                      </div>
                    </div>
                  </SelectItem>
                  <SelectItem value="viewer">
                    <div className="flex items-center gap-2">
                      <ViewIcon className="w-4 h-4" />
                      <div>
                        <div>Viewer</div>
                        <div className="text-xs text-muted-foreground">
                          For read-only access
                        </div>
                      </div>
                    </div>
                  </SelectItem>
                </SelectContent>              </Select>
              {getErrorMessage('userType') && (
                <p className="text-sm text-red-500">{getErrorMessage('userType')}</p>
              )}
            </div>
          )}

          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="john@example.com"
                {...register("email")}            />
            {getErrorMessage('email') && (
              <p className="text-sm text-red-500">{getErrorMessage('email')}</p>
            )}
          </div>

            {type === "sign-up" && (
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  placeholder="John Doe"
                  {...register("name")}
                />
                {errors.name && (
                  <p className="text-sm text-red-500">{errors.name.message}</p>
                )}
              </div>
            )}
          </div>

          {/* Password Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter password"
                  {...register("password")}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-sm text-red-500">{errors.password.message}</p>
              )}
            </div>

            {type === "sign-up" && (
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm password"
                    {...register("confirmPassword")}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-sm text-red-500">{errors.confirmPassword.message}</p>
                )}
              </div>
            )}
          </div>

          {/* User Type Specific Fields */}
          {type === "sign-up" && userType && (
            <>
              <Separator />
              <div className="space-y-4">
                <h3 className="font-semibold flex items-center gap-2">
                  {getUserTypeIcon(userType)}
                  {userType === "government_official" && "Government Official Details"}
                  {userType === "bidder" && "Bidder Information"}
                  {userType === "admin" && "Administrator Details"}
                  {userType === "viewer" && "Additional Information"}
                </h3>

                {/* Government Official Fields */}
                {userType === "government_official" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="department">Department</Label>
                      <Input
                        id="department"
                        placeholder="Ministry of Finance"
                        {...register("department")}
                      />
                      {errors.department && (
                        <p className="text-sm text-red-500">{errors.department.message}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="position">Position</Label>
                      <Input
                        id="position"
                        placeholder="Senior Officer"
                        {...register("position")}
                      />
                      {errors.position && (
                        <p className="text-sm text-red-500">{errors.position.message}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="governmentId">Government ID</Label>
                      <Input
                        id="governmentId"
                        placeholder="GOV123456"
                        {...register("governmentId")}
                      />
                      {errors.governmentId && (
                        <p className="text-sm text-red-500">{errors.governmentId.message}</p>
                      )}
                    </div>
                  </div>
                )}

                {/* Bidder Fields */}
                {userType === "bidder" && (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="companyName">Company Name</Label>
                        <Input
                          id="companyName"
                          placeholder="ABC Construction Ltd"
                          {...register("companyName")}
                        />
                        {errors.companyName && (
                          <p className="text-sm text-red-500">{errors.companyName.message}</p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="businessRegistrationNumber">Business Registration Number</Label>
                        <Input
                          id="businessRegistrationNumber"
                          placeholder="BR123456789"
                          {...register("businessRegistrationNumber")}
                        />
                        {errors.businessRegistrationNumber && (
                          <p className="text-sm text-red-500">{errors.businessRegistrationNumber.message}</p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="taxId">Tax ID</Label>
                        <Input
                          id="taxId"
                          placeholder="TAX123456"
                          {...register("taxId")}
                        />
                        {errors.taxId && (
                          <p className="text-sm text-red-500">{errors.taxId.message}</p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="bidderCategory">Category</Label>
                        <Select onValueChange={(value) => setValue("bidderCategory", value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="construction">Construction</SelectItem>
                            <SelectItem value="it_services">IT Services</SelectItem>
                            <SelectItem value="consulting">Consulting</SelectItem>
                            <SelectItem value="supplies">Supplies</SelectItem>
                            <SelectItem value="maintenance">Maintenance</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                        {errors.bidderCategory && (
                          <p className="text-sm text-red-500">{errors.bidderCategory.message}</p>
                        )}
                      </div>
                    </div>

                    {/* Subscription Tier for Bidders */}
                    <div className="space-y-4">
                      <Label>Subscription Plan</Label>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {["basic", "premium", "enterprise"].map((tier) => (
                          <Card 
                            key={tier}
                            className={`cursor-pointer transition-all border-2 ${
                              watch("subscriptionTier") === tier 
                                ? "border-primary bg-primary/5" 
                                : "border-muted hover:border-primary/50"
                            }`}
                            onClick={() => setValue("subscriptionTier", tier)}
                          >
                            <CardContent className="p-4">
                              <h4 className="font-semibold capitalize">{tier}</h4>
                              <p className="text-sm text-muted-foreground mt-1">
                                {tier === "basic" && "Access to basic features - Free"}
                                {tier === "premium" && "Advanced features - $29/month"}
                                {tier === "enterprise" && "Full access - $99/month"}
                              </p>
                              {tier !== "basic" && (
                                <p className="text-xs text-orange-600 mt-2">
                                  * Dev environment - Payment integration pending
                                </p>
                              )}
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                {/* Admin Fields */}
                {userType === "admin" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="department">Department</Label>
                      <Input
                        id="department"
                        placeholder="IT Department"
                        {...register("department")}
                      />
                      {errors.department && (
                        <p className="text-sm text-red-500">{errors.department.message}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="position">Position</Label>
                      <Input
                        id="position"
                        placeholder="System Administrator"
                        {...register("position")}
                      />
                      {errors.position && (
                        <p className="text-sm text-red-500">{errors.position.message}</p>
                      )}
                    </div>
                  </div>
                )}

                {/* Contact Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phoneNumber">Phone Number (Optional)</Label>
                    <Input
                      id="phoneNumber"
                      placeholder="+264 81 123 4567"
                      {...register("phoneNumber")}
                    />
                    {errors.phoneNumber && (
                      <p className="text-sm text-red-500">{errors.phoneNumber.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="address">Address (Optional)</Label>
                    <Input
                      id="address"
                      placeholder="123 Main Street, Windhoek"
                      {...register("address")}
                    />
                    {errors.address && (
                      <p className="text-sm text-red-500">{errors.address.message}</p>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}

          <Button 
            type="submit" 
            className="w-full" 
            disabled={isLoading}
          >
            {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {type === "sign-in" ? "Sign In" : "Create Account"}
          </Button>
        </form>
      </CardContent>

      <CardFooter className="flex flex-col space-y-4">
        <div className="text-center text-sm text-muted-foreground">
          {type === "sign-in" ? (
            <>
              Don't have an account?{" "}
              <Button variant="link" className="p-0" onClick={() => router.push("/sign-up")}>
                Sign up
              </Button>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <Button variant="link" className="p-0" onClick={() => router.push("/sign-in")}>
                Sign in
              </Button>
            </>
          )}
        </div>
      </CardFooter>
    </Card>
  );
};

export default AuthForm;