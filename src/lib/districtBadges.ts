// Real Telangana district police badge images. Filenames as supplied; encoded
// since several contain spaces. Only districts with a supplied image appear
// here — everything else falls back to a generic placeholder shield (see
// GenericShieldIcon) wherever DISTRICT_BADGE_MAP has no entry.
function badge(filename: string): string {
  return `/district-badges/${encodeURIComponent(filename)}`;
}

export const DISTRICT_BADGE_MAP: Record<string, string> = {
  'D-ADILABAD': badge('Adilabad.png'),
  'D-BHADRADRI-KOTHAGUDEM': badge('Bhadradri kothagudem.png'),
  'D-JAGITIAL': badge('Jagtial.png'),
  'D-JAYASHANKAR': badge('J.Bhupalpally.png'),
  'D-JOGULAMBA-GADWAL': badge('J.gadwal.png'),
  'D-KAMAREDDY': badge('Kamareddy.png'),
  'D-KUMURAM-BHEEM-ASIFABAD': badge('KB.Asifabad.png'),
  'D-MAHABUBABAD': badge('Mahabubabad.png'),
  'D-MAHABUBNAGAR': badge('Mahabubnagar.png'),
  'D-MEDAK': badge('Medak.png'),
  'D-MULUGU': badge('Mulugu.png'),
  'D-NAGARKURNOOL': badge('Nagarkurnool.png'),
  'D-NALGONDA': badge('Nalgonda.png'),
  'D-NARAYANPET': badge('Narayanpet.png'),
  'D-NIRMAL': badge('Nirmal.png'),
  'D-RAJANNA-SIRCILLA': badge('R.sircilla.png'),
  'D-SANGAREDDY': badge('sangareddy.png'),
  'D-SURYAPET': badge('Suryapet.png'),
  'D-VIKARABAD': badge('Vikarabad.png'),
  'D-WANAPARTHY': badge('Wanaparthy.png'),
  'D-YADADRI-BHUVANAGIRI': badge('Yadadri Bhuvanagiri.png'),
};
