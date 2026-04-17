import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function CancellationPolicyPage() {
  return (
    <main className="min-h-screen bg-white font-sans text-neutral-900">
      <div className="max-w-4xl mx-auto px-6 py-12 md:py-20">
        <Link href="/" className="inline-flex items-center gap-2 text-neutral-500 hover:text-neutral-900 transition-colors mb-10 font-medium">
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>
        <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-8">Cancellation Policy</h1>
        
        <div className="prose prose-neutral prose-lg text-neutral-600 leading-relaxed max-w-none">
          <p className="font-medium text-neutral-800">Last Updated: April 2026</p>
          
          <h2 className="text-2xl font-bold text-neutral-900 mt-10 mb-4">1. Host-Specific Cancellations</h2>
          <p>
            AFTR acts as a marketplace. Therefore, the primary driver for any ticket refund or cancellation revolves around the specific <strong>Event Organizer's rules</strong>. Event Organizers may set their events to be strictly "Non-Refundable" or offer tiered cancellation periods. Please read the event-specific "Terms & Conditions" block on the event details page before completing any transaction.
          </p>

          <h2 className="text-2xl font-bold text-neutral-900 mt-10 mb-4">2. Platform Standard Refund Timeframe</h2>
          <p>
            For events that do explicitly permit refunds, our gateway generally requires <strong>5 to 7 business days</strong> to route the funds securely back to your original UPI or Credit/Debit payment method.
          </p>

          <h2 className="text-2xl font-bold text-neutral-900 mt-10 mb-4">3. Cancelled or Postponed Events</h2>
          <p>
            If a Host cancels an event unilaterally:
          </p>
          <ul className="list-disc pl-5 mt-4 space-y-2">
            <li>You are entitled to a full base-ticket refund.</li>
            <li>Note that Payment Gateway and AFTR Platform Fees (if any) are generally non-refundable as the transaction service was provided.</li>
            <li>We will attempt to automatically initiate this reverse-flow within 48 hours of official event cancellation.</li>
          </ul>

          <h2 className="text-2xl font-bold text-neutral-900 mt-10 mb-4">4. How to Request a Refund</h2>
          <p>
            To initiate a cancellation, refer back to your Digital Ticket Dashboard and utilize the "Contact Organizer" section to ensure your request aligns with the Host's explicit policy.
          </p>
        </div>
      </div>
    </main>
  );
}
