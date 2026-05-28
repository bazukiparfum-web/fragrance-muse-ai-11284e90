import { useMemo, useState } from 'react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { AlertTriangle, Plus, Pencil, Check, Loader2 } from 'lucide-react';

export interface PreviewBuckets {
  new: any[];
  updated: { fragrance_code: string; current_version: number; diff: Record<string, { from: any; to: any }>; incoming: any }[];
  unchanged: { fragrance_code: string }[];
  invalid: { fragrance_code: string; reason: string }[];
}

interface Props {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  preview: PreviewBuckets | null;
  applying: boolean;
  onApply: (resolutions: Record<string, 'apply' | 'skip'>, formulas: any[]) => void;
}

export function FormulaImportPreviewDialog({ open, onOpenChange, preview, applying, onApply }: Props) {
  // Default: apply everything actionable
  const [skips, setSkips] = useState<Set<string>>(new Set());

  const allCodes = useMemo(() => {
    if (!preview) return [] as string[];
    return [...preview.new.map((f) => f.fragrance_code), ...preview.updated.map((u) => u.fragrance_code)];
  }, [preview]);

  const toggle = (code: string) => {
    setSkips((prev) => {
      const next = new Set(prev);
      if (next.has(code)) next.delete(code); else next.add(code);
      return next;
    });
  };

  const setAllUpdated = (skip: boolean) => {
    if (!preview) return;
    setSkips((prev) => {
      const next = new Set(prev);
      for (const u of preview.updated) {
        if (skip) next.add(u.fragrance_code); else next.delete(u.fragrance_code);
      }
      return next;
    });
  };

  const handleApply = () => {
    if (!preview) return;
    const resolutions: Record<string, 'apply' | 'skip'> = {};
    const formulas: any[] = [];
    for (const f of preview.new) {
      resolutions[f.fragrance_code] = skips.has(f.fragrance_code) ? 'skip' : 'apply';
      formulas.push(f);
    }
    for (const u of preview.updated) {
      resolutions[u.fragrance_code] = skips.has(u.fragrance_code) ? 'skip' : 'apply';
      formulas.push(u.incoming);
    }
    onApply(resolutions, formulas);
  };

  const applyCount = allCodes.filter((c) => !skips.has(c)).length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Import preview</DialogTitle>
          <DialogDescription>
            Review changes before applying. Updates bump version. Existing rows are not deleted.
          </DialogDescription>
        </DialogHeader>

        {!preview ? (
          <div className="py-12 flex justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <Tabs defaultValue="updated" className="flex-1 overflow-hidden flex flex-col">
            <TabsList className="grid grid-cols-4 w-full">
              <TabsTrigger value="new">
                <Plus className="h-3.5 w-3.5 mr-1" /> New ({preview.new.length})
              </TabsTrigger>
              <TabsTrigger value="updated">
                <Pencil className="h-3.5 w-3.5 mr-1" /> Updated ({preview.updated.length})
              </TabsTrigger>
              <TabsTrigger value="unchanged">
                <Check className="h-3.5 w-3.5 mr-1" /> Unchanged ({preview.unchanged.length})
              </TabsTrigger>
              <TabsTrigger value="invalid">
                <AlertTriangle className="h-3.5 w-3.5 mr-1" /> Invalid ({preview.invalid.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="new" className="flex-1 overflow-hidden mt-3">
              <ScrollArea className="h-[45vh] pr-3">
                {preview.new.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">No new formulas to insert.</p>
                ) : (
                  <ul className="space-y-1.5">
                    {preview.new.map((f) => (
                      <li key={f.fragrance_code} className="flex items-center gap-3 p-2 rounded border bg-muted/30">
                        <Checkbox
                          checked={!skips.has(f.fragrance_code)}
                          onCheckedChange={() => toggle(f.fragrance_code)}
                        />
                        <span className="font-mono text-xs">{f.fragrance_code}</span>
                        <span className="text-sm">{f.formula_name}</span>
                        <Badge variant="outline" className="ml-auto">{f.total_volume_ml}ml</Badge>
                      </li>
                    ))}
                  </ul>
                )}
              </ScrollArea>
            </TabsContent>

            <TabsContent value="updated" className="flex-1 overflow-hidden mt-3">
              {preview.updated.length > 0 && (
                <div className="flex gap-2 mb-2">
                  <Button size="sm" variant="outline" onClick={() => setAllUpdated(false)}>Apply all</Button>
                  <Button size="sm" variant="outline" onClick={() => setAllUpdated(true)}>Skip all</Button>
                </div>
              )}
              <ScrollArea className="h-[40vh] pr-3">
                {preview.updated.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">No changes to existing formulas.</p>
                ) : (
                  <ul className="space-y-2">
                    {preview.updated.map((u) => (
                      <li key={u.fragrance_code} className="p-2.5 rounded border bg-muted/30">
                        <div className="flex items-center gap-3">
                          <Checkbox
                            checked={!skips.has(u.fragrance_code)}
                            onCheckedChange={() => toggle(u.fragrance_code)}
                          />
                          <span className="font-mono text-xs">{u.fragrance_code}</span>
                          <Badge variant="secondary">v{u.current_version} → v{u.current_version + 1}</Badge>
                          <Badge variant="outline" className="ml-auto">{Object.keys(u.diff).length} field(s)</Badge>
                        </div>
                        <ul className="mt-2 ml-8 space-y-0.5 text-xs">
                          {Object.entries(u.diff).map(([field]) => (
                            <li key={field} className="text-muted-foreground">
                              <span className="font-medium text-foreground">{field}</span> changed
                            </li>
                          ))}
                        </ul>
                      </li>
                    ))}
                  </ul>
                )}
              </ScrollArea>
            </TabsContent>

            <TabsContent value="unchanged" className="flex-1 overflow-hidden mt-3">
              <ScrollArea className="h-[45vh] pr-3">
                {preview.unchanged.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">—</p>
                ) : (
                  <ul className="space-y-1 text-xs font-mono text-muted-foreground">
                    {preview.unchanged.map((u) => <li key={u.fragrance_code}>{u.fragrance_code}</li>)}
                  </ul>
                )}
              </ScrollArea>
            </TabsContent>

            <TabsContent value="invalid" className="flex-1 overflow-hidden mt-3">
              <ScrollArea className="h-[45vh] pr-3">
                {preview.invalid.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">All rows valid.</p>
                ) : (
                  <ul className="space-y-1.5">
                    {preview.invalid.map((r, i) => (
                      <li key={i} className="p-2 rounded border border-destructive/30 bg-destructive/5 text-sm flex items-start gap-2">
                        <AlertTriangle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
                        <div>
                          <span className="font-mono text-xs">{r.fragrance_code}</span>
                          <span className="text-muted-foreground"> — {r.reason}</span>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </ScrollArea>
            </TabsContent>
          </Tabs>
        )}

        <DialogFooter className="mt-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={applying}>
            Cancel
          </Button>
          <Button onClick={handleApply} disabled={applying || !preview || applyCount === 0}>
            {applying && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Apply {applyCount} change{applyCount === 1 ? '' : 's'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
