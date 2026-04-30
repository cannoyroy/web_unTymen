export interface HeroProfile {
  name: string;
  line2: string;
  line3: string;
  researchTitle: string;
  researchBullets: string[];
  closing: string;
  // optional avatar path relative to public/, e.g. /avatars/default.png
  avatar?: string;
}

export interface ActionLinks {
  githubUrl: string;
  cvUrl: string;
  email: string;
}

export interface ResearchItem {
  title: string;
  summary: string;
  keywords: string[];
}

export interface ProjectItem {
  title: string;
  period: string;
  summary: string;
  tech: string[];
  link?: string;
}

export interface PublicationItem {
  title: string;
  venue: string;
  year: string;
  status: string;
  url?: string;
}

export interface ExperienceSectionRef {
  id: "research" | "projects" | "publications";
  label: string;
}

export const heroProfile: HeroProfile = {
  name: "Reid",
  line2: "Automation",
  researchTitle: "Research Interests:",
  researchBullets: [
    "Embodied AI and VLA Architectures",
    "Autonomous Agentic Orchestration",
    "Formal Logic and Knowledge Systems",
  ],
  closing:
    "I am dedicated to building the future of Embodied AI and agentic systems, bridging the gap between full-stack engineering and formal logic.",
  // default avatar (uses existing public/avatars/default.png)
  avatar: "/avatars/default.png",
};

export const actionLinks: ActionLinks = {
  githubUrl: "https://github.com/cannoyroy/",
  cvUrl: "/cv/mr-reid-cv.md",
  email: "mailto:untymen@163.com",
};

export const researchItems: ResearchItem[] = [
  {
    title: "Depth-Aware Vision-Language-Action (VLA) Architectures for Embodied AI",
    summary: "Exploring the integration of spatial depth perception into large-scale VLA models to enhance the robustness of robotic manipulation and bridge the gap between high-level reasoning and low-level physical interaction.",
    keywords: ["Embodied AI", "VLA Models", "Robotic Policy Learning"],
  },
];

export const projectItems: ProjectItem[] = [
  {
    title: "Moreturn (formerly Magic Orbit English)",
    period: "2024 - Present",
    summary:
      "Founded and leading the development of a full-process AI platform for correcting and rewriting high school English essays. As CEO and Lead Developer, I designed the system architecture to provide high-accuracy linguistic feedback and personalized learning paths.",
    tech: ["AI Agent", "Vue 3", "LLM API", "Docker"],
    link: "https://moreturn.cn/",
  },
  {
    title: "SBTI Personality Test System",
    period: "2025",
    summary:
      "Developed an entertainment-oriented personality test web app featuring a 36-question quiz and shareable result cards. Reached over 50,000 users through viral social sharing and optimized front-end performance.",
    tech: ["Vite", "React", "TypeScript", "Tailwind CSS"],
    link: "https://sbti.untymen.com/",
  },
];

export const publicationItems: PublicationItem[] = [];

export const experienceSections: ExperienceSectionRef[] = [
  { id: "research", label: "Research" },
  { id: "projects", label: "Projects" },
  { id: "publications", label: "Publications" },
];
