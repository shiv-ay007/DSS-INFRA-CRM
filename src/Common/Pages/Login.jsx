import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FaUser, FaLock, FaArrowLeft, FaSignInAlt } from "react-icons/fa";

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      navigate("/sales/dashboard");
    }, 400);
  };

  return (
    <div className="min-h-screen bg-slate-100/90 flex flex-col items-center justify-center p-4">
      {/* Back to Home link */}
      <div className="w-full max-w-md mb-4 flex items-center justify-start">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-orange-600 font-medium transition-colors"
        >
          <FaArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </Link>
      </div>

      <div 
        style={{ backgroundColor: '#282727' }}
        className="w-full max-w-md border border-neutral-700/80 rounded-2xl shadow-2xl p-8"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-orange-500/10 border border-orange-500/30 rounded-2xl flex items-center justify-center mx-auto mb-4 text-orange-400 shadow-sm">
            <FaSignInAlt className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-white tracking-wide">
            Login
          </h2>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider mb-2">
              Email Address
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-neutral-400">
                <FaUser className="w-4 h-4" />
              </span>
              <input
                type="email"
                name="email"
                required
                placeholder="Enter Email"
                value={formData.email}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-2.5 bg-[#1f1e1e] border border-neutral-700 rounded-xl text-white placeholder-neutral-400 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 text-sm transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider mb-2">
              Password
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-neutral-400">
                <FaLock className="w-4 h-4" />
              </span>
              <input
                type="password"
                name="password"
                required
                placeholder="Enter Password"
                value={formData.password}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-2.5 bg-[#1f1e1e] border border-neutral-700 rounded-xl text-white placeholder-neutral-400 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 text-sm transition-all"
              />
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-neutral-300 pt-1">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                className="rounded bg-[#1f1e1e] border-neutral-700 text-orange-600 focus:ring-orange-500"
              />
              <span className="font-medium">Remember me</span>
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-4 bg-orange-600 hover:bg-orange-500 text-white font-bold py-3 px-4 rounded-xl shadow-lg shadow-orange-600/30 active:scale-98 transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 text-sm tracking-wide uppercase"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              "LOGIN"
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;