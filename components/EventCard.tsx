"use client";

import { Calendar, MapPin } from "lucide-react";
import { useRouter } from "next/navigation";

interface EventCardProps {
  event: any;
}

export default function EventCard({ event }: EventCardProps) {
  const router = useRouter();

  return (
    <div
      onClick={() => event?.is_active !== false && router.push(`/events/${event.id}`)}
      className={`group bg-white cursor-pointer rounded-[2rem] border border-neutral-200 overflow-hidden flex flex-col ${event?.is_active === false ? 'grayscale opacity-60 cursor-not-allowed shadow-none' : 'shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_10px_40px_rgba(0,0,0,0.08)] transition-all cursor-pointer'}`}
    >
      <div className="relative w-full aspect-[4/3] bg-neutral-100 overflow-hidden">
        <img src={event?.image_urls?.length > 0 ? event?.image_urls[0] : null} alt={`Thumbnail`} className="object-cover" />
        {event?.is_active === false && (
          <div className="absolute inset-0 bg-white/20 backdrop-blur-[1.5px] z-10 flex items-center justify-center">
            <div className="bg-white/95 text-neutral-800 font-bold px-4 py-2 rounded-xl shadow-sm border border-neutral-200 uppercase tracking-widest text-[13px]">
              Ended
            </div>
          </div>
        )}
        {event?.is_active !== false && (
          <div className="absolute top-4 left-4 inline-flex items-center font-bold text-xs uppercase tracking-widest text-[#0057FF] bg-blue-50 px-3 py-1.5 rounded-full z-10 shadow-sm border border-white/50">
            {event?.date || "TBD"}
          </div>
        )}
      </div>

      <div className="p-6 md:p-8 flex-1 flex flex-col">
        <h3 className="text-2xl font-black text-neutral-900 tracking-tight leading-tight mb-2 group-hover:text-[#0057FF] transition-colors">
          {event.name}
        </h3>

        <p className="text-neutral-500 text-[15px] font-medium line-clamp-2 mb-6 flex-1">
          {event.description}
        </p>

        <div className="flex flex-col gap-3 mt-auto pt-5 border-t border-neutral-100">
          <div className="flex items-center gap-2 text-neutral-500 font-medium text-sm">
            <MapPin className="w-4 h-4 text-[#0057FF]" />
            <span className="truncate">{event.venue}</span>
          </div>
          <div className="flex items-center gap-2 text-neutral-500 font-medium text-sm">
            <Calendar className="w-4 h-4 text-[#0057FF]" />
            <span>{event.date} • {event.time}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
