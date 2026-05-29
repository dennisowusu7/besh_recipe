'use client';
import { useState } from 'react';
import { FaGithub } from 'react-icons/fa';
import { FcGoogle } from 'react-icons/fc';
import { FiEye, FiEyeOff, FiCheck, FiX } from 'react-icons/fi';
import { useForm } from 'react-hook-form';
import { signIn } from 'next-auth/react';
import { toast } from 'react-hot-toast';
import Link from 'next/link';
import { RegistrationFormData } from '@/lib/types';



const RegisterPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [errors, setErrors] = useState<Partial<RegistrationFormData>>({});

  const { register, handleSubmit, watch, formState: { errors: formErrors } } = useForm<RegistrationFormData>({
    mode: 'onChange'
  });

  const password = watch('password');
  const confirmPassword = watch('confirmPassword');
  const email = watch('email');
  const name = watch('name');

  // Calculate password strength
  const calculatePasswordStrength = (pwd: string) => {
    let strength = 0;
    if (!pwd) return 0;
    if (pwd.length >= 6) strength++;
    if (pwd.length >= 8) strength++;
    if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) strength++;
    if (/\d/.test(pwd)) strength++;
    if (/[^a-zA-Z\d]/.test(pwd)) strength++;
    return Math.min(strength, 4);
  };

  // Update password strength on change
  const handlePasswordChange = () => {
    setPasswordStrength(calculatePasswordStrength(password));
  };

  const validateForm = (data: RegistrationFormData) => {
    const newErrors: Partial<RegistrationFormData> = {};

    if (!data.name?.trim()) {
      newErrors.name = 'Name is required';
    } else if (data.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    if (!data.email?.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!data.password) {
      newErrors.password = 'Password is required';
    } else if (data.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (!data.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (data.password !== data.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const signUpWithCredential = async (data: RegistrationFormData) => {
    if (!validateForm(data)) {
      toast.error('Please fix the errors above', { id: 'signup' });
      return;
    }

    toast.loading('Creating your account...', { id: 'signup' });
    setLoading(true);

    try {
      const result = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: data.name.trim(),
          email: data.email.trim().toLowerCase(),
          password: data.password,
        }),
      });

      const responseData = await result.json();

      if (!result.ok) {
        toast.error(responseData.message || 'Registration failed', { id: 'signup' });
        return;
      }

      toast.success('Account created successfully! Redirecting to login...', { id: 'signup' });
      
      // Redirect to login after 2 seconds
      setTimeout(() => {
        window.location.href = '/login';
      }, 2000);
    } catch (err) {
      console.error('Error signing up with credentials', err);
      toast.error('Failed to create account. Please try again.', { id: 'signup' });
    } finally {
      setLoading(false);
    }
  };

  const handleOAuthSignIn = async (type: 'google' | 'github') => {
    try {
      toast.loading(`Signing up with ${type}...`, { id: 'signin' });
      await signIn(type, {
        callbackUrl: '/',
      });
    } catch (err) {
      console.error('OAuth sign in error:', err);
      toast.error(`Failed to sign up with ${type}`, { id: 'signup' });
    }
  };

  const getPasswordStrengthColor = () => {
    const colors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-blue-500', 'bg-green-500'];
    return colors[passwordStrength] || 'bg-gray-500';
  };

  const getPasswordStrengthText = () => {
    const texts = ['', 'Weak', 'Fair', 'Good', 'Strong'];
    return texts[passwordStrength] || '';
  };

  return (
    <section className='min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8'>
      <div className='w-full max-w-md'>
        <div className='bg-slate-800 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-slate-700'>
          
          <div className='mb-8 text-center'>
            <h1 className='text-3xl font-bold bg-gradient-to-r from-pink-400 to-violet-400 bg-clip-text text-transparent mb-2'>
              Create Account
            </h1>
            <p className='text-gray-400 text-sm'>Join us and start cooking amazing recipes</p>
          </div>

          
          <form onSubmit={handleSubmit(signUpWithCredential)} className='space-y-5'>
            
            <div>
              <label htmlFor='name' className='block text-sm font-semibold text-gray-300 mb-2'>
                Full Name
              </label>
              <input
                id='name'
                type='text'
                placeholder='Sammy Junior Beshman'
                {...register('name', {
                  required: 'Name is required',
                  minLength: { value: 2, message: 'Name must be at least 2 characters' },
                })}
                className={`w-full px-4 py-3 rounded-lg bg-slate-700 border-2 transition-all duration-200 text-white placeholder-gray-500 focus:outline-none ${
                  errors.name
                    ? 'border-red-500 focus:border-red-400'
                    : 'border-slate-600 focus:border-violet-500'
                }`}
              />
              {errors.name && (
                <p className='text-red-400 text-xs mt-1 flex items-center gap-1'>
                  <FiX size={14} className='cursor-pointer' /> {errors.name}
                </p>
              )}
            </div>

            
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
                  <FiX size={14} className='cursor-pointer' /> {errors.email}
                </p>
              )}
            </div>

            
            <div>
              <label htmlFor='password' className='block text-sm font-semibold text-gray-300 mb-2'>
                Password
              </label>
              <div className='relative'>
                <input
                  id='password'
                  type={showPassword ? 'text' : 'password'}
                  placeholder='At least 6 characters'
                  {...register('password', {
                    required: 'Password is required',
                    minLength: { value: 6, message: 'Password must be at least 6 characters' },
                    onChange: handlePasswordChange,
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

              
              {password && (
                <div className='mt-3 space-y-2'>
                  <div className='flex items-center gap-2'>
                    <div className='flex-1 h-2 bg-slate-700 rounded-full overflow-hidden'>
                      <div
                        className={`h-full ${getPasswordStrengthColor()} transition-all duration-300`}
                        style={{ width: `${(passwordStrength / 4) * 100}%` }}
                      />
                    </div>
                    <span className={`text-xs font-semibold ${
                      passwordStrength === 1 ? 'text-red-400' :
                      passwordStrength === 2 ? 'text-orange-400' :
                      passwordStrength === 3 ? 'text-blue-400' :
                      'text-green-400'
                    }`}>
                      {getPasswordStrengthText()}
                    </span>
                  </div>
                  <p className='text-xs text-gray-400'>
                    💡 Use uppercase, lowercase, numbers and symbols for stronger passwords
                  </p>
                </div>
              )}

              {errors.password && (
                <p className='text-red-400 text-xs mt-1 flex items-center gap-1'>
                  <FiX size={14} className='cursor-pointer' /> {errors.password}
                </p>
              )}
            </div>

            
            <div>
              <label htmlFor='confirmPassword' className='block text-sm font-semibold text-gray-300 mb-2'>
                Confirm Password
              </label>
              <div className='relative'>
                <input
                  id='confirmPassword'
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder='Re-enter your password'
                  {...register('confirmPassword', {
                    required: 'Please confirm your password',
                  })}
                  className={`w-full px-4 py-3 rounded-lg bg-slate-700 border-2 transition-all duration-200 text-white placeholder-gray-500 focus:outline-none pr-12 ${
                    errors.confirmPassword || (password && confirmPassword && password !== confirmPassword)
                      ? 'border-red-500 focus:border-red-400'
                      : 'border-slate-600 focus:border-violet-500'
                  }`}
                />
                <button
                  type='button'
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className='absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300 transition-colors'
                  aria-label='Toggle confirm password visibility'
                >
                  {showConfirmPassword ? <FiEyeOff  size={20} className='cursor-pointer' /> : <FiEye size={20} className='cursor-pointer' />}
                </button>
              </div>
              {password && confirmPassword && password === confirmPassword && (
                <p className='text-green-400 text-xs mt-1 flex items-center gap-1'>
                  <FiCheck size={14} className='cursor-pointer' /> Passwords match
                </p>
              )}
              {errors.confirmPassword && (
                <p className='text-red-400 text-xs mt-1 flex items-center gap-1'>
                  <FiX size={14} className='cursor-pointer' /> {errors.confirmPassword}
                </p>
              )}
            </div>

            
            <button
              type='submit'
              disabled={loading}
              className='w-full cursor-pointer bg-gradient-to-r from-violet-600 to-pink-600 hover:from-violet-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl mt-6'
            >
              {loading ? (
                <span className='flex items-center justify-center gap-2'>
                  <div className='w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin' />
                  Creating Account...
                </span>
              ) : (
                'Create Account'
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
              onClick={() => handleOAuthSignIn('google')}
              disabled={loading}
              className='w-full cursor-pointer flex items-center justify-center gap-2 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg transition-all duration-300 border border-slate-600 hover:border-slate-500'
            >
              <FcGoogle size={20} />
              <span>Continue with Google</span>
            </button>

            <button
              onClick={() => handleOAuthSignIn('github')}
              disabled={loading}
              className='w-full cursor-pointer flex items-center justify-center gap-2 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg transition-all duration-300 border border-slate-600 hover:border-slate-500'
            >
              <FaGithub size={20} />
              <span>Continue with GitHub</span>
            </button>
          </div>

          
          <div className='mt-8 text-center border-t border-slate-700 pt-6'>
            <p className='text-gray-400 text-sm'>
              Already have an account?{' '}
              <Link
                href='/login'
                className='text-violet-400 hover:text-violet-300 font-semibold transition-colors'
              >
                Sign In
              </Link>
            </p>
          </div>
        </div>

        
        <p className='text-center text-gray-500 text-xs mt-6'>
          By creating an account, you agree to our <Link href='/terms' className='text-violet-400 hover:text-violet-300 font-semibold transition-colors'>Terms of Service</Link> and <Link href='/privacy' className='text-violet-400 hover:text-violet-300 font-semibold transition-colors'>Privacy Policy</Link>
        </p>
      </div>
    </section>
  );
};

export default RegisterPage;