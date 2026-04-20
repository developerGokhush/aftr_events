"use client";

import { useState } from "react";
import { ArrowLeft, ShieldCheck, Ticket, Tag, ChevronUp, ChevronDown } from "lucide-react";

interface CheckoutFormProps {
  event?: any;
  totalAmount: number;
  tickets: any[];
  isProcessing?: boolean;
  onBack: () => void;
  onPay: (details: any) => void;
}

export default function CheckoutForm({ event, totalAmount, tickets, isProcessing, onBack, onPay }: CheckoutFormProps) {
  const OrderSummaryView = () => (
    <div className="bg-white border text-left border-neutral-200 rounded-[24px] p-5 md:p-6 shadow-[0_4px_20px_rgba(0,0,0,0.03)] w-full">
      {/* Event Header */}
      <div className="flex items-center gap-4 mb-5">
        <div className="w-16 h-16 rounded-xl bg-neutral-100 overflow-hidden shrink-0 relative">
          {/* <div className="absolute inset-0 bg-gradient-to-br from-[#ffb4a2] via-[#e5989b] to-[#b5838d] opacity-90" /> */}
          <img src={event?.image_urls?.length > 0 ? event?.image_urls[0] : null} alt={`Thumbnail`} className="w-full h-full object-cover" />
        </div>
        <div>
          <h4 className="font-black text-neutral-900 text-[17px] leading-tight uppercase">
            {event?.name || "Loading Event..."}
          </h4>
          <p className="text-sm text-neutral-500 font-bold mt-1">
            by {event?.hostname ? `@${event.hostname}` : "@aftr.hyd"}
          </p>
        </div>
      </div>

      <div className="border-t border-neutral-100 my-5"></div>

      {/* Title */}
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
          <Ticket className="w-5 h-5 text-blue-600" />
        </div>
        <h3 className="text-xl font-bold text-neutral-900">Booking Summary</h3>
      </div>

      {/* Ticket List */}
      <div className="space-y-4">
        {tickets.map(ticket => (
          <div key={ticket.id} className="bg-[#F8F9FA] border border-neutral-100 rounded-2xl p-4 md:p-5">
            <div className="flex justify-between items-start mb-3">
              <div className="flex flex-col gap-2">
                <div className="flex gap-4 md:gap-8 items-center">
                  <h5 className="font-bold text-neutral-900 text-lg md:text-xl">{ticket.name}</h5>
                  <span className="hidden md:inline-block bg-blue-600 text-white font-bold text-[13px] px-4 py-1.5 rounded-full shadow-sm transition-all">
                    {ticket.quantity} Ticket{ticket.quantity > 1 ? 's' : ''}
                  </span>
                </div>
                <p className="text-neutral-500 text-[15px] font-medium mt-1">
                  {event?.date || "TBD"} • {event?.time || "TBD"}
                </p>
                <span className="inline-block md:hidden bg-blue-600 text-white font-bold text-[12px] px-4 py-1.5 rounded-full w-auto max-w-fit shadow-sm mt-1">
                  {ticket.quantity} Ticket{ticket.quantity > 1 ? 's' : ''}
                </span>
              </div>
              <div className="text-right shrink-0 ml-4 flex flex-col gap-2">
                <p className="text-2xl font-bold text-blue-600">₹{(ticket.price * ticket.quantity).toFixed(2)}</p>
                <p className="text-neutral-500 text-[13px] font-medium mt-1 uppercase tracking-widest text-right">
                  ₹{ticket.price.toFixed(2)} × {ticket.quantity}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-3 hidden md:block">
        {(event?.has_gst || event?.has_platform_fee || event?.has_payment_charge) && (
          <div>
            <div className="border-t border-neutral-100 my-5"></div>
            <div className="flex justify-between text-[#4b5563] font-medium text-[15px]">
              <span>Subtotal ({totalTicketCount} tickets)</span>
              <span className="font-bold text-neutral-800">₹{subtotal.toFixed(2)}</span>
            </div>
            {event?.has_gst &&
              <div className="flex justify-between text-[#4b5563] font-medium text-[15px]">
                <span>GST</span>
                <span className="font-bold text-neutral-800">₹{gst.toFixed(2)}</span>
              </div>
            }
            {event?.has_platform_fee &&
              <div className="flex justify-between text-[#4b5563] font-medium text-[15px]">
                <span>Platform Fee</span>
                <span className="font-bold text-neutral-800">₹{platformFee.toFixed(2)}</span>
              </div>
            }
            {event?.has_payment_charge &&
              <div className="flex justify-between text-[#4b5563] font-medium text-[15px]">
                <span>Payment Gateway Fee</span>
                <span className="font-bold text-neutral-800">₹{pgFee.toFixed(2)}</span>
              </div>
            }
          </div>
        )}
      </div>
      <div className="border-t border-neutral-100 my-2 pt-3 flex justify-between items-center">
        <span className="text-base font-bold text-neutral-900">Total</span>
        <span className="text-xl font-black text-blue-600">₹{finalComputedTotal}</span>
      </div>
    </div>
  );

  const [couponCode, setCouponCode] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
  });
  const [errors, setErrors] = useState({
    name: "",
    email: "",
    phone: "",
  });
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const subtotal = tickets.reduce((sum, t) => sum + (t.price * t.quantity), 0);
  const totalTicketCount = tickets.reduce((sum, t) => sum + t.quantity, 0);
  const gst = event?.has_gst ? subtotal * event?.gst_percent / 100 : 0;
  const platformFee = event?.has_platform_fee ? event?.platform_fee : 0;
  const pgFee = event?.has_payment_charge ? (subtotal + gst + platformFee) * event?.payment_charges / 100 : 0;
  const finalComputedTotal = (subtotal + gst + platformFee + pgFee).toFixed(2);

  const handleBlur = (field: 'name' | 'email' | 'phone') => {
    let errorMsg = "";
    if (field === 'name') {
      if (!formData.name.trim() || formData.name.length < 2) {
        errorMsg = "Please enter a valid name (min. 2 characters).";
      }
    } else if (field === 'email') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (formData.email.length > 0 && !emailRegex.test(formData.email)) {
        errorMsg = "Please enter a valid email address.";
      }
    } else if (field === 'phone') {
      const phoneRegex = /^[0-9]{10}$/;
      if (formData.phone.length > 0 && !phoneRegex.test(formData.phone)) {
        errorMsg = "Please enter a valid 10-digit phone number.";
      }
    }
    setErrors(prev => ({ ...prev, [field]: errorMsg }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors = { name: "", email: "", phone: "" };
    let hasError = false;

    // Explicit Validations before submission
    if (!formData.name.trim() || formData.name.length < 2) {
      newErrors.name = "Please enter a valid name (min. 2 characters).";
      hasError = true;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      newErrors.email = "Please enter a valid email address.";
      hasError = true;
    }
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(formData.phone)) {
      newErrors.phone = "Please enter a valid 10-digit phone number.";
      hasError = true;
    }

    setErrors(newErrors);

    if (hasError) return;

    onPay(formData);
  };

  const isFormIncomplete = !formData.name.trim() || !formData.email.trim() || !formData.phone.trim();
  const hasErrors = Object.values(errors).some(err => err !== "");
  const isPayDisabled = isFormIncomplete || hasErrors || isProcessing;

  const handleApplyCoupon = () => {
    // Basic UI placeholder for when we wire up to the new DB table
    if (!couponCode.trim()) return;
    alert(`Checking coupon: ${couponCode}`);
  };

  return (
    <div className="w-full bg-[#FAFAFA] min-h-screen pb-24 md:pb-0 animate-page-transition">
      {isProcessing && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-white/80 backdrop-blur-md px-4">
          <div className="bg-white p-6 md:p-8 rounded-3xl shadow-2xl flex flex-col items-center max-w-sm w-full text-center border border-neutral-100 animate-in zoom-in-95 duration-200">
            <div className="w-14 h-14 border-4 border-[#0057FF]/20 border-t-[#0057FF] rounded-full animate-spin mb-6"></div>
            <h3 className="text-xl font-black text-neutral-900 mb-2">Processing Booking</h3>
            <p className="text-neutral-600 font-medium leading-relaxed text-[15px]">
              Please wait while we securely process your payment.
              <br/>
              <span className="text-red-500 font-bold inline-block mt-2">Do not refresh or exit this page.</span>
            </p>
          </div>
        </div>
      )}

      <div className="sticky top-0 bg-white/90 backdrop-blur-xl z-20 p-4 md:px-8 border-b border-neutral-100 flex items-center gap-4 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
        <button onClick={onBack} className="p-2 -ml-2 cursor-pointer rounded-full hover:bg-neutral-100 transition-colors">
          <ArrowLeft className="w-5 h-5 text-neutral-600" />
        </button>
        <h2 className="text-xl font-bold text-neutral-900 tracking-tight">Checkout</h2>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8 md:py-12 md:px-8 flex flex-col justify-center items-center gap-8">
        <div className="flex flex-col md:flex-row gap-8 lg:gap-16 items-start w-full">

          {/* Contact Form (Left on Desktop, Bottom on Mobile logically, but we place it manually) */}
          <div className="w-full md:w-1/2 order-2 md:order-1 flex flex-col gap-4">
            {/* Order Summary */}
            <div className="md:hidden">
              <OrderSummaryView />
            </div>

            <form id="checkoutform" onSubmit={handleSubmit} className="space-y-6 bg-white p-6 md:p-8 rounded-3xl border border-neutral-200 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
              <h3 className="text-xl font-bold text-neutral-900 mb-2">Guest Details</h3>
              <div className="space-y-2">
                <label className="text-sm font-bold text-neutral-700">Full Name</label>
                <input
                  required
                  minLength={2}
                  type="text"
                  placeholder="Enter your name"
                  value={formData.name}
                  onChange={(e) => {
                    setFormData({ ...formData, name: e.target.value });
                    if (errors.name) setErrors({ ...errors, name: "" });
                  }}
                  onBlur={() => handleBlur('name')}
                  className={`w-full p-4 rounded-xl border ${errors.name ? 'border-red-400 focus:ring-red-400/20 focus:border-red-400' : 'border-neutral-300 focus:ring-[#0057FF]/20 focus:border-[#0057FF]'} bg-white focus:outline-none focus:ring-2 transition-all text-neutral-900 font-medium placeholder:text-neutral-400`}
                />
                {errors.name && <p className="text-sm font-medium text-red-500 mt-1">{errors.name}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-neutral-700">Email Address</label>
                <input
                  required
                  type="email"
                  placeholder="your@email.com"
                  value={formData.email}
                  onChange={(e) => {
                    setFormData({ ...formData, email: e.target.value });
                    if (errors.email) setErrors({ ...errors, email: "" });
                  }}
                  onBlur={() => handleBlur('email')}
                  className={`w-full p-4 rounded-xl border ${errors.email ? 'border-red-400 focus:ring-red-400/20 focus:border-red-400' : 'border-neutral-300 focus:ring-[#0057FF]/20 focus:border-[#0057FF]'} bg-white focus:outline-none focus:ring-2 transition-all text-neutral-900 font-medium placeholder:text-neutral-400`}
                />
                {errors.email && <p className="text-sm font-medium text-red-500 mt-1">{errors.email}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-neutral-700">Phone Number</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500 font-medium">+91</span>
                  <input
                    required
                    type="tel"
                    pattern="[0-9]{10}"
                    placeholder="98765 43210"
                    value={formData.phone}
                    onChange={(e) => {
                      setFormData({ ...formData, phone: e.target.value });
                      if (errors.phone) setErrors({ ...errors, phone: "" });
                    }}
                    onBlur={() => handleBlur('phone')}
                    className={`w-full p-4 pl-12 rounded-xl border ${errors.phone ? 'border-red-400 focus:ring-red-400/20 focus:border-red-400' : 'border-neutral-300 focus:ring-[#0057FF]/20 focus:border-[#0057FF]'} bg-white focus:outline-none focus:ring-2 transition-all text-neutral-900 font-medium placeholder:text-neutral-400`}
                  />
                </div>
                {errors.phone && <p className="text-sm font-medium text-red-500 mt-1">{errors.phone}</p>}
              </div>
            </form>

            {/* Coupon Box */}
            <div className="bg-white p-6 md:px-8 md:py-6 rounded-3xl border border-neutral-200 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                  <Tag className="w-5 h-5 text-[#0057FF]" />
                </div>
                <h3 className="text-xl font-bold text-neutral-900">Have a Coupon?</h3>
              </div>

              <div className="space-y-3">
                <label className="text-sm font-bold text-neutral-700">Coupon Code</label>
                <div className="flex items-center border border-neutral-300 rounded-xl bg-white focus-within:ring-2 focus-within:ring-[#0057FF]/20 focus-within:border-[#0057FF] transition-all overflow-hidden h-[56px] md:h-[60px]">
                  <input
                    type="text"
                    placeholder="Enter Coupon Code"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    className="flex-1 px-4 text-neutral-900 font-bold placeholder:text-neutral-400 placeholder:font-medium bg-transparent focus:outline-none uppercase tracking-widest placeholder:normal-case placeholder:tracking-normal w-full"
                  />
                  <div className="w-px h-6 bg-neutral-200 shrink-0" />
                  <button
                    type="button"
                    onClick={handleApplyCoupon}
                    className="px-6 font-bold cursor-pointer text-neutral-900 hover:text-[#0057FF] transition-colors h-full shrink-0"
                  >
                    Apply
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Order Summary (Right on Desktop, Top on Mobile) */}
          <div className="w-full md:w-1/2 order-1 md:order-2 md:sticky md:top-24 hidden md:block">
            <OrderSummaryView />
          </div>

        </div>

        <div className="flex flex-col items-center gap-3 justify-center text-[11px] font-medium text-neutral-500 mb:mt-16 max-w-[400px] mx-auto text-center leading-relaxed mb-8 md:mb-0">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-neutral-400 flex-shrink-0" />
            <span>Payments are processed securely through our encrypted payment gateway.</span>
          </div>
          <p className="text-[11px] text-neutral-400 max-w-[300px] hidden md:block">
            By proceeding with this payment, you agree to our <a href="/terms" target="_blank" className="underline text-neutral-500">Terms & Conditions</a> and <a href="/cancellation-policy" target="_blank" className="underline text-neutral-500">Cancellation Policy</a>.
          </p>
        </div>
        {/* Desktop form submit button placed inline */}
        <div className="hidden md:block w-2/5">
          <button
            type="submit"
            form="checkoutform"
            disabled={isPayDisabled}
            className={`w-full text-white font-bold text-[17px] py-4 px-6 rounded-2xl transition-all ${isPayDisabled ? 'bg-[#D1D5DB] cursor-not-allowed shadow-none' : 'bg-[#0057FF] hover:bg-[#0046CC] shadow-[0_8px_20px_rgba(0,87,255,0.25)] transform active:scale-[0.98]'}`}
          >
            {isProcessing ? "Processing Securely..." : `Pay ₹${finalComputedTotal}`}
          </button>
          {isFormIncomplete && (
            <p className="text-[#ef4444] text-[13px] font-bold text-center mt-3 tracking-snug">Please fill all required details to continue</p>
          )}
        </div>
      </div>

      {/* Mobile sticky submit button */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-20">
        {(event?.has_gst || event?.has_platform_fee || event?.has_payment_charge) && (
          <div className="bg-[#f8f9fa] border-t border-[#e5e7eb] w-full text-[15px]">
            <button
              type="button"
              onClick={() => setIsDetailsOpen(!isDetailsOpen)}
              className="flex items-center cursor-pointer justify-between w-full px-5 py-4"
            >
              <div className="flex items-center gap-2 text-[#6b7280] font-bold text-sm">
                {isDetailsOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
                {isDetailsOpen ? "Hide details" : "View details"}
              </div>
              <div className="font-black text-neutral-900 text-base">
                Total: ₹{finalComputedTotal}
              </div>
            </button>

            {isDetailsOpen && (
              <div className="px-5 pb-5 flex flex-col gap-3 animate-in slide-in-from-bottom-2 fade-in">
                <div className="w-full h-px bg-[#e5e7eb] mb-2" />
                <div className="flex justify-between text-[#4b5563] font-medium text-sm">
                  <span>Subtotal ({totalTicketCount} tickets)</span>
                  <span className="font-bold text-[#1f2937]">₹{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-[#4b5563] font-medium text-sm">
                  <span>GST</span>
                  <span className="font-bold text-[#1f2937]">₹{gst?.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-[#4b5563] font-medium text-sm">
                  <span>Platform Fee</span>
                  <span className="font-bold text-[#1f2937]">₹{platformFee?.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-[#4b5563] font-medium text-sm">
                  <span>Payment Gateway Fee</span>
                  <span className="font-bold text-[#1f2937]">₹{pgFee?.toFixed(2)}</span>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="bg-white/95 backdrop-blur-md px-4 pt-3 pb-4">
          <p className="text-[11px] text-neutral-400 text-center mb-3">
            By proceeding, you agree to our <a href="/terms" target="_blank" className="underline text-neutral-500">Terms</a> and <a href="/cancellation-policy" target="_blank" className="underline text-neutral-500">Cancellation Policy</a>.
          </p>
          <button
            type="submit"
            form="checkoutform"
            disabled={isPayDisabled}
            className={`w-full block text-white font-bold text-[17px] py-[14px] px-6 rounded-2xl transition-all ${isPayDisabled ? 'bg-[#D1D5DB] cursor-not-allowed shadow-none' : 'bg-[#0057FF] hover:bg-[#0046CC] shadow-[0_8px_20px_rgba(0,87,255,0.25)] transform active:scale-[0.98]'}`}
          >
            {isProcessing ? "Processing Securely..." : `Pay \t₹${finalComputedTotal}`}
          </button>
          {isFormIncomplete && (
            <p className="text-[#ef4444] text-[13px] font-bold text-center mt-3 mb-1 tracking-snug">Please fill all required details to continue</p>
          )}
        </div>
      </div>
    </div>
  );
}
