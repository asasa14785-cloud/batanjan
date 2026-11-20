export type CategoryDef = { id: string; en: string; ar: string; icon: string; hue: number };

export const CATEGORIES: CategoryDef[] = [
  { id: "transitions", en: "Transitions", ar: "انتقالات", icon: "🌀", hue: 200 },
  { id: "impacts", en: "Impacts", ar: "ضربات", icon: "💥", hue: 12 },
  { id: "risers", en: "Risers", ar: "تصاعد", icon: "📈", hue: 280 },
  { id: "ui", en: "UI & Clicks", ar: "واجهات ونقرات", icon: "🖱️", hue: 170 },
  { id: "chimes", en: "Chimes & Notify", ar: "نغمات وإشعارات", icon: "🔔", hue: 48 },
  { id: "alerts", en: "Alerts & Errors", ar: "تنبيهات وأخطاء", icon: "🚨", hue: 0 },
  { id: "scifi", en: "Sci-Fi", ar: "خيال علمي", icon: "🛸", hue: 235 },
  { id: "retro", en: "Retro 8-bit", ar: "ريترو 8-بت", icon: "👾", hue: 320 },
  { id: "foley", en: "Foley & Props", ar: "فولي وأدوات", icon: "🎬", hue: 30 },
  { id: "footsteps", en: "Footsteps", ar: "خطوات", icon: "👣", hue: 90 },
  { id: "weapons", en: "Weapons & Combat", ar: "أسلحة ومعارك", icon: "⚔️", hue: 350 },
  { id: "magic", en: "Magic & Powers", ar: "سحر وقوى", icon: "✨", hue: 265 },
  { id: "creatures", en: "Creatures", ar: "مخلوقات ووحوش", icon: "🐉", hue: 130 },
  { id: "voice", en: "Human Voice", ar: "أصوات بشرية", icon: "🗣️", hue: 20 },
  { id: "nature", en: "Nature & Water", ar: "طبيعة وماء", icon: "🌊", hue: 190 },
  { id: "ambience", en: "Ambience", ar: "أجواء وخلفيات", icon: "🌫️", hue: 215 },
  { id: "vehicles", en: "Vehicles & Machines", ar: "مركبات وآلات", icon: "🏎️", hue: 40 },
  { id: "explosions", en: "Explosions", ar: "انفجارات", icon: "🧨", hue: 24 },
  { id: "music", en: "Music & Jingles", ar: "موسيقى وجينجل", icon: "🎵", hue: 300 },
  { id: "soundtrack", en: "Video Soundtracks", ar: "موسيقى الفيديوهات", icon: "🎞️", hue: 330 },
  { id: "glitch", en: "Glitch", ar: "جلتش", icon: "📺", hue: 150 },
  { id: "typing", en: "Typing & Keys", ar: "كتابة ولوحة مفاتيح", icon: "⌨️", hue: 210 },
  { id: "misc", en: "Misc", ar: "متنوع", icon: "🎲", hue: 60 },
];

export const CAT_MAP: Record<string, CategoryDef> = Object.fromEntries(CATEGORIES.map((c) => [c.id, c]));

export type RepoDef = { id: string; title: string; ar: string; url: string; license: string; blurb: string };

export const REPOS: RepoDef[] = [
  {
    id: "motionvideo-opus",
    title: "awesome-opus-5-5-motion-design",
    ar: "مستودع فيديوهات الموشن (الأصلي)",
    url: "https://github.com/motionvideohq/awesome-opus-5-5-motion-design",
    license: "الصوت © صُنّاع الفيديوهات الأصليين",
    blurb: "468 فيديو موشن — تم تنزيلها كلها وفصل الصوت منها وتقطيعه إلى مقاطع منفصلة.",
  },
  {
    id: "atomcut-library",
    title: "novincode/atomcut-library",
    ar: "مكتبة AtomCut (Kenney + OpenGameArt)",
    url: "https://github.com/novincode/atomcut-library",
    license: "CC0 — ملكية عامة",
    blurb: "حزم Kenney وOpenGameArt بترخيص CC0: واجهات، ضربات، خطوات، مخلوقات، سحر وأكثر.",
  },
  {
    id: "sound-sfx",
    title: "ashrafatam96/sound-sfx",
    ar: "مكتبة المونتاج العربية",
    url: "https://github.com/ashrafatam96/sound-sfx",
    license: "MIT",
    blurb: "715 مؤثرًا مصنّفًا بالعربي والإنجليزي للمونتاج: انتقالات، ضربات، تصاعد، جينجل.",
  },
  {
    id: "motion-graphics-sfx",
    title: "Barty-Bart/motion-graphics (sound-effects)",
    ar: "حزمة Motion Graphics SFX",
    url: "https://github.com/Barty-Bart/motion-graphics",
    license: "CC0 — Freesound + Kenney",
    blurb: "مؤثرات مختارة للموشن جرافيك: وووش، نقرات، رايزر، أجواء غرف.",
  },
];

export const REPO_MAP: Record<string, RepoDef> = Object.fromEntries(REPOS.map((r) => [r.id, r]));
