import { useEffect, useState } from 'react';
import { X, Search } from 'lucide-react';

interface SearchOverlayProps {
  open: boolean;
  onClose: () => void;
}

export const SearchOverlay = ({ open, onClose }: SearchOverlayProps) => {
  const [query, setQuery] = useState('');

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[70] bg-[#0A0A0A]/95 backdrop-blur-sm animate-fade-in">
      <button
        onClick={onClose}
        aria-label="Close search"
        className="absolute top-6 right-6 text-[#C8B99A] hover:text-[#C9A84C] transition-colors"
      >
        <X strokeWidth={1} size={28} />
      </button>

      <div className="flex flex-col items-center justify-center h-full px-6">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            // UI only for now
            console.log('search:', query);
          }}
          className="w-full max-w-2xl"
        >
          <div className="flex items-center gap-4 border-b border-[#C9A84C]/40 pb-3">
            <Search strokeWidth={1} size={24} className="text-[#C9A84C]" />
            <input
              autoFocus
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search fragrances, notes, collections…"
              className="flex-1 bg-transparent border-0 outline-none font-cormorant text-2xl md:text-3xl text-[#F5ECD7] placeholder:text-[#C8B99A]/50"
            />
          </div>
          <p className="mt-4 text-[11px] uppercase tracking-[0.2em] text-[#C8B99A]/60">
            Press Enter to search · ESC to close
          </p>
        </form>
      </div>
    </div>
  );
};
