import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import screen1 from "../assets/images/app-screen-1.png";
import screen2 from "../assets/images/app-screen-2.png";
import screen3 from "../assets/images/app-screen-3.png";
import screen4 from "../assets/images/app-screen-4.png";
import screen5 from "../assets/images/app-screen-5.png";

const screens = [screen1, screen2, screen3, screen4, screen5];

const labels = [
  "Tela inicial",
  "Consultas",
  "Prontuário",
  "Medicamentos",
  "Perfil",
];

interface PhoneCarouselProps {
  autoPlay?: boolean;
  interval?: number;
}

export function PhoneCarousel({
  autoPlay = true,
  interval = 4000,
}: PhoneCarouselProps) {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (!autoPlay) return;
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % screens.length);
    }, interval);
    return () => clearInterval(timer);
  }, [autoPlay, interval]);

  const prev = () =>
    setCurrent((c) => (c - 1 + screens.length) % screens.length);
  const next = () => setCurrent((c) => (c + 1) % screens.length);

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Phone frame */}
      <div className="relative">
        {/* Navigation arrows - visible on hover */}
        <button
          onClick={prev}
          className="absolute left-[-40px] sm:left-[-50px] top-1/2 -translate-y-1/2 z-10 w-9 h-9 sm:w-10 sm:h-10 bg-white rounded-full shadow-lg flex items-center justify-center text-slate-600 hover:text-primary hover:scale-110 transition-all cursor-pointer border border-slate-200"
        >
          <ChevronLeft size={20} />
        </button>
        <button
          onClick={next}
          className="absolute right-[-40px] sm:right-[-50px] top-1/2 -translate-y-1/2 z-10 w-9 h-9 sm:w-10 sm:h-10 bg-white rounded-full shadow-lg flex items-center justify-center text-slate-600 hover:text-primary hover:scale-110 transition-all cursor-pointer border border-slate-200"
        >
          <ChevronRight size={20} />
        </button>

        {/* Phone */}
        <div className="aspect-[9/19.5] h-[420px] sm:h-[450px] bg-slate-900 rounded-[2.5rem] sm:rounded-[2.7rem] p-[9px] sm:p-[11px] shadow-2xl shadow-slate-900/30 relative">
          {/* Dynamic Island */}
          <div className="absolute top-[14px] sm:top-[16px] left-1/2 -translate-x-1/2 w-[80px] sm:w-[90px] h-[22px] sm:h-[24px] bg-slate-900 rounded-full z-20" />
          {/* Screen */}
          <div className="w-full h-full rounded-[2rem] sm:rounded-[2.2rem] overflow-hidden bg-white relative">
            <img
              src={screens[current]}
              alt={labels[current]}
              className="w-full h-full object-cover object-center transition-opacity duration-500"
            />
          </div>
        </div>
      </div>

      {/* Dots */}
      <div className="flex items-center gap-2">
        {screens.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrent(idx)}
            className={`rounded-full transition-all cursor-pointer border-none ${
              idx === current
                ? "w-8 h-2.5 bg-primary"
                : "w-2.5 h-2.5 bg-slate-300 hover:bg-slate-400"
            }`}
          />
        ))}
      </div>

      {/* Label */}
      <p className="text-sm font-medium text-slate-500">{labels[current]}</p>
    </div>
  );
}
