"use client";

import { useState } from "react";
import { CheckCircle2, MessageCircle, Mail, ChevronLeft, ChevronRight } from "lucide-react";

interface SuccessViewProps {
  qrCodes?: string[];
}

export default function SuccessView({ qrCodes }: SuccessViewProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const prevCode = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : (qrCodes?.length || 1) - 1));
  };

  const nextCode = () => {
    setCurrentIndex((prev) => (prev < (qrCodes?.length || 1) - 1 ? prev + 1 : 0));
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 md:p-8 text-center max-w-[640px] mx-auto min-h-screen bg-[#FAFAFA] font-sans selection:bg-[#0057FF]/20 selection:text-neutral-900">

      <div className="mb-10 relative auto-animate mt-8">
        <div className="absolute inset-0 bg-[#0057FF]/20 blur-3xl opacity-40 rounded-full animate-pulse scale-150" />
        <CheckCircle2 className="w-24 h-24 text-[#0057FF] relative z-10" />
      </div>

      <h1 className="text-3xl md:text-4xl font-black text-neutral-900 mb-4 tracking-tight leading-[1.1]">Registration Confirmed!</h1>
      <p className="text-neutral-500 mb-10 leading-relaxed text-[17px] max-w-sm mx-auto">
        You're all set for the Indoor Picnic! We're excitedly preparing for your arrival.
      </p>

      {qrCodes && qrCodes.length > 0 && (
        <div className="w-full bg-white border border-neutral-200 rounded-3xl p-6 md:p-8 mb-8 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
          <h3 className="font-bold text-neutral-400 uppercase tracking-widest text-[13px] mb-5">Your Tickets</h3>
          <div className="flex items-center justify-center gap-4 mt-4">

            {qrCodes.length > 1 && (
              <button onClick={prevCode} className="p-3 cursor-pointer bg-neutral-50 hover:bg-neutral-100 border border-neutral-200 rounded-full transition-all focus:outline-none">
                <ChevronLeft className="w-5 h-5 text-neutral-500" />
              </button>
            )}

            <div className="bg-neutral-50 border border-neutral-200 p-6 rounded-2xl shadow-sm text-center flex-1 max-w-[240px]">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${qrCodes[currentIndex]}`}
                alt="Ticket QR Code"
                className="w-40 h-40 mx-auto mb-5 rounded-lg border border-neutral-200 bg-white p-2"
              />
              <span className="font-mono text-neutral-800 font-bold tracking-[0.15em] text-xl">
                {qrCodes[currentIndex]}
              </span>
              {qrCodes.length > 1 && (
                <p className="text-[13px] text-neutral-400 mt-4 font-bold uppercase tracking-wider">Ticket {currentIndex + 1} of {qrCodes.length}</p>
              )}
            </div>

            {qrCodes.length > 1 && (
              <button onClick={nextCode} className="p-3 cursor-pointer bg-neutral-50 hover:bg-neutral-100 border border-neutral-200 rounded-full transition-all focus:outline-none">
                <ChevronRight className="w-5 h-5 text-neutral-500" />
              </button>
            )}

          </div>
          <p className="text-[14px] text-neutral-500 mt-8 font-medium">
            Keep this pure QR code handy during check-in.
          </p>
        </div>
      )}

      <div className="w-full bg-white rounded-3xl p-6 md:p-8 shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-neutral-200 space-y-6 mb-10 text-[15px]">
        <div className="flex items-start gap-5">
          <div className="bg-[#E6F4EA] border border-[#d6ebd9] p-3 rounded-2xl text-[#188038]">
            <MessageCircle className="w-6 h-6" />
          </div>
          <div className="text-left flex-1 pt-1">
            <h3 className="font-bold text-neutral-900 text-[16px]">WhatsApp Confirmation</h3>
            <p className="text-[14px] text-neutral-500 mt-1.5 leading-relaxed">Your bill and ticket details have been sent to your WhatsApp number.</p>
          </div>
        </div>

        <div className="h-px w-full bg-neutral-100" />

        <div className="flex items-start gap-5">
          <div className="bg-[#F8F9FA] border border-neutral-200 p-3 rounded-2xl text-neutral-600">
            <Mail className="w-6 h-6" />
          </div>
          <div className="text-left flex-1 pt-1">
            <h3 className="font-bold text-neutral-900 text-[16px]">Email Receipt</h3>
            <p className="text-[14px] text-neutral-500 mt-1.5 leading-relaxed">A detailed receipt has been sent to your registered email address.</p>
          </div>
        </div>
      </div>

      <button
        onClick={() => window.location.reload()}
        className="text-neutral-500 cursor-pointer font-bold text-[14px] uppercase tracking-widest hover:text-neutral-900 transition-colors drop-shadow-sm pb-10"
      >
        Return to Home
      </button>
    </div>
  );
}
