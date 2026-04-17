import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-white font-sans text-neutral-900">
      <div className="max-w-4xl mx-auto px-6 py-12 md:py-20">
        <Link href="/" className="inline-flex items-center gap-2 text-neutral-500 hover:text-neutral-900 transition-colors mb-10 font-medium">
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>
        <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-8">Terms & Conditions</h1>
        
        <div className="prose prose-neutral prose-lg text-neutral-600 leading-relaxed max-w-none">
          <p className="font-medium text-neutral-800">Last Updated: April 2026</p>
          
          <h2 className="text-2xl font-bold text-neutral-900 mt-10 mb-4">1. Agreement to Terms</h2>
          <p>
            By accessing or using the AFTR platform to discover, book, or host events, you agree to be bound by these generic Terms and Conditions. If you do not agree, you may not access our ticketing platform.
          </p>

          <h2 className="text-2xl font-bold text-neutral-900 mt-10 mb-4">2. Event Bookings and Entry</h2>
          <p>
            AFTR acts solely as a technology platform facilitating the exchange of tickets between hosts and consumers. When you purchase a ticket, you are confirming a direct transaction with the Event Organizer.
          </p>
          <ul className="list-disc pl-5 mt-4 space-y-2">
            <li>Tickets are highly dependent on the Organizer's unique rules.</li>
            <li>Entry to any venue is entirely at the discretion of the Organizer and Venue Management.</li>
            <li>AFTR isn't liable for physical injuries or losses incurred on venue premises.</li>
          </ul>

          <h2 className="text-2xl font-bold text-neutral-900 mt-10 mb-4">3. Prohibited Conduct</h2>
          <p>
            We strictly prohibit any abusive, fraudulent, or malicious behavior targeting our payment gateways or ticketing engines. Any artificial bots attempting to mass-buy or scalp tickets will be permanently blacklisted.
          </p>

          <h2 className="text-2xl font-bold text-neutral-900 mt-10 mb-4">4. Liability & Dispute Resolution</h2>
          <p>
            Because we do not run the physical events ourselves, AFTR expressly disclaims liability regarding the actual quality or safety of the events booked. We mediate disputes, but the final liability remains with the Host/Organizer.
          </p>
        </div>
      </div>
    </main>
  );
}
