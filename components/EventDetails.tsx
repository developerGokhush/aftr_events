"use client";

import { useState } from "react";
import { MapPin, Calendar, Clock, Share2, ArrowLeft, CheckCircle2, ChevronLeft, ChevronRight, Info, Mail, Phone, X } from "lucide-react";

interface EventDetailsProps {
  event: any;
  onRegisterClick: () => void;
}

export default function EventDetails({ event, onRegisterClick }: EventDetailsProps) {
  const [currentImageIdx, setCurrentImageIdx] = useState(0);
  const [isCopied, setIsCopied] = useState(false);
  const [showContactPopup, setShowContactPopup] = useState(false);
  
  if (!event) return null;

  const expectationsList = Array.isArray(event?.expectations)
    ? event.expectations
    : (typeof event?.expectations === 'string' ? event.expectations.split('\n').filter(Boolean) : []);

  const termsList = Array.isArray(event?.terms_conditions)
    ? event.terms_conditions
    : (typeof event?.terms_conditions === 'string' ? event.terms_conditions.split('\n').filter(Boolean) : []);

  let images: string[] = [];
  if (Array.isArray(event?.image_urls) && event.image_urls.length > 0) {
    images = event.image_urls;
  } else if (typeof event?.image_urls === 'string') {
    images = event.image_urls.split(',').map((s: string) => s.trim()).filter(Boolean);
  } else if (event?.image_url) {
    images = [event.image_url];
  } else {
    // Mock fallback images to visibly verify the UI locally until real data is updated in production DB
    images = [
      "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&q=80",
      "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1200&q=80",
      "https://images.unsplash.com/photo-1511527661048-7fe73d85e9a4?w=1200&q=80",
      "https://images.unsplash.com/photo-1528605248644-14dd04022da1?w=1200&q=80"
    ];
  }

  return (
    <div className="w-full max-w-6xl mx-auto my-auto md:py-8 lg:py-12 md:px-6">
      <div className="flex flex-col md:flex-row bg-white md:shadow-[0_0_60px_rgba(0,0,0,0.05)] md:rounded-[2.5rem] overflow-hidden min-h-screen md:min-h-[80vh] relative pb-32 md:pb-0">

        {/* Event Gallery (Left on Desktop, Top on Mobile) */}
        <div className="relative w-full md:w-5/12 lg:w-5/12 overflow-hidden md:flex-shrink-0 flex flex-col bg-[#FAFAFA] p-4 md:p-8">
          {/* Top Navigation Overlays */}
          <div className="absolute top-4 left-4 p-2.5 bg-[#0057FF] backdrop-blur-xl rounded-full text-white cursor-pointer hover:bg-[#0057FF]/80 transition-all z-10 hidden md:flex items-center justify-center shadow-md">
            <ArrowLeft className="w-5 h-5" onClick={() => window.history.length > 1 ? window.history.back() : window.location.href = '/'} />
          </div>
          <div className="absolute top-4 right-4 flex gap-3 z-10">
            <div className="relative">
              <div
                className="p-2.5 bg-[#0057FF] backdrop-blur-xl rounded-full text-white cursor-pointer hover:bg-[#0057FF]/80 transition-all shadow-md"
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  setIsCopied(true);
                  setTimeout(() => setIsCopied(false), 2000);
                }}
              >
                <Share2 className="w-5 h-5" />
              </div>
              {isCopied && (
                <div className="absolute top-full right-0 mt-2 px-3 py-1.5 bg-neutral-900 text-white text-xs font-bold rounded-xl whitespace-nowrap shadow-xl pointer-events-none fade-in animate-in slide-in-from-top-1">
                  Link copied!
                </div>
              )}
            </div>
          </div>
          {/* Main Hero Image */}
          <div className="relative w-full aspect-[1/1.1] bg-white rounded-3xl overflow-hidden shadow-sm group border border-neutral-100 flex items-center justify-center mt-8">
            <img
              src={images[currentImageIdx]}
              alt="Event Image"
              className="absolute inset-0 w-full h-full object-fill p-2 rounded-[22px] transition-all duration-700 ease-in-out group-hover:scale-[1.02] group-hover:rounded-[28px]"
            />

            {/* Left/Right Main Image Control Arrows */}
            {images.length > 1 && (
              <>
                <button
                  onClick={() => setCurrentImageIdx((prev) => (prev === 0 ? images.length - 1 : prev - 1))}
                  className="absolute cursor-pointer left-3 top-1/2 -translate-y-1/2 p-2 bg-white/80 backdrop-blur-md text-neutral-900 rounded-full hover:bg-white hover:scale-110 shadow-lg transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setCurrentImageIdx((prev) => (prev === images.length - 1 ? 0 : prev + 1))}
                  className="absolute cursor-pointer right-3 top-1/2 -translate-y-1/2 p-2 bg-white/80 backdrop-blur-md text-neutral-900 rounded-full hover:bg-white hover:scale-110 shadow-lg transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </>
            )}
          </div>

          {/* Thumbnails Gallery Row */}
          {images.length > 1 && (
            <div className="flex justify-center gap-3 md:gap-4 mt-4 overflow-x-auto snap-x [scrollbar-width:none] [&::-webkit-scrollbar]:hidden pt-2 pb-2">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentImageIdx(idx)}
                  className={`relative w-[21%] aspect-square cursor-pointer flex-shrink-0 rounded-[1rem] overflow-hidden snap-center transition-all duration-300 ${idx === currentImageIdx
                    ? 'ring-2 ring-offset-2 ring-[#0057FF] scale-[1.02]'
                    : 'opacity-50 hover:opacity-100 ring-1 ring-neutral-200'
                    }`}
                >
                  <img src={img} alt={`Thumbnail ${idx}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Content Section (Right on Desktop, Bottom on Mobile) */}
        <div className="flex-1 px-6 md:px-10 lg:px-14 py-8 md:py-12 md:max-h-[80vh] md:overflow-y-auto">
          {/* Date / Category Tag */}
          <div className="inline-flex items-center font-bold text-xs uppercase tracking-widest text-[#0057FF] mb-4 bg-blue-50 px-3 py-1.5 rounded-full">
            {event?.date || 'TBD'} • {event?.time || 'TBD'}
          </div>

          <h1 className="text-3xl md:text-4xl font-black text-neutral-900 tracking-tight leading-[1.1] mb-5">
            {event?.name || 'Event Title'}
          </h1>

          {/* Host Profile */}
          <div className="flex items-center gap-4 py-4 border-y border-neutral-100 mb-6">
            <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-blue-200 to-indigo-200 flex items-center justify-center text-blue-600 font-bold text-xl border-[3px] border-white shadow-sm">
              A
            </div>
            <div>
              <p className="text-xs text-neutral-400 font-bold tracking-wider uppercase mb-0.5">Organized by</p>
              <p className="text-base font-bold text-neutral-900">{event?.event_host}</p>
            </div>
            <button className="ml-auto bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-sm font-bold py-2.5 px-5 rounded-full cursor-pointer transition-colors" onClick={() => window.open(event?.hostUser, "_blank")}>
              Follow
            </button>
          </div>

          {/* Actionable Info Cards */}
          <div className="flex flex-col gap-3 mb-6">
            <div className="flex justify-between items-center p-4 md:p-5 rounded-2xl bg-[#F8F9FA] border border-neutral-100 hover:border-neutral-200 transition-colors cursor-pointer group" onClick={() => window.open(event?.location, "_blank")}>
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white text-neutral-600 rounded-xl shadow-sm border border-neutral-100 group-hover:scale-105 transition-transform">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[13px] text-neutral-500 font-bold uppercase tracking-widest mb-0.5">Location</p>
                  <p className="text-[15px] font-bold text-neutral-900">{event?.venue || 'TBD'}</p>
                </div>
              </div>
              <div className="w-8 h-8 rounded-full bg-white border border-neutral-200 flex items-center justify-center shadow-sm text-neutral-400">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" /></svg>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-neutral-900">About this event</h2>
            <div className="prose prose-neutral prose-lg text-neutral-600 leading-relaxed max-w-none">
              {event?.description?.split('\n').map((paragraph: string, i: number) => (
                <p key={i} className="text-[16px] mb-4 last:mb-0">
                  {paragraph}
                </p>
              ))}

              {expectationsList.length > 0 && (
                <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100 my-8">
                  <h3 className="text-sm font-bold text-[#0057FF] mb-4 tracking-widest uppercase">What to expect ✨</h3>
                  <ul className="list-none pl-0 space-y-3 mb-0">
                    {expectationsList.map((item: string, i: number) => (
                      <li key={i} className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-[#0057FF] flex-shrink-0 mt-0.5" />
                        <span className="font-medium text-neutral-800 text-[15px]">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {termsList.length > 0 && (
                <div className="bg-neutral-50 p-6 rounded-2xl border border-neutral-200 mt-8 mb-6">
                  <h3 className="text-sm font-bold text-neutral-800 mb-4 tracking-widest uppercase">Terms & Conditions</h3>
                  <ul className="list-disc pl-5 space-y-2 mb-0">
                    {termsList.map((term: string, i: number) => (
                      <li 
                        key={i} 
                        className="text-neutral-500 text-[14px] leading-relaxed"
                        dangerouslySetInnerHTML={{ __html: term.replace(/\*(.*?)\*/g, '<strong class="font-bold text-neutral-800">$1</strong>') }}
                      />
                    ))}
                  </ul>
                </div>
              )}

              {event?.contact_us && (
                <div className="mt-8 border-t border-neutral-100 pt-6">
                  <button 
                    onClick={() => setShowContactPopup(true)}
                    className="flex items-center justify-center gap-2 w-full sm:w-auto text-[#0057FF] font-bold text-[15px] hover:text-[#0046CC] transition-colors bg-blue-50 px-5 py-3.5 rounded-xl cursor-pointer"
                  >
                    <Info className="w-5 h-5" />
                    Contact the Organizer
                  </button>
                </div>
              )}

              <p className="text-[14px] text-neutral-500 font-medium pb-24 md:pb-0">
                * Note: Please make sure to bring your confirmation email. Specific venue rules apply.
              </p>
            </div>
          </div>

          <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-neutral-100 p-4 md:absolute md:hidden md:bottom-0 md:left-auto md:right-0 md:w-7/12 lg:w-1/2 md:p-6 z-20 shadow-[0_-20px_40px_rgba(0,0,0,0.03)]">
            <div className="flex items-center justify-between gap-4 max-w-[640px] mx-auto md:max-w-none">
              <div className="min-w-0">
                <p className="text-[11px] text-neutral-500 font-bold tracking-widest uppercase mb-0.5">Tickets from</p>
                <p className="text-xl md:text-2xl font-black text-neutral-900 truncate">₹{event?.startTicket}.00</p>
              </div>
              <button
                onClick={onRegisterClick}
                className="flex-shrink-0 cursor-pointer bg-[#0057FF] hover:bg-[#0046CC] text-white font-bold text-[17px] py-3.5 px-8 md:py-4 md:px-12 rounded-2xl shadow-[0_8px_20px_rgba(0,87,255,0.25)] transition-all transform active:scale-[0.98] w-full max-w-[180px] md:max-w-[240px] text-center"
              >
                Get Tickets
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Bar (Mobile) / Sticky Sidebar Footer (Desktop) */}
        <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-neutral-100 p-4 hidden md:absolute md:block md:bottom-0 md:left-auto md:right-0 md:w-7/12 md:px-6 md:py-4 z-20 shadow-[0_-20px_40px_rgba(0,0,0,0.03)]">
          <div className="flex items-center justify-between gap-4 max-w-[640px] mx-auto md:max-w-none">
            <div className="min-w-0">
              <p className="text-[11px] text-neutral-500 font-bold tracking-widest uppercase mb-0.5">Tickets from</p>
              <p className="text-xl md:text-2xl font-black text-neutral-900 truncate">₹{event?.startTicket}.00</p>
            </div>
            <button
              onClick={onRegisterClick}
              className="flex-shrink-0 cursor-pointer bg-[#0057FF] hover:bg-[#0046CC] text-white font-bold text-[17px] py-3.5 px-8 md:py-4 md:px-12 rounded-2xl shadow-[0_8px_20px_rgba(0,87,255,0.25)] transition-all transform active:scale-[0.98] w-full max-w-[180px] md:max-w-[240px] text-center"
            >
              Get Tickets
            </button>
          </div>
      </div>
      </div>

      {/* Contact Organizer Popup */}
      {showContactPopup && event?.contact_us && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm transition-opacity">
          <div className="bg-white rounded-3xl p-6 md:p-8 max-w-sm w-full shadow-2xl relative animate-in zoom-in-95">
            <button 
              onClick={() => setShowContactPopup(false)}
              className="absolute top-4 right-4 p-2 text-neutral-400 hover:bg-neutral-100 rounded-full transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-xl font-black text-neutral-900 tracking-tight mb-2">Need Help?</h3>
            <p className="text-neutral-500 text-[15px] font-medium mb-6">Reach out to the organizer for any queries regarding this event.</p>
            
            <div className="flex flex-col gap-3">
              {event.contact_us.email && (
                <a href={`mailto:${event.contact_us.email}`} className="flex items-center gap-3 p-4 rounded-xl bg-[#F8F9FA] hover:bg-[#F1F3F5] transition-colors border border-neutral-100">
                  <Mail className="w-5 h-5 text-[#0057FF]" />
                  <span className="font-bold text-neutral-900 text-sm">{event.contact_us.email}</span>
                </a>
              )}
              {event.contact_us.phone && (
                <a href={`tel:${event.contact_us.phone}`} className="flex items-center gap-3 p-4 rounded-xl bg-[#F8F9FA] hover:bg-[#F1F3F5] transition-colors border border-neutral-100">
                  <Phone className="w-5 h-5 text-[#0057FF]" />
                  <span className="font-bold text-neutral-900 text-sm">{event.contact_us.phone}</span>
                </a>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
