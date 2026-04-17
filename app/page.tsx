"use client";

import { useEffect, useState } from "react";
import { Search, Plus, MapPin, Ticket, ShieldCheck, ChevronRight } from "lucide-react";
import Link from "next/link";
import EventCard from "@/components/EventCard";

export default function Home() {
  const [events, setEvents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadTrendingEvents() {
      try {
        const { supabase } = await import("@/lib/supabase");
        if (!process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL === "https://your-project.supabase.co") {
             throw new Error("MOCK_ENV");
        }
        
        const { data, error } = await supabase
          .from("events")
          .select("*")
          .eq("is_active", true)
          .order("created_at", { ascending: false })
          .limit(3);
          
        if (!error && data) {
           setEvents(data);
        }
      } catch (e: any) {
         if (e.message === "MOCK_ENV") {
             setEvents([{
                id: "mock1", 
                name: "The Indoor Picnic Demo",
                date: "Friday, Apr 24",
                time: "5:00 PM",
                venue: "Aftr HQ, Jubilee Hills",
                description: "An exclusive invite-only mock event to test the platform layout.",
                image_urls: ["https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80"],
                is_active: true
             }]);
         }
      } finally {
        setIsLoading(false);
      }
    }
    loadTrendingEvents();
  }, []);

  return (
    <main className="min-h-screen bg-white font-sans selection:bg-[#0057FF]/20 selection:text-[#0057FF] overflow-x-hidden">

      {/* 1. HERO SECTION (Clean, Minimal, Airy) */}
      <section className="pt-24 pb-16 md:pt-32 md:pb-24 px-6 flex flex-col items-center justify-center text-center">
        
        <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-[#0057FF] flex items-center justify-center mb-8 shadow-sm">
          <span className="text-white font-serif font-black text-xl md:text-2xl tracking-tight">AFTR.</span>
        </div>

        <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-neutral-900 mb-6 max-w-4xl">
          Find your next great experience.
        </h1>

        <p className="text-base md:text-lg text-neutral-600 font-medium max-w-2xl leading-relaxed mb-10">
          From intimate indoor picnics to exclusive rooftop parties, discover and book the best local events happening around you.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto px-4">
            <Link 
              href="/events"
              className="bg-[#0057FF] hover:bg-[#0046CC] text-white font-bold text-base py-3.5 px-8 rounded-full shadow-sm transition-colors w-full sm:w-auto flex items-center justify-center gap-2"
            >
              <Search className="w-4 h-4" />
              Explore Events
            </Link>
            <a 
              href="#host"
              className="bg-white hover:bg-neutral-50 text-neutral-800 border border-neutral-300 font-bold text-base py-3.5 px-8 rounded-full transition-colors w-full sm:w-auto flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Host an Event
            </a>
        </div>
      </section>

      {/* 2. UPCOMING EVENTS GRID */}
      <section className="py-16 md:py-24 bg-[#FAFAFA] border-y border-neutral-100">
        <div className="max-w-6xl mx-auto px-6">
           <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
              <div>
                <h2 className="text-2xl md:text-3xl font-extrabold text-neutral-900 tracking-tight mb-2">Upcoming Events</h2>
                <p className="text-base text-neutral-500 font-medium">Explore curated events happening soon.</p>
              </div>
              <Link href="/events" className="hidden md:flex items-center gap-2 font-bold text-[#0057FF] hover:text-indigo-700 transition-colors">
                 See All <ChevronRight className="w-4 h-4" />
              </Link>
           </div>

           {isLoading ? (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
               {[1, 2, 3].map(i => (
                  <div key={i} className="rounded-3xl bg-neutral-200/50 aspect-[4/3] animate-pulse pointer-events-none" />
               ))}
             </div>
           ) : events.length > 0 ? (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
               {events.map((evt) => (
                 <EventCard key={evt.id} event={evt} />
               ))}
             </div>
           ) : (
             <div className="flex flex-col items-center justify-center py-16 bg-white rounded-3xl border border-neutral-200 text-center px-6">
                <Search className="w-10 h-10 text-neutral-300 mb-4" />
                <h3 className="text-lg font-bold text-neutral-900 mb-2">No upcoming events right now.</h3>
                <p className="text-sm text-neutral-500 max-w-sm">Check back soon for new local listings, or start your own gathering today.</p>
             </div>
           )}

           <Link href="/events" className="mt-8 md:hidden flex items-center justify-center gap-2 font-bold text-neutral-700 bg-white border border-neutral-200 shadow-sm px-6 py-3 rounded-xl w-full">
              See All Listings
           </Link>
        </div>
      </section>

      {/* 3. FOR ORGANIZERS (Contextual / Humanized segment) */}
      <section id="host" className="py-16 md:py-24 bg-white text-neutral-900">
        <div className="max-w-6xl mx-auto px-6">
          <div className="max-w-2xl mb-12">
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-4 text-neutral-900">
              Host your own event
            </h2>
            <p className="text-base md:text-lg text-neutral-600 leading-relaxed">
              Create your event page, sell tickets, and manage guest check-ins all in one place. AFTR provides everything you need to run your event smoothly, whether it's a neighborhood meetup or a large festival.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex flex-col">
               <div className="w-12 h-12 bg-blue-50 text-[#0057FF] rounded-xl flex items-center justify-center mb-5">
                  <Ticket className="w-6 h-6" />
               </div>
               <h3 className="text-lg font-bold mb-2 text-neutral-900">Seamless Ticketing</h3>
               <p className="text-sm text-neutral-600 leading-relaxed">Quick checkout experiences and instant digital QR tickets dispatched straight to email and WhatsApp.</p>
            </div>

            <div className="flex flex-col">
               <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-xl flex items-center justify-center mb-5">
                  <MapPin className="w-6 h-6" />
               </div>
               <h3 className="text-lg font-bold mb-2 text-neutral-900">Community Focused</h3>
               <p className="text-sm text-neutral-600 leading-relaxed">Designed explicitly for local creators. Map your venues precisely so your guests arrive without the hassle.</p>
            </div>

            <div className="flex flex-col">
               <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center mb-5">
                  <ShieldCheck className="w-6 h-6" />
               </div>
               <h3 className="text-lg font-bold mb-2 text-neutral-900">Transparent Pricing</h3>
               <p className="text-sm text-neutral-600 leading-relaxed">Clear fee structures for both you and your guests. Everyone hates hidden checkout fees, so we don't use them.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. FOOTER */}
      <footer className="bg-[#FAFAFA] border-t border-neutral-200 py-12">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
           <div className="flex items-center gap-3">
              <span className="font-bold text-neutral-600 tracking-tight text-sm">© 2026 Aftr Events.</span>
           </div>
           
           <div className="flex items-center gap-6 text-sm font-medium text-neutral-500">
             <Link href="/events" className="hover:text-neutral-900 transition-colors">Explore</Link>
             <a href="#host" className="hover:text-neutral-900 transition-colors">Host</a>
             <a href="#" className="hover:text-neutral-900 transition-colors">Privacy</a>
             <a href="#" className="hover:text-neutral-900 transition-colors">Terms</a>
           </div>
        </div>
      </footer>

    </main>
  );
}
