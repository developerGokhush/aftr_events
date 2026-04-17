"use client";

import { useState } from "react";
import { X, Plus, Minus } from "lucide-react";

interface TicketModalProps {
  isOpen: boolean;
  ticketTypes: any[];
  eventName: string;
  onClose: () => void;
  onProceed: (totalAmount: number, tickets: any[]) => void;
}

export default function TicketModal({ isOpen, ticketTypes, eventName, onClose, onProceed }: TicketModalProps) {
  const [quantities, setQuantities] = useState<{ [key: string]: number }>({
    "early-bird": 0,
    "regular": 0,
  });

  if (!isOpen) return null;

  const handleUpdate = (id: string, delta: number) => {
    setQuantities(prev => {
      const newQuantity = (prev[id] || 0) + delta;
      if (newQuantity < 0) return prev;
      return { ...prev, [id]: newQuantity };
    });
  };

  const totalAmount = ticketTypes.reduce(
    (sum, t) => sum + t.price * (quantities[t.id] || 0),
    0
  );

  const totalTickets = Object.values(quantities).reduce((a, b) => a + b, 0);

  const handleProceedClick = () => {
    if (totalTickets === 0) return;
    const selectedTickets = ticketTypes.map(t => ({
      ...t,
      quantity: quantities[t.id] || 0
    })).filter(t => t.quantity > 0);

    onProceed(totalAmount, selectedTickets);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/40 backdrop-blur-sm transition-opacity">
      <div className="bg-white w-full max-w-[500px] sm:rounded-3xl rounded-t-3xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] overflow-hidden flex flex-col max-h-[90vh]">

        {/* Header */}
        <div className="flex items-center justify-between p-5 md:p-6 border-b border-neutral-100 bg-white sticky top-0 z-10">
          <div>
            <h3 className="text-xl md:text-2xl font-black text-neutral-900 tracking-tight">Select Tickets</h3>
            <p className="text-[13px] font-bold text-neutral-500 mt-1 uppercase tracking-wider">{eventName}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 md:p-2.5 cursor-pointer rounded-full hover:bg-neutral-100 text-neutral-400 hover:text-neutral-700 transition-colors bg-white border border-transparent hover:border-neutral-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 md:p-6 space-y-4 bg-[#FAFAFA]">
          {ticketTypes.map(ticket => (
            <div key={ticket.id} className={`p-5 rounded-2xl border-2 transition-all flex flex-col gap-4 bg-white cursor-pointer ${quantities[ticket.id] ? 'border-[#0057FF] shadow-[0_4px_20px_rgba(0,87,255,0.08)]' : 'border-neutral-100 hover:border-neutral-200 hover:shadow-sm'}`}>
              <div className="flex justify-between items-start gap-4">
                <div className="flex-1">
                  <h4 className="font-bold text-[17px] text-neutral-900">{ticket.name}</h4>
                  <p className="text-[14px] text-neutral-500 mt-1 leading-relaxed">{ticket.description}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <span className="font-black text-[17px] text-neutral-900">₹{ticket.price}</span>
                </div>
              </div>

              <div className="flex justify-between items-center mt-1 pt-4 border-t border-dashed border-neutral-200">
                <span className="text-[13px] text-neutral-500 font-bold uppercase tracking-widest">Quantity</span>
                <div className="flex items-center gap-1 bg-white border border-neutral-200 rounded-lg p-1 shadow-sm">
                  <button
                    onClick={(e) => { e.stopPropagation(); handleUpdate(ticket.id, -1); }}
                    disabled={!quantities[ticket.id]}
                    className="p-2 rounded-md text-neutral-400 cursor-pointer hover:text-neutral-900 hover:bg-neutral-100 disabled:opacity-30 disabled:hover:bg-transparent transition-all"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-8 text-center font-bold text-[17px] text-neutral-900">
                    {quantities[ticket.id] || 0}
                  </span>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleUpdate(ticket.id, 1); }}
                    className="p-2 rounded-md text-neutral-400 cursor-pointer hover:text-[#0057FF] hover:bg-blue-50 transition-all font-bold"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="bg-white border-t border-neutral-100 shadow-[0_-10px_20px_rgba(0,0,0,0.02)] z-10">
          <div className="p-5 md:p-6 flex flex-col gap-4">
            <div className="flex justify-between items-center bg-neutral-50 p-4 rounded-xl border border-neutral-100">
              <span className="text-[13px] font-bold text-neutral-500 uppercase tracking-widest">Order Total</span>
              <span className="text-2xl font-black text-neutral-900">₹{totalAmount}</span>
            </div>
            <button
              disabled={totalTickets === 0}
              onClick={handleProceedClick}
              className="w-full bg-[#0057FF] cursor-pointer disabled:bg-neutral-200 disabled:text-neutral-400 disabled:cursor-not-allowed hover:bg-[#0046CC] text-white font-bold py-4 px-6 rounded-2xl shadow-[0_8px_20px_rgba(0,87,255,0.25)] transition-all flex items-center justify-center gap-2 text-[17px] transform active:scale-[0.98]"
            >
              <span>Continue • {totalTickets} Ticket{totalTickets !== 1 ? 's' : ''}</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
