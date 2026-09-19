export const DOMAINE_COLORS = {
  Sport: "#f97316",
  Kiné: "#ef4444",
  Skincare: "#ec4899",
  "Hygiène de vie": "#22c55e",
  Art: "#a855f7",
  Mental: "#3b82f6",
  Écrans: "#6b7280",
};

export function domaineColor(domaine) {
  return DOMAINE_COLORS[domaine] ?? "#6b7280";
}

export const JOURS_SEMAINE = [
  "Lundi",
  "Mardi",
  "Mercredi",
  "Jeudi",
  "Vendredi",
  "Samedi",
  "Dimanche",
];

export const MOMENTS = ["Matin", "Midi", "Soir", "Flexible"];
