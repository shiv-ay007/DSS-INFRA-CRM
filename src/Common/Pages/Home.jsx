import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaChartLine } from "react-icons/fa";

const departments = [
  {
    name: "Sales Department",
    icon: "/SalesLogo.png",
    path: "/sales/login",
  },
];

const Home = () => {
  const [loading, setLoading] = useState(null);
  const navigate = useNavigate();

  const handleLogin = (path) => {
    setLoading(path);
    navigate(path);
  };

  useEffect(() => {
    setLoading(null);
  }, []);

  return (
    <div className="min-h-screen bg-slate-100/90 flex flex-col items-center justify-center p-4">
      {/* Title Header */}
      <div className="text-center text-slate-900 mt-6 mb-8">
        <div className="flex items-center justify-center gap-4 mb-2">
          <div className="flex-1 max-w-20 h-[2px] bg-orange-500" />
          <div className="text-sm font-semibold tracking-wider uppercase text-orange-600">
            Welcome To
          </div>
          <div className="flex-1 max-w-20 h-[2px] bg-orange-500" />
        </div>
        <h1 className="text-2xl md:text-4xl font-extrabold tracking-wide text-slate-900">
          DSS INFRABUILD PVT LTD.
        </h1>
      </div>

      {/* Grid / Card layout with #282727 card background & white logo background */}
      <div className="mb-10 mt-10 max-w-sm w-full mx-auto">
        {departments.map((dept, index) => (
          <div
            key={index}
            style={{ backgroundColor: '#282727' }}
            className="relative rounded-2xl border border-neutral-700/80 shadow-2xl hover:shadow-2xl hover:border-orange-500/50 transition-all duration-300 pt-10 pb-6 px-6 text-center group flex flex-col items-center"
          >
            {/* Icon positioned at top center with WHITE background */}
            <div 
              className="absolute bg-white border-2 border-white p-2 -top-11 left-1/2 transform -translate-x-1/2 text-slate-900 rounded-full w-20 h-20 flex items-center justify-center shadow-md group-hover:scale-105 group-hover:border-orange-500 transition-all duration-300"
            >
              <img
                src={dept.icon}
                loading="lazy"
                alt={dept.name}
                className="w-12 h-12 object-contain"
                onError={(e) => {
                  e.target.style.display = 'none';
                  if (e.target.nextSibling) e.target.nextSibling.style.display = 'block';
                }}
              />
              <FaChartLine className="w-8 h-8 text-orange-500 hidden" />
            </div>

            <div className="mt-3 mb-4">
              <h2 className="text-base font-bold text-white tracking-wide">
                {dept.name}
              </h2>
            </div>

            <button
              disabled={loading === dept.path}
              onClick={() => handleLogin(dept.path)}
              className="w-full mt-2 bg-orange-600 hover:bg-orange-500 text-white rounded-full py-2.5 px-6 text-xs sm:text-sm font-bold tracking-wider uppercase border-none outline-none focus:ring-2 focus:ring-orange-400 focus:ring-offset-2 transition-all duration-200 cursor-pointer shadow-lg shadow-orange-600/30"
            >
              {loading === dept.path ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto"></div>
              ) : (
                "LOGIN"
              )}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Home;
