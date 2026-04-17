"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import EventDetails from "@/components/EventDetails";
import TicketModal from "@/components/TicketModal";

export default function EventPage({ params }: { params: Promise<{ eventId: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [eventData, setEventData] = useState<any>(null);
  const [ticketTypes, setTicketTypes] = useState<any[]>([]);
  const [isLoadingEvent, setIsLoadingEvent] = useState(true);

  useEffect(() => {
    async function loadEvent() {
      try {
        const { supabase } = await import("@/lib/supabase");
        if (!process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL === "https://your-project.supabase.co") {
          throw new Error("Supabase URL mock");
        }
        const { data: event, error: evtErr } = await supabase.from('events').select('*').eq('id', resolvedParams?.eventId).single();
        if (evtErr || !event) throw new Error("No event found");

        setEventData(event);
        const { data: tickets } = await supabase.from('ticket_types').select('*').eq('event_id', event.id);
        setTicketTypes(tickets || []);
      } catch (e) {
        console.log("Mock fallback event data loaded");
        setEventData({ "idx": 1, "id": "c4eb26fd-c1f5-44ca-b99b-96ace219c8b5", "created_at": "2026-04-16 20:49:05.081555+00", "name": "Lippan Art Workshop - The art for the heart ", "description": "Discover the beauty of traditional Lippan Art, a traditional mural art of Kutch, Gujrat made with wood board, clay, acrylic paint, and mirrors. In this hands-on workshop, you’ll learn the basics of this unique art form and create your own decorative Lippan artwork to take home. ✨\n\nWhether you're a beginner or someone who loves creativity, this workshop is designed to help you relax, explore your artistic side, and connect with others who enjoy art and crafts.", "venue": "Antidote Coffee, Gachibowli", "date": "25 Apr, Saturday", "time": "04:00 PM", "location": "https://maps.app.goo.gl/7cgreqhTyEYC9SjD7", "expectations": ["Hands-on Lippan art making from scratch", "Learn modern techniques + mirror work", "Simple step-by-step guidance", "All materials provided", "Personal assistance during workshop", "Fun and relaxing experience", "Take home your own artwork"], "image_urls": ["https://rwlcstbqusxtlqmocmob.supabase.co/storage/v1/object/public/event_images/Lippan%20Art%20Workshop/1.png", "https://rwlcstbqusxtlqmocmob.supabase.co/storage/v1/object/public/event_images/Lippan%20Art%20Workshop/2.png"], "event_host": "Aftr Hyderabad", "host_user": "https://www.instagram.com/the_artful.tales", "is_active": true, "has_gst": false, "has_platform_fee": false, "has_payment_charge": false, "gst_percent": "18", "platform_fee": "10", "payment_charges": "2", "terms_conditions": ["If the event is cancelled by the organizers, the event fee will be refunded (excluding transaction charges).", "If you are unable to attend after registration, the amount will not be refundable.", "Spot registrations are subject to availability.", "We recommend *pre-registration to secure your slot*."], "contact_us": { phone: "91 9908946604", email: "info@gokhush.com" } }
        );
        setTicketTypes([{ "idx": 2, "id": "d5d8968f-cb5b-443b-bc4a-dd88963ebfda", "created_at": "2026-04-16 21:11:47.29141+00", "event_id": "c4eb26fd-c1f5-44ca-b99b-96ace219c8b5", "name": "Solo Pass", "description": "Valid for one participant only. This pass is non-transferable and non-refundable. Includes access to the workshop and all required materials.", "price": "599.00" }, { "idx": 3, "id": "e177f911-d68e-4a93-aa37-541fd9adf713", "created_at": "2026-04-16 21:14:18.197304+00", "event_id": "c4eb26fd-c1f5-44ca-b99b-96ace219c8b5", "name": "Couple Pass", "description": "Valid for two participants attending together. This pass is non-transferable and non-refundable. Includes access to the workshop and all required materials for both participants.", "price": "1099.00" }]);
      } finally {
        setIsLoadingEvent(false);
      }
    }
    loadEvent();
  }, []);

  const handleProceedToCheckout = (amount: number, tickets: any[]) => {
    setIsModalOpen(false);
    sessionStorage.setItem('checkout_amount', amount.toString());
    sessionStorage.setItem('checkout_tickets', JSON.stringify(tickets));
    router.push(`/events/${eventData.id}/checkout`);
  };



  return (
    <main className="min-h-screen bg-[#FAFAFA] flex flex-col font-sans text-neutral-900 selection:bg-[#0057FF]/20 selection:text-neutral-900 animate-page-transition">
      {isLoadingEvent ? (
        <div className="flex-1 flex items-center justify-center min-h-screen">
          <p className="animate-pulse text-neutral-400 font-medium text-sm tracking-wide">Loading Event...</p>
        </div>
      ) : (
        <>
          <EventDetails event={{ ...eventData, startTicket: Math.min(...ticketTypes.map((t: any) => t.price)) }} onRegisterClick={() => setIsModalOpen(true)} />
          <TicketModal
            isOpen={isModalOpen}
            eventName={eventData?.name}
            ticketTypes={ticketTypes}
            onClose={() => setIsModalOpen(false)}
            onProceed={handleProceedToCheckout}
          />
        </>
      )}
    </main>
  );
}
