import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import Razorpay from "razorpay";

const razorpay = new Razorpay({
  key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID as string,
  key_secret: process.env.RAZORPAY_KEY_SECRET as string,
});

export async function POST(req: Request) {
  try {
    const { tickets } = await req.json();

    if (!tickets || !tickets.length) {
      return NextResponse.json({ error: "No tickets selected." }, { status: 400 });
    }

    let backendCalculatedTotal = 0;

    // Check if we use real Supabase Pricing or mock Pricing
    const isMockDB = !process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL === "https://your-project.supabase.co";

    if (isMockDB) {
      console.log("Mock Pricing Engine: Using frontend provided prices since DB isn't configured.");
      tickets.forEach((t: any) => {
        backendCalculatedTotal += (Number(t.price) * Number(t.quantity));
      });
    } else {
      // Secure Production DB Check - Grab true prices
      const ticketIds = tickets.map((t: any) => t.id);
      const { data: dbTickets, error } = await supabase
        .from('ticket_types')
        .select('id, price')
        .in('id', ticketIds);

      if (error || !dbTickets) {
        return NextResponse.json({ error: "Failed to fetch secure pricing data." }, { status: 500 });
      }

      tickets.forEach((clientTicket: any) => {
        const trueDbTicket = dbTickets.find(t => t.id === clientTicket.id);
        if (trueDbTicket) {
          backendCalculatedTotal += (Number(trueDbTicket.price) * Number(clientTicket.quantity));
        }
      });
    }

    // Razorpay amount MUST be in paise
    const amountInPaise = backendCalculatedTotal * 100;

    const options = {
      amount: amountInPaise,
      currency: "INR",
      receipt: `rcpt_${Date.now()}`
    };

    // Explicitly create an Order on Razorpay backend to protect the transaction
    const order = await razorpay.orders.create(options);

    return NextResponse.json({ order_id: order.id, amount: backendCalculatedTotal });

  } catch (err: any) {
    console.error("Razorpay Backend Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
