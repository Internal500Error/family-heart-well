import React, { useState } from 'react';
import { Heart, User, Phone, ArrowRight, CheckCircle2, ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';

// ─── Types ────────────────────────────────────────────────────────────────────
interface LoginForm {
  name: string;
  phone: string;
}

type Step = 'credentials' | 'otp';

const DEFAULT_OTP = '2804';

// ─── Field Component ───────────────────────────────────────────────────────────
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
  const [form, setForm] = useState<LoginForm>({ name: '', phone: '' });
  const [errors, setErrors] = useState<Partial<LoginForm>>({});
  const [otpValue, setOtpValue] = useState(['', '', '', '']);
  const [otpError, setOtpError] = useState('');

  const update = (field: keyof LoginForm, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const validate = () => {
    const newErrors: Partial<LoginForm> = {};
    // if (!form.name.trim()) newErrors.name = 'Please enter your name';
    // if (!/^\+?[0-9]{10,13}$/.test(form.phone.replace(/\s/g, '')))
    //   newErrors.phone = 'Enter a valid phone number';
    // setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSendOtp = () => {
    if (validate()) setStep('otp');
  };

  const handleOtpChange = (i: number, val: string) => {
    if (!/^\d?$/.test(val)) return;
    const next = [...otpValue];
    next[i] = val;
    setOtpValue(next);
    setOtpError('');
    if (val && i < 3) {
      document.getElementById(`login-otp-${i + 1}`)?.focus();
    }
  };

  const handleOtpVerify = () => {
    const entered = otpValue.join('');
    if (entered === DEFAULT_OTP) {
      window.location.href = '/';
    } else {
      setOtpError('Invalid OTP. Please try again.');
      setOtpValue(['', '', '', '']);
      document.getElementById('login-otp-0')?.focus();
    }
  };

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
          <p className="text-white/70 text-sm mt-1">Welcome back 👋</p>
        </div>
      </div>

      {/* Card */}
      <div className="px-5 -mt-6 pb-8">
        <Card className="shadow-2xl border-0 rounded-2xl overflow-hidden">
          <CardContent className="p-6">

            {/* ── CREDENTIALS STEP ── */}
            {step === 'credentials' && (
              <div className="space-y-5">
                <div>
                  <h2 className="text-xl font-bold text-gray-800 mt-4">Log In</h2>
                  <p className="text-gray-500 text-sm mt-1">Enter your details to continue</p>
                </div>

                <Field label="Your Name" icon={User} placeholder="Rajesh Kumar"
                  value={form.name} onChange={e => update('name', e.target.value)}
                  error={errors.name} />

                <Field label="Phone Number" icon={Phone} placeholder="+91 98765 43210"
                  type="tel" value={form.phone}
                  onChange={e => update('phone', e.target.value)}
                  error={errors.phone} />

                <Button
                  onClick={handleSendOtp}
                  className="w-full h-12 rounded-xl text-base font-semibold border-0 mt-2"
                  style={{ background: 'linear-gradient(135deg, #646cffaa, #5915a7)' }}>
                  Send OTP <ArrowRight className="ml-2 h-4 w-4" />
                </Button>

                {/* Divider */}
                <div className="flex items-center space-x-3">
                  <div className="flex-1 h-px bg-gray-100" />
                  <span className="text-gray-400 text-xs">New to DilCare?</span>
                  <div className="flex-1 h-px bg-gray-100" />
                </div>

                <Button
                  variant="outline"
                  onClick={() => window.location.href = '/signup'}
                  className="w-full h-12 rounded-xl text-base font-semibold border-2 border-rose-200 text-rose-500 hover:bg-rose-50">
                  Create an Account
                </Button>
              </div>
            )}

            {/* ── OTP STEP ── */}
            {step === 'otp' && (
              <div className="space-y-6">
                <button
                  onClick={() => { setStep('credentials'); setOtpValue(['', '', '', '']); setOtpError(''); }}
                  className="flex items-center text-blue-500 text-sm font-medium -mt-1">
                  <ChevronLeft className="h-4 w-4 mr-1" /> Back
                </button>

                <div className="text-center">
                  <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-4">
                    <Phone className="h-8 w-8 text-blue-500" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-800">Enter OTP</h2>
                  <p className="text-gray-500 text-sm mt-2">
                    We sent a 4-digit code to<br />
                    <span className="font-semibold text-gray-700">{form.phone}</span>
                  </p>
                </div>

                {/* OTP Boxes */}
                <div className="flex justify-center space-x-3">
                  {otpValue.map((digit, i) => (
                    <input
                      key={i}
                      id={`login-otp-${i}`}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={e => handleOtpChange(i, e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Backspace' && !digit && i > 0) {
                          document.getElementById(`login-otp-${i - 1}`)?.focus();
                        }
                      }}
                      className={`w-14 h-16 text-center text-2xl font-bold rounded-xl border-2 outline-none transition-all
                        ${digit ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}
                        ${otpError ? 'border-red-400 bg-red-50' : ''}
                        focus:border-blue-500 focus:ring-2 focus:ring-blue-100`}
                    />
                  ))}
                </div>

                {otpError && (
                  <p className="text-center text-sm text-red-500 font-medium">{otpError}</p>
                )}

              <Button
                  onClick={handleOtpVerify}
                  disabled={otpValue.some(d => d === '')}
                  className="w-full h-12 rounded-xl text-base font-semibold border-0"
                  style={{ background: 'linear-gradient(135deg, #646cffaa, #5915a7)' }}>
                  <CheckCircle2 className="mr-2 h-4 w-4" /> Verify & Log In
                </Button>

                <p className="text-center text-sm text-gray-400">
                  Didn't receive the OTP?{' '}
                  <span
                    className="text-rose-500 font-semibold cursor-pointer"
                    onClick={() => {
                      setOtpValue(['', '', '', '']);
                      setOtpError('');
                    }}>
                    Resend
                  </span>
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Footer */}
        <p className="text-center text-xs text-gray-400 mt-6">
          Made with ❤️ by DilCare · v1.0
        </p>
      </div>
    </div>
  );
};

export default Login;