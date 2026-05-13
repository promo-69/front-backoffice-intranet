import { cn } from "@/lib/utils";

export const TabsCustom = ({ tabs, activeTab, onChange }) => {
  return (
    <div className="flex gap-6 border-b border-gray-100 pb-2 mb-6">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={cn(
            "text-xs font-montserrat uppercase tracking-widest pb-2 border-b-2 transition-all duration-300",
            activeTab === tab.id
              ? "font-bold text-brand-primary border-brand-gold"
              : "text-muted-foreground border-transparent hover:text-brand-primary/60"
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
};