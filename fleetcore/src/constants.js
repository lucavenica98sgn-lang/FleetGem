export const EVENT_TYPES = {
  tagliando:    { label: "Tagliando",           icon: "🔧", color: "#F59E0B", tracked: true  },
  revisione:    { label: "Revisione",           icon: "📋", color: "#3B82F6", tracked: true  },
  gomme:        { label: "Cambio Gomme",         icon: "⚙️",  color: "#8B5CF6", tracked: true  },
  ispezione_pn: { label: "Ispezione Pneumatici", icon: "🔍", color: "#A78BFA", tracked: false },
  lavaggio:     { label: "Lavaggio",             icon: "💧", color: "#06B6D4", tracked: true  },
  sinistro:     { label: "Sinistro",             icon: "⚠️",  color: "#EF4444", tracked: false },
  collaudo:     { label: "Collaudo",             icon: "✅", color: "#10B981", tracked: false },
  sostitutiva:  { label: "Vettura Sostitutiva",  icon: "🚗", color: "#6366F1", tracked: false },
  manutenzione: { label: "Manutenzione",         icon: "🛠️",  color: "#F97316", tracked: false },
  altro:        { label: "Altro",                icon: "📝", color: "#78716C", tracked: false },
};

export const FUEL_TYPES = ["Benzina", "Diesel", "Ibrido", "Elettrico", "GPL", "Metano"];
export const TIRE_TYPES  = ["Estive", "Invernali", "4 Stagioni", "All Season"];
export const TIRE_CONDITIONS = ["Buono", "Da monitorare", "Da sostituire urgentemente"];

export const today = () => new Date().toISOString().slice(0, 10);

export const daysUntil = (dateStr) => {
  if (!dateStr) return null;
  const diff = new Date(dateStr) - new Date(today());
  return Math.ceil(diff / 86400000);
};

export const urgencyColor = (days) => {
  if (days === null) return "#475569";
  if (days < 0)    return "#EF4444";
  if (days <= 14)  return "#F97316";
  if (days <= 30)  return "#F59E0B";
  return "#10B981";
};

export const urgencyLabel = (days) => {
  if (days === null) return "–";
  if (days < 0)   return `Scad. ${Math.abs(days)}g fa`;
  if (days === 0) return "Oggi!";
  return `${days}g`;
};

export const uid = () => Math.random().toString(36).slice(2, 10);

export const formatDate = (str) => {
  if (!str) return "–";
  const [y, m, d] = str.split("-");
  return `${d}/${m}/${y}`;
};
