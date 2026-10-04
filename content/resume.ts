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
    "Front-end developer building interfaces in React and TypeScript, with a working knowledge of backend development and SQL databases, good knowledge of networking fundamentals, and proficiency with AI coding tools.",

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
      title: "Front-end Developer",
      org: "MediSpace",
      period: "2025",
      points: [
        "Built the full front end in TypeScript: medication schedule, dosage tracking, and the AI chat interface.",
        "Streamed chatbot responses so answers render as they arrive rather than after a blocking wait.",
        "Deployed the front end on Vercel.",
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
      title: "Front-end Developer",
      org: "bitby",
      period: "2025",
      points: [
        "Built the React Native front end for a student UI reconstruction study of a crypto trading interface, as one of three front-end developers on a seven-person team.",
      ],
    },
    {
      title: "Developer, solo build",
      org: "intercli",
      period: "2025–2026",
      points: [
        "Built a C++ chat server and client where many named clients message each other directly or all at once.",
        "Encrypted every message with AES-256-GCM, with keys agreed by Diffie-Hellman and rotated every 10 messages in each direction.",
      ],
    },
    {
      title: "App developer",
      org: "Smart Socket",
      period: "2026",
      points: [
        "Built the Android, Windows and web apps for an Arduino smart socket that cuts power once a device is fully charged, connecting to it over Bluetooth.",
        "Gave all three apps the same screens, wording and behaviour, plus a simulator for working without the hardware, on a ten-person team.",
      ],
    },
  ],

  skills: [
    { group: "Front-end", items: ["TypeScript", "JavaScript", "HTML", "CSS", "React", "Next.js"] },
    {
      group: "Mobile and desktop",
      items: ["React Native", "Kotlin with Jetpack Compose", "C# with WPF"],
    },
    { group: "Other languages", items: ["C++"] },
    { group: "Backend", items: ["Node.js", "Express"] },
    { group: "Databases", items: ["PostgreSQL", "MySQL", "SQL"] },
    {
      group: "Networking",
      items: ["TCP/IP and the OSI model", "IP addressing and subnetting", "routing and switching"],
    },
    { group: "AI tools", items: ["Claude Code", "Cursor", "GitHub Copilot", "Gemini"] },
    { group: "Tooling", items: ["Git", "Vercel", "Vite", "CMake"] },
  ],

  pdfPath: "/Danso_Daniel.pdf",
};
