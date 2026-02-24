import "./style.css";

const skills = {
  Backend: ["C#", ".NET Core", "Go", "Python"],
  Infrastructure: ["Kubernetes", "Docker", "Proxmox VE", "Linux"],
  "Automation & IaC": ["Ansible", "Terraform/OpenTofu", "CI/CD"],
  "Data & Observability": ["PostgreSQL", "Redis", "Prometheus"],
};

const projects = [
  {
    title: "caddy-admin-ui",
    description:
      "Lightweight web UI for managing Caddy reverse proxy routes without editing Caddyfile directly. Built with Go.",
    tags: ["Go", "Caddy", "Web UI"],
    url: "https://github.com/ArtemStepanov/caddy-admin-ui",
  },
  {
    title: "2048 Game (C#)",
    description:
      "Console implementation of the 2048 game in C# with full unit test coverage.",
    tags: ["C#", ".NET", "Testing"],
    url: "https://github.com/ArtemStepanov/2048Game",
  },
  {
    title: "Homelab Infrastructure",
    description:
      "Self-hosted cluster running 30+ services on Proxmox VE. Fully automated provisioning with Ansible and Terraform.",
    tags: ["Proxmox", "Ansible", "Docker", "GitOps"],
    url: null,
  },
];

function renderSkills() {
  const container = document.getElementById("skills-list");
  container.innerHTML = Object.entries(skills)
    .map(
      ([category, items]) => `
    <div>
      <p class="font-mono text-accent text-xs mb-2">${category}</p>
      <div class="flex flex-wrap gap-2">
        ${items
          .map(
            (s) =>
              `<span class="inline-flex px-3 py-1 text-sm border border-zinc-800 text-zinc-300 hover:border-zinc-600 transition-colors rounded-sm">${s}</span>`
          )
          .join("")}
      </div>
    </div>
  `
    )
    .join("");
}

function renderProjects() {
  const grid = document.getElementById("projects-grid");
  grid.innerHTML = projects
    .map(
      (p) => `
    <div class="bg-zinc-900 border border-zinc-800 hover:border-zinc-600 p-5 rounded-sm transition-colors flex flex-col">
      <h3 class="font-mono font-bold text-white mb-2">${p.title}</h3>
      <p class="text-zinc-400 text-sm mb-4">${p.description}</p>
      <div class="flex flex-wrap gap-2 mb-4">
        ${p.tags.map((t) => `<span class="text-xs font-mono text-zinc-500 border border-zinc-800 px-2 py-1 rounded-sm">${t}</span>`).join("")}
      </div>
      ${p.url ? `<a href="${p.url}" target="_blank" rel="noopener" class="mt-auto font-mono text-xs text-accent hover:underline">→ github</a>` : ""}
    </div>
  `
    )
    .join("");
}

renderSkills();
renderProjects();
