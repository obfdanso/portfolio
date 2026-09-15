export type Entry = {
  title: string;
  org: string;
  period: string;
  points: string[];
};

export type Resume = {
  summary: string;
  education: Entry[];
  experience: Entry[];
  skills: { group: string; items: string[] }[];
  pdfPath: string;
};

/**
 * The /resume page renders entirely from this object, so updating the resume
 * is an edit to one data file with no layout work. Keep public/resume.pdf in
 * sync when this changes.
 *
 * TO CONFIRM (Danso): education dates and programme are assumed from context
 * and must be corrected before launch.
 */
export const resume: Resume = {
  summary:
    "Frontend engineer building typed, accessible web interfaces in TypeScript and React. Frontend contributor on three projects, including a deployed medication-tracking app with an AI assistant.",

  education: [
    {
      title: "BSc, Computer Science",
      org: "Kwame Nkrumah University of Science and Technology",
      period: "2023 — present",
      points: ["Coursework in software engineering, data structures, and web development."],
    },
  ],

  experience: [
    {
      title: "Frontend Developer",
      org: "MediSpace",
      period: "2025",
      points: [
        "Built the full frontend in TypeScript: medication schedule, dosage tracking, and the AI chat interface.",
        "Streamed chatbot responses so answers render as they arrive rather than after a blocking wait.",
        "Deployed the frontend on Vercel.",
      ],
    },
    {
      title: "Frontend Developer",
      org: "POS",
      period: "2025",
      points: [
        "Built three role-specific interfaces — administrator, manager, and cashier — over shared data.",
        "Optimised the cashier flow for speed and keyboard operation, the path used most often.",
      ],
    },
    {
      title: "Frontend Developer",
      org: "bitby",
      period: "2025",
      points: [
        "Built the React Native frontend for an independent UI reconstruction study of a crypto trading interface.",
        "Built list rows to update in isolation, keeping a frequently-updating market list responsive.",
      ],
    },
  ],

  skills: [
    { group: "Languages", items: ["TypeScript", "JavaScript", "HTML", "CSS"] },
    { group: "Frameworks", items: ["React", "Next.js", "React Native"] },
    { group: "Tooling", items: ["Git", "Vercel", "Vite"] },
  ],

  pdfPath: "/resume.pdf",
};
