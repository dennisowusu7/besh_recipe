'use client';
import { useState, useEffect } from 'react';
import { FaGithub } from 'react-icons/fa';
import { FcGoogle } from 'react-icons/fc';
import { FiEye, FiEyeOff, FiX } from 'react-icons/fi';
import { useForm } from 'react-hook-form';
import { signIn, signOut } from 'next-auth/react';
import { toast } from 'react-hot-toast';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { SigningFormData } from '@/lib/types';


const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Partial<SigningFormData>>({});
  const router = useRouter();
  const searchParams = useSearchParams();

  const { register, handleSubmit, watch, formState: { errors: formErrors } } = useForm<SigningFormData>({
    mode: 'onChange'
  });

  const email = watch('email');
  const password = watch('password');

  useEffect(() => {
    const errorParam = searchParams.get('error');
    if (errorParam === 'AccountInactive') {
      toast.error('Your account is currently inactive', { id: 'signin' });
      toast.custom(
        (t) => (
          <div className='bg-amber-500/20 border border-amber-500/30 text-amber-200 p-4 rounded-lg max-w-sm'>
            <p className='font-semibold mb-2'>Account Status: Inactive</p>
            <p className='text-sm mb-3'>Your account has been deactivated by an administrator.</p>
            <p className='text-sm mb-3'><strong>Steps to follow:</strong></p>
            <ul className='text-sm list-disc list-inside mb-3 space-y-1'>
              <li>Contact the administrator to reactivate your account</li>
              <li>Provide your email address for verification</li>
              <li>Wait for confirmation and then try signing in again</li>
            </ul>
            <button
              onClick={() => toast.dismiss(t.id)}
              className='text-xs text-amber-300 hover:text-amber-200 underline'
            >
              Dismiss
            </button>
          </div>
        ),
        { duration: 8000 }
      );
    }
  }, [searchParams]);

  const validateForm = (data: SigningFormData) => {
    const newErrors: Partial<SigningFormData> = {};

    if (!data.email?.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!data.password) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const signInWithCredential = async (data: SigningFormData) => {
    if (!validateForm(data)) {
      toast.error('Please fix the errors above', { id: 'signin' });
      return;
    }

    if (isSubmitting) return;
    setIsSubmitting(true);
    toast.loading('Signing in...', { id: 'signin' });

    try {
      const result = await signIn('credentials', {
        email: data.email.trim().toLowerCase(),
        password: data.password,
        redirect: false,
      });

      if (result?.error) {
        if (result.error === 'ACCOUNT_INACTIVE') {
          toast.error('Your account is currently inactive', { id: 'signin' });
          toast.custom(
            (t) => (
              <div className='bg-amber-500/20 border border-amber-500/30 text-amber-200 p-4 rounded-lg max-w-sm'>
                <p className='font-semibold mb-2'>Account Status: Inactive</p>
                <p className='text-sm mb-3'>Your account has been deactivated by an administrator.</p>
                <p className='text-sm mb-3'><strong>Steps to follow:</strong></p>
                <ul className='text-sm list-disc list-inside mb-3 space-y-1'>
                  <li>Contact the administrator to reactivate your account</li>
                  <li>Provide your email address for verification</li>
                  <li>Wait for confirmation and then try signing in again</li>
                </ul>
                <button
                  onClick={() => toast.dismiss(t.id)}
                  className='text-xs text-amber-300 hover:text-amber-200 underline'
                >
                  Dismiss
                </button>
              </div>
            ),
            { duration: 8000 }
          );
        } else {
          toast.error('Invalid email or password', { id: 'signin' });
        }
        setIsSubmitting(false);
        return;
      }

      toast.success('Signed in successfully!', { id: 'signin' });
      router.replace('/');
      router.refresh();
    } catch (err) {
      console.error('Error signing in with credentials', err);
      toast.error('Failed to sign in. Please try again.', { id: 'signin' });
      setIsSubmitting(false);
    }
  };

  const oAuthSignIn = async (type: 'google' | 'github') => {
    try {
      toast.loading(`Signing in with ${type}...`, { id: 'signin' });
      await signOut({ redirect: false });

      if (type === 'github') {
        await signIn('github', { callbackUrl: '/' }, { prompt: 'login' });
      } else {
        await signIn(
          'google',
          { callbackUrl: '/' },
          {
            prompt: 'consent select_account',
          }
        );
      }
    } catch (err) {
      console.error('OAuth sign in error:', err);
      toast.error(`Failed to sign in with ${type}`, { id: 'signin' });
    }
  };

  return (
    <section className='min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8'>
      <div className='w-full max-w-md'>
        <div className='bg-slate-800 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-slate-700'>
         
          <div className='mb-8 text-center'>
            <h1 className='text-3xl font-bold bg-gradient-to-r from-pink-400 to-violet-400 bg-clip-text text-transparent mb-2'>
              Welcome Back
            </h1>
            <p className='text-gray-400 text-sm'>Sign in to your Besh Recipes account</p>
          </div>

          
          <form onSubmit={handleSubmit(signInWithCredential)} className='space-y-5'>
            
            <div>
              <label htmlFor='email' className='block text-sm font-semibold text-gray-300 mb-2'>
                Email Address
              </label>
              <input
                id='email'
                type='email'
                placeholder='you@example.com'
                {...register('email', {
                  required: 'Email is required',
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: 'Please enter a valid email',
                  },
                })}
                className={`w-full px-4 py-3 rounded-lg bg-slate-700 border-2 transition-all duration-200 text-white placeholder-gray-500 focus:outline-none ${
                  errors.email
                    ? 'border-red-500 focus:border-red-400'
                    : 'border-slate-600 focus:border-violet-500'
                }`}
              />
              {errors.email && (
                <p className='text-red-400 text-xs mt-1 flex items-center gap-1'>
                  <FiX size={14} /> {errors.email}
                </p>
              )}
            </div>

            
            <div>
              <div className='flex items-center justify-between mb-2'>
                <label htmlFor='password' className='block text-sm font-semibold text-gray-300'>
                  Password
                </label>
                <Link
                  href='#'
                  className='text-xs text-violet-400 hover:text-violet-300 transition-colors'
                >
                  Forgot?
                </Link>
              </div>
              <div className='relative'>
                <input
                  id='password'
                  type={showPassword ? 'text' : 'password'}
                  placeholder='Enter your password'
                  {...register('password', {
                    required: 'Password is required',
                  })}
                  className={`w-full px-4 py-3 rounded-lg bg-slate-700 border-2 transition-all duration-200 text-white placeholder-gray-500 focus:outline-none pr-12 ${
                    errors.password
                      ? 'border-red-500 focus:border-red-400'
                      : 'border-slate-600 focus:border-violet-500'
                  }`}
                />
                <button
                  type='button'
                  onClick={() => setShowPassword(!showPassword)}
                  className='absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300 transition-colors'
                  aria-label='Toggle password visibility'
                >
                  {showPassword ? <FiEyeOff size={20} className='cursor-pointer' /> : <FiEye size={20} className='cursor-pointer' />}
                </button>
              </div>
              {errors.password && (
                <p className='text-red-400 text-xs mt-1 flex items-center gap-1'>
                  <FiX size={14} className='cursor-pointer' /> {errors.password}
                </p>
              )}
            </div>

            
            <div className='flex items-center'>
              <input
                id='rememberMe'
                type='checkbox'
                {...register('rememberMe')}
                className='w-4 h-4 text-violet-600 bg-slate-700 border-slate-600 rounded cursor-pointer focus:ring-2 focus:ring-violet-500'
              />
              <label htmlFor='rememberMe' className='ml-2 text-sm text-gray-400 cursor-pointer'>
                Remember me
              </label>
            </div>

            
            <button
              type='submit'
              disabled={isSubmitting}
              className='w-full cursor-pointer bg-gradient-to-r from-violet-600 to-pink-600 hover:from-violet-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl mt-6'
            >
              {isSubmitting ? (
                <span className='flex items-center justify-center gap-2'>
                  <div className='w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin' />
                  Signing in...
                </span>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          
          <div className='flex items-center gap-3 my-6'>
            <div className='flex-1 h-px bg-slate-700' />
            <span className='text-gray-500 text-sm font-medium'>or continue with</span>
            <div className='flex-1 h-px bg-slate-700' />
          </div>

          
          <div className='space-y-3'>
            <button
              onClick={() => oAuthSignIn('google')}
              disabled={isSubmitting}
              className='w-full cursor-pointer flex items-center justify-center gap-2 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg transition-all duration-300 border border-slate-600 hover:border-slate-500'
            >
              <FcGoogle size={20} />
              <span>Continue with Google</span>
            </button>

            <button
              onClick={() => oAuthSignIn('github')}
              disabled={isSubmitting}
              className='w-full cursor-pointer flex items-center justify-center gap-2 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg transition-all duration-300 border border-slate-600 hover:border-slate-500'
            >
              <FaGithub size={20} />
              <span>Continue with GitHub</span>
            </button>
          </div>

          
          <div className='mt-8 text-center border-t border-slate-700 pt-6'>
            <p className='text-gray-400 text-sm'>
              Don't have an account?{' '}
              <Link
                href='/register'
                className='text-violet-400 hover:text-violet-300 font-semibold transition-colors'
              >
                Sign Up
              </Link>
            </p>
          </div>
        </div>

        
        <p className='text-center text-gray-500 text-xs mt-6'>
          By signing in, you agree to our <Link href='/terms' className='text-violet-400 hover:text-violet-300 font-semibold transition-colors'>Terms of Service</Link> and <Link href='/privacy' className='text-violet-400 hover:text-violet-300 font-semibold transition-colors'>Privacy Policy</Link>
        </p>
      </div>
    </section>
  );
};

export default LoginPage;
