// Curriculum data + helpers, ported from lumen-study.html.
// Per-curriculum subject rosters, instant seed-topic lists for the highest-traffic
// subjects, plus the small pure helpers the UI relies on (colours, slugs, labels).
//
// NOTE: these topic lists are an original starter structure, NOT reproduced
// exam-board specification text. Generated content must stay original too.

/* ---------------- seed topic lists (common subjects) ---------------- */

const bio: string[] = [
  "Cell structure and organisation",
  "Movement in and out of cells",
  "Enzymes",
  "Biological molecules and nutrition",
  "Transport in animals",
  "Transport in plants",
  "Gas exchange",
  "Respiration",
  "Coordination and response",
  "Homeostasis",
  "Reproduction",
  "Inheritance and variation",
  "Natural selection and evolution",
  "Disease and immunity",
  "Ecology and ecosystems",
  "Human impact on the environment",
];

const chem: string[] = [
  "Atomic structure and the periodic table",
  "Ionic, covalent and metallic bonding",
  "Stoichiometry and the mole",
  "Chemical formulae and equations",
  "States of matter and kinetic theory",
  "Acids, bases and salts",
  "Electrolysis and electrochemistry",
  "Energetics and enthalpy",
  "Rates of reaction",
  "Reversible reactions and equilibria",
  "Redox reactions",
  "Group chemistry and trends",
  "Organic chemistry",
  "Polymers",
  "Chemical analysis and testing",
];

const phys: string[] = [
  "Forces and motion",
  "Energy, work and power",
  "Density and pressure",
  "Waves",
  "Light, reflection and refraction",
  "Sound",
  "Electricity and circuits",
  "Electrical energy and power",
  "Magnetism",
  "Electromagnetism and induction",
  "Thermal physics and heat transfer",
  "Kinetic particle theory",
  "Radioactivity and nuclear physics",
  "The electromagnetic spectrum",
  "Momentum and impulse",
  "Space physics",
];

const math: string[] = [
  "Number, surds and indices",
  "Algebraic manipulation",
  "Equations and inequalities",
  "Functions and graphs",
  "Sequences and series",
  "Trigonometry and identities",
  "Coordinate geometry",
  "Differentiation",
  "Applications of differentiation",
  "Integration",
  "Vectors",
  "Exponentials and logarithms",
  "Probability",
  "Statistical distributions",
  "Hypothesis testing",
];

const econ: string[] = [
  "The basic economic problem",
  "Demand, supply and equilibrium",
  "Price elasticity",
  "Market failure and externalities",
  "Costs, revenue and profit",
  "Market structures",
  "The labour market",
  "Measuring national income",
  "Aggregate demand and supply",
  "Inflation and unemployment",
  "Fiscal policy",
  "Monetary policy",
  "International trade",
  "Exchange rates",
  "Economic growth and development",
];

const engLit: string[] = [
  "Reading prose for meaning",
  "Analysing poetry",
  "Shakespeare and drama",
  "Unseen texts",
  "Context and critical reading",
  "Comparative analysis",
  "Character and relationships",
  "Theme, motif and symbolism",
  "Language, form and structure",
  "Crafting analytical essays",
];

const engLang: string[] = [
  "Reading and comprehension",
  "Analysing language and tone",
  "Persuasive and argumentative writing",
  "Descriptive and narrative writing",
  "Non-fiction and media texts",
  "Structure and rhetorical devices",
  "Summary and synthesis",
  "Directed and transactional writing",
  "Spoken language",
  "Evaluating writers' methods",
];

const hist: string[] = [
  "Causes of the First World War",
  "Treaty of Versailles and the interwar years",
  "Rise of dictatorships",
  "The Second World War",
  "Origins of the Cold War",
  "Cold War crises and détente",
  "Civil rights and protest movements",
  "Empire and decolonisation",
  "Revolution and political change",
  "Working with historical sources",
];

const psy: string[] = [
  "Research methods and design",
  "Memory",
  "Social influence",
  "Attachment",
  "Psychopathology",
  "Approaches in psychology",
  "Biopsychology",
  "Cognition and development",
  "Issues and debates",
  "Applications (forensic / clinical)",
];

/* ---------------- per-curriculum subject rosters ---------------- */

export const CUR: Record<string, string[]> = {
  IGCSE: [
    "Mathematics",
    "Additional Mathematics",
    "English – First Language",
    "English – Second Language",
    "English Literature",
    "Biology",
    "Chemistry",
    "Physics",
    "Co-ordinated Sciences",
    "Combined Science",
    "Economics",
    "Business Studies",
    "Accounting",
    "Computer Science",
    "Information & Communication Technology",
    "Global Perspectives",
    "Geography",
    "History",
    "Sociology",
    "Environmental Management",
    "French",
    "Spanish",
    "German",
    "Mandarin Chinese",
    "Art & Design",
    "Music",
    "Drama",
    "Physical Education",
  ],
  GCSE: [
    "Mathematics",
    "Statistics",
    "English Language",
    "English Literature",
    "Biology",
    "Chemistry",
    "Physics",
    "Combined Science",
    "Computer Science",
    "Geography",
    "History",
    "Religious Studies",
    "Citizenship Studies",
    "Sociology",
    "Economics",
    "Business",
    "French",
    "Spanish",
    "German",
    "Latin",
    "Art & Design",
    "Design & Technology",
    "Drama",
    "Music",
    "Physical Education",
    "Media Studies",
    "Food Preparation & Nutrition",
  ],
  "A-Level": [
    "Mathematics",
    "Further Mathematics",
    "Statistics",
    "Biology",
    "Chemistry",
    "Physics",
    "Geology",
    "Environmental Science",
    "Psychology",
    "Sociology",
    "Economics",
    "Business",
    "Accounting",
    "Law",
    "Politics",
    "Philosophy",
    "Religious Studies",
    "History",
    "Geography",
    "Classical Civilisation",
    "English Language",
    "English Literature",
    "English Language & Literature",
    "French",
    "Spanish",
    "German",
    "Latin",
    "Computer Science",
    "Design & Technology",
    "Art & Design",
    "History of Art",
    "Drama & Theatre",
    "Film Studies",
    "Media Studies",
    "Music",
    "Music Technology",
    "Physical Education",
  ],
  "IB Diploma": [
    "English A: Language & Literature",
    "English A: Literature",
    "Spanish B",
    "French B",
    "Mandarin B",
    "Spanish ab initio",
    "Business Management",
    "Economics",
    "Geography",
    "History",
    "Global Politics",
    "Philosophy",
    "Psychology",
    "Social & Cultural Anthropology",
    "Biology",
    "Chemistry",
    "Physics",
    "Computer Science",
    "Design Technology",
    "Sports, Exercise & Health Science",
    "Environmental Systems & Societies",
    "Mathematics: Analysis & Approaches",
    "Mathematics: Applications & Interpretation",
    "Visual Arts",
    "Music",
    "Theatre",
    "Film",
    "Theory of Knowledge",
  ],
  AP: [
    "AP Seminar",
    "AP Research",
    "AP English Language & Composition",
    "AP English Literature & Composition",
    "AP Calculus AB",
    "AP Calculus BC",
    "AP Precalculus",
    "AP Statistics",
    "AP Computer Science A",
    "AP Computer Science Principles",
    "AP Biology",
    "AP Chemistry",
    "AP Environmental Science",
    "AP Physics 1",
    "AP Physics 2",
    "AP Physics C: Mechanics",
    "AP Physics C: Electricity & Magnetism",
    "AP Macroeconomics",
    "AP Microeconomics",
    "AP Psychology",
    "AP US History",
    "AP World History: Modern",
    "AP European History",
    "AP US Government & Politics",
    "AP Comparative Government & Politics",
    "AP Human Geography",
    "AP Art History",
    "AP Music Theory",
    "AP Spanish Language & Culture",
    "AP Spanish Literature & Culture",
    "AP French Language & Culture",
    "AP German Language & Culture",
    "AP Chinese Language & Culture",
    "AP Japanese Language & Culture",
    "AP Italian Language & Culture",
    "AP Latin",
  ],
};

/** Curriculum names, in display order. */
export const CURRICULA: string[] = Object.keys(CUR);

/** The five study tabs, as [slug, label] pairs. */
export const TABS: [string, string][] = [
  ["notes", "Notes"],
  ["cards", "Flashcards"],
  ["quiz", "Quiz"],
  ["papers", "Past Papers"],
  ["tutor", "AI Tutor"],
];

/* ---------------- helpers ---------------- */

/**
 * An instant curated topic list for the highest-traffic subjects.
 * Returns null when there's no seed (creative/arts subjects, or anything we
 * don't pre-curate) — the app then generates the topic list on demand.
 */
export function seedTopics(name: string): string[] | null {
  const n = String(name).toLowerCase();
  if (
    n.indexOf("art") > -1 ||
    n.indexOf("music") > -1 ||
    n.indexOf("theat") > -1 ||
    n.indexOf("film") > -1 ||
    n.indexOf("drama") > -1
  )
    return null;
  if (n.indexOf("biolog") > -1) return bio;
  if (n.indexOf("chem") > -1) return chem;
  if (n.indexOf("physic") > -1 && n.indexOf("magnet") === -1) return phys;
  if (n.indexOf("math") > -1 || n.indexOf("calc") > -1) return math;
  if (n.indexOf("econ") > -1) return econ;
  if (n.indexOf("english") > -1 || n.indexOf("literature") > -1)
    return n.indexOf("literature") > -1 ? engLit : engLang;
  if (n.indexOf("histor") > -1) return hist;
  if (n.indexOf("psycholog") > -1) return psy;
  return null;
}

/** Maps a subject name to its themed CSS colour variable, e.g. "var(--bio)". */
export function subjColor(name: string): string {
  const n = String(name).toLowerCase();
  if (n.indexOf("biolog") > -1) return "var(--bio)";
  if (n.indexOf("chem") > -1) return "var(--chem)";
  if (n.indexOf("physic") > -1) return "var(--phys)";
  if (
    n.indexOf("math") > -1 ||
    n.indexOf("calc") > -1 ||
    n.indexOf("statist") > -1
  )
    return "var(--math)";
  if (
    n.indexOf("econ") > -1 ||
    n.indexOf("business") > -1 ||
    n.indexOf("account") > -1
  )
    return "var(--econ)";
  if (
    n.indexOf("comput") > -1 ||
    n.indexOf("ict") > -1 ||
    n.indexOf("communication tech") > -1
  )
    return "var(--cs)";
  if (
    n.indexOf("english") > -1 ||
    n.indexOf("literature") > -1 ||
    n.indexOf("french") > -1 ||
    n.indexOf("spanish") > -1 ||
    n.indexOf("german") > -1 ||
    n.indexOf("mandarin") > -1 ||
    n.indexOf("chinese") > -1 ||
    n.indexOf("japanese") > -1 ||
    n.indexOf("italian") > -1 ||
    n.indexOf("latin") > -1 ||
    n.indexOf("initio") > -1
  )
    return "var(--eng)";
  if (
    n.indexOf("art") > -1 ||
    n.indexOf("music") > -1 ||
    n.indexOf("theat") > -1 ||
    n.indexOf("drama") > -1 ||
    n.indexOf("film") > -1
  )
    return "var(--psy)";
  if (
    n.indexOf("psycholog") > -1 ||
    n.indexOf("sociolog") > -1 ||
    n.indexOf("anthropolog") > -1
  )
    return "var(--chem)";
  if (
    n.indexOf("histor") > -1 ||
    n.indexOf("geog") > -1 ||
    n.indexOf("politic") > -1 ||
    n.indexOf("law") > -1 ||
    n.indexOf("philosoph") > -1 ||
    n.indexOf("religio") > -1 ||
    n.indexOf("global") > -1 ||
    n.indexOf("civilis") > -1 ||
    n.indexOf("citizen") > -1
  )
    return "var(--hum)";
  return "var(--gold)";
}

/** URL-safe slug from any label. */
export function slug(s: string): string {
  return String(s)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

/**
 * Human-readable label for a subject within a curriculum.
 * Avoids doubling up when the subject name already carries the curriculum
 * (e.g. AP subjects already start with "AP").
 */
export function label(curriculum: string, subject: string): string {
  return String(subject).indexOf(curriculum) === 0
    ? subject
    : `${curriculum} ${subject}`;
}
