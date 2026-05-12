import { ICONS, IMAGES } from "../constants";

export const TopBar = () => {
  return (
    <header className="w-full sticky top-0 z-40 bg-slate-50/80 backdrop-blur-lg flex justify-between items-center px-8 py-4">
      <h1 className="font-manrope font-bold text-lg tracking-tight text-primary">
        Dashboard
      </h1>

      <div className="flex items-center space-x-4">
        <div className="relative group">
          <span className="absolute inset-y-0 left-3 flex items-center text-slate-400">
            <ICONS.Search size={18} />
          </span>
          <input
            className="bg-slate-200/50 border-none rounded-full py-2 pl-10 pr-4 w-64 focus:ring-2 focus:ring-primary/20 transition-all text-sm outline-none"
            placeholder="Search patients or records..."
            type="text"
          />
        </div>

        <button className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-slate-200/50 transition-colors active:scale-95 duration-150 text-on-surface-variant">
          <ICONS.Bell size={20} />
        </button>

        <button className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-slate-200/50 transition-colors active:scale-95 duration-150 text-on-surface-variant">
          <ICONS.Settings size={20} />
        </button>

        <div className="h-8 w-px bg-slate-200 mx-2"></div>

        <div className="flex items-center space-x-3 pl-2">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-bold text-on-surface">Dr. Smith</p>
            <p className="text-[10px] text-on-surface-variant">
              Senior Cardiologist
            </p>
          </div>
          <img
            alt="Profile"
            className="w-9 h-9 rounded-full object-cover ring-2 ring-primary/10"
            src={IMAGES.Profile}
          />
        </div>
      </div>
    </header>
  );
};
