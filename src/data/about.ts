import {
  actionLinks,
  heroProfile,
  projectItems,
  publicationItems,
  researchItems,
} from "./experience";

export type AboutLanguage = "python" | "go" | "zh";

export interface AboutSidebarSection {
  title: string;
  items: string[];
}

export interface AboutCodeBlock {
  title: string;
  lines: string[];
}

export const defaultAboutLanguage: AboutLanguage = "go";

export const aboutSidebarByLang: Record<AboutLanguage, AboutSidebarSection[]> = {
  go: [
    {
      title: "imports",
      items: ['"profile/core"', '"profile/projects"', '"profile/research"'],
    },
    {
      title: "highlights",
      items: [
        "Machine Learning Systems",
        "Efficient LLM Fine-tuning",
        "Model Compression and Inference Optimization",
      ],
    },
    {
      title: "links",
      items: [actionLinks.githubUrl, actionLinks.cvUrl, actionLinks.email],
    },
  ],
  python: [
    {
      title: "modules",
      items: ["candidate", "research", "projects"],
    },
    {
      title: "focus",
      items: heroProfile.researchBullets,
    },
    {
      title: "links",
      items: [actionLinks.githubUrl, actionLinks.cvUrl, actionLinks.email],
    },
  ],
  zh: [
    {
      title: "identity",
      items: [heroProfile.name, heroProfile.line2, heroProfile.line3],
    },
    {
      title: "interests",
      items: heroProfile.researchBullets,
    },
    {
      title: "contact",
      items: [actionLinks.githubUrl, actionLinks.cvUrl, actionLinks.email],
    },
  ],
};

const goProjectLines = projectItems.flatMap((project) => [
  "    {",
  `        Title:  "${project.title}",`,
  `        Period: "${project.period}",`,
  `        Stack:  []string{${project.tech.map((tech) => `"${tech}"`).join(", ")}},`,
  project.link ? `        Link:   "${project.link}",` : "",
  "    },",
]);

const goPublicationLines =
  publicationItems.length > 0
    ? publicationItems.map(
        (publication) =>
          `    "${publication.title} | ${publication.venue} | ${publication.year}",`,
      )
    : ['    "Publications available upon request.",'];

const pythonProjectLines = projectItems.flatMap((project) => [
  "    {",
  `        "title": "${project.title}",`,
  `        "period": "${project.period}",`,
  `        "tech": [${project.tech.map((tech) => `"${tech}"`).join(", ")}],`,
  project.link ? `        "link": "${project.link}",` : "",
  "    },",
]);

export const aboutCodePanelsByLang: Record<AboutLanguage, AboutCodeBlock[]> = {
  go: [
    {
      title: "resume.go",
      lines: [
        "package profile",
        "",
        "type Candidate struct {",
        "    Name        string",
        "    Role        string",
        "    Institution string",
        "}",
        "",
        "var Me = Candidate{",
        `    Name:        "${heroProfile.name}",`,
        `    Role:        "${heroProfile.line2}",`,
        `    Institution: "${heroProfile.line3}",`,
        "}",
      ],
    },
    {
      title: "research.go",
      lines: [
        "var ResearchInterests = []string{",
        ...researchItems.map((item) => `    "${item.title}",`),
        "}",
        "",
        "var CurrentFocus = []string{",
        ...heroProfile.researchBullets.map((item) => `    "${item}",`),
        "}",
      ],
    },
    {
      title: "projects.go",
      lines: [
        "type Project struct {",
        "    Title  string",
        "    Period string",
        "    Stack  []string",
        "    Link   string",
        "}",
        "",
        "var Projects = []Project{",
        ...goProjectLines,
        "}",
        "",
        "var Publications = []string{",
        ...goPublicationLines,
        "}",
      ],
    },
    {
      title: "contact.go",
      lines: [
        "func Contact() map[string]string {",
        "    return map[string]string{",
        `        "github": "${actionLinks.githubUrl}",`,
        `        "cv":     "${actionLinks.cvUrl}",`,
        `        "email":  "${actionLinks.email}",`,
        "    }",
        "}",
        "",
        `// ${heroProfile.closing}`,
      ],
    },
  ],
  python: [
    {
      title: "resume.py",
      lines: [
        "candidate = {",
        `    'name': '${heroProfile.name}',`,
        `    'role': '${heroProfile.line2}',`,
        `    'institution': '${heroProfile.line3}',`,
        "}",
      ],
    },
    {
      title: "research.py",
      lines: [
        "research_interests = [",
        ...researchItems.map((item) => `    '${item.title}',`),
        "]",
      ],
    },
    {
      title: "projects.py",
      lines: ["projects = [", ...pythonProjectLines, "]"],
    },
    {
      title: "contact.py",
      lines: [
        "contact = {",
        `    'github': '${actionLinks.githubUrl}',`,
        `    'cv': '${actionLinks.cvUrl}',`,
        `    'email': '${actionLinks.email}',`,
        "}",
      ],
    },
  ],
  zh: [
    {
      title: "resume.zh-CN",
      lines: [
        "name = \"Reid\"",
        "status = \"Automation\"",
        "direction = \"Embodied AI and VLA Architectures\"",
      ],
    },
    {
      title: "highlights.zh-CN",
      lines: [
        "highlights = [",
        ...heroProfile.researchBullets.map((item) => `    \"${item}\",`),
        "]",
      ],
    },
    {
      title: "projects.zh-CN",
      lines: [
        "projects = [",
        ...projectItems.map((project) => `    \"${project.title} (${project.period})\",`),
        "]",
      ],
    },
    {
      title: "contact.zh-CN",
      lines: [
        `github = \"${actionLinks.githubUrl}\"`,
        `cv = \"${actionLinks.cvUrl}\"`,
        `email = \"${actionLinks.email}\"`,
      ],
    },
  ],
};
