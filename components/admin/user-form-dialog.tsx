"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, User, Building2, Shield, Eye } from "lucide-react";

interface User {
  id: string;
  email: string;
  name: string;
  userType: string;
  isActive: boolean;
  subscriptionTier?: string;
  companyName?: string;
  phoneNumber?: string;
  address?: string;
  department?: string;
  position?: string;
  governmentId?: string;
  businessRegistrationNumber?: string;
  taxId?: string;
  bidderCategory?: string;
  certifications?: string;
}

interface UserFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user?: User | null;
  onSuccess: () => void;
}

const userFormSchema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email"),
  name: z.string().min(1, "Name is required"),
  password: z.string().optional(),
  userType: z.enum(["admin", "government_official", "bidder", "viewer"]),
  isActive: z.boolean(),
  subscriptionTier: z.string().optional(),
  companyName: z.string().optional(),
  phoneNumber: z.string().optional(),
  address: z.string().optional(),
  department: z.string().optional(),
  position: z.string().optional(),
  governmentId: z.string().optional(),
  businessRegistrationNumber: z.string().optional(),
  taxId: z.string().optional(),
  bidderCategory: z.string().optional(),
  certifications: z.string().optional(),
});

type UserFormData = z.infer<typeof userFormSchema>;

export function UserFormDialog({ open, onOpenChange, user, onSuccess }: UserFormDialogProps) {
  const isEditing = !!user;
  const [showPassword, setShowPassword] = useState(!isEditing);

  const form = useForm<UserFormData>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      isActive: true,
      userType: "viewer",
    },
  });

  const { 
    register, 
    handleSubmit, 
    setValue, 
    watch, 
    reset, 
    formState: { errors } 
  } = form;

  const selectedUserType = watch("userType");

  useEffect(() => {
    if (user && isEditing) {
      // Pre-fill form with user data
      setValue("email", user.email);
      setValue("name", user.name);
      setValue("userType", user.userType as any);
      setValue("isActive", user.isActive);
      setValue("subscriptionTier", user.subscriptionTier || "");
      setValue("companyName", user.companyName || "");
      setValue("phoneNumber", user.phoneNumber || "");
      setValue("address", user.address || "");
      setValue("department", user.department || "");
      setValue("position", user.position || "");
      setValue("governmentId", user.governmentId || "");
      setValue("businessRegistrationNumber", user.businessRegistrationNumber || "");
      setValue("taxId", user.taxId || "");
      setValue("bidderCategory", user.bidderCategory || "");
      setValue("certifications", user.certifications || "");
      setShowPassword(false);
    } else {
      reset({
        isActive: true,
        userType: "viewer",
      });
      setShowPassword(true);
    }
  }, [user, isEditing, setValue, reset]);

  const createUserMutation = useMutation({
    mutationFn: async (data: UserFormData) => {
      const response = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create user");
      }
      return response.json();
    },
    onSuccess: () => {
      toast.success("User created successfully");
      onSuccess();
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const updateUserMutation = useMutation({
    mutationFn: async (data: UserFormData) => {
      const response = await fetch("/api/admin/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, id: user!.id }),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update user");
      }
      return response.json();
    },
    onSuccess: () => {
      toast.success("User updated successfully");
      onSuccess();
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const onSubmit = (data: UserFormData) => {
    // Remove empty password if editing
    if (isEditing && !data.password) {
      delete data.password;
    }

    if (isEditing) {
      updateUserMutation.mutate(data);
    } else {
      createUserMutation.mutate(data);
    }
  };

  const isLoading = createUserMutation.isPending || updateUserMutation.isPending;

  const getUserTypeIcon = (type: string) => {
    switch (type) {
      case "admin":
        return <Shield className="h-4 w-4 text-purple-600" />;
      case "government_official":
        return <Shield className="h-4 w-4 text-blue-600" />;
      case "bidder":
        return <Building2 className="h-4 w-4 text-emerald-600" />;
      case "viewer":
        return <Eye className="h-4 w-4 text-gray-600" />;
      default:
        return <User className="h-4 w-4" />;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            {isEditing ? "Edit User" : "Create New User"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update user information and permissions"
              : "Add a new user to the system"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="profile">Profile</TabsTrigger>
              <TabsTrigger value="specific">Type Specific</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Basic Information</CardTitle>
                  <CardDescription>
                    Essential user account details
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name *</Label>
                      <Input
                        id="name"
                        {...register("name")}
                        placeholder="Enter full name"
                      />
                      {errors.name && (
                        <p className="text-sm text-red-600">{errors.name.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address *</Label>
                      <Input
                        id="email"
                        type="email"
                        {...register("email")}
                        placeholder="Enter email address"
                      />
                      {errors.email && (
                        <p className="text-sm text-red-600">{errors.email.message}</p>
                      )}
                    </div>
                  </div>

                  {showPassword && (
                    <div className="space-y-2">
                      <Label htmlFor="password">
                        Password {!isEditing && "*"}
                      </Label>
                      <Input
                        id="password"
                        type="password"
                        {...register("password")}
                        placeholder={isEditing ? "Leave blank to keep current password" : "Enter password"}
                      />
                      {errors.password && (
                        <p className="text-sm text-red-600">{errors.password.message}</p>
                      )}
                    </div>
                  )}

                  {isEditing && !showPassword && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowPassword(true)}
                    >
                      Change Password
                    </Button>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="userType">User Type *</Label>
                      <Select
                        value={selectedUserType}
                        onValueChange={(value) => setValue("userType", value as any)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select user type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="viewer">
                            <div className="flex items-center gap-2">
                              {getUserTypeIcon("viewer")}
                              Viewer
                            </div>
                          </SelectItem>
                          <SelectItem value="bidder">
                            <div className="flex items-center gap-2">
                              {getUserTypeIcon("bidder")}
                              Bidder
                            </div>
                          </SelectItem>
                          <SelectItem value="government_official">
                            <div className="flex items-center gap-2">
                              {getUserTypeIcon("government_official")}
                              Government Official
                            </div>
                          </SelectItem>
                          <SelectItem value="admin">
                            <div className="flex items-center gap-2">
                              {getUserTypeIcon("admin")}
                              Administrator
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="isActive">Account Status</Label>
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="isActive"
                          checked={watch("isActive")}
                          onCheckedChange={(checked) => setValue("isActive", checked)}
                        />
                        <Label htmlFor="isActive" className="text-sm">
                          {watch("isActive") ? "Active" : "Inactive"}
                        </Label>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="profile" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Profile Information</CardTitle>
                  <CardDescription>
                    Additional user profile details
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="companyName">Company Name</Label>
                      <Input
                        id="companyName"
                        {...register("companyName")}
                        placeholder="Enter company name"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phoneNumber">Phone Number</Label>
                      <Input
                        id="phoneNumber"
                        {...register("phoneNumber")}
                        placeholder="Enter phone number"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address">Address</Label>
                    <Textarea
                      id="address"
                      {...register("address")}
                      placeholder="Enter address"
                      rows={3}
                    />
                  </div>

                  {selectedUserType === "bidder" && (
                    <div className="space-y-2">
                      <Label htmlFor="subscriptionTier">Subscription Tier</Label>
                      <Select
                        value={watch("subscriptionTier") || ""}
                        onValueChange={(value) => setValue("subscriptionTier", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select subscription tier" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="free">Free</SelectItem>
                          <SelectItem value="basic">Basic</SelectItem>
                          <SelectItem value="premium">Premium</SelectItem>
                          <SelectItem value="enterprise">Enterprise</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="specific" className="space-y-4">
              {selectedUserType === "government_official" && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Government Official Details</CardTitle>
                    <CardDescription>
                      Government-specific information
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="department">Department</Label>
                        <Input
                          id="department"
                          {...register("department")}
                          placeholder="Enter department"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="position">Position</Label>
                        <Input
                          id="position"
                          {...register("position")}
                          placeholder="Enter position"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="governmentId">Government ID</Label>
                      <Input
                        id="governmentId"
                        {...register("governmentId")}
                        placeholder="Enter government ID"
                      />
                    </div>
                  </CardContent>
                </Card>
              )}

              {selectedUserType === "bidder" && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Bidder Details</CardTitle>
                    <CardDescription>
                      Business and bidding information
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="businessRegistrationNumber">
                          Business Registration Number
                        </Label>
                        <Input
                          id="businessRegistrationNumber"
                          {...register("businessRegistrationNumber")}
                          placeholder="Enter registration number"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="taxId">Tax ID</Label>
                        <Input
                          id="taxId"
                          {...register("taxId")}
                          placeholder="Enter tax ID"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="bidderCategory">Bidder Category</Label>
                      <Input
                        id="bidderCategory"
                        {...register("bidderCategory")}
                        placeholder="Enter bidder category"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="certifications">Certifications</Label>
                      <Textarea
                        id="certifications"
                        {...register("certifications")}
                        placeholder="Enter certifications (separate with commas)"
                        rows={3}
                      />
                    </div>
                  </CardContent>
                </Card>
              )}

              {(selectedUserType === "admin" || selectedUserType === "viewer") && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Additional Information</CardTitle>
                    <CardDescription>
                      No additional fields required for this user type
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600">
                      {selectedUserType === "admin"
                        ? "Admin users have full system access and don't require additional profile information."
                        : "Viewer users have read-only access and don't require additional profile information."}
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>

          <div className="flex justify-end space-x-2 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {isEditing ? "Update User" : "Create User"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
