"use client";

import { useEffect, useState } from "react";
import EventCard from "@/components/EventCard";

export default function EventsDirectory() {
  const [events, setEvents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadEvents() {
      try {
        const { supabase } = await import("@/lib/supabase");
        if (!process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL === "https://your-project.supabase.co") {
          throw new Error("Supabase URL mock");
        }

        // Fetch ALL events ordered by active status first, then by newest
        const { data, error } = await supabase.from('events').select('*').order('is_active', { ascending: false, nullsFirst: false }).order('created_at', { ascending: false });
        if (error || !data) throw new Error("Could not fetch upcoming events");

        setEvents(data);
      } catch (e) {
        console.log("Mock fallback events loaded (Database unavailable)");
        setEvents([
          { "idx": 1, "id": "c4eb26fd-c1f5-44ca-b99b-96ace219c8b5", "created_at": "2026-04-16 20:49:05.081555+00", "name": "Lippan Art Workshop - The art for the heart ", "description": "Discover the beauty of traditional Lippan Art, a traditional mural art of Kutch, Gujrat made with wood board, clay, acrylic paint, and mirrors. In this hands-on workshop, you’ll learn the basics of this unique art form and create your own decorative Lippan artwork to take home. ✨\n\nWhether you're a beginner or someone who loves creativity, this workshop is designed to help you relax, explore your artistic side, and connect with others who enjoy art and crafts.", "venue": "Antidote Coffee, Gachibowli", "date": "25 Apr, Saturday", "time": "04:00 PM", "location": "https://maps.app.goo.gl/7cgreqhTyEYC9SjD7", "expectations": ["Hands-on Lippan art making from scratch", "Learn modern techniques + mirror work", "Simple step-by-step guidance", "All materials provided", "Personal assistance during workshop", "Fun and relaxing experience", "Take home your own artwork"], "image_urls": ["https://rwlcstbqusxtlqmocmob.supabase.co/storage/v1/object/public/event_images/Lippan%20Art%20Workshop/1.png", "https://rwlcstbqusxtlqmocmob.supabase.co/storage/v1/object/public/event_images/Lippan%20Art%20Workshop/2.png"], "event_host": "Aftr Hyderabad", "host_user": "https://www.instagram.com/the_artful.tales", "is_active": true, "has_gst": false, "has_platform_fee": false, "has_payment_charge": false, "gst_percent": "18", "platform_fee": "10", "payment_charges": "2", "terms_conditions": ["If the event is cancelled by the organizers, the event fee will be refunded (excluding transaction charges).", "If you are unable to attend after registration, the amount will not be refundable.", "Spot registrations are subject to availability.", "We recommend *pre-registration to secure your slot*."], "contact_host": "{\"mobile\":\"91 9908946604\",\"email\":\"info@gokhush.com\"}" }
        ]);
      } finally {
        setIsLoading(false);
      }
    }
    loadEvents();
  }, []);

  return (
    <div className="min-h-screen bg-[#FAFAFA] font-sans text-neutral-900 selection:bg-[#0057FF]/20 selection:text-neutral-900">

      {/* Header */}
      <div className="bg-white border-b border-neutral-100 py-10 md:py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="inline-flex items-center font-bold text-xs uppercase tracking-widest text-[#0057FF] mb-4 bg-blue-50 px-3 py-1.5 rounded-full">
            The AFTR Directory
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-4">Events by Aftr.</h1>
          <p className="text-neutral-500 text-[17px] max-w-2xl font-medium leading-relaxed">
            Find your next favorite community gathering. Explore curated spaces crafted for genuine connections and laid-back energy.
          </p>
        </div>
      </div>

      {/* Grid */}
      <div className="max-w-6xl mx-auto px-6 py-12 md:py-16">
        {isLoading ? (
          <div className="flex justify-center py-20">
            <p className="animate-pulse text-neutral-400 font-medium tracking-wide">Loading events catalog...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {events.map(event => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
