import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type SortKey = "featured" | "price-asc" | "price-desc" | "newest";

interface Props {
  value: SortKey;
  onChange: (v: SortKey) => void;
}

const OPTIONS: { value: SortKey; label: string }[] = [
  { value: "featured", label: "Featured" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "newest", label: "Newest First" },
];

export default function SortDropdown({ value, onChange }: Props) {
  return (
    <div className="flex items-center gap-2 shrink-0">
      <span className="text-[12px] uppercase tracking-[0.1em] text-cream-muted hidden sm:inline">
        Sort by
      </span>
      <Select value={value} onValueChange={(v) => onChange(v as SortKey)}>
        <SelectTrigger className="h-9 min-w-[170px] rounded-md bg-[hsl(var(--bz-bg-card))] border border-[hsl(var(--bz-gold)/0.3)] text-gold text-xs uppercase tracking-[0.1em] focus:ring-1 focus:ring-[hsl(var(--bz-gold)/0.6)] focus:border-[hsl(var(--bz-gold)/0.6)]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="bg-[hsl(var(--bz-bg-card))] border-[hsl(var(--bz-gold)/0.3)]">
          {OPTIONS.map((o) => (
            <SelectItem
              key={o.value}
              value={o.value}
              className="text-cream focus:bg-[hsl(var(--bz-gold)/0.1)] focus:text-gold"
            >
              {o.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
