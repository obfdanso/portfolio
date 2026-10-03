export type Entry = {
  title: string;
  org: string;
  period: string;
  points: string[];
};

type Resume = {
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
 */

export const resume: Resume = {
  summary:
    "Software engineer working across the frontend and the backend, with a working knowledge of databases, networking and system analysis. Key contributor on three projects, including a deployed medication-tracking app with an AI assistant.",

  education: [
    {
      title: "BSc, Computer Science",
      org: "Kwame Nkrumah University of Science and Technology",
      period: "Final year, graduating 2027",
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
      title: "Developer, solo build",
      org: "POS",
      period: "2025",
      points: [
        "Built three role-specific interfaces, for administrator, manager, and cashier, over shared data.",
        "Optimised the cashier flow for speed and keyboard operation, the path used most often.",
        "Built the backend in Node.js and Express on a PostgreSQL database.",
      ],
    },
    {
      title: "Frontend Developer",
      org: "bitby",
      period: "2025",
      points: [
        "Built the React Native frontend for a student UI reconstruction study of a crypto trading interface, as one of three frontend developers on a seven-person team.",
      ],
    },
  ],

  skills: [
    { group: "Languages", items: ["TypeScript", "JavaScript", "HTML", "CSS"] },
    { group: "Frameworks", items: ["React", "Next.js", "React Native"] },
    { group: "Backend", items: ["Node.js", "Express", "PostgreSQL"] },
    { group: "Tooling", items: ["Git", "Vercel", "Vite"] },
    { group: "Core & AI", items: ["Database Design", "System Analysis", "Networking", "AI Tools"] },
  ],

  pdfPath: "/Danso_Daniel.pdf",
};
