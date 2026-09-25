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
  'D-HANUMAKONDA': badge('telangana_police.png'),
  'D-HYDERABAD': badge('thumbnail_Hyderabad_Logo_ca2e6180ee.png'),
  'D-JAGITIAL': badge('Jagtial.png'),
  'D-JAYASHANKAR': badge('J.Bhupalpally.png'),
  'D-JOGULAMBA-GADWAL': badge('J.gadwal.png'),
  'D-KAMAREDDY': badge('Kamareddy.png'),
  'D-KUMURAM-BHEEM-ASIFABAD': badge('KB.Asifabad.png'),
  'D-KARIMNAGAR': badge('thumbnail_karimnagar_Logoo_4d1b927b14.png'),
  'D-KHAMMAM': badge('thumbnail_KHAMMAM_LOGO_41b1441063.png'),
  'D-MAHABUBABAD': badge('Mahabubabad.png'),
  'D-MAHABUBNAGAR': badge('Mahabubnagar.png'),
  'D-MANCHERIAL': badge('telangana_police.png'),
  'D-JANGOAN': badge('telangana_police.png'),
  'D-MEDAK': badge('Medak.png'),
  'D-MEDCHAL-MALKAJGIRI': badge('telangana_police.png'),
  'D-MULUGU': badge('Mulugu.png'),
  'D-NAGARKURNOOL': badge('Nagarkurnool.png'),
  'D-NALGONDA': badge('Nalgonda.png'),
  'D-NARAYANPET': badge('Narayanpet.png'),
  'D-NIRMAL': badge('Nirmal.png'),
  'D-NIZAMABAD': badge('thumbnail_Nizamabad_Logo_0e6c6cc11e.png'),
  'D-PEDDAPALLI': badge('telangana_police.png'),
  'D-RAJANNA-SIRCILLA': badge('R.sircilla.png'),
  'D-RANGA-REDDY': badge('telangana_police.png'),
  'D-SANGAREDDY': badge('sangareddy.png'),
  'D-SIDDIPET': badge('thumbnail_Siddipet_Logo_fa1405a63b.png'),
  'D-SURYAPET': badge('Suryapet.png'),
  'D-VIKARABAD': badge('Vikarabad.png'),
  'D-WANAPARTHY': badge('Wanaparthy.png'),
  'D-WARANGAL': badge('thumbnail_Warangal_Logo_a146d32ca7.png'),
  'D-YADADRI-BHUVANAGIRI': badge('Yadadri Bhuvanagiri.png'),
};
