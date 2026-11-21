import { RUNNING_COSTS } from "@/data/businessDetails";

const RunningCosts = () => (
  <div className="mx-auto mt-12 max-w-4xl rounded-xl border border-gold-strong/15 bg-bz-card p-6 md:p-8">
    <h3 className="text-center font-serif text-xl text-cream">What it costs to run</h3>
    <p className="mt-1 text-center text-[13px] text-body">The package price covers your diffuser. These are the ongoing costs.</p>
    <dl className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
      {RUNNING_COSTS.map((c) => (
        <div key={c.label} className="text-center">
          <dt className="text-[10px] uppercase tracking-[0.2em] text-gold">{c.label}</dt>
          <dd className="mt-2 text-[14px] text-cream">{c.value}</dd>
        </div>
      ))}
    </dl>
  </div>
);
export default RunningCosts;
