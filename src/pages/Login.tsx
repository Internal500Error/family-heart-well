import React, { useState } from 'react';
import { Heart, Mail, Lock, ArrowRight, Loader } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { authService } from '@/lib/api-client';

// Types 
interface LoginForm {
  email: string;
  password: string;
}

type Step = 'credentials' | 'loading';

// Field Component 
const Field = ({ label, icon: Icon, error, ...props }: {
  label: string; icon: React.ElementType; error?: string;
} & React.InputHTMLAttributes<HTMLInputElement>) => (
  <div className="space-y-1">
    <Label className="text-sm font-medium text-gray-700">{label}</Label>
    <div className="relative">
      <Icon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-blue-400" />
      <Input
        {...props}
        className={`pl-10 h-12 rounded-xl border-2 transition-all focus:border-blue-400 focus:ring-blue-100 ${error ? 'border-red-400' : 'border-gray-200'}`}
      />
    </div>
    {error && <p className="text-xs text-red-500">{error}</p>}
  </div>
);

// ─── Main Login Component ──────────────────────────────────────────────────────
const Login = () => {
  const [step, setStep] = useState<Step>('credentials');
  const [form, setForm] = useState<LoginForm>({ email: '', password: '' });
  const [errors, setErrors] = useState<Partial<LoginForm>>({});
  const [apiError, setApiError] = useState('');

  const update = (field: keyof LoginForm, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
    if (apiError) setApiError('');
  };

  const validate = () => {
    const newErrors: Partial<LoginForm> = {};
    if (!form.email.trim()) newErrors.email = 'Email is required';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) newErrors.email = 'Enter a valid email';
    if (!form.password) newErrors.password = 'Password is required';
    if (form.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validate()) return;
    
    setStep('loading');
    try {
      const response = await authService.login(form.email, form.password);

      if (response.error) {
        setApiError(response.error);
        setStep('credentials');
      } else if (response.data) {
        // Login successful - tokens are stored by authService
        // Redirect to home
        window.location.href = '/';
      }
    } catch (err: any) {
      setApiError(err.message || 'Login failed. Please try again.');
      setStep('credentials');
    }
  };

  const handleRegister = () => {
    window.location.href = '/signup';
  };

  if (step === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(160deg, #fff5f5 0%, #fff 60%)' }}>
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto" />
          <p className="text-gray-600 font-medium">Logging you in...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(160deg, #fff5f5 0%, #fff 60%)' }}>
      {/* Top gradient header */}
      <div className="h-52 relative overflow-hidden"
        style={{
      background: 'linear-gradient(135deg, #61dafbaa 0%, #646cffaa 40%, #5915a7 100%)'}}>

        {/* Decorative rings */}
        <div className="absolute -right-10 -top-10 w-40 h-40 rounded-full border-2 border-white/15" />
        <div className="absolute -right-4 top-8 w-24 h-24 rounded-full border-2 border-white/10" />
        <div className="absolute -left-6 bottom-0 w-28 h-28 rounded-full bg-white/10" />

        <div className="absolute inset-0 flex flex-col items-center justify-center">
          {/* Logo */}
          <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center mb-3 border border-white/30">
            <Heart className="h-9 w-9 text-white fill-white" />
          </div>
          <h1 className="text-3xl font-bold text-white" style={{ fontFamily: "'Poppins', sans-serif" }}>
            DilCare
          </h1>
          <p className="text-white/80 text-sm mt-1">Health care app for families</p>
        </div>
      </div>

      {/* Main section */}
      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <Card className="w-full max-w-sm border-0 shadow-xl rounded-3xl">
          <CardContent className="p-8">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome Back</h2>
              <p className="text-sm text-gray-600">Sign in to access your health information</p>
            </div>

            {apiError && (
              <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-sm text-red-700 mb-6">
                {apiError}
              </div>
            )}

            <div className="space-y-5 mb-8">
              <Field
                label="Email"
                icon={Mail}
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={(e) => update('email', e.target.value)}
                error={errors.email}
              />
              <Field
                label="Password"
                icon={Lock}
                type="password"
                placeholder="••••••••"
                value={form.password}
                onChange={(e) => update('password', e.target.value)}
                error={errors.password}
              />
            </div>

            <Button
              onClick={handleLogin}
              className="w-full h-12 rounded-xl font-semibold mb-4 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
            >
              Sign In
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>

            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">or</span>
              </div>
            </div>

            <Button
              variant="outline"
              onClick={handleRegister}
              className="w-full h-12 rounded-xl font-semibold border-2 border-gray-200 hover:border-blue-300 hover:bg-blue-50"
            >
              Create Account
            </Button>

            <p className="text-xs text-gray-500 text-center mt-6">
              <strong>Demo credentials:</strong><br />
              Email: test@example.com<br />
              Password: TestPass123!
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Login;