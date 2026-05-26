export default function BalanceCard({ label, value, symbol, icon }) {
  return (
    <div className="bg-white rounded-2xl border border-[#C4A484]/20 p-5 flex flex-col gap-1 shadow-sm hover:shadow-md transition-shadow duration-200">
      <div className="flex items-center gap-2 text-[#C4A484] text-xs font-medium uppercase tracking-wider">
        <span>{icon}</span>
        <span>{label}</span>
      </div>
      <div className="text-2xl font-bold text-[#3d2b1a] mt-1 font-mono">
        {value ?? "—"}
      </div>
      <div className="text-[#6F4E37]/60 text-xs font-medium">{symbol}</div>
    </div>
  );
}