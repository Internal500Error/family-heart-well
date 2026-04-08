import React, { useState, useEffect } from 'react';
import { Heart, User, Phone, Mail, MapPin, Calendar, ShieldAlert, Lock, ArrowRight, CheckCircle2, ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { authService } from '@/lib/api-client';

// ─── Types ────────────────────────────────────────────────────────────────────
interface SignupForm {
    name: string;
    dob: string;
    phone: string;
    email: string;
    address: string;
    emergencyContact: string;
    password: string;
    otp: string;
}

type Step = 'splash' | 'form' | 'otp' | 'success';

// ─── Splash Screen ─────────────────────────────────────────────────────────────
const SplashScreen = () => (
    <div className="min-h-screen inset-0 flex flex-col items-center justify-center z-50"
        style={{
            background: 'linear-gradient(135deg, #61dafbaa 0%, #646cffaa 40%, #5915a7 100%)',
        }}>
        {/* Animated rings */}
        <div className="relative flex items-center justify-center mb-8">
            <div className="absolute w-40 h-40 rounded-full border-2 border-white/20 animate-ping" style={{ animationDuration: '2s' }} />
            <div className="absolute w-32 h-32 rounded-full border-2 border-white/30 animate-ping" style={{ animationDuration: '2s', animationDelay: '0.3s' }} />
            <div className="w-24 h-24 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border-2 border-white/40">
                <Heart className="h-12 w-12 text-white fill-white" />
            </div>
        </div>

        <h1 className="text-5xl font-bold text-white tracking-tight mb-3"
            style={{ fontFamily: "'Poppins', sans-serif", textShadow: '0 2px 20px rgba(0,0,0,0.2)' }}>
            DilCare
        </h1>
        <p className="text-white/80 text-lg font-light tracking-widest uppercase">
            Your Heart, Our Priority
        </p>

        {/* Loading dots */}
        <div className="flex space-x-2 mt-16">
            {[0, 1, 2].map(i => (
                <div key={i} className="w-2 h-2 rounded-full bg-white/70"
                    style={{ animation: 'bounce 1.4s infinite', animationDelay: `${i * 0.2}s` }} />
            ))}
        </div>

        <style>{`
      @keyframes bounce {
        0%, 80%, 100% { transform: translateY(0); opacity: 0.5; }
        40% { transform: translateY(-8px); opacity: 1; }
      }
    `}</style>
    </div>
);

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

// ─── Progress Bar ──────────────────────────────────────────────────────────────
const ProgressBar = ({ step }: { step: 'form' | 'otp' | 'success' }) => {
    const steps = ['Details', 'Verify', 'Done'];
    const current = step === 'form' ? 0 : step === 'otp' ? 1 : 2;
    return (
        <div className="flex items-center justify-between mb-6 px-2">
            {steps.map((s, i) => (
                <React.Fragment key={s}>
                    <div className="flex flex-col items-center">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-500 ${i <= current ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-400'
                            }`}>
                            {i < current ? <CheckCircle2 className="h-4 w-4" /> : i + 1}
                        </div>
                        <span className={`text-xs mt-1 ${i <= current ? 'text-blue-500 font-medium' : 'text-gray-400'}`}>{s}</span>
                    </div>
                    {i < steps.length - 1 && (
                        <div className={`flex-1 h-0.5 mx-2 mb-4 transition-all duration-700 ${i < current ? 'bg-blue-500' : 'bg-gray-200'}`} />
                    )}
                </React.Fragment>
            ))}
        </div>
    );
};

// ─── Main Signup Component ─────────────────────────────────────────────────────
const Signup = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState<Step>('splash');
    const [errors, setErrors] = useState<Partial<SignupForm>>({});
    const [otpValue, setOtpValue] = useState(['', '', '', '']);
    const [otpError, setOtpError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [apiError, setApiError] = useState('');
    const [form, setForm] = useState<SignupForm>({
        name: '', dob: '', phone: '', email: '',
        address: '', emergencyContact: '', password: '', otp: ''
    });

    // Auto-advance splash after 3 seconds
    useEffect(() => {
        const timer = setTimeout(() => setStep('form'), 3000);
        return () => clearTimeout(timer);
    }, []);

    const update = (field: keyof SignupForm, value: string) => {
        setForm(prev => ({ ...prev, [field]: value }));
        if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
        setApiError('');
    };

    const validate = (): boolean => {
        const newErrors: Partial<SignupForm> = {};
        if (!form.name.trim()) newErrors.name = 'Full name is required';
        if (!form.email.trim()) newErrors.email = 'Email is required';
        if (!/\S+@\S+\.\S+/.test(form.email)) newErrors.email = 'Enter a valid email';
        if (!form.password.trim()) newErrors.password = 'Password is required';
        if (form.password.length < 6) newErrors.password = 'Minimum 6 characters';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleFormSubmit = async () => {
        if (!validate()) return;
        
        setIsLoading(true);
        setApiError('');
        
        try {
            const response = await authService.register(form.email, form.password, form.name);
            if (response.error) {
                setApiError(response.error);
                return;
            }
            // Skip OTP for now and go straight to success
            setStep('success');
        } catch (error) {
            setApiError('An unexpected error occurred. Please try again.');
            console.error('Registration error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleOtpChange = (i: number, val: string) => {
        if (!/^\d?$/.test(val)) return;
        const next = [...otpValue];
        next[i] = val;
        setOtpValue(next);
        setOtpError('');
        if (val && i < 3) {
            document.getElementById(`otp-${i + 1}`)?.focus();
        }
    };

    const handleOtpVerify = () => {
        const entered = otpValue.join('');
        if (entered === '2804') {
            setStep('success');
        } else {
            setOtpError('Invalid OTP. Please try again.');
            setOtpValue(['', '', '', '']);
            document.getElementById('otp-0')?.focus();
        }
    };

    const handleLoginRedirect = () => {
        navigate('/');
    };
    
    const handleSuccessRedirect = () => {
        navigate('/index');
    };

    // ── Splash ──
    if (step === 'splash') return <SplashScreen />;

    // ── Success ──
    if (step === 'success') {
        return (
            <div className="min-h-screen bg-gradient-to-br from-primary/20 via-white to-accent/20">
                <div className="max-w-lg mx-auto px-4 py-6 space-y-5 text-center animate-fade-in-up">

                    <div className="w-24 h-24 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
                        <CheckCircle2 className="h-12 w-12 text-green-500" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">You're all set!</h2>
                    <p className="text-gray-500 mb-8">Account created successfully.<br />Welcome to the DilCare family 💖</p>
                    <Button
                        onClick={handleSuccessRedirect}
                        style={{ background: 'linear-gradient(135deg, #646cffaa, #5915a7)' }}
                    >
                        Go to Dashboard <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen" style={{ background: 'linear-gradient(160deg, #fff5f5 0%, #fff 60%)' }}>
            {/* Top gradient header */}
            <div className="h-36 relative overflow-hidden"
                style={{
                    background: 'linear-gradient(135deg, #61dafbaa 0%, #646cffaa 40%, #5915a7 100%)',
                }}>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <div className="flex items-center space-x-2">
                        <Heart className="h-7 w-7 text-white fill-white" />
                        <span className="text-3xl font-bold text-white" style={{ fontFamily: "'Poppins', sans-serif" }}>DilCare</span>
                    </div>
                    <p className="text-white/70 text-sm mt-1">Create your health profile</p>
                </div>
                {/* Decorative circles */}
                <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full bg-white/10" />
                <div className="absolute -left-4 bottom-0 w-20 h-20 rounded-full bg-white/10" />
            </div>

            <div className="px-5 py-6 -mt-4">
                <Card className="shadow-xl border-0 rounded-2xl overflow-hidden">
                    <CardContent className="p-6">
                        <ProgressBar step={step === 'form' ? 'form' : step === 'otp' ? 'otp' : 'success'} />

                        {/* ── FORM STEP ── */}
                        {step === 'form' && (
                            <div className="space-y-4">
                                <h2 className="text-xl font-bold text-gray-800 mb-4">Create Your Account</h2>

                                {apiError && (
                                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
                                        {apiError}
                                    </div>
                                )}

                                <Field label="Full Name *" icon={User} placeholder="Rajesh Kumar"
                                    value={form.name} onChange={e => update('name', e.target.value)}
                                    error={errors.name} />

                                <Field label="Email Address *" icon={Mail} placeholder="you@email.com"
                                    type="email" value={form.email} onChange={e => update('email', e.target.value)}
                                    error={errors.email} />

                                <Field label="Password *" icon={Lock} placeholder="Min. 6 characters"
                                    type="password" value={form.password}
                                    onChange={e => update('password', e.target.value)}
                                    error={errors.password} />

                                <Button onClick={handleFormSubmit}
                                    disabled={isLoading}
                                    className="w-full h-12 rounded-xl text-base font-semibold border-0 mt-2"
                                    style={{ background: 'linear-gradient(135deg, #646cffaa, #5915a7)' }}>
                                    {isLoading ? 'Creating Account...' : 'Create Account'} <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>

                                <p className="text-center text-sm text-gray-500 pt-1">
                                    Already have an account?{' '}
                                    <span className="text-blue-500 font-semibold cursor-pointer" onClick={handleLoginRedirect}>
                                        Log In
                                    </span>
                                </p>
                            </div>
                        )}

                        {/* ── OTP STEP ── */}
                        {step === 'otp' && (
                            <div className="space-y-6">
                                <button onClick={() => setStep('form')}
                                    className="flex items-center text-blue-500 text-sm font-medium -mt-2 mb-2">
                                    <ChevronLeft className="h-4 w-4 mr-1" /> Back
                                </button>

                                <div className="text-center">
                                    <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-4">
                                        <Phone className="h-8 w-8 text-blue-500" />
                                    </div>
                                    <h2 className="text-xl font-bold text-gray-800">Verify Phone Number</h2>
                                    <p className="text-gray-500 text-sm mt-2">
                                        We sent a 4-digit OTP to<br />
                                        <span className="font-semibold text-gray-700">{form.phone}</span>
                                    </p>
                                </div>

                                {/* OTP Boxes */}
                                <div className="flex justify-center space-x-3">
                                    {otpValue.map((digit, i) => (
                                        <input
                                            key={i}
                                            id={`otp-${i}`}
                                            type="text"
                                            inputMode="numeric"
                                            maxLength={1}
                                            value={digit}
                                            onChange={e => handleOtpChange(i, e.target.value)}
                                            onKeyDown={e => {
                                                if (e.key === 'Backspace' && !digit && i > 0) {
                                                    document.getElementById(`otp-${i - 1}`)?.focus();
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

                                <p className="text-center text-xs text-gray-400">
                                    Default OTP for testing: <span className="font-mono font-bold text-blue-500">2804</span>
                                </p>

                                <Button
                                    onClick={handleOtpVerify}
                                    disabled={otpValue.some(d => d === '')}
                                    className="w-full h-12 rounded-xl text-base font-semibold border-0"
                                    style={{ background: 'linear-gradient(135deg, #646cffaa, #5915a7)' }}>
                                    Verify & Create Account
                                </Button>

                                <p className="text-center text-sm text-gray-400">
                                    Didn't receive the OTP?{' '}
                                    <span className="text-rose-500 font-semibold cursor-pointer">Resend</span>
                                </p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default Signup;