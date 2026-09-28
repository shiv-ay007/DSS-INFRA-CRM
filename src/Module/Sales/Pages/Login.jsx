import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaUser, FaLock, FaEye, FaEyeSlash, FaChartLine } from "react-icons/fa";
import { toast } from "react-toastify";
import { loginApi } from "../services/auth.api";
import { useAuth } from "../../../context/AuthContext";

const Login = () => {
  const navigate = useNavigate();
  const { login, user } = useAuth();

  useEffect(() => {
    if (user) {
      navigate("/sales/dashboard", { replace: true });
    }
  }, [user, navigate]);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await loginApi(formData);
      if (res && res.success && res.data) {
        login(res.data.user, res.data.accessToken, res.data.refreshToken);

        toast.success(res.message || `Login Successful! Welcome ${res.data.user?.name || ""}`, {
          position: "top-right",
          autoClose: 2000,
        });

        setTimeout(() => {
          navigate("/sales/dashboard");
        }, 600);
        return;
      } else {
        toast.error(res?.message || "Invalid credentials or unauthorized role. Only Admin & Executive can log in.", {
          position: "top-right"
        });
      }
    } catch (err) {
      console.warn("Sales login error:", err);
      toast.error(err?.message || "Sales Login failed. Please check your credentials.", {
        position: "top-right"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f1115] relative overflow-hidden flex flex-col items-center justify-center p-4 selection:bg-orange-500 selection:text-white">
      {/* Subtle Ambient Background Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[30rem] h-[30rem] bg-orange-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-10 right-1/4 w-80 h-80 bg-neutral-700/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Title Header */}
      <div className="relative z-10 text-center mb-8">
        <div className="flex items-center justify-center gap-3 mb-2.5">
          <div className="w-12 sm:w-16 h-[2px] bg-gradient-to-r from-transparent to-orange-500" />
          <span className="text-xs sm:text-sm font-semibold tracking-widest uppercase text-orange-500">
            Welcome To
          </span>
          <div className="w-12 sm:w-16 h-[2px] bg-gradient-to-l from-transparent to-orange-500" />
        </div>
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-wider text-white">
          DSS INFRABUILD PVT LTD.
        </h1>
        <p className="text-xs text-neutral-400 mt-1 font-medium tracking-wide">
          Enterprise Lead Management System
        </p>
      </div>

      {/* Login Card with #282727 background & white circular logo badge */}
      <div className="relative z-10 mt-8 mb-6 max-w-md w-full mx-auto">
        <div
          style={{ backgroundColor: "#232323" }}
          className="relative rounded-2xl border border-neutral-700/70 shadow-2xl shadow-black/60 pt-12 pb-8 px-6 sm:px-8 text-center flex flex-col items-center backdrop-blur-sm"
        >
          {/* Circular Badge positioned at top center with WHITE background */}
          <div
            className="absolute bg-white border-2 border-white p-2 -top-11 left-1/2 transform -translate-x-1/2 text-slate-900 rounded-full w-20 h-20 flex items-center justify-center shadow-xl shadow-black/40 transition-all duration-300"
          >
            <img
              src="/SalesLogo.png"
              loading="lazy"
              alt="Sales Department"
              className="w-12 h-12 object-contain"
              onError={(e) => {
                e.target.style.display = "none";
                if (e.target.nextSibling) e.target.nextSibling.style.display = "block";
              }}
            />
            <FaChartLine className="w-8 h-8 text-orange-500 hidden" />
          </div>

          {/* Card Header */}
          <div className="mt-2 mb-6 text-center w-full">
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-wide">
              Sales Department Login
            </h2>
            <p className="text-xs text-neutral-400 mt-1.5">
              Enter your credentials to access your sales workspace
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="w-full space-y-4 text-left">
            <div>
              <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-2">
                Email Address
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-neutral-400">
                  <FaUser className="w-4 h-4" />
                </span>
                <input
                  type="email"
                  name="email"
                  required
                  placeholder="sales@gmail.com"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2.5 bg-[#181818] border border-neutral-700/80 rounded-xl text-white placeholder-neutral-500 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 text-sm transition-all font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-2">
                Password
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-neutral-400">
                  <FaLock className="w-4 h-4" />
                </span>
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  required
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full pl-10 pr-11 py-2.5 bg-[#181818] border border-neutral-700/80 rounded-xl text-white placeholder-neutral-500 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 text-sm transition-all font-medium"
                />
                {/* Show / Hide Password Toggle */}
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-neutral-400 hover:text-orange-400 transition-colors cursor-pointer focus:outline-none"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  tabIndex={-1}
                >
                  {showPassword ? <FaEyeSlash className="w-4 h-4" /> : <FaEye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-neutral-300 pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  className="rounded bg-[#181818] border-neutral-700 text-orange-600 focus:ring-orange-500 cursor-pointer"
                />
                <span className="font-medium text-neutral-300">Remember me</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-4 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-500 text-white rounded-full py-3 px-6 text-xs sm:text-sm font-bold tracking-wider uppercase border-none outline-none focus:ring-2 focus:ring-orange-400 focus:ring-offset-2 transition-all duration-200 cursor-pointer shadow-lg shadow-orange-600/30 flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto"></div>
              ) : (
                "LOGIN TO SALES"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;