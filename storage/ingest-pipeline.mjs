// Stage 2: build the sound library (analysis, naming, categorisation, encoding)
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import ffmpegPath from "ffmpeg-static";
const run = promisify(execFile);
const OUT = process.env.OUT;
const AUD = path.join(OUT, "audio");
fs.mkdirSync(AUD, { recursive: true });
const R = "/tmp/work/repos";
const sha = (s) => crypto.createHash("sha1").update(s).digest("hex").slice(0, 10);

// ---------- vocabulary ----------
const CAT_AR = { transitions: "انتقالات", impacts: "ضربات", risers: "تصاعد", ui: "واجهات ونقرات", chimes: "نغمات وإشعارات", alerts: "تنبيهات وأخطاء", scifi: "خيال علمي", retro: "ريترو 8-بت", foley: "فولي وأدوات", footsteps: "خطوات", weapons: "أسلحة ومعارك", magic: "سحر وقوى", creatures: "مخلوقات ووحوش", voice: "أصوات بشرية", nature: "طبيعة وماء", ambience: "أجواء وخلفيات", vehicles: "مركبات وآلات", explosions: "انفجارات", music: "موسيقى وجينجل", soundtrack: "موسيقى الفيديوهات", glitch: "جلتش", typing: "كتابة ولوحة مفاتيح", misc: "متنوع" };
const AR = Object.fromEntries(`whoosh:وووش woosh:وووش swoosh:سووش swish:سويش swipe:سحب transition:انتقال zip:سحّاب impact:ضربة hit:ضربة hits:ضربات boom:بووم slam:صدمة thud:دمدمة stinger:ستينجر crash:تحطم smash:تهشيم drop:سقوط break:كسر breaking:كسر crack:تشقق thump:خبطة bang:فرقعة explosion:انفجار explode:انفجار firework:ألعاب-نارية riser:تصاعد swell:تضخم build:بناء downlifter:هبوط reverse:عكسي click:نقرة clicks:نقرات button:زر menu:قائمة toggle:تبديل switch:مفتاح select:اختيار tick:تكّة pop:بوب hover:تمرير confirm:تأكيد cancel:إلغاء back:رجوع open:فتح close:إغلاق ui:واجهة interface:واجهة beep:صفير blip:بلب chime:جرس ding:دينج bell:جرس success:نجاح notify:إشعار notification:إشعار error:خطأ alert:تنبيه warning:تحذير fail:فشل wrong:خاطئ buzz:طنين laser:ليزر phaser:فيزر space:فضاء robot:روبوت digital:رقمي energy:طاقة shield:درع glitch:عطل engine:محرك motor:موتور car:سيارة vehicle:مركبة footstep:خطوة footsteps:خطوات step:خطوة steps:خطوات walk:مشي run:ركض grass:عشب sand:رمل stone:حجر gravel:حصى mud:طين snow:ثلج leaves:أوراق leaf:ورقة wood:خشب wooden:خشبي metal:معدن glass:زجاج door:باب paper:ورق card:بطاقة cards:بطاقات dice:نرد book:كتاب page:صفحة cloth:قماش coin:عملة coins:عملات chip:رقاقة keyboard:لوحة-مفاتيح key:مفتاح typing:كتابة typewriter:آلة-كاتبة knife:سكين sword:سيف gun:مسدس shot:طلقة slash:قطع punch:لكمة swing:تلويح clash:اشتباك arrow:سهم bow:قوس weapon:سلاح armor:درع magic:سحر spell:تعويذة power:قوة heal:شفاء fire:نار water:ماء splash:رذاذ bubble:فقاعات rain:مطر wind:رياح thunder:رعد ocean:محيط wave:موجة swamp:مستنقع slime:لزج squish:سحق monster:وحش creature:مخلوق zombie:زومبي goblin:عفريت alien:فضائي growl:زمجرة roar:زئير dragon:تنين voice:صوت vocal:غناء grunt:أنين yell:صراخ scream:صرخة laugh:ضحكة hurt:ألم death:موت dying:احتضار male:ذكر female:أنثى taunt:استفزاز jump:قفزة land:هبوط level:مستوى up:صعود down:هبوط jingle:جينجل music:موسيقى melody:لحن fanfare:فانفار ambience:أجواء ambient:أجواء drone:درون loop:حلقة short:قصير long:طويل soft:ناعم heavy:ثقيل light:خفيف fast:سريع slow:بطيء deep:عميق low:منخفض high:عالٍ big:كبير small:صغير sharp:حاد simple:بسيط harsh:خشن coarse:خشن retro:ريترو bat:مضرب hammer:مطرقة bone:عظم flesh:لحم blood:دم choir:كورال piano:بيانو guitar:جيتار drum:طبل drums:طبول bass:باص kick:ركلة snare:سنير hat:هات cymbal:صنج whistle:صافرة camera:كاميرا shutter:غالق scissors:مقص cash:نقود register:ماكينة-كاشير lock:قفل unlock:فتح-القفل power-on:تشغيل start:بدء stop:توقف end:نهاية win:فوز lose:خسارة game:لعبة over:انتهاء item:عنصر pickup:التقاط collect:جمع bonus:مكافأة select:اختيار error:خطأ negative:سلبي positive:إيجابي teleport:انتقال-آني portal:بوابة force:قوة field:مجال beam:شعاع plasma:بلازما electric:كهرباء spark:شرارة zap:صعقة shock:صدمة bounce:ارتداد roll:تدحرج slide:انزلاق scrape:خدش scratch:خربشة rustle:حفيف squeak:صرير creak:صرير knock:طرق wet:مبلل dry:جاف tap:نقر hand:يد`.split(/\s+/).map((p) => p.split(":")).map(([k, v]) => [k, v.replace(/-/g, " ")]));

const AR_EXTRA = `movement:حركة exp:انفجار falling:سقوط casino:كازينو stationery:قرطاسية medium:متوسط swosh:سووش walking:مشي covered:مغطى powerup:تقوية sci:خيال-علمي superpowers:قوى-خارقة superpower:قوة-خارقة money:مال shake:اهتزاز bowl:وعاء deathscream:صرخة-موت human:بشري chips:رقائق keypress:ضغطة-مفتاح tone:نغمة plastic:بلاستيك hard:صلب bottle:زجاجة synth:سينث ice:جليد interaction:تفاعل kitchen:مطبخ handle:مقبض vial:قارورة maximize:تكبير machine:آلة die:موت cluster:عنقود stairs:درج minimize:تصغير flip:قلب ouch:آخ noise:ضوضاء pew:بيو tools:أدوات keyhole:ثقب-المفتاح lockbox:صندوق-مقفل steel:فولاذ rollover:تمرير war:حرب air:هواء pot:قدر slightscream:صرخة-خفيفة bug:حشرة nuts:مكسرات round:دائري large:كبير place:وضع throw:رمي square:مربع damage:ضرر rock:صخر spoon:ملعقة alarm:إنذار shoot:إطلاق landing:هبوط stack:تكديس rattle:خشخشة put:وضع scroll:تمرير spring:نابض neutral:محايد uncork:فتح-الفلين confirmation:تأكيد keys:مفاتيح clic:نقرة double:مزدوج phase:طور trash:قمامة cute:لطيف preview:معاينة leather:جلد mining:تعدين plank:لوح plate:طبق tin:صفيح circular:دائري crunch:طقطقة thruster:دافع instrument:آلة-موسيقية voiceover:تعليق-صوتي fighter:مقاتل terminal:طرفية pills:حبوب sticks:عصي android:أندرويد attack:هجوم shove:دفع collide:اصطدام unsheathe:سحب-السيف question:سؤال belt:حزام computer:حاسوب stones:أحجار drink:شراب fall:سقوط draw:سحب cork:فلين rise:ارتفاع magical:سحري sheet:ورقة bubbles:فقاعات move:حركة fly:طيران grab:إمساك coffee:قهوة spin:دوران turn:دوران twist:التواء quiver:كنانة pluck:نقر-وتر kill:قتل cannon:مدفع quick:سريع container:حاوية empty:فارغ concrete:خرسانة giant:عملاق ogre:غول dinosaur:ديناصور demon:شيطان whisper:همس cut:قطع bag:حقيبة slice:قطع gold:ذهب victory:نصر bubbling:فوران plop:بلوب spray:رش phone:هاتف velcro:فيلكرو burp:تجشؤ cough:سعال spit:بصق troll:ترول jingles:جينجل misc:متنوع exit:خروج talk:كلام eat:أكل chain:سلسلة gem:جوهرة magnet:مغناطيس fan:مروحة take:أخذ type:كتابة rotate:تدوير tie:ربط standard:قياسي various:متنوع other:آخر lowhealth:صحة-منخفضة lay:وضع single:مفرد hi:عالٍ shortest:الأقصر three:ثلاثة two:اثنان one:واحد`.split(/\s+/).map((p) => p.split(":"));
for (const [k, v] of AR_EXTRA) AR[k] = v.replace(/-/g, " ");
const NOISE = new Set(["fs", "bfh", "fw", "lth", "vel", "mnstr", "wav", "v", "s", "i", "b", "t", "e", "h", "n", "p", "z", "x", "l", "c", "d", "exp"]);
function arTok(t) {
  if (/^\d+$/.test(t)) return t;
  if (AR[t]) return AR[t];
  for (let i = 3; i <= t.length - 3; i++) { const a = t.slice(0, i), b = t.slice(i); if (AR[a] && AR[b]) return AR[a] + " " + AR[b]; }
  return null;
}
const STOP = new Set(["sound", "sounds", "sfx", "effect", "effects", "the", "a", "of", "and", "fx"]);

function titleCase(s) { return s.replace(/\b([a-z])/g, (m) => m.toUpperCase()); }
function cleanName(raw) {
  let s = raw.replace(/\.[a-z0-9]+$/i, "").replace(/%[0-9a-f]{2}/gi, " ").replace(/[_\-.]+/g, " ").replace(/([a-z])([A-Z])/g, "$1 $2").replace(/([a-zA-Z])(\d)/g, "$1 $2").replace(/\s+/g, " ").trim();
  return titleCase(s.toLowerCase());
}
function toArabic(name, cat) {
  const toks = name.toLowerCase().split(/\s+/).filter((t) => t && !STOP.has(t));
  let known = 0, total = 0; const out = [];
  for (const t of toks) { if (/^\d+$/.test(t)) { out.push(t); continue; } if (NOISE.has(t)) continue; total++; const a = arTok(t); if (a) { known++; out.push(a); } else out.push(t); }
  if (total === 0 || known / total < 0.5) return `${CAT_AR[cat] || ""} · ${name}`;
  return out.join(" ");
}

// ---------- classification ----------
const RULES = [
  ["typing", /keyboard|typing|keystroke|typewriter|key press/],
  ["footsteps", /footstep|footsteps|\bsteps?\b|walking|stride/],
  ["explosions", /explo|firework|blast|bomb|detonat|\bbang\b/],
  ["weapons", /sword|\bgun|shoot|slash|blade|weapon|swing|clash|armor|arrow|\bbow\b|punch|knife|axe|rifle|pistol|dagger|shield bash/],
  ["vehicles", /\bcar\b|engine|motor|vehicle|truck|train|racing|machine/],
  ["creatures", /monster|creature|zombie|goblin|alien|growl|roar|beast|dragon|orc|ghoul|demon|slime/],
  ["voice", /voice|vocal|grunt|yell|scream|taunt|\bhurt|death|dying|laugh|\bmale\b|female|dialog|speech|cough|breath|pain/],
  ["magic", /magic|spell|superpower|heal|fantasy|enchant|sparkle|\bpower ?up|buff|curse/],
  ["glitch", /glitch|static|distort|corrupt/],
  ["scifi", /sci-?fi|laser|phaser|space|robot|digital|energy|shield|futur|teleport|portal|plasma|force ?field|hologram|cyber|synth/],
  ["retro", /8-?bit|16-?bit|retro|\bnes\b|chiptune|arcade|\bblip|jump|\bcoin/],
  ["risers", /riser|build ?up|swell|downlifter|uplifter|rising|tension/],
  ["transitions", /whoosh|swoosh|swish|swipe|woosh|transition|\bzip\b|sweep|slide ?in/],
  ["impacts", /impact|boom|\bhit|slam|thud|stinger|crash|smash|thump|punch|heavy|drop|break|crack|bang/],
  ["alerts", /error|alert|warning|fail|wrong|buzz|denied|negative/],
  ["chimes", /chime|ding|\bbell|success|notify|notification|level|sparkle|tone|achievement|reward|bonus|positive/],
  ["ui", /\bui\b|click|button|menu|toggle|switch|select|interface|beep|\btick|\bpop|hover|\bgui|confirm|cancel|tap|cursor|gui/],
  ["music", /jingle|music|melody|fanfare|loop|theme|piano|guitar|chord|stinger/],
  ["ambience", /ambien|atmos|drone|room ?tone|swamp|ocean|wind|rain|forest|cave|night|hum/],
  ["nature", /water|splash|leaf|leaves|snow|gravel|mud|squish|bubble|river|fire|crackle|thunder|bird|animal|insect|frog|grass/],
  ["foley", /door|paper|card|dice|book|cloth|wood|metal|glass|coin|chip|rustle|clip|dish|knock|scissor|drawer|lock|cash|creak|squeak|bounce|scrape|rope|cup|bottle|zipper|crumple|page|cabinet|plate|bag|shutter|camera|stapler|latch/],
];
function classifyText(t) { t = t.toLowerCase(); for (const [c, re] of RULES) if (re.test(t)) return c; return null; }
const REFINE = new Set(["typing", "footsteps", "explosions", "weapons", "vehicles", "creatures", "voice", "magic", "glitch", "retro"]);

function classifyAcoustic(f) {
  if (f.dur >= 12) return f.flat > 0.25 ? "ambience" : "music";
  if (f.rise > 2.2 && f.dur > 0.6) return "risers";
  if (f.dur < 0.18) return "ui";
  if (f.flat < 0.1) return f.dur < 1.4 ? "chimes" : "music";
  if (f.bright < 0.35 && f.attack < 70) return "impacts";
  if (f.flat >= 0.2 && f.dur >= 0.25 && f.attack >= 60) return "transitions";
  if (f.bright > 0.6 && f.dur < 0.6) return "ui";
  if (f.dur > 3) return "ambience";
  return "foley";
}


if (process.env.REFINE) {
  const mp = path.join(OUT, "manifest.json"); const items0 = JSON.parse(fs.readFileSync(mp, "utf8")); const unk = {};
  const fix = (n) => { let t = n.replace(/([a-z])([A-Z])/g, "$1 $2").replace(/([A-Za-z])(\d)/g, "$1 $2").replace(/(\d)([A-Za-z])/g, "$1 $2").split(/\s+/).filter(Boolean).map((w) => (/^\d+$/.test(w) ? String(parseInt(w, 10)) : w));
    t = t.filter((w, i) => i === 0 || w.toLowerCase() !== t[i - 1].toLowerCase()); return titleCase(t.join(" ").toLowerCase()); };
  let ar = 0, tot = 0;
  for (const it of items0) {
    if (it.videoSlug) continue;
    it.name = fix(it.name); it.nameAr = toArabic(it.name, it.category); tot++;
    if (!it.nameAr.startsWith((CAT_AR[it.category] || "~") + " ·")) ar++;
    else for (const w of it.name.toLowerCase().split(/\s+/)) if (!/^\d+$/.test(w) && !AR[w] && !STOP.has(w)) unk[w] = (unk[w] || 0) + 1;
  }
  fs.writeFileSync(mp, JSON.stringify(items0));
  console.log("arabic-named", ar, "/", tot);
  console.log(Object.entries(unk).sort((a, b) => b[1] - a[1]).slice(0, 220).map(([k, v]) => k + ":" + v).join(" "));
  process.exit(0);
}
// ---------- DSP ----------
const SR = 22050;
async function decode(file, extra = []) {
  const { stdout } = await run(ffmpegPath, ["-v", "error", ...extra, "-i", file, "-ac", "1", "-ar", String(SR), "-f", "f32le", "-"], { encoding: "buffer", maxBuffer: 1 << 29 });
  const b = stdout; return new Float32Array(b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength - (b.byteLength % 4)));
}
function fft(re, im) {
  const n = re.length;
  for (let i = 1, j = 0; i < n; i++) { let bit = n >> 1; for (; j & bit; bit >>= 1) j ^= bit; j ^= bit; if (i < j) { [re[i], re[j]] = [re[j], re[i]]; [im[i], im[j]] = [im[j], im[i]]; } }
  for (let len = 2; len <= n; len <<= 1) {
    const ang = (-2 * Math.PI) / len, wr = Math.cos(ang), wi = Math.sin(ang);
    for (let i = 0; i < n; i += len) { let cr = 1, ci = 0; for (let k = 0; k < len / 2; k++) { const a = i + k, b = i + k + len / 2; const tr = re[b] * cr - im[b] * ci, ti = re[b] * ci + im[b] * cr; re[b] = re[a] - tr; im[b] = im[a] - ti; re[a] += tr; im[a] += ti; const nr = cr * wr - ci * wi; ci = cr * wi + ci * wr; cr = nr; } }
  }
}
const db = (v) => 20 * Math.log10(Math.max(v, 1e-6));
function analyze(x) {
  const n = x.length, dur = n / SR; let peak = 0, sum = 0;
  for (let i = 0; i < n; i++) { const a = Math.abs(x[i]); if (a > peak) peak = a; sum += x[i] * x[i]; }
  const rms = Math.sqrt(sum / Math.max(n, 1));
  const hop = 512, env = [];
  for (let i = 0; i < n; i += hop) { let s = 0, c = 0; for (let j = i; j < Math.min(n, i + hop); j++) { s += x[j] * x[j]; c++; } env.push(Math.sqrt(s / Math.max(c, 1))); }
  const maxEnv = Math.max(...env, 1e-9);
  let ai = env.findIndex((e) => e >= 0.9 * maxEnv); if (ai < 0) ai = 0;
  const attack = ((ai * hop) / SR) * 1000;
  const half = Math.floor(env.length / 2) || 1;
  const m1 = env.slice(0, half).reduce((a, b) => a + b, 0) / half, m2 = env.slice(half).reduce((a, b) => a + b, 0) / Math.max(env.length - half, 1);
  const rise = m2 / (m1 + 1e-9);
  const bins = 48, pk = new Array(bins).fill(0);
  for (let i = 0; i < n; i++) { const b = Math.min(bins - 1, Math.floor((i / n) * bins)); const a = Math.abs(x[i]); if (a > pk[b]) pk[b] = a; }
  const mp = Math.max(...pk, 1e-9); const peaks = pk.map((v) => Math.round((v / mp) * 100));
  // spectral features
  const N = 1024; const idx = env.map((e, i) => [e, i]).sort((a, b) => b[0] - a[0]).slice(0, 8).map((p) => p[1]);
  let cs = 0, fl = 0, cnt = 0; const re = new Float64Array(N), im = new Float64Array(N);
  for (const fi of idx) {
    const st = Math.max(0, Math.min(n - N, fi * hop - N / 4)); if (n < N) break;
    for (let i = 0; i < N; i++) { re[i] = x[st + i] * (0.5 - 0.5 * Math.cos((2 * Math.PI * i) / (N - 1))); im[i] = 0; }
    fft(re, im); let num = 0, den = 0, lg = 0, am = 0; const K = 400;
    for (let k = 2; k < K; k++) { const m = Math.hypot(re[k], im[k]) + 1e-9; num += m * ((k * SR) / N); den += m; lg += Math.log(m); am += m; }
    cs += num / den; fl += Math.exp(lg / (K - 2)) / (am / (K - 2)); cnt++;
  }
  const centroid = cnt ? cs / cnt : 1000, flat = cnt ? fl / cnt : 0.1;
  const bright = Math.max(0, Math.min(1, Math.log2(Math.max(centroid, 100) / 150) / Math.log2(6000 / 150)));
  return { dur, peakDb: db(peak), rmsDb: db(rms), peaks, attack, rise, bright, flat, centroid };
}

// ---------- pipeline ----------
const items = []; const seen = new Set(); const stats = { dup: 0, silent: 0, fail: 0 };
async function pool(list, n, fn) { let i = 0; await Promise.all(Array.from({ length: n }, async () => { while (i < list.length) { const j = list[i++]; try { await fn(j); } catch (e) { stats.fail++; console.error("FAIL", j.src || j.slug, String(e.message).slice(0, 120)); } } })); }

function describe(f) {
  const tone = f.flat < 0.1 ? "tonal" : f.flat > 0.3 ? "noisy" : "textured";
  const tonality = f.bright < 0.3 ? "dark" : f.bright < 0.55 ? "warm" : f.bright < 0.8 ? "bright" : "airy";
  const punch = f.attack < 15 ? "punchy" : f.attack > 120 ? "swelling" : "smooth";
  const len = f.dur < 0.3 ? "tiny" : f.dur < 1 ? "short" : f.dur < 4 ? "medium" : f.dur < 15 ? "long" : "extended";
  return [tone, tonality, punch, len];
}
const DESC_AR = { tonal: "نغمي", noisy: "ضوضائي", textured: "ملمسي", dark: "غامق", warm: "دافئ", bright: "ساطع", airy: "هوائي", punchy: "قوي", swelling: "متصاعد", smooth: "ناعم", tiny: "قصير جدًا", short: "قصير", medium: "متوسط", long: "طويل", extended: "ممتد" };

function baseItem(o, f, category, kind) {
  const [tone, tonality, punch, len] = describe(f);
  const tags = [...new Set([category, CAT_AR[category], tone, tonality, punch, len, DESC_AR[tonality], DESC_AR[len], ...(o.tags || [])].filter(Boolean))];
  return {
    id: o.id, name: o.name, nameAr: o.nameAr, category, kind, tags, repo: o.repo, pack: o.pack, creator: o.creator || null, license: o.license, attribution: o.attribution || null, sourceUrl: o.sourceUrl || null,
    videoSlug: o.videoSlug || null, videoTitle: o.videoTitle || null, videoUrl: o.videoUrl || null, posterUrl: o.posterUrl || null, segStart: o.segStart ?? null, segEnd: o.segEnd ?? null,
    file: o.file, duration: +f.dur.toFixed(3), size: 0, peaks: f.peaks, peakDb: +f.peakDb.toFixed(1), rmsDb: +f.rmsDb.toFixed(1), brightness: Math.round(f.bright * 100), flatness: Math.round(Math.min(f.flat, 1) * 100), attackMs: Math.round(f.attack),
  };
}

async function ingestFile(job) {
  const { src, repo, pack, meta } = job;
  const x = await decode(src); if (x.length < 200) { stats.fail++; return; }
  const f = analyze(x);
  if (f.peakDb < -58) { stats.silent++; return; }
  const stem = path.basename(src).replace(/\.[a-z0-9]+$/i, "").toLowerCase().replace(/[^a-z0-9]/g, "");
  const key = stem + "|" + Math.round(f.dur * 25);
  if (seen.has(key)) { stats.dup++; return; } seen.add(key);
  const text = `${meta.name} ${path.basename(src)} ${pack} ${(meta.tags || []).join(" ")}`;
  let category = meta.category || null;
  const t = classifyText(text);
  if (!category) category = t || classifyAcoustic(f); else if (t && REFINE.has(t)) category = t;
  if (f.dur >= 15 && !["music", "ambience", "nature", "vehicles"].includes(category)) category = f.flat > 0.25 ? "ambience" : "music";
  const id = sha(repo + "/" + job.rel); const ext = src.endsWith(".m4a") ? "m4a" : "m4a";
  const file = `${id}.${ext}`; const outp = path.join(AUD, file);
  if (src.endsWith(".m4a")) fs.copyFileSync(src, outp);
  else await run(ffmpegPath, ["-v", "error", "-y", "-i", src, "-c:a", "aac", "-b:a", "128k", "-movflags", "+faststart", outp]);
  const name = meta.name; const nameAr = meta.nameAr || toArabic(name, category);
  const kind = ["music"].includes(category) ? "music" : category === "ambience" ? "ambience" : category === "voice" ? "voice" : "sfx";
  const it = baseItem({ id, name, nameAr, repo, pack, tags: meta.tags, creator: meta.creator, license: meta.license, attribution: meta.attribution, sourceUrl: meta.sourceUrl, file }, f, category, kind);
  it.size = fs.statSync(outp).size; items.push(it);
}

const jobs = [];
// 1) atomcut-library (Kenney + OpenGameArt, CC0)
{
  const base = `${R}/atomcut-library/packs`;
  for (const p of fs.readdirSync(base)) {
    const pj = path.join(base, p, "pack.json"); if (!fs.existsSync(pj)) continue; const j = JSON.parse(fs.readFileSync(pj, "utf8")); if (j.kind !== "sound") continue;
    for (const fl of j.files) {
      const src = path.join(base, p, fl.file); if (!fs.existsSync(src)) continue;
      const nm = fl.name && !/^\s*$/.test(fl.name) ? fl.name : cleanName(path.basename(fl.file));
      jobs.push({ src, rel: `${p}/${fl.file}`, repo: "atomcut-library", pack: j.title, meta: { name: nm, tags: (fl.tags || []).filter((t) => t !== "cc0"), creator: j.publisher?.name, license: "CC0 1.0", attribution: j.attribution, sourceUrl: j.homepage || "https://github.com/novincode/atomcut-library" } });
    }
  }
}
// 2) sound-sfx (Arabic-organised, MIT)
{
  const base = `${R}/sound-sfx`; const j = JSON.parse(fs.readFileSync(`${base}/sounds.json`, "utf8"));
  const cmap = { transitions: "transitions", impacts: "impacts", risers: "risers", "ui-clicks": "ui", "chimes-tones": "chimes", alerts: "alerts", "sci-fi": "scifi", foley: "foley", jingles: "music" };
  const arMap = Object.fromEntries(j.categories.map((c) => [c.id, c.name_ar]));
  for (const s of j.sounds) {
    const src = path.join(base, s.file); if (!fs.existsSync(src)) continue; const cid = s.id.split("/")[0];
    jobs.push({ src, rel: s.file, repo: "sound-sfx", pack: `${j.categories.find((c) => c.id === cid)?.name_en || cid} (${arMap[cid] || ""})`, meta: { name: cleanName(path.basename(s.file)), tags: s.tags, category: cmap[cid], creator: "Ashraf Atam", license: "MIT", attribution: "© Ashraf Atam — MIT", sourceUrl: "https://github.com/ashrafatam96/sound-sfx" } });
  }
}
// 3) Barty-Bart/motion-graphics sound-effects skill (CC0)
{
  const base = `${R}/motion-graphics/skills/sound-effects/sfx`; const j = JSON.parse(fs.readFileSync(`${base}/manifest.json`, "utf8"));
  const cmap = { whoosh: "transitions", pop: "ui", click: "ui", tick: "ui", typing: "typing", riser: "risers", impact: "impacts", ding: "chimes", glitch: "glitch", ambience: "ambience", "ui-blip": "ui" };
  for (const s of j.bundled) {
    const src = path.join(base, s.file); if (!fs.existsSync(src)) continue;
    const nm = cleanName(path.basename(s.file).replace(/^(fs|kenney)-\d*-?/i, ""));
    jobs.push({ src, rel: s.file, repo: "motion-graphics-sfx", pack: "Motion Graphics SFX Kit", meta: { name: nm, tags: [s.category], category: cmap[s.category], creator: (s.attribution || "").split(/ via | \(/)[0] || null, license: s.license || "CC0 1.0", attribution: s.attribution, sourceUrl: s.source_url } });
  }
}
console.log("repo jobs", jobs.length);
await pool(jobs, 8, ingestFile);
console.log("repo items", items.length, stats);

// 4) video soundtracks + slices
const videos = JSON.parse(fs.readFileSync("/tmp/work/repo/data/videos.json", "utf8")); const vmap = Object.fromEntries(videos.map((v) => [v.slug, v]));
const ADJ = { dark: [["Deep", "عميق"], ["Dark", "مظلم"], ["Sub", "سفلي"]], warm: [["Warm", "دافئ"], ["Round", "مستدير"], ["Velvet", "مخملي"]], bright: [["Crisp", "هش"], ["Bright", "ساطع"], ["Neon", "نيون"]], airy: [["Glassy", "زجاجي"], ["Airy", "هوائي"], ["Sparkling", "متلألئ"]] };
const NOUN = { transitions: ["Whoosh", "وووش"], impacts: ["Hit", "ضربة"], risers: ["Riser", "تصاعد"], ui: ["Click", "نقرة"], chimes: ["Chime", "نغمة"], foley: ["Foley", "فولي"], music: ["Motif", "لحن"], ambience: ["Atmos", "أجواء"], glitch: ["Glitch", "جلتش"] };
const short = (t) => (t.length > 34 ? t.slice(0, 32).trim() + "…" : t);
const vjobs = fs.readdirSync("/tmp/work/meta").map((f) => JSON.parse(fs.readFileSync(`/tmp/work/meta/${f}`, "utf8"))).filter((m) => m.hasAudio && fs.existsSync(`/tmp/work/wav/${m.slug}.wav`));
console.log("video tracks", vjobs.length);
let vItems = 0;
await pool(vjobs, 6, async (m) => {
  const v = vmap[m.slug]; const wav = `/tmp/work/wav/${m.slug}.wav`; const x = await decode(wav); if (x.length < SR * 0.2) return;
  const f = analyze(x); if (f.peakDb < -50) { stats.silent++; return; }
  const common = { repo: "motionvideo-opus", pack: `🎬 ${v.title}`, creator: `@${v.creator}`, license: "Audio © original creator", attribution: `Extracted from @${v.creator}'s video — personal reference use`, sourceUrl: v.post_url, videoSlug: v.slug, videoTitle: v.title, videoUrl: v.motionvideo_url, posterUrl: v.poster_url };
  // soundtrack (full)
  const fid = sha("full/" + m.slug), ffile = `${fid}.m4a`;
  await run(ffmpegPath, ["-v", "error", "-y", "-i", wav, "-c:a", "aac", "-b:a", "112k", "-movflags", "+faststart", path.join(AUD, ffile)]);
  const fullCat = f.dur >= 3 ? "soundtrack" : classifyAcoustic(f);
  const fi = baseItem({ ...common, id: fid, file: ffile, name: `Soundtrack · ${v.title}`, nameAr: `موسيقى «${v.title}»`, tags: ["soundtrack", "full track", "video", v.creator, ...(v.categories || [])] }, f, fullCat, f.dur >= 3 ? "music" : "sfx");
  fi.size = fs.statSync(path.join(AUD, ffile)).size; items.push(fi); vItems++;
  // slices by silence
  const hop = 220, th = Math.max(-55, f.peakDb - 42); const act = [];
  for (let i = 0; i + hop <= x.length; i += hop) { let s = 0; for (let j = i; j < i + hop; j++) s += x[j] * x[j]; act.push(db(Math.sqrt(s / hop)) > th); }
  const segs = []; let st = -1, gap = 0; const maxGap = 15;
  act.forEach((a, i) => { if (a) { if (st < 0) st = i; gap = 0; } else if (st >= 0) { gap++; if (gap > maxGap) { segs.push([st, i - gap + 1]); st = -1; gap = 0; } } });
  if (st >= 0) segs.push([st, act.length - gap]);
  let sl = segs.map(([a, b]) => [Math.max(0, (a * hop) / SR - 0.02), Math.min(f.dur, (b * hop) / SR + 0.05)]).filter(([a, b]) => b - a >= 0.12 && b - a <= 25 && b - a < f.dur * 0.9);
  if (sl.length > 40) sl = sl.sort((p, q) => q[1] - q[0] - (p[1] - p[0])).slice(0, 40).sort((p, q) => p[0] - q[0]);
  let n = 0;
  for (const [a, b] of sl) {
    const seg = x.subarray(Math.floor(a * SR), Math.floor(b * SR)); if (seg.length < 1100) continue;
    const sf = analyze(seg); if (sf.peakDb < -50) continue;
    const key = "v|" + m.slug + "|" + Math.round(sf.dur * 20) + "|" + sf.peaks.slice(0, 6).join(","); if (seen.has(key)) continue; seen.add(key);
    n++;
    let cat = classifyAcoustic(sf);
    const adjSet = ADJ[describe(sf)[1]]; const h = parseInt(sha(m.slug + a).slice(0, 4), 16); const [adjE, adjA] = adjSet[h % adjSet.length]; const [nE, nA] = NOUN[cat] || NOUN.foley;
    const id = sha(`seg/${m.slug}/${a.toFixed(3)}`), file = `${id}.m4a`;
    await run(ffmpegPath, ["-v", "error", "-y", "-ss", a.toFixed(3), "-to", b.toFixed(3), "-i", wav, "-af", `afade=t=in:d=0.004,afade=t=out:st=${Math.max(0, b - a - 0.03).toFixed(3)}:d=0.03`, "-c:a", "aac", "-b:a", "128k", "-movflags", "+faststart", path.join(AUD, file)]);
    const num = String(n).padStart(2, "0");
    const it = baseItem({ ...common, id, file, name: `${adjE} ${nE} ${num} · ${short(v.title)}`, nameAr: `${nA} ${adjA} ${num} · ${short(v.title)}`, segStart: +a.toFixed(3), segEnd: +b.toFixed(3), tags: ["slice", "from video", v.creator] }, sf, cat, sf.dur >= 12 ? (sf.flat > 0.25 ? "ambience" : "music") : "sfx");
    it.size = fs.statSync(path.join(AUD, file)).size; items.push(it); vItems++;
  }
});
console.log("video items", vItems, stats);

// finalize
items.sort((a, b) => (a.repo + a.pack + a.name).localeCompare(b.repo + b.pack + b.name));
fs.writeFileSync(path.join(OUT, "manifest.json"), JSON.stringify(items));
const byCat = {}, byRepo = {}; let bytes = 0, secs = 0; for (const i of items) { byCat[i.category] = (byCat[i.category] || 0) + 1; byRepo[i.repo] = (byRepo[i.repo] || 0) + 1; bytes += i.size; secs += i.duration; }
console.log("TOTAL", items.length, "bytes", (bytes / 1e6).toFixed(1) + "MB", "hours", (secs / 3600).toFixed(2)); console.log(byCat, byRepo);
console.log("INGEST DONE");
