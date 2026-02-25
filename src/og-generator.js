import { Resvg } from "@resvg/resvg-js";
import { join } from "node:path";

const fontDir = join(process.cwd(), "src", "fonts");

function escapeXml(unsafe) {
  return unsafe.replace(/[<>&'"]/g, function (c) {
    switch (c) {
      case "<":
        return "&lt;";
      case ">":
        return "&gt;";
      case "&":
        return "&amp;";
      case "'":
        return "&apos;";
      case '"':
        return "&quot;";
    }
  });
}

function truncate(str, max) {
  if (str.length <= max) return str;
  return str.substring(0, max - 3) + "...";
}

function wrapText(text, maxChars) {
  const words = text.split(" ");
  const lines = [];
  let currentLine = "";
  for (const word of words) {
    if ((currentLine + " " + word).trim().length > maxChars) {
      if (currentLine.trim()) lines.push(currentLine.trim());
      currentLine = word;
    } else {
      currentLine = currentLine ? currentLine + " " + word : word;
    }
  }
  if (currentLine.trim()) lines.push(currentLine.trim());
  return lines;
}

export function generateOgImageBuffer(post) {
  // Wrap to at most 3 lines of 34 characters each
  const titleLines = post
    ? wrapText(post.title, 32).slice(0, 3)
    : ["Artem Stepanov"];
  const titleSvg = titleLines
    .map(
      (line, i) =>
        `<tspan x="96" dy="${i === 0 ? 0 : 76}">${escapeXml(line)}</tspan>`,
    )
    .join("");

  const titleEndOffset = (titleLines.length - 1) * 76;
  const shiftY = titleEndOffset / 2;

  const startY = 220 - shiftY;
  const subtitleY = 290 - shiftY + titleEndOffset;
  const siteUrlY = 360 - shiftY + titleEndOffset;
  const dividerY = 420 - shiftY + titleEndOffset;
  const tagsY = 470 - shiftY + titleEndOffset;
  const subtitle = post
    ? post.date
      ? new Date(post.date).toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
          timeZone: "UTC",
        })
      : "Undated"
    : "Senior Software Engineer";
  const tagsStr =
    post && post.tags && post.tags.length > 0
      ? escapeXml(truncate(post.tags.join(" / "), 60))
      : "Backend / Platform / Infra";

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <rect width="1200" height="630" fill="#09090b" />
  <rect x="0" y="0" width="1200" height="6" fill="#22c55e" />
  <rect x="0" y="624" width="1200" height="6" fill="#22c55e" />
  <text x="96" y="${startY}" fill="#e4e4e7" font-size="64" font-family="Inter" font-weight="bold">${titleSvg}</text>
  <text x="96" y="${subtitleY}" fill="#a1a1aa" font-size="28" font-family="JetBrains Mono">${subtitle}</text>
  <text x="96" y="${siteUrlY}" fill="#22c55e" font-size="24" font-family="JetBrains Mono">~/awocy.dev${post ? `/posts/${post.slug}` : ""}</text>
  <path d="M96 ${dividerY}h180" stroke="#3f3f46" stroke-width="2" />
  <text x="96" y="${tagsY}" fill="#71717a" font-size="20" font-family="JetBrains Mono">${tagsStr}</text>
</svg>`;

  const resvg = new Resvg(svg, {
    font: {
      loadSystemFonts: false,
      fontFiles: [
        join(fontDir, "JetBrainsMono-Regular.ttf"),
        join(fontDir, "JetBrainsMono-Bold.ttf"),
        join(fontDir, "Inter-Regular.ttf"),
        join(fontDir, "Inter-Bold.ttf"),
      ],
      defaultFontFamily: "Inter",
    },
    fitTo: { mode: "width", value: 1200 },
  });

  const pngData = resvg.render();
  return pngData.asPng();
}
