"use client";

import React from 'react';
import AuthForm from '@/components/AuthForm';
import { signInSchema } from '@/lib/validations';

const SignInPage = () => {
  const handleSubmit = async (data: any) => {
    // This will be handled by the AuthForm component using NextAuth
    console.log('Sign in data:', data);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <AuthForm
        type="sign-in"
        schema={signInSchema}
        onSubmit={handleSubmit}
      />
    </div>
  );
};

export default SignInPage;