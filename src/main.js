import "./style.css";

const projects = [
  {
    title: "Project One",
    description: "A short description of what this project does.",
    tech: ["JavaScript", "Vite", "Tailwind"],
    url: "https://github.com",
  },
  {
    title: "Project Two",
    description: "A short description of what this project does.",
    tech: ["Python", "FastAPI"],
    url: "https://github.com",
  },
];

const skills = [
  "JavaScript", "TypeScript", "Python", "HTML", "CSS",
  "React", "Node.js", "Vite", "Tailwind CSS", "Git",
];

function renderProjects() {
  const grid = document.getElementById("projects-grid");
  grid.innerHTML = projects
    .map(
      (p) => `
    <a href="${p.url}" target="_blank" rel="noopener"
       class="block border border-zinc-800 p-6 hover:border-accent transition-colors group">
      <h3 class="font-mono font-bold mb-2 group-hover:text-accent transition-colors">${p.title}</h3>
      <p class="text-zinc-400 text-sm mb-4">${p.description}</p>
      <div class="flex flex-wrap gap-2">
        ${p.tech.map((t) => `<span class="text-xs font-mono text-zinc-500 border border-zinc-700 px-2 py-1">${t}</span>`).join("")}
      </div>
    </a>
  `
    )
    .join("");
}

function renderSkills() {
  const list = document.getElementById("skills-list");
  list.innerHTML = skills
    .map(
      (s) =>
        `<span class="text-sm font-mono text-zinc-300 border border-zinc-700 px-3 py-1">${s}</span>`
    )
    .join("");
}

renderProjects();
renderSkills();
