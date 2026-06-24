"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google'; // 🚀 IMPORT ADDED
import { jwtDecode } from "jwt-decode"; // 🚀 IMPORT ADDED

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoaded, setIsLoaded] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [theme, setTheme] = useState({ bg: "", greeting: "", subtitle: "" });
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 50);
    const hour = new Date().getHours();
    
    // Greeting and Background Logic
    if (hour >= 5 && hour < 12) {
      setTheme({ 
        bg: "url('https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=2070')", 
        greeting: "GOOD MORNING", 
        subtitle: "START FRESH: Join us and explore the world." 
      });
    } else if (hour >= 12 && hour < 17) {
      setTheme({ 
        bg: "url('https://images.unsplash.com/photo-1502791451862-7bd8c1df43a7?q=80&w=1964')", 
        greeting: "GOOD AFTERNOON", 
        subtitle: "TAKE FLIGHT: Your journey starts with a step." 
      });
    } else {
      setTheme({ 
        bg: "url('https://images.unsplash.com/photo-1516483638261-f4dbaf036963?q=80&w=1886')", 
        greeting: "GOOD EVENING", 
        subtitle: "STAY INSPIRED: Dream of your next destination." 
      });
    }
    return () => clearTimeout(timer);
  }, []);

  const handleRegister = async (e) => {
    e.preventDefault();
    setError(""); setSuccess("");

    // 🚀 Strict Email Validation Check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address! ❌");
      return;
    }

    try {
      const res = await fetch("https://travel-backend-api-vx7a.onrender.com/api/users/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess("Success! Redirecting...");
        setTimeout(() => router.push("/login"), 1500);
      } else {
        setError(data.error || "Failed");
      }
    } catch (err) {
      setError("Server error!");
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
      `}</style>

      {/* Responsive padding added */}
      <div className={`min-h-screen flex items-center justify-center p-4 pt-32 md:pt-40 pb-10 md:pb-20 relative overflow-hidden z-0 transition-colors duration-700 ${isDarkMode ? 'bg-slate-950' : 'bg-[#f0f4f8]'}`}>
        
        {/* Background Layer */}
        <div className="absolute inset-0 z-[-1] overflow-hidden">
          <div 
            className={`absolute inset-0 bg-cover bg-center animate-ken-burns transition-opacity duration-1000 ${isDarkMode ? 'opacity-50' : 'opacity-100'}`}
            style={{ backgroundImage: theme.bg }} 
          ></div>
          <div className={`absolute inset-0 backdrop-blur-[2px] transition-colors duration-700 ${isDarkMode ? 'bg-black/60' : 'bg-white/20'}`}></div>
        </div>

        {/* Theme Toggle - Mobile optimized position */}
        <button 
          onClick={() => setIsDarkMode(!isDarkMode)}
          className={`absolute top-4 right-4 md:top-6 md:right-6 z-50 p-2.5 md:p-3 rounded-2xl backdrop-blur-xl border transition-all duration-300 hover:scale-110 active:scale-90 ${isDarkMode ? 'bg-white/10 border-white/20 text-yellow-400' : 'bg-black/5 border-black/10 text-slate-800 shadow-lg'}`}
        >
          {isDarkMode ? "☀️" : "🌙"}
        </button>
        
        {/* Main Card - Flex direction change for mobile */}
        <div 
          className={`relative z-10 flex flex-col md:flex-row-reverse w-full max-w-4xl rounded-[2rem] md:rounded-3xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.15)] border transition-all duration-1000 ease-out transform ${
            isLoaded ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-95 translate-y-8"
          } ${isDarkMode ? 'bg-slate-900/40 border-white/10' : 'bg-white/40 border-white/60'}`}
        >
          {/* Greeting Side (Now on top for mobile, right for desktop) */}
          <div className={`md:w-1/2 w-full h-48 md:h-auto relative group flex flex-col justify-center items-center p-6 md:p-8 text-center border-b md:border-b-0 md:border-l transition-all duration-700 ${isDarkMode ? 'border-white/10 bg-black/20' : 'border-white/50 bg-white/40'}`}>
            <h1 className={`text-2xl md:text-4xl font-extrabold tracking-widest leading-snug transition-colors ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              {theme.greeting}
            </h1>
            <div className="h-[3px] w-10 md:w-12 bg-blue-500 mx-auto rounded-full mt-3 md:mt-4 mb-3 shadow-[0_0_10px_rgba(59,130,246,0.3)]"></div>
            <p className={`text-xs md:text-sm font-medium tracking-wider transition-colors px-4 ${isDarkMode ? 'text-blue-100/70' : 'text-gray-800'}`}>
              {theme.subtitle}
            </p>
          </div>

          {/* Form Side (Bottom for mobile, left for desktop) */}
          <div className={`md:w-1/2 w-full p-8 md:p-14 backdrop-blur-2xl flex flex-col justify-center relative transition-colors duration-700 ${isDarkMode ? 'bg-slate-900/80 text-white' : 'bg-white/70 text-gray-900'}`}>
            
            <div className="text-center mb-6 md:mb-10 relative z-10">
              <h2 className={`text-xl md:text-2xl font-bold tracking-widest inline-block py-2 mb-2 uppercase border-y transition-colors ${isDarkMode ? 'border-white/20' : 'border-gray-900/10'}`}>
                Register
              </h2>
            </div>

            <form onSubmit={handleRegister} className="space-y-6 md:space-y-8 relative z-10">
              
              {/* Full Name */}
              <div className="relative group">
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder=" "
                  className={`block w-full px-2 py-3 bg-transparent border-b-2 appearance-none focus:outline-none focus:ring-0 transition-colors font-medium peer ${isDarkMode ? 'border-slate-700 focus:border-blue-400 text-white' : 'border-gray-400 focus:border-blue-500 text-gray-900'}`}
                />
                <label className={`absolute font-medium duration-300 transform -translate-y-6 scale-75 top-3 z-[-1] origin-[0] peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6 tracking-wide text-sm md:text-base ${isDarkMode ? 'text-slate-400 peer-focus:text-blue-400' : 'text-gray-600 peer-focus:text-blue-600'}`}>
                  Full Name
                </label>
              </div>

              {/* Email */}
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

              {/* Password */}
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
                  className={`absolute right-2 top-3 transition-all duration-300 opacity-50 hover:opacity-100 cursor-pointer ${isDarkMode ? 'text-white' : 'text-gray-900'}`}
                >
                  {showPassword ? "🙈" : "👁️"}
                </button>
              </div>

              {error && (
                <p className="text-red-400 bg-red-500/10 border border-red-500/20 p-2 md:p-3 rounded-lg text-xs md:text-sm text-center font-bold">
                  {error}
                </p>
              )}

              {success && (
                <p className="text-green-400 bg-green-500/10 border border-green-500/20 p-2 md:p-3 rounded-lg text-xs md:text-sm text-center font-bold">
                  {success}
                </p>
              )}

              <div className="pt-2 md:pt-4">
                <button
                  type="submit"
                  className="w-full relative flex items-center justify-center bg-blue-600 text-white font-bold tracking-widest py-3 md:py-3.5 rounded-xl shadow-lg hover:bg-blue-700 hover:-translate-y-1 transition-all duration-300 active:scale-95 shadow-blue-600/20 hover:shadow-blue-600/40 text-xs md:text-sm"
                >
                  CREATE ACCOUNT
                </button>
              </div>

              {/* 🚀 REAL GOOGLE LOGIN WRAPPED IN PROVIDER HERE */}
              <div className="flex items-center my-4 before:flex-1 before:border-t before:border-gray-300 after:flex-1 after:border-t after:border-gray-300">
                <span className={`px-3 text-[10px] md:text-xs font-bold uppercase tracking-widest ${isDarkMode ? 'text-slate-500' : 'text-gray-400'}`}>OR</span>
              </div>
              
              <div className="flex justify-center w-full">
                <GoogleOAuthProvider clientId="591920054629-m595eoigo07hl5gapp8bb4n95b8l34h0.apps.googleusercontent.com">
                  <GoogleLogin
                    onSuccess={(credentialResponse) => {
                      const details = jwtDecode(credentialResponse.credential);
                      console.log("Google User Details:", details);
                      // User la direct login karun home page var pathvnyasathi
                      localStorage.setItem("user", JSON.stringify({ name: details.name, role: "user", email: details.email }));
                      localStorage.setItem("userRole", "user");
                      localStorage.setItem("userName", details.name);
                      router.push("/");
                      setTimeout(() => window.location.reload(), 100);
                    }}
                    onError={() => {
                      setError("Google Login Failed!");
                    }}
                    theme={isDarkMode ? "filled_black" : "outline"}
                    size="large"
                    text="continue_with"
                  />
                </GoogleOAuthProvider>
              </div>
              
              <div className="text-center mt-4 md:mt-6">
                <Link href="/login" className={`font-medium text-xs md:text-sm transition-colors ${isDarkMode ? 'text-slate-400 hover:text-white' : 'text-gray-600 hover:text-blue-600'}`}>
                  Already a member? <span className="font-bold underline">Login</span>
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}