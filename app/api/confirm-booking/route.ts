import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { nanoid } from "nanoid";
import crypto from "crypto";
import nodemailer from "nodemailer";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { razorpayData, userDetails, tickets } = body;

    // Secure Verification Layer
    // Check if this uses actual keys, bypassing if not using a true razorpay signature payload
    if (razorpayData?.razorpay_signature && process.env.RAZORPAY_KEY_SECRET) {
      const shasum = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET);
      shasum.update(`${razorpayData.razorpay_order_id}|${razorpayData.razorpay_payment_id}`);
      const expectedSignature = shasum.digest("hex");

      if (expectedSignature !== razorpayData.razorpay_signature) {
        console.error("Signature tampering detected!");
        return NextResponse.json({ error: "Invalid cryptographic signature." }, { status: 400 });
      }
    }

    if (!userDetails || !tickets?.length) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const { name, email, phone, event_id } = userDetails;

    // Insert ONE single consolidated row into bookings
    const rowToInsert = {
      payment_id: razorpayData?.razorpay_payment_id || razorpayData?.id || "mock_" + Date.now(),
      user_name: name,
      user_email: email,
      user_phone: phone,
      tickets: tickets,      // The array of {name, quantity, price} objects
      event_id: event_id     // Ensure the event id is logged
    };

    // Write to Supabase 'bookings' table
    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_URL !== "https://your-project.supabase.co") {
      const { data, error } = await supabase
        .from('bookings')
        .insert([rowToInsert])
        .select();

      if (error) {
        console.error("Supabase insert error:", error.message);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      const bookingId = data[0].id;

      // ==========================================
      // BACKEND NATIVE EMAIL DISPATCH (NODEMAILER)
      // ==========================================
      const { SMTP_EMAIL, SMTP_PASSWORD } = process.env;

      if (SMTP_EMAIL && SMTP_PASSWORD) {
        try {
          // Fetch event details for the email context
          let eventDetails: any = { name: "An Event", venue: "TBD", date: "TBD", time: "TBD", location: "" };
          const { data: eventData } = await supabase.from('events').select('name, date, time, venue, location').eq('id', event_id).single();
          if (eventData) {
            eventDetails = eventData;
          }

          // Dynamically capture the frontend app's origin domain (e.g. localhost or vercel)
          const appUrl = req.headers.get("origin") || "https://yourdomain.com";

          // Generate an HTML description of the tickets included in this booking
          const ticketsDescription = tickets.map((t: any) => `${t.quantity}x ${t.name}`).join(', ');

          const ticketsHTML = `
              <div style="border: 2px solid #e7e5e4; border-radius: 12px; padding: 24px; text-align: center; margin-bottom: 25px;">
                  <p style="font-size: 18px; font-weight: bold; margin-bottom: 10px; color: #1c1917;">You're In!</p>
                  <p style="font-size: 15px; color: #78716c; margin-bottom: 25px;">${ticketsDescription}</p>
                  
                  <a href="${appUrl}/bookings/${bookingId}" style="display: inline-block; background-color: #0057FF; color: #ffffff; text-decoration: none; padding: 14px 28px; font-size: 16px; font-weight: bold; border-radius: 10px; margin-bottom: 20px;">
                     View Digital Ticket & QR Code
                  </a>
              </div>
            `;

          const htmlContent = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1c1917;">
              <h1 style="color: #0057FF; text-align: center;">${tickets.length > 1 ? "Tickets" : "Ticket"} Confirmed!</h1>
              <p style="font-size: 16px;">Hi ${name || 'there'},</p>
              <p style="font-size: 16px; line-height: 1.5;">Your booking for ${eventDetails.name} has been successfully secured. Tap the button below to load your personalized event dashboard containing your check-in QR code, cancellation policies, and event details.</p>
              
              <div style="margin-top: 30px;">
                ${ticketsHTML}
              </div>

              <div style="background-color: #f8fafc; padding: 24px; border-radius: 16px; margin-top: 20px; border: 1px solid #f1f5f9;">
                 <h2 style="margin: 0 0 12px 0; font-size: 18px; color: #0f172a;">${eventDetails.name}</h2>
                 <p style="margin: 0 0 6px 0; font-size: 15px; color: #334155;">📍 <strong>${eventDetails.venue}</strong></p>
                 <p style="margin: 0 0 5px 0; font-size: 15px; color: #334155;">📅 ${eventDetails.date} at ${eventDetails.time}</p>
                 ${eventDetails.location ? `<p style="margin: 15px 0 0 0;"><a href="${eventDetails.location}" style="color: #0057FF; text-decoration: none; font-weight: 500;">Open in Maps →</a></p>` : ''}
              </div>
              
              <p style="font-size: 12px; color: #a8a29e; text-align: center; margin-top: 40px; border-top: 1px solid #f1f5f9; padding-top: 20px;">Powered by Aftr Events System</p>
            </div>
          `;

          const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: Number(process.env.SMTP_PORT),
            secure: true,
            auth: { user: SMTP_EMAIL, pass: SMTP_PASSWORD }
          });

          await transporter.sendMail({
            from: `"Aftr Events" <${SMTP_EMAIL}>`,
            to: email,
            subject: `Your ${eventDetails.name} ${tickets.length > 1 ? "Tickets" : "Ticket"}`,
            html: htmlContent,
          });

          console.log("Secure Native Email dispatched successfully!");
        } catch (e) {
          console.error("Nodemailer routing failed:", e);
        }
      } else {
        console.log("Bypassing Native Emails - Missing SMTP_EMAIL credentials in .env");
      }

      return NextResponse.json({ success: true, bookings: data });
    } else {
      // Return mock payload if no supabase keys provided yet
      console.log("MOCK DB: Returning generated data directly because Supabase URL isn't set");
      const mockBookingId = "mock-" + nanoid();
      return NextResponse.json({ success: true, bookings: [{ ...rowToInsert, id: mockBookingId }] });
    }
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
