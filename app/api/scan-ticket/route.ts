import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(req: Request) {
  try {
    const { qr_code } = await req.json();

    if (!qr_code) {
      return NextResponse.json({ error: "Missing QR code" }, { status: 400 });
    }

    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL === "https://your-project.supabase.co") {
        // Mock Response for local dev
        console.log("MOCK: Scanned", qr_code);
        return NextResponse.json({ success: true, message: "Valid Ticket (Mock Mode)", details: { ticket_type: "Early Bird", user_name: "John Doe" } });
    }

    // 1. Check if the QR Code exists in any bookings
    // Using `contains` for array matching
    const { data: booking, error: findError } = await supabase
      .from("bookings")
      .select("*")
      .contains("qr_codes", [qr_code])
      .single();

    if (findError || !booking) {
      return NextResponse.json({ error: "Invalid Ticket - Code not found in system." }, { status: 404 });
    }

    // 2. Check if the QR code is ALREADY scanned
    const { data: scannedRecord, error: scanError } = await supabase
      .from("scanned_tickets")
      .select("id, scanned_at")
      .eq("qr_code", qr_code)
      .maybeSingle();

    if (scannedRecord) {
      return NextResponse.json({ 
        error: `Ticket already used at ${new Date(scannedRecord.scanned_at).toLocaleString()}` 
      }, { status: 403 });
    }

    // 3. Mark the QR Code as scanned
    const { error: insertError } = await supabase
      .from("scanned_tickets")
      .insert([
        { 
          qr_code: qr_code, 
          event_id: booking.event_id 
        }
      ]);

    if (insertError) {
      return NextResponse.json({ error: "Failed to mark ticket as used." }, { status: 500 });
    }

    return NextResponse.json({ 
        success: true, 
        message: "Entry Granted",
        details: {
            user_name: booking.user_name,
            ticket_type: booking.ticket_type
        }
     });

  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
