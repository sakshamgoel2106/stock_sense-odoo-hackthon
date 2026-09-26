import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../lib/api';
import { Package } from 'lucide-react';

const ForgotPassword = () => {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    let interval = null;
    if (timer > 0) {
      interval = setInterval(() => setTimer((t) => t - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const handleRequestOtp = async (e) => {
    e?.preventDefault();
    try {
      setLoading(true);
      setError(null);
      setMessage(null);
      const res = await api.post('/auth/forgot-password', { email });
      setMessage(res.data.message || 'OTP sent successfully');
      setStep(2);
      setTimer(60);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to request reset');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      setMessage(null);
      const res = await api.post('/auth/verify-otp', { email, otp });
      // Pass the resetToken to the ResetPassword route via state
      navigate('/reset-password', { state: { email, resetToken: res.data.resetToken } });
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to verify OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-xl shadow-lg">
        <div className="text-center">
          <Package className="mx-auto h-12 w-12 text-indigo-600" />
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">Reset your password</h2>
          <p className="mt-2 text-sm text-gray-600">
            {step === 1 ? "Enter your email and we'll send you an OTP." : "Enter the 6-digit OTP sent to your email."}
          </p>
        </div>
        
        {step === 1 ? (
          <form className="mt-8 space-y-6" onSubmit={handleRequestOtp}>
            {error && <div className="text-red-500 text-sm text-center bg-red-50 p-3 rounded-lg">{error}</div>}
            {message && <div className="text-green-600 text-sm text-center bg-green-50 p-3 rounded-lg">{message}</div>}
            <div className="rounded-md shadow-sm -space-y-px">
              <div>
                <input
                  name="email"
                  type="email"
                  required
                  className="appearance-none rounded-md relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>
            <div>
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-70 transition-colors"
              >
                {loading ? 'Sending...' : 'Send OTP'}
              </button>
            </div>
          </form>
        ) : (
          <form className="mt-8 space-y-6" onSubmit={handleVerifyOtp}>
            {error && <div className="text-red-500 text-sm text-center bg-red-50 p-3 rounded-lg">{error}</div>}
            {message && <div className="text-green-600 text-sm text-center bg-green-50 p-3 rounded-lg">{message}</div>}
            <div className="rounded-md shadow-sm -space-y-px">
              <div>
                <input
                  name="otp"
                  type="text"
                  required
                  maxLength={6}
                  className="appearance-none rounded-md relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm text-center tracking-widest text-lg font-mono"
                  placeholder="000000"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))}
                />
              </div>
            </div>
            <div>
              <button
                type="submit"
                disabled={loading || otp.length < 6}
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-70 transition-colors mb-3"
              >
                {loading ? 'Verifying...' : 'Verify OTP'}
              </button>
              
              <button
                type="button"
                onClick={handleRequestOtp}
                disabled={timer > 0 || loading}
                className="w-full flex justify-center py-2 px-4 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition-colors"
              >
                {timer > 0 ? `Resend OTP in ${timer}s` : 'Resend OTP'}
              </button>
            </div>
          </form>
        )}

        <div className="text-center mt-4">
          <p className="text-sm text-gray-600 mt-2">
            Remember your password?{' '}
            <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
