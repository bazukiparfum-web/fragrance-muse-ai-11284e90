import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

interface CitySearchProps {
  value: string;
  onChange: (city: string) => void;
}

export const CitySearch = ({ value, onChange }: CitySearchProps) => {
  return (
    <div className="relative">
      <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
      <Input
        type="text"
        placeholder="Search city"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="pl-12 text-lg py-6 bg-muted/50 border-border"
      />
    </div>
  );
};
