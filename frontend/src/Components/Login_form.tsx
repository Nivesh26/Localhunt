import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { sessionUtils } from '../utils/sessionUtils';

const Login_form = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Redirect if already logged in (check sessionStorage for this tab)
    const user = sessionUtils.getUser()
    if (user) {
      if (user.role === 'SUPERADMIN') {
        navigate('/admindashboard')
      } else if (user.role === 'VENDOR') {
        navigate('/sellerdashboard')
      } else {
        navigate('/')
      }
    }
  }, [navigate])

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { email?: string; password?: string } = {};

    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      // Form is valid, verify credentials first, then request OTP
      handleLogin();
    }
  };

  const handleLogin = async () => {
    setLoading(true);
    try {
      // First verify email and password
      const verifyResponse = await fetch('http://localhost:8080/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password
        }),
      });

      const verifyData = await verifyResponse.json();

      if (!verifyData.success) {
        toast.error(verifyData.message || 'Invalid email or password');
        setLoading(false);
        return;
      }

      // If credentials are correct, request OTP
      const otpResponse = await fetch('http://localhost:8080/api/auth/request-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email
        }),
      });

      const otpData = await otpResponse.json();

      if (otpData.success) {
        toast.success('OTP sent to your email. Please check your inbox.');
        // Navigate to OTP verification page with email
        setTimeout(() => {
          navigate('/userotp', { state: { email, loginType: 'user' } });
        }, 1000);
      } else {
        toast.error(otpData.message || 'Failed to send OTP');
      }
    } catch (error) {
      console.error('Login/OTP error:', error);
      toast.error('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100 px-4 py-8">
      <div className="bg-white shadow-lg rounded-xl px-6 sm:px-8 py-8 sm:py-10 w-full max-w-sm">
        {/* Title */}
        <h2 className="text-2xl font-semibold text-center mb-6">Login</h2>

        {/* Signup Link */}
        <p className="text-center text-sm mb-6">
          Don't have an account?{" "}
              <Link to="/signup" className="text-red-600 hover:underline">
            Signup
          </Link>
        </p>

        <form onSubmit={handleSubmit}>
          {/* Email */}
          <div className="mb-6">
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (errors.email) setErrors({ ...errors, email: undefined });
              }}
              placeholder="Email"
              className={`w-full border-b py-2 focus:outline-none ${
                errors.email ? 'border-red-500' : 'border-gray-300 focus:border-gray-500'
              }`}
            />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
          </div>

          {/* Password */}
          <div className="mb-6">
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errors.password) setErrors({ ...errors, password: undefined });
                }}
                placeholder="Password"
                className={`w-full border-b py-2 pr-10 focus:outline-none ${
                  errors.password ? 'border-red-500' : 'border-gray-300 focus:border-gray-500'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
              >
                {showPassword ? <FaEyeSlash className="w-5 h-5" /> : <FaEye className="w-5 h-5" />}
              </button>
            </div>
            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
          </div>

          {/* Forgot Password Link */}
          <div className="flex justify-end mb-2">
            <Link to="/userforgetpassword" className="text-sm text-red-600 hover:underline">
              Forgot Password?
            </Link>
          </div>

          {/* Login Button */}
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-red-400 text-white py-2 rounded-full font-semibold hover:bg-red-500 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Verifying...' : 'Continue'}
          </button>
        </form>

        {/* Divider
        <div className="flex items-center my-6">
          <hr className="flex-grow border-gray-300" />
          <span className="mx-2 text-gray-500 text-sm">OR</span>
          <hr className="flex-grow border-gray-300" />
        </div> */}

        {/* Google Login
        <button className="w-full flex items-center justify-center border border-gray-300 py-2 rounded-full hover:bg-gray-50 transition">
          <img
            src={google}
            alt="google"
            className="w-5 h-5 mr-2"
          />
          Continue with Google
        </button> */}

        {/* Terms */}
        <p className="text-xs text-center text-gray-500 mt-6">
          By joining, you agree to the{" "}
          <a href="#" className="text-red-600 hover:underline">
            Terms
          </a>{" "}
          and{" "}
          <a href="#" className="text-red-600 hover:underline">
            Privacy Policy
          </a>.
        </p>
      </div>
    </div>
  );
};

export default Login_form;
