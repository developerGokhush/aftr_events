"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import CheckoutForm from "@/components/CheckoutForm";

export default function CheckoutPage({ params }: { params: Promise<{ eventId: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [totalAmount, setTotalAmount] = useState<number>(0);
  const [selectedTickets, setSelectedTickets] = useState<any[]>([]);
  const [eventData, setEventData] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isReady, setIsReady] = useState(true);

  useEffect(() => {
    async function bootstrapCheckout() {
      if (typeof window !== "undefined") {
        const amount = sessionStorage.getItem("checkout_amount");
        const tickets = sessionStorage.getItem("checkout_tickets");

        if (!amount || !tickets) {
          router.push("/events");
          return;
        }

        try {
          const { supabase } = await import("@/lib/supabase");
          const { data: event } = await supabase.from('events').select('*').eq('id', resolvedParams.eventId).single();
          if (event) setEventData(event);
        } catch {
          console.error("Failed to fetch event database details on checkout route");
        }

        setTotalAmount(parseFloat(amount));
        setSelectedTickets(JSON.parse(tickets));
        setIsReady(true);
      }
    }
    bootstrapCheckout();
  }, [router, resolvedParams.eventId]);

  const handlePayment = async (details: { name: string; email: string; phone: string }) => {
    setIsProcessing(true);
    let order_id = "";
    let calculatedAmount = 0;

    try {
      const res = await fetch("/api/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tickets: selectedTickets })
      });
      const orderData = await res.json();

      if (!res.ok) {
        alert("Could not initialize secure order: " + orderData.error);
        setIsProcessing(false);
        return;
      }

      order_id = orderData.order_id;
      calculatedAmount = orderData.amount;
    } catch (e) {
      alert("Failed to hit backend order engine");
      setIsProcessing(false);
      return;
    }

    if (typeof window !== "undefined" && (window as any).Razorpay) {
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_test_SeAsfekRga3KZo",
        amount: calculatedAmount * 100,
        currency: "INR",
        name: "Aftr Hyderabad",
        description: `Event ${selectedTickets?.length > 1 ? "Tickets" : "Ticket"} - ${eventData?.name}`,
        order_id: order_id,
        handler: async function (response: any) {
          console.log("Payment successful", response);
          await processBooking(response, details);
        },
        modal: {
          ondismiss: function () {
            // User cancelled/closed the Razorpay window manually
            setIsProcessing(false);
          }
        },
        prefill: {
          name: details.name,
          email: details.email,
          contact: details.phone,
        },
        theme: {
          color: "#0057ff",
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.on("payment.failed", function (response: any) {
        alert("Payment failed! " + response.error.description);
        setIsProcessing(false);
      });
      rzp.open();
    } else {
      alert("Razorpay script blocked or missing keys. Showing mockup frontend bypass.");
      await processBooking({ id: order_id }, details);
    }
  };

  const processBooking = async (razorpayData: any, details: any) => {
    setIsProcessing(true);
    try {
      const res = await fetch("/api/confirm-booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          razorpayData,
          userDetails: { ...details, event_id: resolvedParams.eventId },
          tickets: selectedTickets,
        }),
      });
      const data = await res.json();
      if (data.success && data.bookings && data.bookings.length > 0) {
        const bookingId = data.bookings[0].id;
        sessionStorage.setItem("success_qrcodes", JSON.stringify([bookingId]));
        sessionStorage.setItem("success_tickets", JSON.stringify(selectedTickets));
        const url = window.location.origin + '/bookings/' + bookingId;
        router.push(url)
      } else {
        alert("Booking confirmation failed.");
        setIsProcessing(false);
      }
    } catch (e) {
      console.error("Booking failed to process backend:", e);
      setIsProcessing(false);
    }
  };

  if (!isReady) {
    return (
      <div className="flex-1 max-w-[640px] mx-auto w-full bg-[#FAFAFA] min-h-screen flex justify-center items-center">
        <p className="animate-pulse text-neutral-400 font-medium">Preparing checkout...</p>
      </div>
    );
  }

  return (
    <CheckoutForm
      event={eventData}
      totalAmount={totalAmount}
      tickets={selectedTickets}
      isProcessing={isProcessing}
      onBack={() => router.push("/events")}
      onPay={handlePayment}
    />
  );
}
