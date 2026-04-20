"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

export default function CreateBooking() {
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [events, setEvents] = useState<any[]>([]);
  const [ticketTypes, setTicketTypes] = useState<any[]>([]);
  const [selectedTickets, setSelectedTickets] = useState<{ [key: string]: number }>({});
  
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    event_id: "",
    payment_id: "",
  });

  // Fetch events on mount
  useEffect(() => {
    async function fetchEvents() {
      try {
        const { data, error } = await supabase.from('events').select('id, name, date, time').order('created_at', { ascending: false });
        if (error) throw error;
        setEvents(data || []);
      } catch (err) {
        console.error("Failed to load events", err);
      } finally {
        setLoadingEvents(false);
      }
    }
    fetchEvents();
  }, []);

  // Fetch tickets when event changes
  useEffect(() => {
    async function fetchTickets() {
      if (!formData.event_id) {
        setTicketTypes([]);
        setSelectedTickets({});
        return;
      }
      try {
        const { data, error } = await supabase.from('ticket_types').select('*').eq('event_id', formData.event_id);
        if (error) throw error;
        
        setTicketTypes(data || []);
        
        // Initialize ticket counts to 0
        const initialSelected: { [key: string]: number } = {};
        (data || []).forEach(t => {
          initialSelected[t.id] = 0;
        });
        setSelectedTickets(initialSelected);
      } catch (err) {
        console.error("Failed to load ticket types", err);
      }
    }
    fetchTickets();
  }, [formData.event_id]);

  const handleTicketChange = (ticketId: string, increment: number) => {
    setSelectedTickets(prev => {
      const current = prev[ticketId] || 0;
      const newValue = Math.max(0, current + increment);
      return { ...prev, [ticketId]: newValue };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      // Build tickets payload
      const validTickets = ticketTypes
        .filter(t => selectedTickets[t.id] > 0)
        .map(t => ({
          name: t.name,
          quantity: selectedTickets[t.id],
          price: Number(t.price),
        }));

      if (validTickets.length === 0) {
        throw new Error("Please select at least one ticket.");
      }
      
      if (!formData.payment_id.trim()) {
        throw new Error("Please enter a valid Payment ID.");
      }

      const payload = {
        razorpayData: {
          id: formData.payment_id,
        },
        userDetails: {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          event_id: formData.event_id,
        },
        tickets: validTickets,
      };

      const res = await fetch("/api/confirm-booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to create booking");
      }

      setSuccess(true);
      
      // Reset sensitive/ticket stuff but keep the basic form data
      setFormData(prev => ({
        ...prev,
        payment_id: "",
        name: "",
        email: "",
        phone: ""
      }));
      
      // Reset ticket counts
      const resetCounts: { [key: string]: number } = {};
      ticketTypes.forEach(t => { resetCounts[t.id] = 0; });
      setSelectedTickets(resetCounts);
      
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const totalSelectedCount = Object.values(selectedTickets).reduce((a, b) => a + b, 0);

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden p-8">
        <h2 className="text-3xl font-black text-gray-900 text-center mb-8">
          Admin Booking Creator
        </h2>
        
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl relative mb-6 backdrop-blur">
            <strong className="font-bold">Success!</strong>
            <span className="block sm:inline"> Tickets generated and email triggered.</span>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl relative mb-6">
            <strong className="font-bold">Error:</strong>
            <span className="block sm:inline"> {error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6 text-black">
          {/* USER DETAILS */}
          <div className="space-y-4 bg-gray-50 p-5 rounded-2xl border border-gray-100">
            <h3 className="font-bold text-gray-800 border-b pb-2">Guest Details</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input
                type="text"
                name="name"
                required
                placeholder="Attendee Name"
                value={formData.name}
                onChange={handleChange}
                className="block w-full border border-gray-300 rounded-xl py-3 px-4 focus:ring-[#0057FF]/20 focus:border-[#0057FF] sm:text-sm text-black"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                name="email"
                required
                placeholder="attendee@example.com"
                value={formData.email}
                onChange={handleChange}
                className="block w-full border border-gray-300 rounded-xl py-3 px-4 focus:ring-[#0057FF]/20 focus:border-[#0057FF] sm:text-sm text-black"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input
                type="tel"
                name="phone"
                required
                placeholder="e.g. 9876543210"
                value={formData.phone}
                onChange={handleChange}
                className="block w-full border border-gray-300 rounded-xl py-3 px-4 focus:ring-[#0057FF]/20 focus:border-[#0057FF] sm:text-sm text-black"
              />
            </div>
          </div>

          {/* EVENT AND TICKETS DETAILS */}
          <div className="space-y-4 bg-gray-50 p-5 rounded-2xl border border-gray-100">
            <h3 className="font-bold text-gray-800 border-b pb-2">Event & Tickets</h3>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Select Event</label>
              <select
                name="event_id"
                required
                value={formData.event_id}
                onChange={handleChange}
                disabled={loadingEvents}
                className="block w-full border border-gray-300 rounded-xl py-3 px-4 focus:ring-[#0057FF]/20 focus:border-[#0057FF] sm:text-sm text-black bg-white disabled:opacity-50"
              >
                <option value="">{loadingEvents ? "Loading Events..." : "-- Choose an Event --"}</option>
                {events.map((evt) => (
                  <option key={evt.id} value={evt.id}>
                    {evt.name} ({evt.date || "No Date"})
                  </option>
                ))}
              </select>
            </div>

            {formData.event_id && ticketTypes.length > 0 && (
              <div className="space-y-3 pt-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">Select Tickets</label>
                {ticketTypes.map(ticket => (
                     <div key={ticket.id} className="flex items-center justify-between bg-white border border-gray-200 p-3 rounded-xl shadow-sm">
                       <div className="flex flex-col max-w-[200px]">
                           <span className="font-bold text-gray-900 text-sm truncate">{ticket.name}</span>
                           <span className="text-gray-500 text-xs">₹{ticket.price}</span>
                       </div>
                       <div className="flex items-center gap-3">
                         <button
                            type="button"
                            onClick={() => handleTicketChange(ticket.id, -1)}
                            disabled={!selectedTickets[ticket.id]}
                            className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center font-bold text-gray-600 disabled:opacity-30 disabled:bg-gray-100"
                         >
                            -
                         </button>
                         <span className="w-4 text-center font-bold text-sm">{selectedTickets[ticket.id] || 0}</span>
                         <button
                            type="button"
                           onClick={() => handleTicketChange(ticket.id, 1)}
                            className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center font-bold text-gray-600"
                         >
                            +
                         </button>
                       </div>
                     </div>
                ))}
              </div>
            )}
            
            {formData.event_id && ticketTypes.length === 0 && (
                <div className="text-sm text-gray-500 py-2 italic text-center">
                    No tickets found for this event in the database.
                </div>
            )}
          </div>

          {/* TRANSACTION MANIPULATION */}
          <div className="space-y-4 bg-blue-50/50 p-5 rounded-2xl border border-blue-100">
             <h3 className="font-bold text-blue-900 border-b border-blue-100 pb-2 flex justify-between items-center">
                Payment Tracking
                <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded uppercase font-bold tracking-widest">Manual Setup</span>
             </h3>
             <div>
              <label className="block text-sm font-bold text-blue-900 mb-1">Payment ID</label>
              <input
                type="text"
                name="payment_id"
                required
                placeholder="e.g. manual_cash_collection"
                value={formData.payment_id}
                onChange={handleChange}
                className="block w-full border border-blue-200 rounded-xl py-3 px-4 focus:ring-blue-500/20 focus:border-blue-500 sm:text-sm text-blue-900 bg-white"
              />
              <p className="text-xs text-blue-500 mt-2 font-medium">Use internal transaction IDs (e.g. GPay transaction ref, Cash, etc) for admin reference.</p>
            </div>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={loading || totalSelectedCount === 0}
              className="w-full flex justify-center py-4 px-4 border border-transparent rounded-xl shadow-[0_8px_20px_rgba(0,87,255,0.25)] text-[15px] font-bold text-white bg-[#0057FF] hover:bg-[#0046CC] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0057FF] disabled:opacity-50 disabled:shadow-none transition-all transform active:scale-[0.98]"
            >
              {loading ? "Processing Securely..." : `Issue ${totalSelectedCount} Tickets`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
