"use client";

import { ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-[#FAFAFA] font-sans text-neutral-900 selection:bg-[#0057FF]/20 selection:text-[#0057FF] flex flex-col pt-12 md:pt-24 lg:pt-32 relative overflow-hidden">

      {/* Background Decor */}
      <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-[800px] h-[800px] bg-[#0057FF]/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-rose-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-6xl mx-auto px-6 w-full relative z-10 flex flex-col items-center text-center">

        {/* Brand Core Logo */}
        <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-[#0057FF] flex items-center justify-center mb-10 shadow-[0_10px_40px_rgba(0,87,255,0.25)] border-[6px] border-white">
          <span className="text-white font-serif font-black text-2xl md:text-4xl tracking-tight">AFTR.</span>
        </div>

        <h1 className="text-5xl md:text-7xl font-black tracking-tight leading-[1.1] text-neutral-900 mb-8 max-w-4xl">
          The ultimate platform for <span className="text-[#0057FF] block md:inline">authentic gatherings.</span>
        </h1>

        <p className="text-lg md:text-xl text-neutral-500 font-medium max-w-2xl leading-relaxed mb-12">
          Discover, book, and attend exclusive community events happening in your city. Stop settling for virtual noise and start connecting in real life.
        </p>

        <button
          onClick={() => router.push('/events')}
          className="group bg-[#0057FF] hover:bg-[#0046CC] cursor-pointer text-white font-bold text-lg md:text-xl py-5 px-10 rounded-full shadow-[0_8px_30px_rgba(0,87,255,0.3)] transition-all transform hover:scale-105 active:scale-95 flex items-center gap-3"
        >
          Explore the Directory
          <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
        </button>

      </div>
    </main>
  );
}
