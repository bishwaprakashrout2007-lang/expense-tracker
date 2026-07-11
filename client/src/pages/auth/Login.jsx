import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import toast from 'react-hot-toast';
import { MdEmail, MdLock, MdAttachMoney } from 'react-icons/md';
import { FcGoogle } from 'react-icons/fc';
import { getRedirectResult, signInWithRedirect } from 'firebase/auth';
import { auth, googleProvider } from '../../firebase';

const Login = () => {
  const { login, loginWithFirebase } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const handleRedirectResult = async () => {
      try {
        const result = await getRedirectResult(auth);
        if (result?.user) {
          const res = await loginWithFirebase(result.user, 'google');
          if (res.success) {
            toast.success('Signed in with Google');
            navigate('/');
          } else {
            toast.error(res.message);
          }
        }
      } catch (error) {
        console.error('Google redirect sign-in failed:', error);
        toast.error(error.message || 'Google sign-in failed');
      }
    };

    handleRedirectResult();
  }, [loginWithFirebase, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please enter both email and password');
      return;
    }

    setLoading(true);
    const res = await login(email, password);
    setLoading(false);

    if (res.success) {
      toast.success('Welcome back to finsift!');
      navigate('/');
    } else {
      toast.error(res.message);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      await signInWithRedirect(auth, googleProvider);
    } catch (error) {
      setLoading(false);
      toast.error(error.message || 'Google sign-in failed');
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 overflow-hidden bg-alabaster dark:bg-charcoal">
      {/* Background blobs */}
      <div className="gradient-blob bg-brand-500 -top-40 -left-40 opacity-20" />
      <div className="gradient-blob bg-terracotta -bottom-40 -right-40 opacity-20" />

      <Card className="w-full max-w-md relative z-10 p-8">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 flex items-center justify-center bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200/50 dark:border-slate-700/50 p-2 mb-3">
            <img src="https://m.media-amazon.com/images/I/614y4xnqgdL.png" alt="finsift logo" className="w-full h-full object-contain" />
          </div>
          <h2 className="text-2xl font-extrabold text-charcoal dark:text-white tracking-tight">
            fin<span className="text-brand-500 dark:text-brand-400">sift</span>
          </h2>
          <p className="text-sm text-slate-400 dark:text-slate-500 font-medium mt-1">
            Access your SaaS wealth dashboard.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <Input
            label="Email Address"
            type="email"
            id="email"
            placeholder="name@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            icon={<MdEmail className="w-5 h-5" />}
            required
          />

          <Input
            label="Password"
            type="password"
            id="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            icon={<MdLock className="w-5 h-5" />}
            required
          />

          <div className="text-right">
            <Link
              to="/register"
              className="text-xs font-semibold text-brand-600 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300"
            >
              Don't have an account? Sign up
            </Link>
          </div>

          <Button
            type="submit"
            className="w-full py-3"
            loading={loading}
          >
            Sign In
          </Button>
        </form>

        <div className="mt-5">
          <Button
            type="button"
            variant="outline"
            className="w-full"
            loading={loading}
            onClick={handleGoogleLogin}
            icon={<FcGoogle className="w-5 h-5" />}
          >
            Continue with Google
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default Login;
