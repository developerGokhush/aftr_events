"use client";

import { useEffect, useState, useCallback } from "react";
import { 
  ChevronDown, 
  ChevronUp, 
  RefreshCw, 
  Users, 
  Mail, 
  Phone, 
  Clock, 
  Ticket, 
  Calendar,
  Search,
  ArrowLeft,
  LayoutDashboard
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

interface Booking {
  id: string;
  created_at: string;
  user_name: string;
  user_email: string;
  user_phone: string;
  tickets: {
    name: string;
    quantity: number;
    price: number;
  }[];
  payment_id: string;
}

interface Event {
  id: string;
  name: string;
  date: string;
}

export default function CheckBookingsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string>("");
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [expandedBookingId, setExpandedBookingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch all events for the dropdown
  const fetchEvents = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("events")
        .select("id, name, date")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setEvents(data || []);
      if (data && data.length > 0 && !selectedEventId) {
        setSelectedEventId(data[0].id);
      }
    } catch (err) {
      console.error("Error fetching events:", err);
    }
  }, [selectedEventId]);

  // Fetch bookings for the selected event
  const fetchBookings = useCallback(async (eventId: string, isRefresh = false) => {
    if (!eventId) return;
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const { data, error } = await supabase
        .from("bookings")
        .select("*")
        .eq("event_id", eventId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setBookings(data || []);
    } catch (err) {
      console.error("Error fetching bookings:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  useEffect(() => {
    if (selectedEventId) {
      fetchBookings(selectedEventId);
    }
  }, [selectedEventId, fetchBookings]);

  const handleRefresh = () => {
    fetchBookings(selectedEventId, true);
  };

  const toggleExpand = (id: string) => {
    setExpandedBookingId(expandedBookingId === id ? null : id);
  };

  const filteredBookings = bookings.filter(b => 
    b.user_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.user_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.user_phone.includes(searchTerm)
  );

  const totalTicketsSold = bookings.reduce((acc, b) => 
    acc + b.tickets.reduce((tAcc, t) => tAcc + t.quantity, 0), 0
  );

  return (
    <div className="min-h-screen bg-[#F8F9FA] pb-20">
      {/* Sticky Header */}
      <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-neutral-200 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link 
              href="/" 
              className="p-2 hover:bg-neutral-100 rounded-full transition-colors group"
            >
              <ArrowLeft className="w-5 h-5 text-neutral-600 group-hover:text-blue-600" />
            </Link>
            <div>
              <h1 className="text-xl font-black text-neutral-900 tracking-tight flex items-center gap-2">
                <LayoutDashboard className="w-5 h-5 text-blue-600" />
                CHECK BOOKINGS
              </h1>
              <p className="text-[12px] font-bold text-neutral-400 uppercase tracking-widest">Admin Dashboard</p>
            </div>
          </div>
          
          <button 
            onClick={handleRefresh}
            disabled={refreshing || !selectedEventId}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all ${
              refreshing 
                ? 'bg-neutral-100 text-neutral-400 cursor-not-allowed' 
                : 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-600/20 active:scale-95'
            }`}
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
        {/* Controls Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-[13px] font-black text-neutral-500 uppercase tracking-wider ml-1">Select Event</label>
            <div className="relative group">
              <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400 group-focus-within:text-blue-600 transition-colors" />
              <select 
                value={selectedEventId}
                onChange={(e) => setSelectedEventId(e.target.value)}
                className="w-full bg-white border border-neutral-200 rounded-[18px] pl-12 pr-4 py-4 font-bold text-neutral-900 focus:outline-none focus:ring-4 focus:ring-blue-600/10 focus:border-blue-600 transition-all appearance-none cursor-pointer"
              >
                <option value="" disabled>Choose an event...</option>
                {events.map(event => (
                  <option key={event.id} value={event.id}>
                    {event.name} ({event.date})
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400 pointer-events-none" />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[13px] font-black text-neutral-500 uppercase tracking-wider ml-1">Search Guests</label>
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400 group-focus-within:text-blue-600 transition-colors" />
              <input 
                type="text"
                placeholder="Name, email or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white border border-neutral-200 rounded-[18px] pl-12 pr-4 py-4 font-bold text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-4 focus:ring-blue-600/10 focus:border-blue-600 transition-all"
              />
            </div>
          </div>
        </div>

        {/* Stats Row */}
        {selectedEventId && !loading && (
          <div className="flex gap-4 overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0">
            <div className="bg-white border border-neutral-200 rounded-2xl p-5 flex flex-col gap-1 min-w-[160px] shadow-sm">
              <span className="text-[11px] font-black text-neutral-400 uppercase">Total Bookings</span>
              <span className="text-2xl font-black text-neutral-900">{bookings.length}</span>
            </div>
            <div className="bg-white border border-neutral-200 rounded-2xl p-5 flex flex-col gap-1 min-w-[160px] shadow-sm">
              <span className="text-[11px] font-black text-neutral-400 uppercase">Tickets Sold</span>
              <span className="text-2xl font-black text-blue-600">{totalTicketsSold}</span>
            </div>
          </div>
        )}

        {/* Bookings List */}
        <div className="space-y-4">
          {loading ? (
             <div className="flex flex-col items-center justify-center py-20 gap-4">
               <div className="w-12 h-12 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin" />
               <p className="font-bold text-neutral-400 animate-pulse">Loading bookings...</p>
             </div>
          ) : filteredBookings.length > 0 ? (
            filteredBookings.map((booking) => (
              <div 
                key={booking.id}
                className={`bg-white border rounded-[24px] overflow-hidden transition-all duration-300 ${
                  expandedBookingId === booking.id 
                    ? 'border-blue-600/30 shadow-xl shadow-blue-600/5 ring-1 ring-blue-600/5' 
                    : 'border-neutral-200 shadow-sm hover:border-neutral-300'
                }`}
              >
                {/* Summary View */}
                <button 
                  onClick={() => toggleExpand(booking.id)}
                  className="w-full text-left p-5 md:p-6 flex items-center justify-between group"
                >
                  <div className="flex items-center gap-4 md:gap-6">
                    <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center shrink-0">
                      <Users className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-neutral-900 leading-tight">
                        {booking.user_name}
                      </h3>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-[13px] font-bold text-neutral-500 flex items-center gap-1.5">
                          <Ticket className="w-3.5 h-3.5" />
                          {booking.tickets.reduce((acc, t) => acc + t.quantity, 0)} Ticket(s)
                        </span>
                        <span className="w-1 h-1 rounded-full bg-neutral-300" />
                        <span className="text-[13px] font-bold text-neutral-400">
                          {new Date(booking.created_at).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="bg-neutral-50 px-3 py-1.5 rounded-lg border border-neutral-100 hidden md:block">
                      <span className="text-[11px] font-black text-neutral-400 uppercase block leading-none mb-1">Payment ID</span>
                      <span className="text-[12px] font-mono font-bold text-neutral-600 leading-none">
                        {booking.payment_id.length > 12 ? booking.payment_id.slice(0, 12) + "..." : booking.payment_id}
                      </span>
                    </div>
                    {expandedBookingId === booking.id ? (
                      <ChevronUp className="w-6 h-6 text-blue-600" />
                    ) : (
                      <ChevronDown className="w-6 h-6 text-neutral-400 group-hover:text-blue-600 transition-colors" />
                    )}
                  </div>
                </button>

                {/* Expanded View */}
                {expandedBookingId === booking.id && (
                  <div className="px-5 pb-6 pt-0 md:px-8 md:pb-8 animate-in slide-in-from-top-2 duration-300">
                    <div className="h-px bg-neutral-100 mb-6" />
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      {/* Left Side: Contact Details */}
                      <div className="space-y-6">
                        <div>
                          <p className="text-[11px] font-black text-neutral-400 uppercase tracking-widest mb-3">Customer Information</p>
                          <div className="space-y-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl bg-neutral-50 flex items-center justify-center shrink-0 border border-neutral-100">
                                <Mail className="w-5 h-5 text-neutral-500" />
                              </div>
                              <div>
                                <p className="text-[10px] font-bold text-neutral-400 uppercase leading-none mb-1">Email address</p>
                                <p className="font-bold text-neutral-900 leading-none">{booking.user_email}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl bg-neutral-50 flex items-center justify-center shrink-0 border border-neutral-100">
                                <Phone className="w-5 h-5 text-neutral-500" />
                              </div>
                              <div>
                                <p className="text-[10px] font-bold text-neutral-400 uppercase leading-none mb-1">Phone number</p>
                                <p className="font-bold text-neutral-900 leading-none">+91 {booking.user_phone}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl bg-neutral-50 flex items-center justify-center shrink-0 border border-neutral-100">
                                <Clock className="w-5 h-5 text-neutral-500" />
                              </div>
                              <div>
                                <p className="text-[10px] font-bold text-neutral-400 uppercase leading-none mb-1">Booked on</p>
                                <p className="font-bold text-neutral-900 leading-none">
                                  {new Date(booking.created_at).toLocaleString('en-IN', {
                                    day: 'numeric',
                                    month: 'long',
                                    year: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                    hour12: true
                                  })}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Right Side: Ticket Details */}
                      <div className="space-y-4">
                        <p className="text-[11px] font-black text-neutral-400 uppercase tracking-widest">Order Details</p>
                        <div className="bg-neutral-50 rounded-2xl border border-neutral-200 overflow-hidden">
                          {booking.tickets.map((ticket, idx) => (
                            <div 
                              key={idx} 
                              className={`flex items-center justify-between p-4 ${idx !== booking.tickets.length - 1 ? 'border-b border-neutral-200' : ''}`}
                            >
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center text-[13px] font-black text-blue-600 border border-neutral-100">
                                  {ticket.quantity}
                                </div>
                                <span className="font-bold text-neutral-900">{ticket.name}</span>
                              </div>
                              <span className="font-black text-neutral-700">₹{(ticket.price * ticket.quantity).toFixed(2)}</span>
                            </div>
                          ))}
                          <div className="bg-white p-4 flex justify-between items-center border-t border-neutral-200">
                            <span className="font-black text-neutral-400 text-xs uppercase">Total Paid</span>
                            <span className="text-lg font-black text-blue-600">
                              ₹{booking.tickets.reduce((acc, t) => acc + (t.price * t.quantity), 0).toFixed(2)}
                            </span>
                          </div>
                        </div>
                        <div className="flex justify-between items-center px-1">
                          <span className="text-[10px] font-black text-neutral-400 uppercase">Payment ID: {booking.payment_id}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))
          ) : selectedEventId ? (
            <div className="flex flex-col items-center justify-center py-24 bg-white border border-dashed border-neutral-200 rounded-[32px] gap-4">
              <div className="w-20 h-20 rounded-full bg-neutral-50 flex items-center justify-center border border-neutral-100">
                <Users className="w-10 h-10 text-neutral-300" />
              </div>
              <div className="text-center">
                <h4 className="text-xl font-black text-neutral-900">No bookings yet</h4>
                <p className="text-neutral-400 font-bold mt-1 max-w-[260px]">
                  When guests book tickets for this event, they will appear here.
                </p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-24 bg-white border border-dashed border-neutral-200 rounded-[32px] gap-4">
              <div className="w-20 h-20 rounded-full bg-neutral-50 flex items-center justify-center border border-neutral-100">
                <Calendar className="w-10 h-10 text-neutral-300" />
              </div>
              <div className="text-center">
                <h4 className="text-xl font-black text-neutral-900">Get Started</h4>
                <p className="text-neutral-400 font-bold mt-1">
                  Select an event from the dropdown to view bookings.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
