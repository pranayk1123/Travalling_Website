"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { GoogleLogin } from '@react-oauth/google'; // 🚀 Added
import { jwtDecode } from "jwt-decode"; // 🚀 Added

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoaded, setIsLoaded] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [theme, setTheme] = useState({ bg: "", greeting: "", subtitle: "" });
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 50);

    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) {
      setTheme({
        bg: "url('https://images.unsplash.com/photo-1499678329028-101435549a4e?q=80&w=2070')",
        greeting: "GOOD MORNING",
        subtitle: "Start your day with a new adventure."
      });
    } else if (hour >= 12 && hour < 17) {
      setTheme({
        bg: "url('https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=2073')",
        greeting: "GOOD AFTERNOON",
        subtitle: "The world is waiting for you."
      });
    } else {
      setTheme({
        bg: "url('https://images.unsplash.com/photo-1506012787146-f92b2d7d6d96?q=80&w=2069')",
        greeting: "GOOD EVENING",
        subtitle: "Plan your next perfect getaway."
      });
    }

    return () => clearTimeout(timer);
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    const emailRegex = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address! ❌");
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch("https://travel-backend-api-vx7a.onrender.com/api/users/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (res.ok && data.msg === "Login success") {
        localStorage.setItem("user", JSON.stringify({ name: data.name, role: data.role, email: email }));
        localStorage.setItem("userRole", data.role);
        localStorage.setItem("userName", data.name);
        
        if (data.role === "admin") {
          router.push("/admin/dashboard");
        } else {
          router.push("/");
        }
        
        setTimeout(() => window.location.reload(), 100);
      } else {
        setError(data.msg || "Invalid Credentials");
        setIsLoading(false);
      }
    } catch (err) {
      setError("Server error! Backend check kara.");
      setIsLoading(false);
    }
  };

  if (!theme.bg) return <div className="min-h-screen bg-[#f0f4f8]"></div>;

  return (
    <>
      <style>{`
        @keyframes kenBurns {
          0% { transform: scale(1); }
          100% { transform: scale(1.1); }
        }
        .animate-ken-burns { animation: kenBurns 30s ease-in-out infinite alternate; }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        .animate-shake { animation: shake 0.3s ease-in-out; }
      `}</style>

      <div className={`min-h-screen flex items-center justify-center p-4 relative overflow-hidden z-0 transition-colors duration-700 ${isDarkMode ? 'bg-slate-950' : 'bg-[#f0f4f8]'}`}>
        
        <div className="absolute inset-0 z-[-1] overflow-hidden">
          <div 
            className={`absolute inset-0 bg-cover bg-center animate-ken-burns transition-opacity duration-1000 ${isDarkMode ? 'opacity-50' : 'opacity-100'}`}
            style={{ backgroundImage: theme.bg }} 
          ></div>
          <div className={`absolute inset-0 backdrop-blur-[2px] transition-colors duration-700 ${isDarkMode ? 'bg-black/60' : 'bg-white/20'}`}></div>
        </div>

        <button 
          onClick={() => setIsDarkMode(!isDarkMode)}
          className={`absolute top-4 right-4 md:top-6 md:right-6 z-50 p-2.5 md:p-3 rounded-2xl backdrop-blur-xl border transition-all duration-300 hover:scale-110 active:scale-90 ${isDarkMode ? 'bg-white/10 border-white/20 text-yellow-400' : 'bg-black/5 border-black/10 text-slate-800 shadow-lg'}`}
        >
          {isDarkMode ? "☀️" : "🌙"}
        </button>
        
        <div 
          className={`relative z-10 flex flex-col md:flex-row w-full max-w-4xl rounded-[2rem] md:rounded-3xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.2)] border transition-all duration-1000 ease-out transform ${
            isLoaded ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-95 translate-y-8"
          } ${isDarkMode ? 'bg-slate-900/40 border-white/10' : 'bg-white/40 border-white/60'}`}
        >
          <div className={`md:w-1/2 w-full h-48 md:h-auto relative group flex flex-col justify-center items-center p-6 md:p-8 text-center border-b md:border-b-0 md:border-r transition-all duration-700 ${isDarkMode ? 'border-white/10 bg-black/20' : 'border-white/50 bg-white/40'}`}>
            <h1 className={`text-2xl md:text-4xl font-extrabold tracking-widest leading-snug transition-colors ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              {theme.greeting}
            </h1>
            <div className="h-[3px] w-10 md:w-12 bg-blue-500 mx-auto rounded-full mt-3 md:mt-4 mb-3 shadow-[0_0_10px_rgba(59,130,246,0.5)]"></div>
            <p className={`text-xs md:text-sm font-medium tracking-wider transition-colors px-4 ${isDarkMode ? 'text-blue-100/70' : 'text-gray-800'}`}>
              {theme.subtitle}
            </p>
          </div>

          <div className={`md:w-1/2 w-full p-8 md:p-14 backdrop-blur-2xl flex flex-col justify-center relative transition-colors duration-700 ${isDarkMode ? 'bg-slate-900/80 text-white' : 'bg-white/70 text-gray-900'}`}>
            
            <div className="text-center mb-8 md:mb-10 relative z-10">
              <h2 className={`text-xl md:text-2xl font-bold tracking-widest inline-block py-2 mb-2 uppercase border-y transition-colors ${isDarkMode ? 'border-white/20' : 'border-gray-900/10'}`}>
                Welcome Back
              </h2>
            </div>

            <form onSubmit={handleLogin} className="space-y-6 md:space-y-8 relative z-10">
              <div className="relative group">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder=" "
                  className={`block w-full px-2 py-3 bg-transparent border-b-2 appearance-none focus:outline-none focus:ring-0 transition-colors font-medium peer ${isDarkMode ? 'border-slate-700 focus:border-blue-400 text-white' : 'border-gray-400 focus:border-blue-500 text-gray-900'}`}
                />
                <label className={`absolute font-medium duration-300 transform -translate-y-6 scale-75 top-3 z-[-1] origin-[0] peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6 tracking-wide text-sm md:text-base ${isDarkMode ? 'text-slate-400 peer-focus:text-blue-400' : 'text-gray-600 peer-focus:text-blue-600'}`}>
                  Email Address
                </label>
              </div>

              <div className="relative group">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder=" "
                  className={`block w-full px-2 py-3 bg-transparent border-b-2 appearance-none focus:outline-none focus:ring-0 transition-colors font-medium peer ${isDarkMode ? 'border-slate-700 focus:border-blue-400 text-white' : 'border-gray-400 focus:border-blue-500 text-gray-900'}`}
                />
                <label className={`absolute font-medium duration-300 transform -translate-y-6 scale-75 top-3 z-[-1] origin-[0] peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6 tracking-wide text-sm md:text-base ${isDarkMode ? 'text-slate-400 peer-focus:text-blue-400' : 'text-gray-600 peer-focus:text-blue-600'}`}>
                  Password
                </label>
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)}
                  className={`absolute right-2 top-3 transition-opacity opacity-50 hover:opacity-100 text-lg`}
                >
                  {showPassword ? "🙈" : "👁️"}
                </button>
              </div>

              {error && (
                <p className="text-red-400 text-[10px] md:text-xs font-bold text-center bg-red-500/10 py-2 rounded-lg animate-shake">
                  {error}
                </p>
              )}

              <div className="pt-2 md:pt-4">
                <button
                  type="submit"
                  disabled={isLoading}
                  className={`w-full relative flex items-center justify-center font-bold tracking-[0.2em] py-3.5 md:py-4 rounded-xl shadow-lg transition-all duration-300 transform text-xs md:text-sm ${isLoading ? 'bg-blue-400 cursor-not-allowed opacity-80' : 'bg-blue-600 hover:bg-blue-700 hover:-translate-y-1 active:scale-95 shadow-blue-600/30 hover:shadow-blue-600/50'} text-white`}
                >
                  {isLoading ? "WAIT..." : "ENTER"}
                </button>
              </div>
              
              <div className="flex items-center my-4 before:flex-1 before:border-t before:border-gray-300 after:flex-1 after:border-after:border-gray-300">
                <span className={`px-3 text-[10px] md:text-xs font-bold uppercase tracking-widest ${isDarkMode ? 'text-slate-500' : 'text-gray-400'}`}>OR</span>
              </div>
              
              {/* 🚀 Google Login Replaced Here */}
              <div className="flex justify-center">
                <GoogleLogin
                  onSuccess={credentialResponse => {
                    const details = jwtDecode(credentialResponse.credential);
                    console.log("Google User:", details);
                    localStorage.setItem("user", JSON.stringify({ name: details.name, email: details.email }));
                    router.push("/");
                    window.location.reload();
                  }}
                  onError={() => setError("Google Login Failed!")}
                />
              </div>
              
              <div className="text-center mt-4 md:mt-6">
                <Link href="/register" className={`font-medium text-xs md:text-sm transition-all ${isDarkMode ? 'text-slate-400 hover:text-white' : 'text-gray-600 hover:text-blue-600'}`}>
                  Don't have an account? <span className="font-bold underline decoration-blue-500/50">Create one</span>
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}