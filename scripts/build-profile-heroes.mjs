#!/usr/bin/env node

import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const OUTPUT_DIR = "assets/profile-hero-candidates";
const ACTIVE_OUTPUT = "assets/profile-hero.svg";
const ACTIVE_CANDIDATE_ID = "03-enterprise-api";
const WIDTH = 1200;
const HEIGHT = 420;

const palette = {
  bg0: "#07090D",
  bg1: "#10141B",
  bg2: "#171014",
  panel: "#0F141B",
  panel2: "#121821",
  text: "#F8FAFC",
  muted: "#CBD5E1",
  dim: "#94A3B8",
  line: "#D8DEE9",
  red: "#8B1A1A",
  red2: "#C0392B",
  rose: "#F0A39B",
  bluePanel: "#111827",
};

const fonts = `
  .eyebrow { font: 700 18px Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; letter-spacing: .15em; }
  .title { font: 800 64px Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; letter-spacing: -.035em; }
  .subtitle { font: 650 26px Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }
  .label { font: 750 17px Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; letter-spacing: .025em; }
  .micro { font: 750 14px Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; letter-spacing: .09em; }
  .mono { font: 650 14px "SFMono-Regular", Consolas, "Liberation Mono", monospace; letter-spacing: .01em; }
`;

const candidates = [
  {
    id: "01-core-ledger",
    title: "Core Ledger",
    description: "Diseño sobrio con tarjeta principal, panel de arquitectura bancaria y ledger visual.",
    variant: "ledger",
  },
  {
    id: "02-decision-flow",
    title: "Decision Flow",
    description: "Enfatiza motor de decisión y trazabilidad sin sacar nodos de su contenedor.",
    variant: "decision",
  },
  {
    id: "03-enterprise-api",
    title: "Enterprise API",
    description: "Más API/platform oriented, útil para Solutions Architect y backend enterprise.",
    variant: "api",
  },
  {
    id: "04-credit-origination",
    title: "Credit Origination",
    description: "Más orientado a originación digital y flujo de crédito bancario.",
    variant: "credit",
  },
];

function escapeText(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function attrs(values) {
  return Object.entries(values)
    .filter(([, value]) => value !== undefined && value !== null && value !== false)
    .map(([key, value]) => `${key}="${escapeText(value)}"`)
    .join(" ");
}

function tag(name, values = {}, children = "") {
  const attributes = attrs(values);
  const open = attributes ? `<${name} ${attributes}` : `<${name}`;
  if (children === null) return `${open}/>`;
  return `${open}>${children}</${name}>`;
}

function rect(x, y, width, height, options = {}) {
  return tag("rect", { x, y, width, height, ...options }, null);
}

function text(x, y, content, options = {}) {
  return tag("text", { x, y, ...options }, escapeText(content));
}

function line(x1, y1, x2, options = {}) {
  return tag("path", { d: `M${x1} ${y1}H${x2}`, ...options }, null);
}

function vline(x, y1, y2, options = {}) {
  return tag("path", { d: `M${x} ${y1}V${y2}`, ...options }, null);
}

function g(children, options = {}) {
  return tag("g", options, children.join("\n"));
}

function assertInside(parent, child, label) {
  const right = child.x + child.width;
  const bottom = child.y + child.height;
  const parentRight = parent.x + parent.width;
  const parentBottom = parent.y + parent.height;
  const ok = child.x >= parent.x && child.y >= parent.y && right <= parentRight && bottom <= parentBottom;
  if (!ok) {
    throw new Error(`${label} escapes parent: child=${JSON.stringify(child)} parent=${JSON.stringify(parent)}`);
  }
}

function chip(x, y, width, label, active = false) {
  return [
    rect(x, y, width, 34, {
      rx: 7,
      fill: active ? palette.red : "#1E293B",
      "fill-opacity": active ? 0.94 : 1,
      stroke: palette.line,
      "stroke-opacity": active ? 0 : 0.18,
    }),
    text(x + width / 2, y + 23, label, {
      fill: active ? "#FFFFFF" : palette.muted,
      "text-anchor": "middle",
      class: "label",
    }),
  ].join("\n");
}

function badge(x, y, label, icon = "bars") {
  const iconMarkup = icon === "bank"
    ? [
        rect(x + 15, y + 24, 5, 8, { rx: 1, fill: "#F3B6AF" }),
        rect(x + 24, y + 18, 5, 14, { rx: 1, fill: palette.red2 }),
        rect(x + 33, y + 12, 5, 20, { rx: 1, fill: palette.red }),
      ].join("\n")
    : [
        rect(x + 15, y + 14, 22, 4, { rx: 2, fill: palette.rose }),
        rect(x + 15, y + 23, 22, 4, { rx: 2, fill: palette.red2 }),
      ].join("\n");

  return [
    rect(x, y, 214, 42, {
      rx: 9,
      fill: "#FFFFFF",
      "fill-opacity": 0.052,
      stroke: palette.line,
      "stroke-opacity": 0.13,
    }),
    iconMarkup,
    text(x + 52, y + 29, label, { fill: "#E5E7EB", class: "eyebrow" }),
  ].join("\n");
}

function baseDefs(id, { animated = false } = {}) {
  const bgAnimation = animated
    ? '<animate attributeName="stop-color" values="#10141B;#131820;#10141B" dur="14s" repeatCount="indefinite"/>'
    : "";
  const frameAnimation = animated
    ? '<animate attributeName="stop-opacity" values="0.70;1;0.70" dur="9s" repeatCount="indefinite"/>'
    : "";
  const lineAnimation = animated
    ? '<animate attributeName="stop-opacity" values="0.38;0.72;0.38" dur="6.5s" repeatCount="indefinite"/>'
    : "";

  return tag("defs", {}, `
    <linearGradient id="${id}-bg" x1="0" y1="0" x2="${WIDTH}" y2="${HEIGHT}" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="${palette.bg0}"/>
      <stop offset="0.58" stop-color="${palette.bg1}">${bgAnimation}</stop>
      <stop offset="1" stop-color="${palette.bg2}"/>
    </linearGradient>
    <linearGradient id="${id}-frame" x1="24" y1="24" x2="1176" y2="396" gradientUnits="userSpaceOnUse">
      <stop stop-color="#4B5563"/>
      <stop offset="0.55" stop-color="${palette.red}" stop-opacity="0.82">${frameAnimation}</stop>
      <stop offset="1" stop-color="${palette.red2}"/>
    </linearGradient>
    <linearGradient id="${id}-line" x1="0" y1="0" x2="360" y2="0" gradientUnits="userSpaceOnUse">
      <stop stop-color="${palette.line}" stop-opacity="0.20"/>
      <stop offset="0.5" stop-color="${palette.red2}" stop-opacity="0.62">${lineAnimation}</stop>
      <stop offset="1" stop-color="${palette.line}" stop-opacity="0.20"/>
    </linearGradient>
    <pattern id="${id}-grid" width="40" height="40" patternUnits="userSpaceOnUse">
      <path d="M40 0H0V40" stroke="${palette.line}" stroke-opacity="0.042"/>
    </pattern>
    <style>${fonts}</style>
  `);
}

function baseFrame(id, children, { animated = false } = {}) {
  const frame = animated
    ? tag("rect", {
        x: 24,
        y: 24,
        width: 1152,
        height: 372,
        rx: 28,
        fill: "#0A0D12",
        "fill-opacity": 0.28,
        stroke: `url(#${id}-frame)`,
        "stroke-width": 2,
        "stroke-opacity": 0.46,
      }, '<animate attributeName="stroke-opacity" values="0.34;0.56;0.34" dur="9s" repeatCount="indefinite"/>')
    : rect(24, 24, 1152, 372, {
        rx: 28,
        fill: "#0A0D12",
        "fill-opacity": 0.28,
        stroke: `url(#${id}-frame)`,
        "stroke-width": 2,
        "stroke-opacity": 0.46,
      });

  return [
    rect(0, 0, WIDTH, HEIGHT, { rx: 28, fill: `url(#${id}-bg)` }),
    rect(0, 0, WIDTH, HEIGHT, { rx: 28, fill: `url(#${id}-grid)` }),
    frame,
    line(24, 110, 1176, { stroke: palette.line, "stroke-opacity": 0.055 }),
    line(24, 314, 1176, { stroke: palette.line, "stroke-opacity": 0.06 }),
    ...children,
  ].join("\n");
}

function introPanel(id, options = {}) {
  const panel = { x: 64, y: 64, width: 576, height: 292 };
  const badgeBox = { x: 92, y: 92, width: 214, height: 42 };
  const chipRow = { x: 96, y: 314, width: 484, height: 34 };
  assertInside(panel, badgeBox, `${id}: badge`);
  assertInside(panel, chipRow, `${id}: chip row`);

  return [
    rect(panel.x, panel.y, panel.width, panel.height, {
      rx: 20,
      fill: "#0F141B",
      "fill-opacity": 0.9,
      stroke: palette.line,
      "stroke-opacity": 0.09,
    }),
    badge(badgeBox.x, badgeBox.y, options.badge ?? "BANKING CORE", "bank"),
    text(92, 190, "Manuel Meneses", { fill: palette.text, class: "title" }),
    text(96, 236, "Staff Software Engineer · Solutions Architect", { fill: palette.muted, class: "subtitle" }),
    text(98, 276, options.line ?? "Onboarding digital · Decisiones de crédito · APIs bancarias", {
      fill: palette.rose,
      class: "label",
    }),
    chip(96, 314, 118, "TypeScript"),
    chip(226, 314, 98, "NestJS"),
    chip(336, 314, 105, "Node.js"),
    chip(453, 314, 126, options.activeChip ?? "Crédito", true),
  ].join("\n");
}

function flowPanel(id, variant) {
  const panel = { x: 686, y: 64, width: 430, height: 292 };
  const header = { x: 718, y: 88, width: 366, height: 44 };
  const flow = { x: 724, y: 164, width: 354, height: 58 };
  const audit = { x: 724, y: 260, width: 360, height: 58 };
  assertInside(panel, header, `${id}: right header`);
  assertInside(panel, flow, `${id}: right flow`);
  assertInside(panel, audit, `${id}: right audit`);

  const middleLabel = variant === "api" ? "API" : "REGLAS";
  const middleMono = variant === "api" ? "contract" : "score()";
  const leftLabel = variant === "credit" ? "SOLIC." : "CAPTURA";
  const rightLabel = variant === "api" ? "EVENTOS" : "API";

  return [
    rect(panel.x, panel.y, panel.width, panel.height, {
      rx: 20,
      fill: "#0F141B",
      "fill-opacity": 0.9,
      stroke: palette.line,
      "stroke-opacity": 0.13,
    }),
    rect(header.x, header.y, header.width, header.height, {
      rx: 10,
      fill: "#FFFFFF",
      "fill-opacity": 0.052,
      stroke: palette.line,
      "stroke-opacity": 0.11,
    }),
    text(header.x + 22, header.y + 29, variant === "api" ? "Contratos empresariales" : "Arquitectura bancaria", {
      fill: "#E5E7EB",
      class: "label",
    }),
    g([
      rect(0, 0, 90, 58, { rx: 12, fill: palette.bluePanel, stroke: palette.line, "stroke-opacity": 0.17 }),
      text(45, 35, leftLabel, { fill: palette.muted, class: "micro", "text-anchor": "middle" }),
      rect(132, 0, 90, 58, { rx: 12, fill: palette.bluePanel, stroke: palette.red, "stroke-opacity": 0.7 }),
      text(177, 26, middleLabel, { fill: palette.rose, class: "micro", "text-anchor": "middle" }),
      text(177, 44, middleMono, { fill: palette.muted, class: "mono", "text-anchor": "middle" }),
      rect(264, 0, 90, 58, { rx: 12, fill: palette.bluePanel, stroke: palette.line, "stroke-opacity": 0.17 }),
      text(309, 35, rightLabel, { fill: palette.muted, class: "micro", "text-anchor": "middle" }),
      tag("path", { d: "M92 29H128", stroke: `url(#${id}-line)`, "stroke-width": 3, "stroke-linecap": "round" }, null),
      tag("path", { d: "M224 29H260", stroke: `url(#${id}-line)`, "stroke-width": 3, "stroke-linecap": "round" }, null),
      tag("circle", { cx: 92, cy: 29, r: 4.5, fill: palette.rose }, null),
      tag("circle", { cx: 128, cy: 29, r: 4.5, fill: palette.rose }, null),
      tag("circle", { cx: 224, cy: 29, r: 4.5, fill: palette.rose }, null),
      tag("circle", { cx: 260, cy: 29, r: 4.5, fill: palette.rose }, null),
    ], { transform: `translate(${flow.x} ${flow.y})` }),
    g([
      rect(0, 0, audit.width, audit.height, {
        rx: 12,
        fill: "#FFFFFF",
        "fill-opacity": 0.04,
        stroke: palette.line,
        "stroke-opacity": 0.11,
      }),
      text(20, 25, variant === "api" ? "CONTRATOS" : "TRAZABILIDAD", { fill: palette.rose, class: "micro" }),
      text(20, 44, variant === "credit" ? "solicitud → validación → aprobación" : "solicitud → validación → decisión", {
        fill: palette.muted,
        class: "mono",
      }),
      tag("path", { d: "M302 20H336", stroke: `url(#${id}-line)`, "stroke-width": 4, "stroke-linecap": "round", opacity: 0.78 }, null),
      tag("path", { d: "M302 36H326", stroke: palette.line, "stroke-opacity": 0.38, "stroke-width": 4, "stroke-linecap": "round" }, null),
    ], { transform: `translate(${audit.x} ${audit.y})` }),
  ].join("\n");
}

function metricRail(id, variant) {
  return g([
    vline(660, 82, 338, { stroke: `url(#${id}-line)`, "stroke-width": 1.5, "stroke-linecap": "round", opacity: 0.55 }),
    ...[0, 1, 2].flatMap((_, index) => {
      const y = 108 + index * 82;
      return [
        line(636, y + 10, 684, { stroke: palette.line, "stroke-opacity": 0.08 }),
        rect(650, y, 20, 20, { rx: 4, fill: index === 1 ? palette.red2 : palette.red, "fill-opacity": 0.86 }),
      ];
    }),
  ], { opacity: 0.72 });
}

function buildCandidate(candidate, { animated = false, outputId = candidate.id } = {}) {
  const id = outputId;
  const introOptions = candidate.variant === "api"
    ? { badge: "API DELIVERY", line: "Contratos de API · Integración bancaria · Azure DevOps", activeChip: "APIs" }
    : candidate.variant === "credit"
      ? { badge: "CREDIT ORIGINATION", line: "Originación digital · Reglas de riesgo · Trazabilidad", activeChip: "Riesgo" }
      : candidate.variant === "decision"
        ? { badge: "DECISION SYSTEMS", line: "Motores de decisión · BPMN · Automatización bancaria", activeChip: "BPMN" }
        : {};

  const body = baseFrame(id, [
    introPanel(id, introOptions),
    metricRail(id, candidate.variant),
    flowPanel(id, candidate.variant),
  ], { animated });

  return `<svg width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-labelledby="title desc">
  <title id="title">Manuel Meneses - ${escapeText(candidate.title)}</title>
  <desc id="desc">${escapeText(candidate.description)}</desc>
  ${baseDefs(id, { animated })}
  ${body}
</svg>
`;
}

mkdirSync(OUTPUT_DIR, { recursive: true });

for (const candidate of candidates) {
  const svg = buildCandidate(candidate);
  writeFileSync(join(OUTPUT_DIR, `${candidate.id}.svg`), svg);
  console.log(`generated ${join(OUTPUT_DIR, `${candidate.id}.svg`)}`);
}

const activeCandidate = candidates.find((candidate) => candidate.id === ACTIVE_CANDIDATE_ID);
if (!activeCandidate) {
  throw new Error(`Missing active candidate ${ACTIVE_CANDIDATE_ID}`);
}

writeFileSync(ACTIVE_OUTPUT, buildCandidate(activeCandidate, { animated: true, outputId: "profile-hero" }));
console.log(`generated ${ACTIVE_OUTPUT}`);

const index = `# Profile Hero Candidates

Generado con \`scripts/build-profile-heroes.mjs\`. Estas opciones son estáticas; las animaciones se agregan sólo después de escoger dirección visual.

${candidates.map((candidate) => `## ${candidate.title}

${candidate.description}

![${candidate.title}](./${candidate.id}.svg)
`).join("\n")}
`;

writeFileSync(join(OUTPUT_DIR, "README.md"), index);
console.log(`generated ${join(OUTPUT_DIR, "README.md")}`);
