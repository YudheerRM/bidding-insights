"use client";

import React, { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { profileUpdateSchema, changePasswordSchema } from '@/lib/validations';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { Loader2, User, Lock, CreditCard, Shield, Building2, Eye } from 'lucide-react';

const SettingsPage = () => {
  const { data: session, update } = useSession();
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const profileForm = useForm({
    resolver: zodResolver(profileUpdateSchema),
    defaultValues: {
      name: session?.user?.name || '',
      companyName: session?.user?.companyName || '',
      // Add other default values as needed
    },
  });

  const passwordForm = useForm({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmNewPassword: '',
    },
  });

  const handleProfileUpdate = async (data: any) => {
    setIsUpdatingProfile(true);
    try {
      const response = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to update profile');
      }

      await update(); // Refresh session
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handlePasswordChange = async (data: any) => {
    setIsChangingPassword(true);
    try {
      const response = await fetch('/api/user/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to change password');
      }

      passwordForm.reset();
      toast.success('Password changed successfully');
    } catch (error) {
      toast.error('Failed to change password');
    } finally {
      setIsChangingPassword(false);
    }
  };

  const getUserTypeIcon = (userType: string) => {
    switch (userType) {
      case 'government_official':
        return <Shield className="w-4 h-4" />;
      case 'bidder':
        return <Building2 className="w-4 h-4" />;
      case 'admin':
        return <Shield className="w-4 h-4" />;
      case 'viewer':
        return <Eye className="w-4 h-4" />;
      default:
        return <User className="w-4 h-4" />;
    }
  };

  const getUserTypeLabel = (userType: string) => {
    switch (userType) {
      case 'government_official':
        return 'Government Official';
      case 'bidder':
        return 'Bidder';
      case 'admin':
        return 'Administrator';
      case 'viewer':
        return 'Viewer';
      default:
        return userType;
    }
  };

  const getSubscriptionColor = (tier: string) => {
    switch (tier) {
      case 'basic':
        return 'secondary';
      case 'premium':
        return 'default';
      case 'enterprise':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  if (!session) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Account Settings</h1>
          <p className="text-muted-foreground">
            Manage your account settings and preferences
          </p>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="subscription">Subscription</TabsTrigger>
            <TabsTrigger value="account">Account</TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>
                  Update your personal information and preferences
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={profileForm.handleSubmit(handleProfileUpdate)} className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <Avatar className="w-20 h-20">
                      <AvatarImage src={session.user.image || ''} />
                      <AvatarFallback className="text-lg">
                        {session.user.name?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="text-lg font-semibold">{session.user.name}</h3>
                      <p className="text-muted-foreground">{session.user.email}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="outline" className="flex items-center gap-1">
                          {getUserTypeIcon(session.user.userType)}
                          {getUserTypeLabel(session.user.userType)}
                        </Badge>
                        {session.user.userType === 'bidder' && (
                          <Badge variant={getSubscriptionColor(session.user.subscriptionTier)}>
                            {session.user.subscriptionTier?.toUpperCase()}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input
                        id="name"
                        {...profileForm.register('name')}
                      />
                      {profileForm.formState.errors.name && (
                        <p className="text-sm text-red-500">
                          {profileForm.formState.errors.name.message}
                        </p>
                      )}
                    </div>

                    {(session.user.userType === 'bidder' || session.user.companyName) && (
                      <div className="space-y-2">
                        <Label htmlFor="companyName">Company Name</Label>
                        <Input
                          id="companyName"
                          {...profileForm.register('companyName')}
                        />
                      </div>
                    )}

                    <div className="space-y-2">
                      <Label htmlFor="phoneNumber">Phone Number</Label>
                      <Input
                        id="phoneNumber"
                        {...profileForm.register('phoneNumber')}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="address">Address</Label>
                      <Input
                        id="address"
                        {...profileForm.register('address')}
                      />
                    </div>
                  </div>

                  <Button type="submit" disabled={isUpdatingProfile}>
                    {isUpdatingProfile && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    Update Profile
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="w-5 h-5" />
                  Security Settings
                </CardTitle>
                <CardDescription>
                  Change your password and manage security preferences
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={passwordForm.handleSubmit(handlePasswordChange)} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">Current Password</Label>
                    <Input
                      id="currentPassword"
                      type="password"
                      {...passwordForm.register('currentPassword')}
                    />
                    {passwordForm.formState.errors.currentPassword && (
                      <p className="text-sm text-red-500">
                        {passwordForm.formState.errors.currentPassword.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="newPassword">New Password</Label>
                    <Input
                      id="newPassword"
                      type="password"
                      {...passwordForm.register('newPassword')}
                    />
                    {passwordForm.formState.errors.newPassword && (
                      <p className="text-sm text-red-500">
                        {passwordForm.formState.errors.newPassword.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmNewPassword">Confirm New Password</Label>
                    <Input
                      id="confirmNewPassword"
                      type="password"
                      {...passwordForm.register('confirmNewPassword')}
                    />
                    {passwordForm.formState.errors.confirmNewPassword && (
                      <p className="text-sm text-red-500">
                        {passwordForm.formState.errors.confirmNewPassword.message}
                      </p>
                    )}
                  </div>

                  <Button type="submit" disabled={isChangingPassword}>
                    {isChangingPassword && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    Change Password
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="subscription">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  Subscription & Billing
                </CardTitle>
                <CardDescription>
                  Manage your subscription and billing information
                </CardDescription>
              </CardHeader>
              <CardContent>
                {session.user.userType === 'bidder' ? (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h3 className="font-semibold">Current Plan</h3>
                        <p className="text-muted-foreground">
                          {session.user.subscriptionTier?.toUpperCase()} Plan
                        </p>
                      </div>
                      <Badge variant={getSubscriptionColor(session.user.subscriptionTier)}>
                        {session.user.subscriptionTier?.toUpperCase()}
                      </Badge>
                    </div>

                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <h4 className="font-semibold text-yellow-800">Development Environment</h4>
                      <p className="text-yellow-700 mt-1">
                        Payment integration is not yet implemented. The final payment gateway
                        will be determined by the project owner.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {['basic', 'premium', 'enterprise'].map((tier) => (
                        <Card 
                          key={tier}
                          className={`${
                            session.user.subscriptionTier === tier 
                              ? 'border-primary bg-primary/5' 
                              : ''
                          }`}
                        >
                          <CardContent className="p-4">
                            <h4 className="font-semibold capitalize">{tier}</h4>
                            <p className="text-sm text-muted-foreground mt-1">
                              {tier === 'basic' && 'Basic features - Free'}
                              {tier === 'premium' && 'Advanced features - $29/month'}
                              {tier === 'enterprise' && 'Full access - $99/month'}
                            </p>
                            {session.user.subscriptionTier === tier && (
                              <Badge className="mt-2">Current</Badge>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">
                      Subscription management is only available for bidder accounts.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="account">
            <Card>
              <CardHeader>
                <CardTitle>Account Information</CardTitle>
                <CardDescription>
                  View your account details and status
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Email Address</Label>
                      <p className="text-sm">{session.user.email}</p>
                    </div>
                    <div>
                      <Label>Account Type</Label>
                      <p className="text-sm flex items-center gap-2">
                        {getUserTypeIcon(session.user.userType)}
                        {getUserTypeLabel(session.user.userType)}
                      </p>
                    </div>
                    <div>
                      <Label>Account Status</Label>
                      <Badge variant="default">Active</Badge>
                    </div>
                    {session.user.userType === 'bidder' && (
                      <div>
                        <Label>Subscription</Label>
                        <Badge variant={getSubscriptionColor(session.user.subscriptionTier)}>
                          {session.user.subscriptionTier?.toUpperCase()}
                        </Badge>
                      </div>
                    )}
                  </div>

                  <Separator />

                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <h4 className="font-semibold text-red-800">Danger Zone</h4>
                    <p className="text-red-700 mt-1 mb-3">
                      Once you delete your account, there is no going back. Please be certain.
                    </p>
                    <Button variant="destructive" size="sm">
                      Delete Account
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default SettingsPage;
