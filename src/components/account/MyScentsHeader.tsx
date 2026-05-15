import { Sparkles } from 'lucide-react';

interface Props {
  fullName?: string | null;
  email?: string | null;
  memberSince?: string | null;
  savedScents: any[];
}

const FAMILY_LABELS: Record<string, string> = {
  woody: 'Woody',
  oriental: 'Oriental',
  floral: 'Floral',
  citrus: 'Citrus',
  fresh: 'Fresh',
  musky: 'Musky',
  amber: 'Amber',
  spicy: 'Spicy',
  green: 'Green',
  aquatic: 'Aquatic',
};

function deriveProfile(scents: any[]): string | null {
  if (!scents?.length) return null;
  const familyCount: Record<string, number> = {};
  let intensitySum = 0;
  let intensityN = 0;
  for (const s of scents) {
    if (typeof s.intensity === 'number') {
      intensitySum += s.intensity;
      intensityN += 1;
    }
    const formula = Array.isArray(s.formula) ? s.formula : [];
    for (const note of formula) {
      const fam = (note?.family || note?.category || '').toString().toLowerCase();
      if (!fam) continue;
      familyCount[fam] = (familyCount[fam] || 0) + (note.percentage || 1);
    }
  }
  const top = Object.entries(familyCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 2)
    .map(([k]) => FAMILY_LABELS[k] || k.charAt(0).toUpperCase() + k.slice(1));
  if (!top.length) return null;
  const avg = intensityN ? intensitySum / intensityN : 0;
  const intensityLabel =
    avg >= 7 ? 'Bold Intensity' : avg >= 4 ? 'Balanced Intensity' : avg > 0 ? 'Soft Intensity' : null;
  const familyStr = top.join(' ');
  return intensityLabel ? `${familyStr} · ${intensityLabel}` : familyStr;
}

export function MyScentsHeader({ fullName, email, memberSince, savedScents }: Props) {
  const name = fullName || email?.split('@')[0] || 'Friend';
  const profile = deriveProfile(savedScents);
  const memberSinceLabel = memberSince
    ? new Date(memberSince).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })
    : null;

  return (
    <div className="rounded-2xl border border-primary/20 bg-gradient-to-br from-background via-background to-primary/5 p-6 md:p-8">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-primary/80 mb-2">My Scent Library</p>
          <h1 className="font-serif text-3xl md:text-4xl text-foreground">
            Welcome back, <span className="text-primary">{name}</span>
          </h1>
          {memberSinceLabel && (
            <p className="text-sm text-muted-foreground mt-2">Member since {memberSinceLabel}</p>
          )}
        </div>
        {profile && (
          <div className="inline-flex items-center gap-2 self-start md:self-auto rounded-full border border-primary/40 bg-primary/10 px-4 py-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-sm text-foreground">
              <span className="text-muted-foreground mr-1">Your scent profile:</span>
              <span className="font-medium text-primary">{profile}</span>
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
