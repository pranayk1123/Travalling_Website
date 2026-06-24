"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("packages");
  const [packages, setPackages] = useState<any[]>([]);
  const [leads, setLeads] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [feedbacks, setFeedbacks] = useState<any[]>([]);
  
  const [currentAdmin, setCurrentAdmin] = useState<any>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  
  const [formData, setFormData] = useState({
    title: "", location: "", price: "", days: "", vibe: "", image_url: "", description: "", itinerary: ""
  });

  const [adminData, setAdminData] = useState({
    email: "", newPassword: "", confirmPassword: ""
  });

  const [visiblePasswords, setVisiblePasswords] = useState<any>({});
  const [passwordTimers, setPasswordTimers] = useState<any>({});
  const [passwordCountdowns, setPasswordCountdowns] = useState<any>({});

  const togglePasswordVisibility = (userId: any) => {
    setVisiblePasswords((prev: any) => ({ ...prev, [userId]: !prev[userId] }));
  };

  // 🚀 Clear all timers and countdowns
  const clearAllTimers = () => {
    Object.values(passwordTimers).forEach((timer: any) => clearInterval(timer));
    setPasswordTimers({});
    setPasswordCountdowns({});
  };

  const fetchAllData = async () => {
    try {
      const pkgRes = await fetch("https://travel-backend-api-vx7a.onrender.com/api/packages", { cache: "no-store" });
      const pkgData = await pkgRes.json();
      if (Array.isArray(pkgData)) setPackages(pkgData);

      const leadsRes = await fetch("https://travel-backend-api-vx7a.onrender.com/api/leads", {
        headers: { "role": "admin" }, cache: "no-store"
      }).catch(()=>null);
      if(leadsRes && leadsRes.ok){
        const leadsData = await leadsRes.json();
        if (Array.isArray(leadsData)) setLeads(leadsData);
      }

      const usersRes = await fetch("https://travel-backend-api-vx7a.onrender.com/api/users", {
        headers: { "role": "admin" }, cache: "no-store"
      }).catch(()=>null);
      if(usersRes && usersRes.ok){
         const usersData = await usersRes.json();
         if (Array.isArray(usersData)) setUsers(usersData);
      }

      const fbRes = await fetch("https://travel-backend-api-vx7a.onrender.com/api/feedback", {
        headers: { "role": "admin" }, cache: "no-store"
      }).catch(()=>null);
      if(fbRes && fbRes.ok){
         const fbData = await fbRes.json();
         if (Array.isArray(fbData)) setFeedbacks(fbData);
      }

      // 🚀 Load saved timers from localStorage
      const savedTimers = localStorage.getItem(`passwordTimers_${currentAdmin?.email}`);
      if (savedTimers && currentAdmin) {
        const parsed = JSON.parse(savedTimers);
        const now = Date.now();
        const activeTimers: any = {};
        const activeCountdowns: any = {};
        
        Object.keys(parsed).forEach(userEmail => {
          const elapsed = Math.floor((now - parsed[userEmail]) / 1000);
          const remaining = 30 - elapsed;
          if (remaining > 0) {
            activeCountdowns[userEmail] = remaining;
            // Start timer for remaining time
            const timer = setInterval(() => {
              setPasswordCountdowns((prev: any) => {
                const current = prev[userEmail] || 0;
                if (current <= 1) {
                  clearInterval(timer);
                  const newCountdowns = { ...prev };
                  delete newCountdowns[userEmail];
                  // Remove from localStorage
                  const savedTimers = JSON.parse(localStorage.getItem(`passwordTimers_${currentAdmin?.email}`) || "{}");
                  delete savedTimers[userEmail];
                  localStorage.setItem(`passwordTimers_${currentAdmin?.email}`, JSON.stringify(savedTimers));
                  return newCountdowns;
                }
                return { ...prev, [userEmail]: current - 1 };
              });
            }, 1000);
            activeTimers[userEmail] = timer;
          }
        });
        
        setPasswordTimers(activeTimers);
        setPasswordCountdowns(activeCountdowns);
      }
    } catch (err) {
      console.error("Failed to fetch data", err);
    }
  };

  useEffect(() => { 
    const userStr = localStorage.getItem("user");
    if(userStr) {
      setCurrentAdmin(JSON.parse(userStr));
    }
    fetchAllData();
    
    return () => {
      clearAllTimers();
    };
  }, []);

  // 🚀 When admin changes, reload everything
  useEffect(() => {
    if (currentAdmin) {
      fetchAllData();
    } else {
      clearAllTimers();
      setPasswordCountdowns({});
    }
  }, [currentAdmin?.email]);

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure? This trip will be gone forever!")) return;
    try {
      const res = await fetch(`https://travel-backend-api-vx7a.onrender.com/api/packages/${id}`, {
        method: "DELETE", headers: { "role": "admin" }
      });
      if (res.ok) { alert("Trip Deleted Successfully! 🗑️"); fetchAllData(); } 
      else { alert("Delete Failed! Check Backend."); }
    } catch (err) { alert("Server Error!"); }
  };

  const handleDeleteLead = async (id: any) => {
    if (!id) return alert("Error: ID not found!");
    if (!confirm("Are you sure you want to delete this record?")) return;
    try {
      const res = await fetch(`https://travel-backend-api-vx7a.onrender.com/api/leads/${id}`, { 
        method: "DELETE", headers: { "role": "admin" } 
      });
      if (res.ok) { alert("Record Deleted! 🗑️"); fetchAllData(); } 
      else { alert("Delete Failed!"); }
    } catch (err) { alert("Server Error!"); }
  };

  const handleDeleteUser = async (id: any) => {
    if (!id) return alert("Error: ID not found!");
    if (!confirm("Are you sure you want to remove this user?")) return;
    try {
      const res = await fetch(`https://travel-backend-api-vx7a.onrender.com/api/users/${id}`, { 
        method: "DELETE", headers: { "Content-Type": "application/json", "role": "admin" } 
      });
      if (res.ok) { alert("User Deleted! 🗑️"); fetchAllData(); }
      else { alert("Delete failed!"); }
    } catch (err: any) { alert("Server Error!"); }
  };

  const handleApproveAdmin = async (id: any) => {
    if (!confirm("Approve this user as Sub-Admin?")) return;
    try {
      const res = await fetch(`https://travel-backend-api-vx7a.onrender.com/api/users/${id}`, {
        method: "PUT", headers: { "Content-Type": "application/json", "role": "admin" },
        body: JSON.stringify({ role: "admin" }) 
      });
      if (res.ok) { alert("Sub-Admin Approved! ✅"); fetchAllData(); } 
      else { alert("Approval Failed!"); }
    } catch (err) { alert("Server Error!"); }
  };

  const handleAcceptFeedback = async (id: any) => {
    try {
      const res = await fetch(`https://travel-backend-api-vx7a.onrender.com/api/feedback/${id}`, {
        method: "PUT", headers: { "Content-Type": "application/json", "role": "admin" },
        body: JSON.stringify({ status: "accepted" }) 
      });
      if (res.ok) { alert("Feedback Marked as Accepted! ✅"); fetchAllData(); } 
      else { alert("Failed to Accept!"); }
    } catch (err) { alert("Server Error!"); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const method = editingItem ? "PUT" : "POST";
      const url = editingItem ? `https://travel-backend-api-vx7a.onrender.com/api/packages/${editingItem.id}` : "https://travel-backend-api-vx7a.onrender.com/api/packages";
      const res = await fetch(url, {
        method: method, headers: { "Content-Type": "application/json", "role": "admin" }, body: JSON.stringify(formData)
      });
      if (res.ok) {
        alert(editingItem ? "Trip Updated! ✏️" : "New Trip Added! 🚀");
        setIsModalOpen(false); setEditingItem(null);
        setFormData({ title: "", location: "", price: "", days: "", vibe: "", image_url: "", description: "", itinerary: "" });
        fetchAllData();
      }
    } catch (err) { alert("Server Error!"); }
  };

  const handleAdminUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if(adminData.newPassword !== adminData.confirmPassword) { alert("Passwords do not match! ❌"); return; }
    try {
      const res = await fetch("https://travel-backend-api-vx7a.onrender.com/api/users/register", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          name: adminData.email.split('@')[0], email: adminData.email, password: adminData.newPassword, role: "pending_admin" 
        })
      });
      if (res.ok) {
        alert("Request Sent! 🚀 Main Admin will approve it.");
        setIsSettingsOpen(false);
        setAdminData({ email: "", newPassword: "", confirmPassword: "" }); fetchAllData();
      }
    } catch (err) { alert("Network Error!"); }
  };

  const handleRequestPasswordView = async (userEmail: string, userId: any) => {
    try {
      const res = await fetch("https://travel-backend-api-vx7a.onrender.com/api/users/password-request", {
        method: "POST",
        headers: { "Content-Type": "application/json", "role": "admin" },
        body: JSON.stringify({
          requestedBy: currentAdmin?.email,
          requestedUserEmail: userEmail,
          requestedUserId: userId
        })
      });
      
      if (res.ok) {
        alert(`Password view request sent to Main Admin for: ${userEmail} 📩`);
        fetchAllData();
      } else {
        const errData = await res.json();
        alert(errData.error || "Failed to send request. Please try again.");
      }
    } catch (err) { 
      alert("Network error! Request failed.");
    }
  };

  // 🚀 Start 30 second countdown for password view
  const startPasswordTimer = (userEmail: string) => {
    // Clear existing timer if any
    if (passwordTimers[userEmail]) {
      clearInterval(passwordTimers[userEmail]);
    }
    
    // Save timer start time to localStorage
    const savedTimers = JSON.parse(localStorage.getItem(`passwordTimers_${currentAdmin?.email}`) || "{}");
    savedTimers[userEmail] = Date.now();
    localStorage.setItem(`passwordTimers_${currentAdmin?.email}`, JSON.stringify(savedTimers));
    
    // Set initial countdown
    setPasswordCountdowns((prev: any) => ({ ...prev, [userEmail]: 30 }));
    
    // Start countdown
    const timer = setInterval(() => {
      setPasswordCountdowns((prev: any) => {
        const current = prev[userEmail] || 0;
        if (current <= 1) {
          // Timer finished
          clearInterval(timer);
          // Remove from localStorage
          const savedTimers = JSON.parse(localStorage.getItem(`passwordTimers_${currentAdmin?.email}`) || "{}");
          delete savedTimers[userEmail];
          localStorage.setItem(`passwordTimers_${currentAdmin?.email}`, JSON.stringify(savedTimers));
          // Remove from timers
          setPasswordTimers((prevTimers: any) => {
            const newTimers = { ...prevTimers };
            delete newTimers[userEmail];
            return newTimers;
          });
          // Remove countdown
          const newCountdowns = { ...prev };
          delete newCountdowns[userEmail];
          alert(`⏰ Password access for ${userEmail} has expired! Request again if needed.`);
          return newCountdowns;
        }
        return { ...prev, [userEmail]: current - 1 };
      });
    }, 1000);
    
    setPasswordTimers((prev: any) => ({ ...prev, [userEmail]: timer }));
  };

  const canSubAdminViewPassword = (userEmail: string) => {
    if (!currentAdmin) return false;
    
    const hasApprovedRequest = leads.some((lead: any) => 
      lead.name === "🔐 PASSWORD REQUEST" && 
      lead.email === currentAdmin.email &&
      lead.message?.includes(`User: ${userEmail}`) &&
      lead.status === "approved"
    );
    
    // Check if countdown is active
    const countdown = passwordCountdowns[userEmail];
    return hasApprovedRequest && countdown > 0;
  };

  const hasPendingRequest = (userEmail: string) => {
    if (!currentAdmin) return false;
    return leads.some((lead: any) => 
      lead.name === "🔐 PASSWORD REQUEST" && 
      lead.email === currentAdmin.email &&
      lead.message?.includes(`User: ${userEmail}`) &&
      (!lead.status || lead.status === "pending")
    );
  };

  const hasRejectedRequest = (userEmail: string) => {
    if (!currentAdmin) return false;
    return leads.some((lead: any) => 
      lead.name === "🔐 PASSWORD REQUEST" && 
      lead.email === currentAdmin.email &&
      lead.message?.includes(`User: ${userEmail}`) &&
      lead.status === "rejected"
    );
  };

  const changePackagePosition = async (oldIndex: number, newPosStr: string) => {
    const newPos = parseInt(newPosStr);
    if (isNaN(newPos) || newPos < 1 || newPos > packages.length || newPos - 1 === oldIndex) return;
    const newIndex = newPos - 1; const newPackages = [...packages];
    const [movedItem] = newPackages.splice(oldIndex, 1);
    newPackages.splice(newIndex, 0, movedItem); setPackages(newPackages);
    try {
      await fetch("https://travel-backend-api-vx7a.onrender.com/api/packages/sequence/update", {
        method: "PUT", headers: { "Content-Type": "application/json", "role": "admin" }, body: JSON.stringify({ packages: newPackages })
      });
    } catch (err) { console.error("Failed to update sequence", err); }
  };

  const handleApprovePasswordRequest = async (leadId: string, userEmail: string, requestedBy: string) => {
    try {
      const res = await fetch(`https://travel-backend-api-vx7a.onrender.com/api/leads/${leadId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", "role": "admin" },
        body: JSON.stringify({ status: "approved" })
      });
      if (res.ok) { 
        alert(`Password Request Approved! ✅\n${requestedBy} can view ${userEmail}'s password for 30 seconds.`);
        // 🚀 Start 30 second timer for this specific sub-admin
        const timerKey = `${requestedBy}_${userEmail}`;
        
        // Save to localStorage for the sub-admin
        const savedTimers = JSON.parse(localStorage.getItem(`passwordTimers_${requestedBy}`) || "{}");
        savedTimers[userEmail] = Date.now();
        localStorage.setItem(`passwordTimers_${requestedBy}`, JSON.stringify(savedTimers));
        
        // If the approved sub-admin is currently logged in, start their timer
        if (currentAdmin?.email === requestedBy) {
          startPasswordTimer(userEmail);
        }
        
        fetchAllData(); 
      } else {
        alert("Failed to approve!");
      }
    } catch (err) { 
      alert("Network error! " + err); 
    }
  };

  const handleRejectPasswordRequest = async (leadId: string) => {
    try {
      const res = await fetch(`https://travel-backend-api-vx7a.onrender.com/api/leads/${leadId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", "role": "admin" },
        body: JSON.stringify({ status: "rejected" })
      });
      if (res.ok) { 
        alert("Password Request Rejected! ❌"); 
        fetchAllData(); 
      } else {
        alert("Failed to reject!");
      }
    } catch (err) { 
      alert("Network error! " + err); 
    }
  };

  const passwordRequestLeads = leads
    .filter(lead => lead.name === "🔐 PASSWORD REQUEST")
    .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const regularInquiries = leads
    .filter(lead => lead.type === "contact" && lead.name !== "🔐 PASSWORD REQUEST")
    .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const bookings = leads
    .filter(lead => lead.type === "booking")
    .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  
  const adminList = users.filter(u => u.role === 'admin' || u.role === 'pending_admin' || u.role === 'pending' || u.email === "up@1123.com").sort((a: any, b: any) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
  const normalUsersList = users.filter(u => u.role !== 'admin' && u.role !== 'pending_admin' && u.role !== 'pending' && u.email !== "up@1123.com").sort((a: any, b: any) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());

  const isMainAdmin = currentAdmin?.email === "up@1123.com";

  const tabs = [
    { id: 'packages', label: '🌍 Packages' },
    { id: 'bookings', label: '🚀 Bookings' },
    { id: 'inquiries', label: '💬 Inquiries' },
    { id: 'admins', label: '🛡️ Admins' },
    { id: 'users', label: '👥 Users' },
    { id: 'feedbacks', label: '⭐ Feedbacks' },
    ...(isMainAdmin ? [{ id: 'passwordRequests', label: '🔑 Pwd Requests' }] : [])
  ];

  return (
    <div className="min-h-screen bg-slate-100 font-sans relative overflow-x-hidden">
      <div className="absolute top-0 left-0 w-full h-[120px] bg-slate-900 rounded-b-[2.5rem] shadow-xl z-0"></div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 pt-[130px] md:pt-[150px] pb-20 relative z-10">
        
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4 w-full">
          <h1 className="text-3xl md:text-4xl font-black italic uppercase text-slate-900 drop-shadow-sm">
            Admin <span className="text-blue-600">Control</span>
          </h1>
          <div className="flex flex-wrap gap-2 md:gap-3 w-full sm:w-auto">
             <button onClick={() => setIsSettingsOpen(true)} className="flex-1 sm:flex-none justify-center bg-slate-200 text-slate-800 px-4 md:px-5 py-3 md:py-3.5 rounded-full font-black tracking-widest hover:bg-slate-300 transition-all text-[10px] md:text-xs uppercase">
              ➕ SUB-ADMIN
            </button>
            <button onClick={() => { setEditingItem(null); setFormData({ title: "", location: "", price: "", days: "", vibe: "", image_url: "", description: "", itinerary: "" }); setIsModalOpen(true); }} className="flex-1 sm:flex-none justify-center bg-slate-900 text-white px-5 md:px-7 py-3 md:py-3.5 rounded-full font-black tracking-widest hover:bg-blue-600 transition-all shadow-xl text-[10px] md:text-xs uppercase">
              + ADD ADVENTURE
            </button>
          </div>
        </div>

        <div className="flex overflow-x-auto whitespace-nowrap no-scrollbar gap-2 mb-8 bg-white/80 backdrop-blur-md p-2 rounded-full shadow-sm border border-slate-200 w-full md:w-fit">
          {tabs.map((tab) => (
            <button 
              key={tab.id} 
              onClick={() => setActiveTab(tab.id)}
              className={`px-5 py-3 rounded-full text-[10px] font-black uppercase tracking-[0.15em] transition-all flex-shrink-0 ${activeTab === tab.id ? 'bg-blue-600 text-white shadow-md' : 'bg-transparent text-slate-900 hover:bg-slate-100'}`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="bg-white rounded-[1.5rem] md:rounded-[2rem] shadow-2xl overflow-x-auto border border-slate-200 w-full relative">
          <table className="w-full text-left border-collapse min-w-[750px] md:min-w-[800px]">
            
            {activeTab === 'packages' && (
              <>
                <thead className="bg-slate-900 text-white uppercase text-[10px] tracking-[0.2em]">
                  <tr><th className="px-4 md:px-6 py-4 md:py-5 w-20">Order</th><th className="px-4 md:px-6 py-4 md:py-5">Trip</th><th className="px-4 md:px-6 py-4 md:py-5">Vibe</th><th className="px-4 md:px-6 py-4 md:py-5">Price</th><th className="px-4 md:px-6 py-4 md:py-5 text-right">Actions</th></tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {packages.map((pkg: any, index: number) => (
                    <tr key={pkg._id || pkg.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 md:px-6 py-4"><input type="number" min="1" max={packages.length} defaultValue={index + 1} onBlur={(e) => changePackagePosition(index, e.target.value)} className="w-12 md:w-14 p-2 text-center border border-slate-300 rounded-lg text-xs font-black text-slate-900 focus:ring-2 ring-blue-500 outline-none bg-white shadow-sm"/></td>
                      <td className="px-4 md:px-6 py-4 font-black text-slate-900 text-sm md:text-base whitespace-nowrap uppercase italic">{pkg.title}</td>
                      <td className="px-4 md:px-6 py-4 uppercase text-[9px] md:text-[10px] font-black text-blue-500 tracking-widest">{pkg.vibe || "General"}</td>
                      <td className="px-4 md:px-6 py-4 font-black text-slate-950 italic text-sm md:text-base">₹{pkg.price}</td>
                      <td className="px-4 md:px-6 py-4 text-right space-x-2 whitespace-nowrap">
                        <button onClick={() => { setEditingItem(pkg); setFormData(pkg); setIsModalOpen(true); }} className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-emerald-600 hover:bg-emerald-50 px-3 py-2 rounded-full transition-all">Edit</button>
                        <button onClick={() => handleDelete(pkg._id || pkg.id)} className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-red-500 hover:bg-red-50 px-3 py-2 rounded-full transition-all">Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </>
            )}

            {activeTab === 'bookings' && (
              <>
                <thead className="bg-slate-900 text-white uppercase text-[10px] tracking-[0.2em]">
                  <tr><th className="px-4 md:px-6 py-4 md:py-5">Date</th><th className="px-4 md:px-6 py-4 md:py-5">Customer</th><th className="px-4 md:px-6 py-4 md:py-5">Contact</th><th className="px-4 md:px-6 py-4 md:py-5">Trip</th><th className="px-4 md:px-6 py-4 md:py-5 text-right">Actions</th></tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {bookings.length === 0 ? <tr><td colSpan={5} className="p-8 text-center text-slate-900 font-black uppercase italic">No bookings yet.</td></tr> : bookings.map((b: any) => (
                    <tr key={b._id || b.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 md:px-6 py-4 text-[10px] md:text-xs text-slate-900 font-black">{new Date(b.createdAt).toLocaleDateString()}</td>
                      <td className="px-4 md:px-6 py-4 font-black text-slate-950 text-sm uppercase italic">{b.name}</td>
                      <td className="px-4 md:px-6 py-4 text-xs text-slate-900"><p className="font-black">{b.phone}</p><p className="text-[9px] font-bold text-slate-500">{b.email}</p></td>
                      <td className="px-4 md:px-6 py-4 font-black text-blue-600 italic uppercase text-xs">{b.packageName}</td>
                      <td className="px-4 md:px-6 py-4 text-right"><button onClick={() => handleDeleteLead(b._id || b.id)} className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-red-500 hover:bg-red-50 px-3 py-2 rounded-full transition-all">Delete</button></td>
                    </tr>
                  ))}
                </tbody>
              </>
            )}

            {activeTab === 'inquiries' && (
              <>
                <thead className="bg-slate-900 text-white uppercase text-[10px] tracking-[0.2em]">
                  <tr><th className="px-4 md:px-6 py-4 md:py-5">Date</th><th className="px-4 md:px-6 py-4 md:py-5">Name</th><th className="px-4 md:px-6 py-4 md:py-5">Message</th><th className="px-4 md:px-6 py-4 md:py-5 text-right">Actions</th></tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {regularInquiries.length === 0 ? <tr><td colSpan={4} className="p-8 text-center text-slate-900 font-black uppercase italic">No inquiries yet.</td></tr> : regularInquiries.map((iq: any) => (
                    <tr key={iq._id || iq.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 md:px-6 py-4 text-[10px] md:text-xs text-slate-950 font-black">{new Date(iq.createdAt).toLocaleDateString()}</td>
                      <td className="px-4 md:px-6 py-4 font-black text-slate-950 text-sm uppercase italic">{iq.name}</td>
                      <td className="px-4 md:px-6 py-4 text-xs text-slate-800 font-medium min-w-[200px]">{iq.message}</td>
                      <td className="px-4 md:px-6 py-4 text-right"><button onClick={() => handleDeleteLead(iq._id || iq.id)} className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-red-500 hover:bg-red-50 px-3 py-2 rounded-full transition-all">Delete</button></td>
                    </tr>
                  ))}
                </tbody>
              </>
            )}

            {/* 🚀 PASSWORD REQUESTS TAB - Only for main admin */}
            {activeTab === 'passwordRequests' && isMainAdmin && (
              <>
                <thead className="bg-slate-900 text-white uppercase text-[10px] tracking-[0.2em]">
                  <tr>
                    <th className="px-4 md:px-6 py-4 md:py-5">Date</th>
                    <th className="px-4 md:px-6 py-4 md:py-5">Requested By</th>
                    <th className="px-4 md:px-6 py-4 md:py-5">User Email</th>
                    <th className="px-4 md:px-6 py-4 md:py-5">Status</th>
                    <th className="px-4 md:px-6 py-4 md:py-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {passwordRequestLeads.length === 0 ? (
                    <tr><td colSpan={5} className="p-8 text-center text-slate-900 font-black uppercase italic">No password requests yet.</td></tr>
                  ) : passwordRequestLeads.map((req: any) => {
                    const userEmailMatch = req.message?.match(/User: (.*)/);
                    const userEmail = userEmailMatch ? userEmailMatch[1] : "Unknown";
                    const leadId = req._id || req.id;
                    const requestedBy = req.email;
                    
                    return (
                      <tr key={leadId} className="hover:bg-slate-50 transition-colors">
                        <td className="px-4 md:px-6 py-4 text-[10px] md:text-xs text-slate-900 font-black">
                          {new Date(req.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-4 md:px-6 py-4 font-black text-slate-950 text-sm uppercase italic">
                          {requestedBy}
                        </td>
                        <td className="px-4 md:px-6 py-4 text-xs font-black text-blue-600">
                          {userEmail}
                        </td>
                        <td className="px-4 md:px-6 py-4">
                          {req.status === 'approved' ? (
                            <span className="bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full text-[8px] font-black uppercase tracking-widest">✅ APPROVED</span>
                          ) : req.status === 'rejected' ? (
                            <span className="bg-red-100 text-red-700 px-2 py-1 rounded-full text-[8px] font-black uppercase tracking-widest">❌ REJECTED</span>
                          ) : (
                            <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-[8px] font-black uppercase tracking-widest">⏳ PENDING</span>
                          )}
                        </td>
                        <td className="px-4 md:px-6 py-4 text-right space-x-2">
                          {req.status !== 'approved' && req.status !== 'rejected' && (
                            <>
                              <button onClick={() => handleApprovePasswordRequest(leadId, userEmail, requestedBy)} className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-emerald-600 hover:bg-emerald-50 px-3 py-2 rounded-full transition-all border border-emerald-200">
                                ✅ Approve
                              </button>
                              <button onClick={() => handleRejectPasswordRequest(leadId)} className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-red-500 hover:bg-red-50 px-3 py-2 rounded-full transition-all border border-red-200">
                                ❌ Reject
                              </button>
                            </>
                          )}
                          <button onClick={() => handleDeleteLead(leadId)} className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-slate-500 hover:bg-slate-100 px-3 py-2 rounded-full transition-all">
                            🗑️
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </>
            )}

            {activeTab === 'admins' && (
              <>
                <thead className="bg-slate-900 text-white uppercase text-[10px] tracking-[0.2em]">
                  <tr><th className="px-4 md:px-6 py-4 md:py-5">User</th><th className="px-4 md:px-6 py-4 md:py-5">Email</th><th className="px-4 md:px-6 py-4 md:py-5">Password</th><th className="px-4 md:px-6 py-4 md:py-5">Rank</th><th className="px-4 md:px-6 py-4 md:py-5 text-right">Actions</th></tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {adminList.length === 0 ? <tr><td colSpan={5} className="p-8 text-center text-slate-900 font-black uppercase italic">No admins found.</td></tr> : adminList.map((u: any) => {
                    
                    const isMaster = u.email === "up@1123.com";
                    const isSubAdmin = u.role === 'admin' && !isMaster;
                    const isPendingAdmin = u.role === 'pending_admin' || u.role === 'pending';
                    const isNormalUser = u.role !== 'admin' && !isPendingAdmin;

                    const iAmMain = currentAdmin?.email === "up@1123.com";
                    const iAmSub = currentAdmin?.role === 'admin' && currentAdmin?.email !== "up@1123.com";
                    const isOwnProfile = currentAdmin?.email === u.email;

                    let canDelete = false;
                    if(iAmMain) {
                        canDelete = !isMaster; 
                    } else if(iAmSub) {
                        canDelete = isNormalUser; 
                    }

                    const canViewPassword = iAmMain || isOwnProfile || canSubAdminViewPassword(u.email);
                    const displayPassword = (isMaster && !iAmMain && !isOwnProfile) ? "******" : (u.password || "******");
                    const isActive = currentAdmin?.email === u.email;
                    const myPendingRequest = !iAmMain && hasPendingRequest(u.email);
                    const myRejectedRequest = !iAmMain && hasRejectedRequest(u.email);
                    const countdown = passwordCountdowns[u.email];

                    return (
                      <tr key={u._id || u.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-4 md:px-6 py-4 font-black text-slate-950 text-sm uppercase italic flex items-center gap-2">
                          {u.name || 'Unknown'}
                          {isActive && (
                            <span className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse shadow-[0_0_5px_#22c55e]" title="Active (You)"></span>
                          )}
                        </td>
                        <td className="px-4 md:px-6 py-4 text-xs font-black text-slate-900">{u.email}</td>
                        <td className="px-4 md:px-6 py-4 text-xs font-mono font-black text-blue-600 bg-slate-50 rounded-lg">
                          {u.password === "GoogleLogin_NoPassword" ? (
                            <span className="text-blue-500 font-semibold flex items-center gap-1">🌐 Google Auth</span>
                          ) : canViewPassword ? (
                            <div className="flex items-center gap-2">
                              <span className="select-all">{visiblePasswords[u._id || u.id] ? displayPassword : "••••••••"}</span>
                              <button type="button" onClick={() => togglePasswordVisibility(u._id || u.id)} className="opacity-60 hover:opacity-100 transition-all text-sm hover:scale-110 active:scale-90" title={visiblePasswords[u._id || u.id] ? "Hide Password" : "Show Password"}>
                                {visiblePasswords[u._id || u.id] ? "🙈" : "👁️"}
                              </button>
                              {countdown > 0 && (
                                <span className="text-[10px] font-black text-orange-500 animate-pulse ml-1 bg-orange-50 px-1.5 py-0.5 rounded-full">
                                  ⏱️{countdown}s
                                </span>
                              )}
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <span>••••••••</span>
                              {myPendingRequest ? (
                                <span className="text-[9px] font-black uppercase tracking-widest text-yellow-600 bg-yellow-50 px-2 py-1 rounded-full border border-yellow-200">
                                  ⏳ Pending
                                </span>
                              ) : myRejectedRequest ? (
                                <button type="button" onClick={() => handleRequestPasswordView(u.email, u._id || u.id)} className="text-[9px] font-black uppercase tracking-widest text-orange-600 hover:bg-orange-50 px-2 py-1 rounded-full transition-all border border-orange-200" title="Request Again">
                                  🔄 Request Again
                                </button>
                              ) : (
                                <button type="button" onClick={() => handleRequestPasswordView(u.email, u._id || u.id)} className="text-[9px] font-black uppercase tracking-widest text-orange-600 hover:bg-orange-50 px-2 py-1 rounded-full transition-all border border-orange-200" title="Request Password View">
                                  🔑 Request
                                </button>
                              )}
                            </div>
                          )}
                        </td>
                        <td className="px-4 md:px-6 py-4">
                           <span className={`px-2 py-1 md:px-3 md:py-1 rounded-full text-[8px] md:text-[9px] font-black uppercase tracking-widest ${isMaster ? 'bg-purple-100 text-purple-800' : isSubAdmin ? 'bg-yellow-100 text-yellow-800' : isPendingAdmin ? 'bg-orange-100 text-orange-800' : 'bg-blue-100 text-blue-800'}`}>
                             {isMaster ? 'MAIN ADMIN' : isSubAdmin ? 'SUB ADMIN' : isPendingAdmin ? 'REQUESTED' : 'USER'}
                           </span>
                        </td>
                        <td className="px-4 md:px-6 py-4 text-right space-x-2">
                          {iAmMain && isPendingAdmin && (
                            <button onClick={() => handleApproveAdmin(u._id || u.id)} className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-emerald-600 hover:bg-emerald-50 px-3 py-2 rounded-full transition-all border border-emerald-200">Accept</button>
                          )}
                          {canDelete && (
                            <button onClick={() => handleDeleteUser(u._id || u.id)} className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-red-500 hover:bg-red-50 px-3 py-2 rounded-full transition-all">Delete</button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </>
            )}

            {activeTab === 'users' && (
              <>
                <thead className="bg-slate-900 text-white uppercase text-[10px] tracking-[0.2em]">
                  <tr><th className="px-4 md:px-6 py-4 md:py-5">User</th><th className="px-4 md:px-6 py-4 md:py-5">Email</th><th className="px-4 md:px-6 py-4 md:py-5">Password</th><th className="px-4 md:px-6 py-4 md:py-5 text-right">Actions</th></tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {normalUsersList.length === 0 ? <tr><td colSpan={5} className="p-8 text-center text-slate-900 font-black uppercase italic">No users found.</td></tr> : normalUsersList.map((u: any) => {
                    
                    const isMaster = u.email === "up@1123.com";
                    const isSubAdmin = u.role === 'admin' && !isMaster;
                    const isPendingAdmin = u.role === 'pending_admin' || u.role === 'pending';
                    const isNormalUser = u.role !== 'admin' && !isPendingAdmin;

                    const iAmMain = currentAdmin?.email === "up@1123.com";
                    const iAmSub = currentAdmin?.role === 'admin' && currentAdmin?.email !== "up@1123.com";
                    const isOwnProfile = currentAdmin?.email === u.email;

                    let canDelete = false;
                    if(iAmMain) {
                        canDelete = !isMaster; 
                    } else if(iAmSub) {
                        canDelete = isNormalUser; 
                    }

                    const canViewPassword = iAmMain || isOwnProfile || canSubAdminViewPassword(u.email);
                    const displayPassword = (isMaster && !iAmMain && !isOwnProfile) ? "******" : (u.password || "******");
                    const isActive = currentAdmin?.email === u.email;
                    const myPendingRequest = !iAmMain && hasPendingRequest(u.email);
                    const myRejectedRequest = !iAmMain && hasRejectedRequest(u.email);
                    const countdown = passwordCountdowns[u.email];

                    return (
                      <tr key={u._id || u.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-4 md:px-6 py-4 font-black text-slate-950 text-sm uppercase italic flex items-center gap-2">
                          {u.name || 'Unknown'}
                          {isActive && (
                            <span className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse shadow-[0_0_5px_#22c55e]" title="Active (You)"></span>
                          )}
                        </td>
                        <td className="px-4 md:px-6 py-4 text-xs font-black text-slate-900">{u.email}</td>
                        <td className="px-4 md:px-6 py-4 text-xs font-mono font-black text-blue-600 bg-slate-50 rounded-lg">
                          {u.password === "GoogleLogin_NoPassword" ? (
                            <span className="text-blue-500 font-semibold flex items-center gap-1">🌐 Google Auth</span>
                          ) : canViewPassword ? (
                            <div className="flex items-center gap-2">
                              <span className="select-all">{visiblePasswords[u._id || u.id] ? displayPassword : "••••••••"}</span>
                              <button type="button" onClick={() => togglePasswordVisibility(u._id || u.id)} className="opacity-60 hover:opacity-100 transition-all text-sm hover:scale-110 active:scale-90" title={visiblePasswords[u._id || u.id] ? "Hide Password" : "Show Password"}>
                                {visiblePasswords[u._id || u.id] ? "🙈" : "👁️"}
                              </button>
                              {countdown > 0 && (
                                <span className="text-[10px] font-black text-orange-500 animate-pulse ml-1 bg-orange-50 px-1.5 py-0.5 rounded-full">
                                  ⏱️{countdown}s
                                </span>
                              )}
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <span>••••••••</span>
                              {myPendingRequest ? (
                                <span className="text-[9px] font-black uppercase tracking-widest text-yellow-600 bg-yellow-50 px-2 py-1 rounded-full border border-yellow-200">
                                  ⏳ Pending
                                </span>
                              ) : myRejectedRequest ? (
                                <button type="button" onClick={() => handleRequestPasswordView(u.email, u._id || u.id)} className="text-[9px] font-black uppercase tracking-widest text-orange-600 hover:bg-orange-50 px-2 py-1 rounded-full transition-all border border-orange-200" title="Request Again">
                                  🔄 Request Again
                                </button>
                              ) : (
                                <button type="button" onClick={() => handleRequestPasswordView(u.email, u._id || u.id)} className="text-[9px] font-black uppercase tracking-widest text-orange-600 hover:bg-orange-50 px-2 py-1 rounded-full transition-all border border-orange-200" title="Request Password View">
                                  🔑 Request
                                </button>
                              )}
                            </div>
                          )}
                        </td>
                        <td className="px-4 md:px-6 py-4">
                           <span className={`px-2 py-1 md:px-3 md:py-1 rounded-full text-[8px] md:text-[9px] font-black uppercase tracking-widest ${isMaster ? 'bg-purple-100 text-purple-800' : isSubAdmin ? 'bg-yellow-100 text-yellow-800' : isPendingAdmin ? 'bg-orange-100 text-orange-800' : 'bg-blue-100 text-blue-800'}`}>
                             {isMaster ? 'MAIN ADMIN' : isSubAdmin ? 'SUB ADMIN' : isPendingAdmin ? 'REQUESTED' : 'USER'}
                           </span>
                        </td>
                        <td className="px-4 md:px-6 py-4 text-right space-x-2">
                          {canDelete && (
                            <button onClick={() => handleDeleteUser(u._id || u.id)} className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-red-500 hover:bg-red-50 px-3 py-2 rounded-full transition-all">Delete</button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </>
            )}

            {activeTab === 'feedbacks' && (
              <>
                <thead className="bg-slate-900 text-white uppercase text-[10px] tracking-[0.2em]">
                  <tr><th className="px-4 md:px-6 py-4 md:py-5">Date</th><th className="px-4 md:px-6 py-4 md:py-5">User Info</th><th className="px-4 md:px-6 py-4 md:py-5">Message</th><th className="px-4 md:px-6 py-4 md:py-5">Status</th><th className="px-4 md:px-6 py-4 md:py-5 text-right">Actions</th></tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {feedbacks.length === 0 ? <tr><td colSpan={5} className="p-8 text-center text-slate-900 font-black uppercase italic">No feedbacks yet.</td></tr> : feedbacks
                    .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                    .map((fb: any) => (
                    <tr key={fb._id || fb.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 md:px-6 py-4 text-[10px] md:text-xs text-slate-900 font-black">{new Date(fb.createdAt).toLocaleDateString()}</td>
                      <td className="px-4 md:px-6 py-4 font-black text-slate-950 text-sm uppercase italic">
                        {fb.name} <span className="block text-[9px] text-slate-500 lowercase font-bold tracking-widest mt-1">{fb.email}</span>
                      </td>
                      <td className="px-4 md:px-6 py-4 text-xs text-slate-800 font-medium min-w-[200px]">{fb.message}</td>
                      <td className="px-4 md:px-6 py-4">
                         {fb.status === 'accepted' ? (
                            <span className="bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full text-[8px] font-black uppercase tracking-widest">✅ ACCEPTED</span>
                         ) : (
                            <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded-full text-[8px] font-black uppercase tracking-widest">⏳ PENDING</span>
                         )}
                      </td>
                      <td className="px-4 md:px-6 py-4 text-right">
                        {fb.status !== 'accepted' && (
                          <button onClick={() => handleAcceptFeedback(fb._id || fb.id)} className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-emerald-600 hover:bg-emerald-50 px-3 py-2 rounded-full transition-all border border-emerald-200">Accept</button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </>
            )}

          </table>
        </div>
      </div>

      {/* --- ADD / EDIT PACKAGE MODAL --- */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="relative bg-white w-full max-w-2xl rounded-[2rem] md:rounded-[2.5rem] p-5 md:p-10 shadow-2xl overflow-y-auto max-h-[90vh]">
              <h2 className="text-xl md:text-3xl font-black italic uppercase mb-6 md:mb-8 text-slate-900">Add <span className="text-blue-600">Adventure</span></h2>
              <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
                <input type="text" placeholder="Trip Title" required className="bg-slate-100 p-4 rounded-xl outline-none focus:ring-2 ring-blue-500 text-slate-900 font-bold" value={formData.title || ""} onChange={(e) => setFormData({...formData, title: e.target.value})} />
                <input type="text" placeholder="Location" required className="bg-slate-100 p-4 rounded-xl outline-none focus:ring-2 ring-blue-500 text-slate-900 font-bold" value={formData.location || ""} onChange={(e) => setFormData({...formData, location: e.target.value})} />
                <input type="number" placeholder="Price (INR)" required className="bg-slate-100 p-4 rounded-xl outline-none focus:ring-2 ring-blue-500 text-slate-900 font-bold" value={formData.price || ""} onChange={(e) => setFormData({...formData, price: e.target.value})} />
                <input type="number" placeholder="Days" required className="bg-slate-100 p-4 rounded-xl outline-none focus:ring-2 ring-blue-500 text-slate-900 font-bold" value={formData.days || ""} onChange={(e) => setFormData({...formData, days: e.target.value})} />
                <textarea placeholder="Description" required className="bg-slate-100 p-4 rounded-xl outline-none focus:ring-2 ring-blue-500 text-slate-900 font-bold md:col-span-2 h-24" value={formData.description || ""} onChange={(e) => setFormData({...formData, description: e.target.value})} />
                <div className="md:col-span-2 flex flex-col sm:flex-row gap-3">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="w-full sm:flex-1 bg-slate-200 text-slate-900 font-black py-4 rounded-xl uppercase text-xs">Cancel</button>
                  <button type="submit" className="w-full sm:flex-1 bg-blue-600 text-white font-black py-4 rounded-xl uppercase text-xs shadow-lg">Save Adventure</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* --- ADD SUB ADMIN MODAL --- */}
      <AnimatePresence>
        {isSettingsOpen && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setIsSettingsOpen(false)} />
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="relative bg-white w-full max-w-md rounded-[2rem] md:rounded-[2.5rem] p-8 md:p-10 shadow-2xl">
              <h2 className="text-xl md:text-2xl font-black italic uppercase mb-6 text-slate-900">Add <span className="text-blue-600">Sub-Admin</span></h2>
              <form onSubmit={handleAdminUpdate} className="flex flex-col gap-4">
                <input type="email" placeholder="New Admin Email" required className="bg-slate-100 p-4 rounded-xl outline-none text-slate-900 font-bold" value={adminData.email} onChange={(e) => setAdminData({...adminData, email: e.target.value})} />
                <input type="password" placeholder="Password" required className="bg-slate-100 p-4 rounded-xl outline-none text-slate-900 font-bold" value={adminData.newPassword} onChange={(e) => setAdminData({...adminData, newPassword: e.target.value})} />
                <input type="password" placeholder="Confirm Password" required className="bg-slate-100 p-4 rounded-xl outline-none text-slate-900 font-bold" value={adminData.confirmPassword} onChange={(e) => setAdminData({...adminData, confirmPassword: e.target.value})} />
                <button type="submit" className="w-full bg-blue-600 text-white font-black py-4 rounded-xl uppercase text-xs shadow-lg">Send Request</button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}