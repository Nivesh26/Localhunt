import React from 'react';
import { Link } from 'react-router-dom';
import google from "../assets/google.svg";

const Login_form = () => {
  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100" >
      <div className="bg-white shadow-lg rounded-xl px-8 py-10 w-full max-w-sm">
        {/* Title */}
        <h2 className="text-2xl font-semibold text-center mb-6">Login</h2>

        {/* Signup Link */}
        <p className="text-center text-sm mb-6">
          Don’t have an account?{" "}
              <Link to="/signup" className="text-blue-600 hover:underline">
            Signup
          </Link>
        </p>

        {/* Username */}
        <input
          type="text"
          placeholder="Email"
          className="w-full border-b border-gray-300 py-2 mb-6 focus:outline-none focus:border-gray-500"
        />

        {/* Password */}
        <input
          type="password"
          placeholder="Password"
          className="w-full border-b border-gray-300 py-2 mb-2 focus:outline-none focus:border-gray-500"
        />

        {/* Forgot Password */}
        <div className="text-right mb-6">
          <a href="#" className="text-sm text-red-500 hover:underline">
            Forget Password?
          </a>
        </div>

        {/* Login Button */}
        <button className="w-full bg-red-500 text-white py-2 rounded-full font-semibold hover:bg-red-600 transition">
          Login
        </button>

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
