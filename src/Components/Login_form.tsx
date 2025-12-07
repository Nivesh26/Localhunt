import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const Login_form = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

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
      // Form is valid, proceed with login
      console.log('Login submitted:', { email, password });
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100" >
      <div className="bg-white shadow-lg rounded-xl px-8 py-10 w-full max-w-sm">
        {/* Title */}
        <h2 className="text-2xl font-semibold text-center mb-6">Login</h2>

        {/* Signup Link */}
        <p className="text-center text-sm mb-6">
          Don't have an account?{" "}
              <Link to="/signup" className="text-blue-600 hover:underline">
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
          <div className="mb-2">
            <input
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (errors.password) setErrors({ ...errors, password: undefined });
              }}
              placeholder="Password"
              className={`w-full border-b py-2 focus:outline-none ${
                errors.password ? 'border-red-500' : 'border-gray-300 focus:border-gray-500'
              }`}
            />
            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
          </div>

          {/* Forgot Password */}
          <div className="text-right mb-6">
            <a href="#" className="text-sm text-red-500 hover:underline">
              Forget Password?
            </a>
          </div>

          {/* Login Button */}
          <button type="submit" className="w-full bg-red-500 text-white py-2 rounded-full font-semibold hover:bg-red-600 transition">
            Login
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
          <a href="#" className="text-blue-600 hover:underline">
            Terms
          </a>{" "}
          and{" "}
          <a href="#" className="text-blue-600 hover:underline">
            Privacy Policy
          </a>.
        </p>
      </div>
    </div>
  );
};

export default Login_form;
