"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import AuthForm from '@/components/AuthForm';
import { signUpSchema } from '@/lib/validations';
import { toast } from 'sonner';

const SignUpPage = () => {
  const router = useRouter();

  const handleSubmit = async (data: any) => {
    try {
      const response = await fetch('/api/auth/sign-up', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create account');
      }

      toast.success('Account created successfully! Please sign in.');
      router.push('/sign-in');
    } catch (error) {
      console.error('Sign up error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to create account');
      throw error; // Re-throw to be handled by AuthForm
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <AuthForm
        type="sign-up"
        schema={signUpSchema}
        defaultValues={{
          subscriptionTier: 'basic',
        }}
        onSubmit={handleSubmit}
      />
    </div>
  );
};

export default SignUpPage;