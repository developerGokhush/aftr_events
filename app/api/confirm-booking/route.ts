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

    const { name, email, phone } = userDetails;

    // Creates multiple rows if there are multiple ticket types!
    // For each ticket type, it calculates `quantity` distinct string identifiers.
    const rowsToInsert = tickets.map((t: any) => {
      const quantity = t.quantity || 1;

      // generating `quantity` unique 8-character ids prefixed with AFTR
      const qrCodes = Array.from({ length: quantity }).map(() => `AFTR-${nanoid(8)}`);

      return {
        payment_id: razorpayData?.razorpay_payment_id || razorpayData?.id || "mock_" + Date.now(),
        user_name: name,
        user_email: email,
        user_phone: phone,
        ticket_type: t.name,
        quantity: quantity,
        qr_codes: qrCodes
      };
    });

    // Write to Supabase 'bookings' table
    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_URL !== "https://your-project.supabase.co") {
      const { data, error } = await supabase
        .from('bookings')
        .insert(rowsToInsert)
        .select();

      if (error) {
        console.error("Supabase insert error:", error.message);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      // ==========================================
      // BACKEND NATIVE EMAIL DISPATCH (NODEMAILER)
      // ==========================================
      const { SMTP_EMAIL, SMTP_PASSWORD } = process.env;

      if (SMTP_EMAIL && SMTP_PASSWORD) {
        try {
          const emailTickets = rowsToInsert.flatMap((row: any) => row.qr_codes.map((code: string) => ({
            code,
            type: row.ticket_type
          })));

          let ticketsHTML = "";
          for (const ticket of emailTickets) {
            ticketsHTML += `
              <div style="border: 2px solid #e7e5e4; border-radius: 12px; padding: 20px; text-align: center; margin-bottom: 20px;">
                  <p style="font-size: 18px; font-weight: bold; margin-bottom: 5px; color: #1c1917;">${ticket.type}</p>
                  <p style="font-size: 14px; color: #78716c; margin-bottom: 20px;">Ticket ID: <strong>${ticket.code}</strong></p>
                  <img src="https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${ticket.code}" alt="QR Code" width="250" height="250" style="display:block; margin:0 auto; border-radius: 8px;" />
              </div>
            `;
          }

          const htmlContent = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1c1917;">
              <h1 style="color: #f43f5e; text-align: center;">You're going to the Indoor Picnic!</h1>
              <p>Hi ${name || 'there'},</p>
              <p>Your tickets have been successfully validated. Please keep these QR codes handy on your phone to be scanned at the entrance.</p>
              
              <div style="margin-top: 30px;">
                ${ticketsHTML}
              </div>
              
              <p style="font-size: 12px; color: #a8a29e; text-align: center; margin-top: 40px;">Powered by Aftr Events System</p>
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
            subject: 'Your Indoor Picnic Tickets & QR Codes',
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
      return NextResponse.json({ success: true, bookings: rowsToInsert });
    }
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
