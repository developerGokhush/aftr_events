"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import SuccessView from "@/components/SuccessView";

export default function SuccessPage() {
  const router = useRouter();
  const [qrCodes, setQrCodes] = useState<string[]>([]);
  const [tickets, setTickets] = useState<any[]>([]);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedCodes = sessionStorage.getItem("success_qrcodes");
      const storedTickets = sessionStorage.getItem("success_tickets");
      if (!storedCodes) {
        // Redirect back home if accessed empty
        router.push("/");
        return;
      }
      setQrCodes(JSON.parse(storedCodes));
      if (storedTickets) {
          setTickets(JSON.parse(storedTickets));
      }
      setIsReady(true);

      // Optional: clear to prevent replays
      // sessionStorage.removeItem("success_qrcodes");
      // sessionStorage.removeItem("checkout_amount");
      // sessionStorage.removeItem("checkout_tickets");
    }
  }, [router]);

  if (!isReady) {
    return (
      <div className="flex-1 max-w-[640px] mx-auto w-full bg-[#FAFAFA] min-h-screen flex justify-center items-center">
        <p className="animate-pulse text-neutral-400 font-medium">Loading ticket data...</p>
      </div>
    );
  }

  return <SuccessView qrCodes={qrCodes} tickets={tickets} />;
}
