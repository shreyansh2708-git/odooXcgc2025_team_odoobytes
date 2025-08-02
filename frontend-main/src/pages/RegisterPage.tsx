import React from 'react';
import { AuthLayout } from "@/components/auth/AuthLayout";
import { RegisterForm } from "@/components/auth/RegisterForm";
import ThemeToggleButton from 'src/components/ui/ThemeToggleButton';
const RegisterPage: React.FC = () => {
  return (
    <AuthLayout
      title="Create Account"
      description="Join QuickDesk to start managing your support tickets efficiently"
    >
      <RegisterForm />
    </AuthLayout>
  );
};

export default RegisterPage;