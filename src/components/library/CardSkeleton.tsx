export default function CardSkeleton() {
  return (
    <div className="relative overflow-hidden rounded-xl border border-gold bg-[#1A1A1A]">
      <div className="relative aspect-[4/5] w-full bg-[#1A1A1A]">
        <div className="shimmer-gold absolute inset-0" />
      </div>
      <div className="p-5 space-y-3">
        <div className="h-5 w-2/3 rounded bg-white/5 relative overflow-hidden">
          <div className="shimmer-gold absolute inset-0" />
        </div>
        <div className="h-4 w-1/3 rounded bg-white/5 relative overflow-hidden">
          <div className="shimmer-gold absolute inset-0" />
        </div>
        <div className="h-10 w-full rounded-pill bg-white/5 relative overflow-hidden">
          <div className="shimmer-gold absolute inset-0" />
        </div>
      </div>
    </div>
  );
}
