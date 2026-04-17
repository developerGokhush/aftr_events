"use client";

import { useEffect, useState, use } from "react";
import { Link, MapPin, Calendar, Clock, Ticket, Share2, ArrowLeft, Loader2, X, AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";

export default function BookingPage({ params }: { params: Promise<{ bookingId: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  
  const [booking, setBooking] = useState<any>(null);
  const [event, setEvent] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    async function loadBooking() {
      try {
        const { supabase } = await import("@/lib/supabase");
        if (!process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL === "https://your-project.supabase.co") {
          throw new Error("MOCK_ENV");
        }

        // Fetch booking with event details correctly (assumes one-to-one foreign key on event_id)
        const { data, error: fetchErr } = await supabase
          .from("bookings")
          .select("*, events(*)")
          .eq("id", resolvedParams.bookingId)
          .single();

        if (fetchErr || !data) {
          throw new Error("Booking not found");
        }

        setBooking(data);
        setEvent(data.events); // Nested via Supabase relationship
      } catch (e: any) {
        if (e.message === "MOCK_ENV") {
          console.log("Mock data payload served");
          setBooking({
            id: resolvedParams.bookingId || "mock_uuid_xyz",
            payment_id: "pay_xyz12345",
            user_name: "Mock User",
            user_email: "test@example.com",
            user_phone: "+91 999999999",
            tickets: [{ name: "Early Bird", quantity: 2 }, { name: "VIP", quantity: 1 }]
          });
          setEvent({
            name: "MOCK INDOOR PICNIC",
            venue: "Hydernagar",
            date: "17 Apr, Friday",
            time: "04:00 PM",
            image_urls: [],
            location: "https://g.page/",
            terms_conditions: ["No refunds", "Must arrive 15 minutes before"]
          });
        } else {
          setError("We couldn't locate this booking.");
        }
      } finally {
        setIsLoading(false);
      }
    }
    loadBooking();
  }, [resolvedParams.bookingId]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-screen bg-[#FAFAFA]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <p className="text-neutral-500 font-medium">Retrieving Booking...</p>
        </div>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-screen bg-[#FAFAFA] p-6 text-center">
        <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
        <h1 className="text-2xl font-bold text-neutral-900 mb-2">Booking Not Found</h1>
        <p className="text-neutral-500 mb-8">{error}</p>
        <button onClick={() => router.push('/')} className="bg-[#0057FF] text-white px-8 py-3 rounded-xl font-bold">
          Go Home
        </button>
      </div>
    );
  }

  // Helper arrays for T&Cs format parsing
  const termsList = Array.isArray(event?.terms_conditions)
    ? event.terms_conditions
    : (typeof event?.terms_conditions === 'string' ? event.terms_conditions.split('\n').filter(Boolean) : []);

  const totalTickets = booking.tickets ? booking.tickets.reduce((acc: number, t: any) => acc + t.quantity, 0) : 0;
  // Get Hero Image
  const heroImage = event?.image_urls?.[0] || event?.image_url || "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&q=80";

  return (
    <main className="min-h-screen bg-[#FAFAFA] pb-20 font-sans">
      
      {/* Header bar */}
      <div className="bg-white border-b border-neutral-100 px-4 py-4 sticky top-0 z-20 flex justify-between items-center shadow-sm">
        <button onClick={() => router.push('/')} className="p-2 cursor-pointer rounded-full hover:bg-neutral-100 text-neutral-600 transition-colors">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-lg font-bold text-neutral-900">Your Ticket</h1>
        <button onClick={handleCopyLink} className="p-2 cursor-pointer rounded-full hover:bg-neutral-100 text-neutral-600 transition-colors relative">
          <Share2 className="w-5 h-5" />
          {isCopied && (
            <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-neutral-800 text-white text-[11px] font-bold px-2 py-1 rounded shadow-lg whitespace-nowrap">
              Copied!
            </span>
          )}
        </button>
      </div>

      <div className="max-w-xl mx-auto px-4 mt-6 space-y-6">
        
        {/* Event Card Header */}
        <div className="bg-white rounded-[2rem] p-4 flex gap-4 md:gap-5 shadow-sm border border-neutral-200">
           <div className="w-[100px] h-[120px] md:w-[120px] md:h-[140px] shrink-0 rounded-2xl overflow-hidden bg-neutral-100">
              <img src={heroImage} alt="Event" className="w-full h-full object-cover" />
           </div>
           <div className="flex flex-col py-1">
             <h2 className="text-lg md:text-xl font-black leading-tight text-neutral-900 mb-2 truncate line-clamp-2 white-space-normal">
               {event?.name}
             </h2>
             <div className="flex items-center gap-2 text-neutral-500 text-[13px] font-medium mb-1.5">
               <Calendar className="w-4 h-4 text-blue-600" />
               <span>{event?.date}</span>
             </div>
             <div className="flex items-center gap-2 text-neutral-500 text-[13px] font-medium mb-1.5">
               <Clock className="w-4 h-4 text-blue-600" />
               <span>{event?.time}</span>
             </div>
             <div className="flex items-start gap-2 text-neutral-500 text-[13px] font-medium">
               <MapPin className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
               <a href={event?.location || '#'} target="_blank" rel="noreferrer" className="underline hover:text-neutral-800 line-clamp-2">
                 {event?.venue}
               </a>
             </div>
           </div>
        </div>

        {/* QR Code Action Bubble */}
        <div className="bg-white rounded-[2rem] p-8 flex flex-col items-center justify-center shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-neutral-200 relative overflow-hidden text-center cursor-pointer hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all" onClick={() => setIsQrModalOpen(true)}>
            <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-blue-500 to-indigo-500" />
            <h3 className="uppercase tracking-widest text-neutral-400 font-bold text-[11px] mb-6">Tap to Enlarge</h3>
            
            <div className="bg-white p-3 rounded-2xl shadow-sm border border-neutral-100">
                <img 
                   src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${booking.id}`} 
                   alt="Entry QR" 
                   className="w-[160px] h-[160px]"
                />
            </div>
            
            <p className="mt-5 font-bold text-neutral-900 text-lg">
               Admit {totalTickets} Guest{totalTickets > 1 ? 's' : ''}
            </p>
            <p className="text-sm font-medium text-blue-600 mt-1">Ready for check-in</p>
        </div>

        {/* Tickets Breakdown */}
        <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-neutral-200">
            <h3 className="font-black text-neutral-900 text-lg mb-5">Guest Details</h3>
            
            <div className="mb-4">
                <p className="text-sm text-neutral-500 font-medium">Primary Contact</p>
                <p className="text-neutral-900 font-bold text-[15px] mt-0.5">{booking.user_name}</p>
                <p className="text-neutral-500 text-[13px] mt-0.5">{booking.user_email}</p>
            </div>

            <div className="border-t border-neutral-100 my-4" />

            <p className="text-sm text-neutral-500 font-medium mb-3">Ticket Types Included</p>
            <div className="space-y-3">
               {booking.tickets && booking.tickets.map((t: any, idx: number) => (
                  <div key={idx} className="flex justify-between items-center bg-neutral-50 px-4 py-3 rounded-xl border border-neutral-100">
                     <span className="font-bold text-neutral-900 text-[15px]">{t.name}</span>
                     <span className="font-black text-blue-600 bg-white px-3 py-1 rounded-full shadow-sm text-sm border border-blue-100">x{t.quantity}</span>
                  </div>
               ))}
            </div>
        </div>

      </div>

      {/* Enlarged QR Modal & Details */}
      {isQrModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-white/95 backdrop-blur-md animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-md max-h-[90vh] overflow-y-auto custom-scrollbar rounded-[2rem] shadow-2xl border border-neutral-200 relative animate-in zoom-in-95">
                <button 
                  onClick={() => setIsQrModalOpen(false)}
                  className="absolute top-4 right-4 p-2 cursor-pointer bg-neutral-100 hover:bg-neutral-200 text-neutral-800 rounded-full transition-colors z-10"
                >
                  <X className="w-6 h-6" />
                </button>
                
                <div className="p-8 text-center flex flex-col items-center border-b border-neutral-100 pb-10">
                   <h2 className="text-2xl font-black text-neutral-900 mb-8 mt-2">Check-in Pass</h2>
                   <div className="bg-white p-4 rounded-3xl shadow-[0_5px_40px_rgba(0,0,0,0.08)] border border-neutral-200">
                     <img 
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=350x350&data=${booking.id}`} 
                        alt="Enlarged Entry QR" 
                        className="w-[280px] h-[280px] md:w-[320px] md:h-[320px]"
                     />
                   </div>
                   <p className="text-neutral-500 font-medium mt-6 text-sm">Present this QR code to the entrance staff</p>
                </div>

                <div className="p-6 md:p-8 bg-neutral-50 text-left">
                   <div className="mb-6 grid grid-cols-2 gap-4">
                     <div>
                       <p className="text-[11px] text-neutral-400 font-bold uppercase tracking-wider mb-1">Booking ID</p>
                       <p className="font-mono text-neutral-900 text-xs break-all leading-tight font-medium bg-white p-2 rounded-lg border border-neutral-200">{booking.id}</p>
                     </div>
                     <div>
                       <p className="text-[11px] text-neutral-400 font-bold uppercase tracking-wider mb-1">Payment ID</p>
                       <p className="font-mono text-neutral-900 text-xs break-all leading-tight font-medium bg-white p-2 rounded-lg border border-neutral-200">{booking.payment_id}</p>
                     </div>
                   </div>

                   {termsList.length > 0 && (
                      <div>
                        <h3 className="text-[12px] font-bold text-neutral-800 uppercase tracking-widest mb-3">Cancellation & Terms</h3>
                        <ul className="list-disc pl-5 space-y-2 mb-0">
                          {termsList.map((term: string, i: number) => (
                            <li 
                               key={i} 
                               className="text-neutral-500 text-[13px] leading-relaxed"
                               dangerouslySetInnerHTML={{ __html: term.replace(/\*(.*?)\*/g, '<strong class="font-bold text-neutral-800">$1</strong>') }}
                            />
                          ))}
                        </ul>
                      </div>
                   )}
                </div>
            </div>
        </div>
      )}

    </main>
  );
}
