import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Label } from '../components/ui/Label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/Card';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { Building2, Loader2, CheckCircle2, XCircle, Info } from 'lucide-react';

const registerSchema = z.object({
  name: z.string().min(2, { message: 'Company name is required' }),
  registrationNumber: z.string().min(2, { message: 'Registration number is required' }),
  pan: z.string().regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, { message: 'Invalid PAN format (e.g. ABCDE1234F)' }),
  email: z.string().email({ message: 'Invalid email address' }),
  phoneNumber: z.string().min(10, { message: 'Valid phone number is required' }),
  address: z.string().min(5, { message: 'Address is required' }),
  password: z.string().regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/, { message: 'Password must meet all format requirements' }),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export default function Register() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const [focusedField, setFocusedField] = useState(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(registerSchema),
    mode: "onChange",
  });

  const registerWithFocus = (fieldName) => {
    const registered = register(fieldName);
    return {
      ...registered,
      onFocus: (e) => {
        setFocusedField(fieldName);
        if (registered.onFocus) registered.onFocus(e);
      },
      onBlur: (e) => {
        setFocusedField(null);
        if (registered.onBlur) registered.onBlur(e);
      }
    };
  };

  const passwordValue = watch('password') || '';
  const confirmPasswordValue = watch('confirmPassword') || '';
  const passwordsMatch = passwordValue.length > 0 && confirmPasswordValue === passwordValue;
  
  const hasMinLength = passwordValue.length >= 8;
  const hasUppercase = /[A-Z]/.test(passwordValue);
  const hasLowercase = /[a-z]/.test(passwordValue);
  const hasNumber = /\d/.test(passwordValue);
  const hasSpecial = /[@$!%*?&#]/.test(passwordValue);

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      // Remove confirmPassword before sending to API
      const { confirmPassword, ...submitData } = data;
      await api.post('/auth/register', submitData);
      toast.success('Registration successful! Please login.');
      navigate('/login');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4 py-12">
      <Card className="w-full max-w-2xl border-white/60 bg-white/70 backdrop-blur-xl shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <div className="rounded-full bg-primary/10 p-3">
              <Building2 className="h-6 w-6 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">Register Company</CardTitle>
          <CardDescription>
            Create an account to verify your company details
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Company Name</Label>
                <Input
                  id="name"
                  placeholder="Acme Corp"
                  {...register('name')}
                  className={errors.name ? "border-destructive" : ""}
                />
                {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="registrationNumber">Registration Number</Label>
                <Input
                  id="registrationNumber"
                  placeholder="CIN/LLPIN"
                  {...register('registrationNumber')}
                  className={errors.registrationNumber ? "border-destructive" : ""}
                />
                {errors.registrationNumber && <p className="text-sm text-destructive">{errors.registrationNumber.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="pan">Company PAN</Label>
                <div className="relative">
                  <Input
                    id="pan"
                    placeholder="ABCDE1234F"
                    className={`uppercase ${errors.pan ? "border-destructive" : ""}`}
                    {...registerWithFocus('pan')}
                  />
                  {focusedField === 'pan' && (
                    <div className="absolute top-full left-0 w-full z-10 mt-1 flex items-start gap-1.5 text-xs text-slate-500 bg-white p-2.5 rounded-md border border-slate-200 shadow-md transition-all">
                      <Info className="h-4 w-4 text-blue-500 shrink-0 mt-0.5" />
                      <span><strong>Format:</strong> 5 Letters, 4 Numbers, 1 Letter<br/><span className="text-[10px] opacity-80">(e.g. ABCDE1234F)</span></span>
                    </div>
                  )}
                </div>
                {errors.pan && <p className="text-sm text-destructive mt-1">{errors.pan.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Official Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="contact@company.com"
                  {...register('email')}
                  className={errors.email ? "border-destructive" : ""}
                />
                {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phoneNumber">Phone Number</Label>
                <Input
                  id="phoneNumber"
                  placeholder="+91 9876543210"
                  {...register('phoneNumber')}
                  className={errors.phoneNumber ? "border-destructive" : ""}
                />
                {errors.phoneNumber && <p className="text-sm text-destructive">{errors.phoneNumber.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type="password"
                    {...registerWithFocus('password')}
                    className={errors.password ? "border-destructive" : ""}
                  />
                  
                  {focusedField === 'password' && (
                    <div className="absolute top-full left-0 w-full z-20 mt-1 bg-white p-3.5 rounded-md border border-slate-200 shadow-md transition-all">
                      <p className="text-xs font-semibold text-slate-700 mb-2">Password Requirements:</p>
                      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                        <li className={`flex items-center gap-1.5 ${hasMinLength ? 'text-emerald-600' : 'text-slate-500'}`}>
                          {hasMinLength ? <CheckCircle2 className="h-3.5 w-3.5" /> : <XCircle className="h-3.5 w-3.5 opacity-50" />} 8+ characters
                        </li>
                        <li className={`flex items-center gap-1.5 ${hasUppercase ? 'text-emerald-600' : 'text-slate-500'}`}>
                          {hasUppercase ? <CheckCircle2 className="h-3.5 w-3.5" /> : <XCircle className="h-3.5 w-3.5 opacity-50" />} 1 uppercase letter
                        </li>
                        <li className={`flex items-center gap-1.5 ${hasLowercase ? 'text-emerald-600' : 'text-slate-500'}`}>
                          {hasLowercase ? <CheckCircle2 className="h-3.5 w-3.5" /> : <XCircle className="h-3.5 w-3.5 opacity-50" />} 1 lowercase letter
                        </li>
                        <li className={`flex items-center gap-1.5 ${hasNumber ? 'text-emerald-600' : 'text-slate-500'}`}>
                          {hasNumber ? <CheckCircle2 className="h-3.5 w-3.5" /> : <XCircle className="h-3.5 w-3.5 opacity-50" />} 1 number
                        </li>
                        <li className={`flex items-center gap-1.5 sm:col-span-2 ${hasSpecial ? 'text-emerald-600' : 'text-slate-500'}`}>
                          {hasSpecial ? <CheckCircle2 className="h-3.5 w-3.5" /> : <XCircle className="h-3.5 w-3.5 opacity-50" />} 1 special char (@, $, !, %, *, ?, &, #)
                        </li>
                      </ul>
                    </div>
                  )}
                </div>
                {errors.password && <p className="text-sm text-destructive mt-1">{errors.password.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type="password"
                    {...registerWithFocus('confirmPassword')}
                    className={errors.confirmPassword ? "border-destructive" : ""}
                  />
                  
                  {focusedField === 'confirmPassword' && (
                    <div className="absolute top-full left-0 w-full z-10 mt-1 bg-white p-2.5 rounded-md border border-slate-200 shadow-md transition-all">
                      <p className={`flex items-center gap-1.5 text-xs font-medium ${passwordsMatch ? 'text-emerald-600' : 'text-slate-500'}`}>
                        {passwordsMatch ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4 opacity-50" />} Passwords match
                      </p>
                    </div>
                  )}
                </div>
                {errors.confirmPassword && <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Registered Address</Label>
              <Input
                id="address"
                placeholder="123 Business Park, City, State, ZIP"
                {...register('address')}
                className={errors.address ? "border-destructive" : ""}
              />
              {errors.address && <p className="text-sm text-destructive">{errors.address.message}</p>}
            </div>

            <Button 
              className="w-full bg-primary hover:bg-primary/90 transition-all hover:shadow-md hover:-translate-y-0.5" 
              type="submit" 
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating account...
                </>
              ) : (
                'Register Company'
              )}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <div className="text-sm text-muted-foreground">
            Already registered?{' '}
            <Link to="/login" className="text-primary hover:underline">
              Sign in
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
