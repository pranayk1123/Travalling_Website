"use client";

import { useEffect, useState } from "react";

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  return (
    <div className="min-h-screen bg-slate-100 pt-32 px-6">
      <div className="max-w-4xl mx-auto bg-white p-10 rounded-[2rem] shadow-2xl border border-slate-200">
        <h1 className="text-3xl font-black italic uppercase text-slate-900 mb-8">My <span className="text-blue-600">Profile</span></h1>
        {user ? (
          <div className="space-y-4">
            <p className="text-lg font-bold text-slate-600">Name: <span className="text-slate-900">{user.name}</span></p>
            <p className="text-lg font-bold text-slate-600">Email: <span className="text-slate-900">{user.email}</span></p>
            <p className="text-lg font-bold text-slate-600">Role: <span className="text-blue-600 uppercase">{user.role}</span></p>
          </div>
        ) : (
          <p className="text-slate-500 font-bold">Loading profile data...</p>
        )}
      </div>
    </div>
  );
}