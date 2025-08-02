import React from 'react';
import { AuthLayout } from "@/components/auth/AuthLayout";
import { LoginForm } from "@/components/auth/LoginForm";
import ThemeToggleButton from 'src/components/ui/ThemeToggleButton';
const LoginPage: React.FC = () => {
  return (
    <AuthLayout
      title="Welcome Back"
      description="Sign in to your QuickDesk account to manage support tickets"
    >
      <LoginForm />
    </AuthLayout>
  );
};

export default LoginPage;