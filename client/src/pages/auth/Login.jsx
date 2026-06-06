import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import toast from 'react-hot-toast';
import { MdEmail, MdLock, MdAttachMoney } from 'react-icons/md';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

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
      toast.success('Welcome back to FinanceFlow!');
      navigate('/');
    } else {
      toast.error(res.message);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 overflow-hidden bg-slate-50 dark:bg-slate-950">
      {/* Background blobs */}
      <div className="gradient-blob bg-brand-500 -top-40 -left-40 opacity-20" />
      <div className="gradient-blob bg-indigo-500 -bottom-40 -right-40 opacity-20" />

      <Card className="w-full max-w-md relative z-10 p-8">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="p-3 bg-gradient-brand rounded-2xl text-white shadow-lg shadow-brand-500/25 mb-3 animate-pulse-subtle">
            <MdAttachMoney className="w-8 h-8 rotate-12" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-800 dark:text-white tracking-tight">
            Finance<span className="text-brand-650 dark:text-brand-450">Flow</span>
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
      </Card>
    </div>
  );
};

export default Login;
