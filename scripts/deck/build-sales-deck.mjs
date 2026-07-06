import { spawnSync } from "node:child_process";
import crypto from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";

import JSZip from "jszip";
import pptxgen from "pptxgenjs";
import sharp from "sharp";
import ts from "typescript";

const root = process.cwd();
const publicDir = path.join(root, "public");
const brandDir = path.join(publicDir, "brand", "northlace");
const resourceDir = path.join(publicDir, "resources", "modernization-deck");
const ogDir = path.join(publicDir, "og");
const qaDir = path.join(root, "work", "deck-qa");
const tempDir = path.join(qaDir, "tmp");
const finalRenderDir = path.join(qaDir, "final-renders");
const pptxPath = path.join(brandDir, "northlace-modernization-sales-deck.pptx");
const pdfPath = path.join(brandDir, "northlace-modernization-sales-deck.pdf");
const ogPath = path.join(ogDir, "northlace-modernization-deck.png");
const sourcePdfPath = path.join(
  root,
  "assets",
  "source",
  "application-modernization-cloud-devops-sales-deck.pdf",
);
const fixedBuildDate = new Date("2026-07-06T00:00:00.000Z");
const fixedBuildDateText = "2026-07-06T00:00:00Z";

const ensureDir = (dir) => fs.mkdirSync(dir, { recursive: true });
const cleanDir = (dir) => {
  fs.rmSync(dir, { force: true, recursive: true });
  ensureDir(dir);
};
const writeText = (filePath, contents) => {
  ensureDir(path.dirname(filePath));
  fs.writeFileSync(filePath, `${contents.trim()}\n`);
};
const pptxColor = (hex) => hex.replace("#", "");
const publicPathFor = (filePath) =>
  `/${path.relative(publicDir, filePath).split(path.sep).join("/")}`;
const escapeXml = (value) =>
  String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");

const importBrands = async () => {
  const tsPath = path.join(root, "src", "data", "brands.ts");
  const source = fs.readFileSync(tsPath, "utf8");
  const js = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.ES2022,
      target: ts.ScriptTarget.ES2022,
    },
  }).outputText;
  const tempModule = path.join(tempDir, "brands.mjs");
  writeText(tempModule, js);
  return (await import(pathToFileURL(tempModule).href)).brands;
};

const getPalette = (brand) => {
  const byName = new Map(brand.palette.map((color) => [color.name, color.hex]));
  return {
    amber: byName.get("Amber") ?? "#BA7517",
    dark: brand.primaryDark,
    light: brand.primaryLight,
    lightest: byName.get("Lightest Tint") ?? "#E1F5EE",
    mid: byName.get("Mid Teal") ?? "#0F6E56",
    signal: brand.primaryAccent,
    text: "#173D35",
    tint: byName.get("Light Tint") ?? "#9FE1CB",
  };
};

const addTrackedText = (ledger, slideNumber, text) => {
  if (Array.isArray(text)) {
    for (const item of text)
      addTrackedText(ledger, slideNumber, item.text ?? "");
    return;
  }
  const normalized = String(text).replace(/\s+/g, " ").trim();
  if (normalized) ledger.push(`Slide ${slideNumber}: ${normalized}`);
};

const addText = (
  slide,
  ledger,
  slideNumber,
  text,
  x,
  y,
  w,
  h,
  options = {},
) => {
  addTrackedText(ledger, slideNumber, text);
  slide.addText(text, {
    breakLine: false,
    color: options.color ?? "173D35",
    fit: "shrink",
    fontFace: "Inter",
    fontSize: options.fontSize ?? 16,
    h,
    margin: options.margin ?? 0.08,
    valign: options.valign ?? "mid",
    w,
    x,
    y,
    ...options,
  });
};

const addPanel = (slide, x, y, w, h, fill, line, options = {}) => {
  slide.addShape("roundRect", {
    fill: { color: pptxColor(fill), transparency: options.transparency ?? 0 },
    h,
    line: {
      color: pptxColor(line ?? fill),
      transparency: options.lineTransparency ?? 0,
      width: options.lineWidth ?? 0.9,
    },
    radius: options.radius ?? 0.12,
    w,
    x,
    y,
  });
};

const addFooter = (slide, ledger, slideNumber, brand, colors, isDark) => {
  addText(
    slide,
    ledger,
    slideNumber,
    "Northlace modernization sales deck",
    0.56,
    7.05,
    3.9,
    0.22,
    {
      color: pptxColor(isDark ? colors.light : colors.mid),
      fontSize: 8,
      margin: 0,
    },
  );
  addText(
    slide,
    ledger,
    slideNumber,
    String(slideNumber).padStart(2, "0"),
    12.35,
    7.05,
    0.45,
    0.22,
    {
      align: "right",
      color: pptxColor(isDark ? colors.light : colors.mid),
      fontSize: 8,
      margin: 0,
    },
  );
};

const addSlideTitle = (
  slide,
  ledger,
  slideNumber,
  title,
  subtitle,
  colors,
  isDark,
) => {
  addText(slide, ledger, slideNumber, title, 0.64, 0.42, 10.5, 0.62, {
    bold: true,
    color: pptxColor(isDark ? colors.light : colors.dark),
    fontSize: 32,
    margin: 0,
  });
  if (subtitle) {
    addText(slide, ledger, slideNumber, subtitle, 0.66, 1.1, 9.7, 0.36, {
      color: pptxColor(isDark ? colors.tint : colors.text),
      fontSize: 15,
      margin: 0,
    });
  }
};

const prepareLogoAssets = async (brand) => {
  const embedDir = path.join(tempDir, "embed-assets");
  ensureDir(embedDir);
  const assets = {
    lockupDark: path.join(embedDir, "northlace-lockup-dark.png"),
    markDark: path.join(embedDir, "northlace-mark-dark.png"),
  };
  await sharp(path.join(publicDir, brand.assets.markDark.replace(/^\//, "")))
    .resize({ width: 460 })
    .png()
    .toFile(assets.markDark);
  await sharp(path.join(publicDir, brand.assets.lockupDark.replace(/^\//, "")))
    .resize({ width: 1200 })
    .png()
    .toFile(assets.lockupDark);
  return assets;
};

const metricCards = (slide, ledger, slideNumber, metrics, colors) => {
  metrics.forEach((metric, index) => {
    const x = 0.64 + index * 2.48;
    addPanel(slide, x, 1.82, 2.14, 1.28, colors.lightest, colors.tint);
    addText(
      slide,
      ledger,
      slideNumber,
      metric.value,
      x + 0.12,
      2.04,
      1.9,
      0.38,
      {
        align: "center",
        bold: true,
        color: pptxColor(colors.mid),
        fontSize: 24,
        margin: 0.02,
      },
    );
    addText(
      slide,
      ledger,
      slideNumber,
      metric.label,
      x + 0.16,
      2.48,
      1.82,
      0.32,
      {
        align: "center",
        color: pptxColor(colors.text),
        fontSize: 9.5,
        margin: 0.02,
        valign: "top",
      },
    );
  });
};

const writeDeck = async (brand, colors, logos) => {
  const textLedger = [];
  const pptx = new pptxgen();
  pptx.defineLayout({ height: 7.5, name: "NORTHLACE_WIDE", width: 13.333 });
  pptx.layout = "NORTHLACE_WIDE";
  pptx.author = "Northlace";
  pptx.company = "Northlace";
  pptx.subject = "Modernization sales deck";
  pptx.title = "Northlace Modernization Sales Deck";
  pptx.lang = "en-US";
  pptx.theme = {
    bodyFontFace: "Inter",
    headFontFace: "Inter",
    lang: "en-US",
  };

  const dark = pptxColor(colors.dark);
  const light = pptxColor(colors.light);
  const mid = pptxColor(colors.mid);
  const signal = pptxColor(colors.signal);
  const text = pptxColor(colors.text);

  const newSlide = (slideNumber, isDark = false) => {
    const slide = pptx.addSlide();
    slide.background = { color: isDark ? dark : light };
    addFooter(slide, textLedger, slideNumber, brand, colors, isDark);
    return slide;
  };

  let slideNumber = 1;
  let slide = newSlide(slideNumber, true);
  slide.addImage({ path: logos.markDark, x: 0.66, y: 0.62, w: 1.12, h: 1.12 });
  addText(slide, textLedger, slideNumber, brand.name, 2.0, 0.74, 3.1, 0.42, {
    color: light,
    fontSize: 21,
    margin: 0,
  });
  addText(
    slide,
    textLedger,
    slideNumber,
    brand.tagline,
    2.02,
    1.18,
    4.2,
    0.28,
    {
      color: signal,
      fontSize: 13,
      margin: 0,
    },
  );
  addText(
    slide,
    textLedger,
    slideNumber,
    "Every cloud. One standard.",
    0.72,
    2.58,
    9.3,
    0.82,
    { bold: true, color: light, fontSize: 39, margin: 0 },
  );
  addText(
    slide,
    textLedger,
    slideNumber,
    "Application modernization, cloud, DevOps, SRE, security, FinOps, Kubernetes, Terraform, and platform governance for AWS, Azure, GCP, IBM Cloud, and hybrid estates.",
    0.76,
    3.58,
    9.0,
    0.82,
    { color: pptxColor(colors.tint), fontSize: 18, margin: 0, valign: "top" },
  );
  ["Run", "Shield", "Ledger", "Shift"].forEach((label, index) => {
    addPanel(
      slide,
      0.8 + index * 1.42,
      5.12,
      1.05,
      0.46,
      colors.dark,
      colors.signal,
      {
        lineWidth: 1.1,
      },
    );
    addText(
      slide,
      textLedger,
      slideNumber,
      label,
      0.8 + index * 1.42,
      5.22,
      1.05,
      0.18,
      {
        align: "center",
        color: signal,
        fontSize: 10,
        margin: 0,
      },
    );
  });

  slideNumber += 1;
  slide = newSlide(slideNumber);
  addSlideTitle(
    slide,
    textLedger,
    slideNumber,
    "Modernization only creates value when ownership is clear",
    "The source deck's pains all point to one root cause: no single operating standard across cost, release risk, security exposure, and fragile environments.",
    colors,
    false,
  );
  [
    {
      body: "Cloud spend grows without accountable owners or week-one baselines.",
      title: "Cost has no owner",
    },
    {
      body: "Manual release paths make delivery slow, risky, and hard to audit.",
      title: "Releases feel fragile",
    },
    {
      body: "Cloud, application, and data controls are discovered late in the workflow.",
      title: "Exposure stays open",
    },
    {
      body: "Drift, weak observability, and unclear runbooks stretch incident response.",
      title: "Operations depend on heroics",
    },
  ].forEach((item, index) => {
    const x = 0.72 + (index % 2) * 5.98;
    const y = 1.9 + Math.floor(index / 2) * 1.28;
    addPanel(slide, x, y, 5.35, 0.95, colors.lightest, colors.tint);
    addText(
      slide,
      textLedger,
      slideNumber,
      item.title,
      x + 0.22,
      y + 0.16,
      4.8,
      0.23,
      {
        bold: true,
        color: dark,
        fontSize: 15,
        margin: 0,
      },
    );
    addText(
      slide,
      textLedger,
      slideNumber,
      item.body,
      x + 0.22,
      y + 0.48,
      4.7,
      0.28,
      {
        color: text,
        fontSize: 11.5,
        margin: 0,
        valign: "top",
      },
    );
  });
  addPanel(slide, 0.76, 5.0, 11.65, 0.88, colors.dark, colors.dark);
  addText(
    slide,
    textLedger,
    slideNumber,
    "Northlace turns the scattered work into one governed motion: assess the baseline, prove value in one workload, and scale with KPI ownership.",
    1.05,
    5.22,
    11.1,
    0.26,
    { align: "center", color: light, fontSize: 16, margin: 0 },
  );

  slideNumber += 1;
  slide = newSlide(slideNumber);
  addSlideTitle(
    slide,
    textLedger,
    slideNumber,
    "The value case is already measurable",
    "Use the source facts as a client conversation starter, then verify figures before client distribution.",
    colors,
    false,
  );
  metricCards(
    slide,
    textLedger,
    slideNumber,
    [
      {
        label:
          "Kubernetes in production or evaluation among surveyed cloud consumers.",
        value: "84%",
      },
      {
        label:
          "Cloud resources commonly wasted, creating immediate FinOps opportunity.",
        value: "30%",
      },
      {
        label: "Global average cost of a data breach in 2024.",
        value: "$4.88M",
      },
      {
        label:
          "Breaches involved public cloud, private cloud, and on-prem data.",
        value: "40%",
      },
      {
        label:
          "Top-performing firms broadly adopted application modernization.",
        value: "57%",
      },
    ],
    colors,
  );
  addPanel(slide, 0.78, 4.1, 11.7, 1.18, colors.lightest, colors.tint);
  addText(
    slide,
    textLedger,
    slideNumber,
    "What this means for clients",
    1.05,
    4.3,
    3.2,
    0.3,
    { bold: true, color: dark, fontSize: 16, margin: 0 },
  );
  addText(
    slide,
    textLedger,
    slideNumber,
    "Modernization is a board-level value case across growth, resilience, security, compliance, and cost discipline. Start with a free assessment, quantify baseline pain, then fund the roadmap through quick wins.",
    1.05,
    4.74,
    10.75,
    0.34,
    { color: text, fontSize: 13, margin: 0 },
  );
  addText(
    slide,
    textLedger,
    slideNumber,
    "Sources: CNCF Annual Survey 2023, IBM Cost of a Data Breach 2024, DORA 2024. Verify figures before client distribution.",
    0.78,
    6.12,
    11.2,
    0.24,
    { color: mid, fontSize: 9.5, margin: 0 },
  );

  slideNumber += 1;
  slide = newSlide(slideNumber);
  addSlideTitle(
    slide,
    textLedger,
    slideNumber,
    "Northlace is built for this 3S niche",
    "A sharper niche keeps the offer focused enough to sell, pilot, and measure.",
    colors,
    false,
  );
  [
    {
      body: "Growth-stage and mid-market companies on AWS, Azure, GCP, IBM Cloud, and hybrid estates. CTOs, VPs Engineering, platform leads, and cloud operations owners. TODO-COPY: tighten ICP (spend band, team size, sector).",
      title: "Specific Person",
    },
    {
      body: "Cloud spend has no owner, releases are slow and risky, environments are fragile, and security exposure remains unresolved. The root cause is no single operating standard.",
      title: "Specific Problem",
    },
    {
      body: "The Northlace Standard unifies Run, Shield, Ledger, and Shift through assess -> pilot -> scale KPI governance.",
      title: "Specific Way",
    },
  ].forEach((item, index) => {
    const x = 0.72 + index * 4.12;
    addPanel(slide, x, 1.78, 3.58, 3.65, colors.lightest, colors.tint);
    addText(
      slide,
      textLedger,
      slideNumber,
      item.title,
      x + 0.28,
      2.08,
      3.0,
      0.3,
      {
        bold: true,
        color: dark,
        fontSize: 17,
        margin: 0,
      },
    );
    addText(
      slide,
      textLedger,
      slideNumber,
      item.body,
      x + 0.28,
      2.62,
      3.0,
      1.72,
      {
        color: text,
        fontSize: 13,
        margin: 0,
        valign: "top",
      },
    );
  });

  slideNumber += 1;
  slide = newSlide(slideNumber, true);
  addSlideTitle(
    slide,
    textLedger,
    slideNumber,
    "The Northlace Standard turns scattered work into governed progress",
    "The unique mechanism is not another service menu. It is the operating path from baseline to scale.",
    colors,
    true,
  );
  [
    [
      "01",
      "Baseline the estate",
      "Cost, risk, delivery, reliability, and modernization data are captured in week one.",
    ],
    [
      "02",
      "Set the standard",
      "Run, Shield, Ledger, and Shift define the rules every workload follows.",
    ],
    [
      "03",
      "Prove one workload",
      "A 90-day pilot validates the first economics, controls, and release improvements.",
    ],
    [
      "04",
      "Govern the signals",
      "KPI dashboards and executive reviews keep cost, risk, speed, and reliability visible.",
    ],
    [
      "05",
      "Scale the cadence",
      "Modernization waves expand only after the pilot proves the operating model.",
    ],
  ].forEach(([number, title, body], index) => {
    const y = 1.74 + index * 0.86;
    addPanel(slide, 0.78, y, 11.65, 0.62, colors.dark, colors.signal, {
      lineTransparency: 35,
      lineWidth: 0.8,
    });
    addText(slide, textLedger, slideNumber, number, 1.02, y + 0.14, 0.55, 0.2, {
      bold: true,
      color: signal,
      fontSize: 13,
      margin: 0,
    });
    addText(slide, textLedger, slideNumber, title, 1.85, y + 0.11, 3.0, 0.23, {
      bold: true,
      color: light,
      fontSize: 14.5,
      margin: 0,
    });
    addText(slide, textLedger, slideNumber, body, 5.1, y + 0.12, 6.6, 0.22, {
      color: pptxColor(colors.tint),
      fontSize: 11.2,
      margin: 0,
    });
  });

  slideNumber += 1;
  slide = newSlide(slideNumber, true);
  addSlideTitle(
    slide,
    textLedger,
    slideNumber,
    "In 90 days, prove the value before scaling the program",
    "The promise is measured against the client's week-one baseline, not a generic benchmark.",
    colors,
    true,
  );
  addPanel(slide, 0.78, 1.82, 5.55, 3.15, colors.dark, colors.signal, {
    lineTransparency: 20,
  });
  addText(slide, textLedger, slideNumber, "Outcome", 1.12, 2.1, 2.2, 0.26, {
    bold: true,
    color: signal,
    fontSize: 16,
    margin: 0,
  });
  addText(
    slide,
    textLedger,
    slideNumber,
    "Lower cloud waste, faster and safer releases, hardened posture, and exec-grade visibility quantified against the week-one baseline.",
    1.12,
    2.58,
    4.75,
    0.92,
    { color: light, fontSize: 18, margin: 0, valign: "top" },
  );
  addPanel(slide, 6.72, 1.82, 5.55, 3.15, colors.dark, colors.signal, {
    lineTransparency: 20,
  });
  addText(slide, textLedger, slideNumber, "Container", 7.06, 2.1, 2.2, 0.26, {
    bold: true,
    color: signal,
    fontSize: 16,
    margin: 0,
  });
  addText(
    slide,
    textLedger,
    slideNumber,
    "A 90-day pilot begins with a 2-3 week assessment, then proves one workload, quick-win FinOps action, or platform capability.",
    7.06,
    2.58,
    4.75,
    0.92,
    { color: light, fontSize: 18, margin: 0, valign: "top" },
  );
  addPanel(slide, 0.82, 5.54, 11.4, 0.68, colors.signal, colors.signal, {
    lineTransparency: 100,
  });
  addText(
    slide,
    textLedger,
    slideNumber,
    "Illustrative guarantee: if the assessment does not find a fundable pilot path, Northlace turns the findings into an executive roadmap. TODO-OFFER: confirm guarantee terms. HUMAN_DECISION_GATE.",
    1.08,
    5.68,
    10.85,
    0.28,
    { color: dark, fontSize: 12.8, margin: 0 },
  );

  slideNumber += 1;
  slide = newSlide(slideNumber);
  addSlideTitle(
    slide,
    textLedger,
    slideNumber,
    "Four pillars keep modernization balanced",
    "Each pillar owns a different failure mode, but the operating cadence is shared.",
    colors,
    false,
  );
  [
    ["Northlace Run", "Faster release paths with SLO-backed operations."],
    [
      "Northlace Shield",
      "Controls embedded into delivery instead of bolted on late.",
    ],
    [
      "Northlace Ledger",
      "Every cloud decision gets a cost signal people can act on.",
    ],
    [
      "Northlace Shift",
      "Migration and modernization move in waves teams can absorb.",
    ],
  ].forEach(([title, body], index) => {
    const x = 0.7 + (index % 2) * 6.0;
    const y = 1.82 + Math.floor(index / 2) * 1.62;
    addPanel(slide, x, y, 5.35, 1.15, colors.lightest, colors.tint);
    addText(
      slide,
      textLedger,
      slideNumber,
      title,
      x + 0.26,
      y + 0.22,
      4.2,
      0.28,
      {
        bold: true,
        color: dark,
        fontSize: 18,
        margin: 0,
      },
    );
    addText(
      slide,
      textLedger,
      slideNumber,
      body,
      x + 0.26,
      y + 0.62,
      4.4,
      0.25,
      {
        color: text,
        fontSize: 13.2,
        margin: 0,
      },
    );
  });
  addText(
    slide,
    textLedger,
    slideNumber,
    brand.pillars
      .map((pillar) => `${pillar.name}: ${pillar.description}`)
      .join("  "),
    0.78,
    5.66,
    11.2,
    0.38,
    { color: mid, fontSize: 9.5, margin: 0 },
  );

  slideNumber += 1;
  slide = newSlide(slideNumber);
  addSlideTitle(
    slide,
    textLedger,
    slideNumber,
    "The service portfolio maps into one operating model",
    "The source catalog stays intact, but buyers see where each service fits inside Northlace.",
    colors,
    false,
  );
  [
    [
      "Run",
      "CI/CD, IaC, SRE, observability, CloudOps, incident response, runbooks.",
    ],
    [
      "Shield",
      "Cloud security, AppSec, penetration testing, encryption, policy, evidence.",
    ],
    [
      "Ledger",
      "Cost assessment, rightsizing, commitment planning, budgets, forecasts.",
    ],
    [
      "Shift",
      "Modernization, migration, container platforms, data, AI-native workflows.",
    ],
  ].forEach(([title, body], index) => {
    const x = 0.7 + (index % 2) * 6.0;
    const y = 1.74 + Math.floor(index / 2) * 1.43;
    addPanel(slide, x, y, 5.35, 1.0, colors.lightest, colors.tint);
    addText(
      slide,
      textLedger,
      slideNumber,
      title,
      x + 0.24,
      y + 0.16,
      0.95,
      0.3,
      {
        bold: true,
        color: mid,
        fontSize: 18,
        margin: 0,
      },
    );
    addText(
      slide,
      textLedger,
      slideNumber,
      body,
      x + 1.32,
      y + 0.18,
      3.65,
      0.42,
      {
        color: text,
        fontSize: 12.2,
        margin: 0,
        valign: "top",
      },
    );
  });
  addPanel(slide, 0.78, 5.0, 11.55, 0.78, colors.dark, colors.dark);
  addText(
    slide,
    textLedger,
    slideNumber,
    "Engagement models: free assessment, advisory roadmap, project delivery, modernization factory, platform squad, or managed operations.",
    1.05,
    5.2,
    10.9,
    0.24,
    { align: "center", color: light, fontSize: 13.2, margin: 0 },
  );

  slideNumber += 1;
  slide = newSlide(slideNumber);
  addSlideTitle(
    slide,
    textLedger,
    slideNumber,
    "Delivery moves from baseline to operating cadence",
    "The source five-phase path is preserved with spacing that keeps step labels, timing, and artifacts readable.",
    colors,
    false,
  );
  [
    [
      "1. Assess",
      "2-3 weeks",
      "Current state, cost, risk, security, architecture, and readiness baseline.",
    ],
    [
      "2. Design",
      "2-4 weeks",
      "Business case, target architecture, backlog, landing zone, and KPI model.",
    ],
    [
      "3. Pilot",
      "4-8 weeks",
      "Priority app, migration wave, FinOps quick wins, or platform capability.",
    ],
    [
      "4. Scale",
      "Quarterly waves",
      "Modernization factory, migration factory, or platform engineering squad.",
    ],
    [
      "5. Operate",
      "Continuous",
      "SRE, CloudOps, FinOps, security governance, and managed improvement.",
    ],
  ].forEach(([title, timing, body], index) => {
    const x = 0.48 + index * 2.52;
    addPanel(slide, x, 1.78, 2.18, 3.2, colors.lightest, colors.tint);
    addText(slide, textLedger, slideNumber, title, x + 0.16, 2.08, 1.82, 0.26, {
      align: "center",
      bold: true,
      color: dark,
      fontSize: 14.2,
      margin: 0,
    });
    addText(
      slide,
      textLedger,
      slideNumber,
      timing,
      x + 0.16,
      2.52,
      1.82,
      0.26,
      {
        align: "center",
        color: mid,
        fontSize: 11.5,
        margin: 0,
      },
    );
    addText(slide, textLedger, slideNumber, body, x + 0.22, 3.08, 1.7, 0.82, {
      align: "center",
      color: text,
      fontSize: 9.4,
      margin: 0,
      valign: "top",
    });
  });
  addText(
    slide,
    textLedger,
    slideNumber,
    "Governance cadence: weekly delivery review, fortnightly architecture and risk review, monthly value realization, and executive steering.",
    0.82,
    5.72,
    11.2,
    0.25,
    { align: "center", color: mid, fontSize: 12.2, margin: 0 },
  );

  slideNumber += 1;
  slide = newSlide(slideNumber);
  addSlideTitle(
    slide,
    textLedger,
    slideNumber,
    "The pilot has a clear 90-day onboarding path",
    "A buyer can see exactly what happens before they commit to scale.",
    colors,
    false,
  );
  [
    [
      "Day 0",
      "Confirm sponsor, workload candidate, data access, meeting rhythm, and success definition.",
    ],
    [
      "Week 1",
      "Capture cloud spend, delivery, reliability, security, and architecture baselines.",
    ],
    [
      "Weeks 2-3",
      "Return scorecard, roadmap, pilot scope, KPI model, and fundable quick-win backlog.",
    ],
    [
      "Weeks 4-12",
      "Execute one workload or capability with weekly delivery reviews and value tracking.",
    ],
    [
      "Day 90",
      "Present results, lessons, scale options, and operate cadence for the next wave.",
    ],
  ].forEach(([title, body], index) => {
    const y = 1.62 + index * 0.88;
    addPanel(slide, 0.86, y, 11.45, 0.6, colors.lightest, colors.tint);
    addText(slide, textLedger, slideNumber, title, 1.12, y + 0.14, 1.28, 0.22, {
      bold: true,
      color: mid,
      fontSize: 14,
      margin: 0,
    });
    addText(slide, textLedger, slideNumber, body, 2.72, y + 0.13, 8.8, 0.24, {
      color: text,
      fontSize: 12.5,
      margin: 0,
    });
  });

  slideNumber += 1;
  slide = newSlide(slideNumber);
  addSlideTitle(
    slide,
    textLedger,
    slideNumber,
    "Every stage produces evidence leadership can use",
    "The deliverables make the operating standard visible, auditable, and fundable.",
    colors,
    false,
  );
  [
    [
      "Assessment pack",
      "Readiness scorecard, technical debt map, dependency map, risk and cost baseline.",
    ],
    [
      "Architecture pack",
      "Target-state blueprint, landing zone design, security model, governance model.",
    ],
    [
      "Execution pack",
      "Migration playbooks, IaC modules, CI/CD templates, test and cutover plans.",
    ],
    [
      "Operations pack",
      "Dashboards, runbooks, SLO/error budget model, FinOps reporting.",
    ],
    [
      "Security pack",
      "Vulnerability report, remediation roadmap, retest evidence, compliance mapping.",
    ],
    [
      "Value pack",
      "ROI model, KPI dashboard, quick wins backlog, executive roadmap.",
    ],
  ].forEach(([title, body], index) => {
    const x = 0.7 + (index % 3) * 4.08;
    const y = 1.75 + Math.floor(index / 3) * 1.46;
    addPanel(slide, x, y, 3.55, 1.02, colors.lightest, colors.tint);
    addText(
      slide,
      textLedger,
      slideNumber,
      title,
      x + 0.22,
      y + 0.17,
      3.05,
      0.24,
      {
        bold: true,
        color: dark,
        fontSize: 14.3,
        margin: 0,
      },
    );
    addText(
      slide,
      textLedger,
      slideNumber,
      body,
      x + 0.22,
      y + 0.52,
      3.04,
      0.28,
      {
        color: text,
        fontSize: 9.9,
        margin: 0,
        valign: "top",
      },
    );
  });
  addText(
    slide,
    textLedger,
    slideNumber,
    "Outcome KPIs: delivery, reliability, cost, security, modernization, and adoption.",
    0.78,
    5.5,
    11.2,
    0.24,
    { align: "center", color: mid, fontSize: 13.2, margin: 0 },
  );

  slideNumber += 1;
  slide = newSlide(slideNumber);
  addSlideTitle(
    slide,
    textLedger,
    slideNumber,
    "Proof points stay anonymized until evidence is approved",
    "Representative outcomes are useful in conversation, but external distribution needs client-approved evidence.",
    colors,
    false,
  );
  [
    [
      "40% cloud cost reduction",
      "Analytics platform optimization story: monitoring, waste reduction, and cost control.",
    ],
    [
      "72% faster deployments",
      "Cloud engineering story: IaC and GitOps changed releases from days to minutes.",
    ],
    [
      "95% critical vulns remediated",
      "Security testing story: phased testing and remediation validation.",
    ],
    [
      "1.2M+ users supported",
      "Application modernization story for healthcare and wellness scale.",
    ],
    [
      "10,000+ systems tracked",
      "Enterprise mobility story for IP litigation workflow.",
    ],
    [
      "30+ countries standardized",
      "Global e-commerce platform standardization story.",
    ],
  ].forEach(([title, body], index) => {
    const x = 0.7 + (index % 3) * 4.08;
    const y = 1.72 + Math.floor(index / 3) * 1.36;
    addPanel(slide, x, y, 3.55, 0.96, colors.lightest, colors.tint);
    addText(
      slide,
      textLedger,
      slideNumber,
      title,
      x + 0.2,
      y + 0.15,
      3.1,
      0.22,
      {
        bold: true,
        color: mid,
        fontSize: 13.6,
        margin: 0,
      },
    );
    addText(
      slide,
      textLedger,
      slideNumber,
      body,
      x + 0.2,
      y + 0.47,
      3.04,
      0.26,
      {
        color: text,
        fontSize: 9.6,
        margin: 0,
        valign: "top",
      },
    );
  });
  addPanel(slide, 0.78, 5.22, 11.55, 0.7, colors.dark, colors.dark);
  addText(
    slide,
    textLedger,
    slideNumber,
    "TODO-METRIC: attach client-approved evidence before external distribution.",
    1.08,
    5.43,
    10.8,
    0.22,
    { align: "center", color: light, fontSize: 13.5, margin: 0 },
  );

  slideNumber += 1;
  slide = newSlide(slideNumber);
  addSlideTitle(
    slide,
    textLedger,
    slideNumber,
    "Replace assumptions with the client's week-one baseline",
    "The ROI model is a conversation tool. It becomes credible only after assessment data replaces estimates.",
    colors,
    false,
  );
  const rows = [
    ["Baseline annual cloud spend", "$2,400,000", "Monthly spend of $200K"],
    [
      "Cloud cost optimization",
      "$600,000",
      "25% savings from rightsizing and waste cleanup",
    ],
    [
      "Release efficiency gain",
      "$360,000",
      "10 engineers x 15% capacity unlocked",
    ],
    [
      "Incident reduction value",
      "$300,000",
      "12 avoided hours x estimated business impact",
    ],
    [
      "Security risk reduction",
      "$250,000",
      "Avoided remediation, audit, and exposure proxy",
    ],
    [
      "Total annual benefit",
      "$1,510,000",
      "Illustrative benefit pool before investment",
    ],
    [
      "Sample program investment",
      "($650,000)",
      "Assessment, pilot, migration waves, automation",
    ],
    [
      "Illustrative net value",
      "$860,000",
      "132% ROI and payback inside year one",
    ],
  ];
  addPanel(slide, 0.7, 1.62, 7.65, 4.7, colors.lightest, colors.tint);
  addText(
    slide,
    textLedger,
    slideNumber,
    "Value lever",
    0.95,
    1.88,
    2.6,
    0.22,
    {
      bold: true,
      color: dark,
      fontSize: 11,
      margin: 0,
    },
  );
  addText(
    slide,
    textLedger,
    slideNumber,
    "Annual value",
    3.9,
    1.88,
    1.5,
    0.22,
    {
      bold: true,
      color: dark,
      fontSize: 11,
      margin: 0,
    },
  );
  addText(slide, textLedger, slideNumber, "Assumption", 5.58, 1.88, 2.3, 0.22, {
    bold: true,
    color: dark,
    fontSize: 11,
    margin: 0,
  });
  rows.forEach((row, index) => {
    const y = 2.25 + index * 0.42;
    const valueColor = index >= 5 ? mid : text;
    addText(slide, textLedger, slideNumber, row[0], 0.95, y, 2.7, 0.18, {
      color: text,
      fontSize: 8.3,
      margin: 0,
    });
    addText(slide, textLedger, slideNumber, row[1], 3.9, y, 1.4, 0.18, {
      bold: index >= 5,
      color: valueColor,
      fontSize: 8.3,
      margin: 0,
    });
    addText(slide, textLedger, slideNumber, row[2], 5.58, y, 2.2, 0.18, {
      color: text,
      fontSize: 7.4,
      margin: 0,
    });
  });
  addPanel(slide, 8.68, 1.62, 3.62, 4.7, colors.dark, colors.dark);
  addText(
    slide,
    textLedger,
    slideNumber,
    "How to use this slide",
    9.0,
    1.95,
    2.8,
    0.28,
    {
      bold: true,
      color: light,
      fontSize: 16,
      margin: 0,
    },
  );
  [
    "Replace assumptions with client baseline.",
    "Validate savings with assessment data.",
    "Separate hard savings from productivity and risk value.",
    "Use a pilot to prove the first 90-day value case.",
  ].forEach((item, index) => {
    addText(
      slide,
      textLedger,
      slideNumber,
      `${index + 1}. ${item}`,
      9.0,
      2.45 + index * 0.58,
      2.72,
      0.24,
      {
        color: light,
        fontSize: 11,
        margin: 0,
      },
    );
  });
  addText(
    slide,
    textLedger,
    slideNumber,
    "Illustrative only; final ROI depends on baseline spend, application criticality, delivery scope, and adoption.",
    0.78,
    6.44,
    11.3,
    0.2,
    { color: mid, fontSize: 9.3, margin: 0 },
  );

  slideNumber += 1;
  slide = newSlide(slideNumber, true);
  addSlideTitle(
    slide,
    textLedger,
    slideNumber,
    "Start free, prove value in a pilot, then scale what works",
    "The offer ladder keeps the first yes small while making the scale path obvious.",
    colors,
    true,
  );
  [
    [
      "Free assessment",
      "No-cost discovery and baseline review across cloud readiness, cost, security, and modernization entry points.",
    ],
    [
      "90-day pilot",
      "$12K example entry price for one scoped workload or capability. TODO-PRICE: confirm pricing and scope bands.",
    ],
    [
      "Scale and operate",
      "Custom waves, platform squad, modernization factory, or managed operations based on pilot evidence.",
    ],
  ].forEach(([title, body], index) => {
    const x = 0.84 + index * 4.03;
    addPanel(slide, x, 1.95, 3.46, 2.6, colors.dark, colors.signal, {
      lineTransparency: 15,
    });
    addText(slide, textLedger, slideNumber, title, x + 0.26, 2.24, 2.8, 0.28, {
      bold: true,
      color: signal,
      fontSize: 17,
      margin: 0,
    });
    addText(slide, textLedger, slideNumber, body, x + 0.26, 2.78, 2.88, 0.82, {
      color: light,
      fontSize: 13.2,
      margin: 0,
      valign: "top",
    });
  });
  addPanel(slide, 1.02, 5.26, 11.05, 0.72, colors.signal, colors.signal, {
    lineTransparency: 100,
  });
  addText(
    slide,
    textLedger,
    slideNumber,
    "quick wins found in the assessment routinely fund the pilot. Gated download decision: HUMAN_DECISION_GATE, default ungated for this publication.",
    1.28,
    5.48,
    10.5,
    0.24,
    { align: "center", color: dark, fontSize: 12.6, margin: 0 },
  );

  slideNumber += 1;
  slide = newSlide(slideNumber);
  addSlideTitle(
    slide,
    textLedger,
    slideNumber,
    "Take the deck to leadership, then choose the first workload",
    "Close with a free assessment, a 90-day pilot, baseline KPIs, and a funded modernization roadmap.",
    colors,
    false,
  );
  [
    [
      "Cloud readiness assessment",
      "Application inventory, dependency map, migration risk, downtime tolerance, and target cloud fit.",
    ],
    [
      "Cloud cost assessment",
      "Spend baseline, idle waste, tagging gaps, commitment usage, quick wins, and FinOps roadmap.",
    ],
    [
      "Security assessment",
      "Cloud posture, app/API testing scope, IAM risk, encryption gaps, and remediation priorities.",
    ],
    [
      "Modernization assessment",
      "Technical debt map, UX friction, data/integration gaps, AI readiness, and modernization backlog.",
    ],
  ].forEach(([title, body], index) => {
    const x = 0.72 + (index % 2) * 5.98;
    const y = 1.78 + Math.floor(index / 2) * 1.2;
    addPanel(slide, x, y, 5.35, 0.86, colors.lightest, colors.tint);
    addText(
      slide,
      textLedger,
      slideNumber,
      title,
      x + 0.22,
      y + 0.14,
      4.6,
      0.22,
      {
        bold: true,
        color: dark,
        fontSize: 13.5,
        margin: 0,
      },
    );
    addText(
      slide,
      textLedger,
      slideNumber,
      body,
      x + 0.22,
      y + 0.44,
      4.68,
      0.2,
      {
        color: text,
        fontSize: 9.8,
        margin: 0,
      },
    );
  });
  addPanel(slide, 0.82, 5.1, 11.42, 0.78, colors.dark, colors.dark);
  addText(
    slide,
    textLedger,
    slideNumber,
    "Recommended close: book a 60-minute discovery session, share baseline artifacts, and receive a prioritized roadmap with quick wins and investment options.",
    1.1,
    5.33,
    10.9,
    0.24,
    { align: "center", color: light, fontSize: 12.4, margin: 0 },
  );

  slideNumber += 1;
  slide = newSlide(slideNumber, true);
  slide.addImage({ path: logos.lockupDark, x: 0.7, y: 0.7, w: 4.0, h: 1.14 });
  addText(
    slide,
    textLedger,
    slideNumber,
    "Northlace runs modernization as one standard",
    0.78,
    2.62,
    10.4,
    0.72,
    { bold: true, color: light, fontSize: 36, margin: 0 },
  );
  addText(
    slide,
    textLedger,
    slideNumber,
    "Run what changes. Shield what matters. Ledger what costs. Shift what must modernize.",
    0.82,
    3.58,
    8.9,
    0.36,
    { color: signal, fontSize: 18, margin: 0 },
  );
  addPanel(slide, 0.86, 5.12, 8.35, 0.7, colors.dark, colors.signal, {
    lineTransparency: 15,
  });
  addText(
    slide,
    textLedger,
    slideNumber,
    "Next step: choose one workload, confirm the assessment artifacts, and decide the 90-day pilot sponsor. Contact link: #TODO-LINK.",
    1.12,
    5.34,
    7.9,
    0.22,
    { color: light, fontSize: 12.2, margin: 0 },
  );

  await pptx.writeFile({ fileName: pptxPath });
  writeText(
    path.join(qaDir, "sales-deck-text-ledger.txt"),
    textLedger.join("\n"),
  );
};

const normalizePptx = async (filePath) => {
  const zip = await JSZip.loadAsync(fs.readFileSync(filePath));

  for (const file of Object.values(zip.files)) file.date = fixedBuildDate;

  const coreFile = zip.file("docProps/core.xml");
  if (coreFile) {
    const coreXml = await coreFile.async("string");
    const normalizedCoreXml = coreXml
      .replace(
        /<dcterms:created xsi:type="dcterms:W3CDTF">[^<]+<\/dcterms:created>/,
        `<dcterms:created xsi:type="dcterms:W3CDTF">${fixedBuildDateText}</dcterms:created>`,
      )
      .replace(
        /<dcterms:modified xsi:type="dcterms:W3CDTF">[^<]+<\/dcterms:modified>/,
        `<dcterms:modified xsi:type="dcterms:W3CDTF">${fixedBuildDateText}</dcterms:modified>`,
      );
    zip.file("docProps/core.xml", normalizedCoreXml, { date: fixedBuildDate });
  }

  const buffer = await zip.generateAsync({
    compression: "DEFLATE",
    compressionOptions: { level: 9 },
    platform: "UNIX",
    type: "nodebuffer",
  });
  fs.writeFileSync(filePath, buffer);
};

const extractPptxText = async () => {
  const zip = await JSZip.loadAsync(fs.readFileSync(pptxPath));
  const slideFiles = Object.keys(zip.files)
    .filter((name) => /^ppt\/slides\/slide\d+\.xml$/.test(name))
    .sort(
      (a, b) =>
        Number(a.match(/slide(\d+)\.xml/)?.[1] ?? 0) -
        Number(b.match(/slide(\d+)\.xml/)?.[1] ?? 0),
    );
  const lines = [];
  for (const [index, fileName] of slideFiles.entries()) {
    const xml = await zip.file(fileName).async("string");
    const textNodes = [...xml.matchAll(/<a:t>(.*?)<\/a:t>/g)]
      .map((match) =>
        match[1]
          .replaceAll("&amp;", "&")
          .replaceAll("&lt;", "<")
          .replaceAll("&gt;", ">"),
      )
      .filter(Boolean);
    lines.push(`--- SLIDE ${index + 1} ---`);
    lines.push(textNodes.join("\n"));
  }
  writeText(
    path.join(qaDir, "sales-deck-extracted-text.txt"),
    lines.join("\n"),
  );
  return lines.join("\n");
};

const convertWithLibreOffice = () => {
  fs.rmSync(pdfPath, { force: true });
  const profile = path.join(os.tmpdir(), "northlace-sales-deck-libreoffice");
  fs.rmSync(profile, { force: true, recursive: true });
  const result = spawnSync(
    "soffice",
    [
      "--headless",
      "--nologo",
      "--norestore",
      `-env:UserInstallation=${pathToFileURL(profile).href}`,
      "--convert-to",
      "pdf",
      "--outdir",
      brandDir,
      pptxPath,
    ],
    { encoding: "utf8" },
  );
  writeText(
    path.join(qaDir, "libreoffice-conversion.txt"),
    [result.stdout, result.stderr].filter(Boolean).join("\n") ||
      "LibreOffice conversion completed with no output.",
  );
  if (result.status !== 0 || !fs.existsSync(pdfPath)) {
    throw new Error(
      `LibreOffice PDF conversion failed. Exit ${result.status}. ${result.stderr}`,
    );
  }
};

const renderPdf = () => {
  cleanDir(finalRenderDir);
  const result = spawnSync(
    "pdftoppm",
    ["-png", "-r", "120", pdfPath, path.join(finalRenderDir, "slide")],
    { encoding: "utf8" },
  );
  if (result.status !== 0) {
    throw new Error(`pdftoppm failed. ${result.stderr}`);
  }
};

const createPreviews = async () => {
  ensureDir(resourceDir);
  const renderFiles = fs
    .readdirSync(finalRenderDir)
    .filter((file) => file.endsWith(".png"))
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
  if (renderFiles.length !== 16) {
    throw new Error(
      `Expected 16 rendered slides, found ${renderFiles.length}.`,
    );
  }

  for (let index = 0; index < 4; index += 1) {
    await sharp(path.join(finalRenderDir, renderFiles[index]))
      .resize({ width: 960 })
      .png({ compressionLevel: 9 })
      .toFile(
        path.join(
          resourceDir,
          `preview-${String(index + 1).padStart(2, "0")}.png`,
        ),
      );
  }

  const cellW = 320;
  const cellH = 180;
  const labelH = 24;
  const gap = 18;
  const cols = 4;
  const rows = Math.ceil(renderFiles.length / cols);
  const composites = [];
  for (const [index, file] of renderFiles.entries()) {
    const thumb = await sharp(path.join(finalRenderDir, file))
      .resize(cellW, cellH, {
        background: colorsForContactSheet.light,
        fit: "inside",
      })
      .png()
      .toBuffer();
    const left = (index % cols) * (cellW + gap);
    const top = Math.floor(index / cols) * (cellH + labelH + gap);
    const labelSvg = `<svg width="${cellW}" height="${labelH}" xmlns="http://www.w3.org/2000/svg"><rect width="100%" height="100%" fill="${colorsForContactSheet.dark}"/><text x="10" y="17" fill="${colorsForContactSheet.light}" font-size="14" font-family="Arial">Slide ${index + 1}</text></svg>`;
    composites.push({ input: Buffer.from(labelSvg), left, top });
    composites.push({ input: thumb, left, top: top + labelH });
  }
  await sharp({
    create: {
      background: colorsForContactSheet.light,
      channels: 4,
      height: rows * (cellH + labelH + gap) - gap,
      width: cols * cellW + (cols - 1) * gap,
    },
  })
    .composite(composites)
    .png()
    .toFile(path.join(qaDir, "sales-deck-contact-sheet.png"));
};

const colorsForContactSheet = {
  dark: "#04342C",
  light: "#F1EFE8",
};

const writeOgImage = async (brand, colors, logos) => {
  ensureDir(ogDir);
  const lockupData = fs.readFileSync(logos.lockupDark).toString("base64");
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
    <rect width="1200" height="630" fill="${colors.dark}"/>
    <image href="data:image/png;base64,${lockupData}" x="72" y="70" width="360" height="103"/>
    <text x="82" y="300" fill="${colors.light}" font-family="Inter, Arial, sans-serif" font-size="66" font-weight="700">${escapeXml("Modernization Sales Deck")}</text>
    <text x="86" y="370" fill="${colors.signal}" font-family="Inter, Arial, sans-serif" font-size="30">${escapeXml(brand.tagline)}</text>
    <text x="86" y="470" fill="${colors.light}" font-family="Inter, Arial, sans-serif" font-size="24">${escapeXml("Run / Shield / Ledger / Shift")}</text>
  </svg>`;
  await sharp(Buffer.from(svg)).png().toFile(ogPath);
};

const updateManifest = () => {
  const manifestPath = path.join(publicDir, "brand", "manifest.json");
  const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
  const added = [pptxPath, pdfPath].map((filePath) => {
    const buffer = fs.readFileSync(filePath);
    const filePublicPath = publicPathFor(filePath);
    return {
      bytes: buffer.length,
      mime: filePublicPath.endsWith(".pptx")
        ? "application/vnd.openxmlformats-officedocument.presentationml.presentation"
        : "application/pdf",
      path: filePublicPath,
      sha256: crypto.createHash("sha256").update(buffer).digest("hex"),
    };
  });

  const current = manifest.brands.northlace.files.filter(
    (file) => !added.some((record) => record.path === file.path),
  );
  const deckTemplateIndex = current.findIndex((file) =>
    file.path.endsWith("northlace-deck-template.pptx"),
  );
  current.splice(deckTemplateIndex + 1, 0, ...added);
  manifest.brands.northlace.files = current;
  fs.writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
};

const writeThemeAudit = async (extractedText) => {
  const zip = await JSZip.loadAsync(fs.readFileSync(pptxPath));
  const xml = (
    await Promise.all(
      Object.values(zip.files)
        .filter((file) => file.name.endsWith(".xml"))
        .map((file) => file.async("string")),
    )
  ).join("\n");
  const bannedSourceColors = [
    "4285F4",
    "34A853",
    "FBBC05",
    "EA4335",
    "FF6D00",
    "8E24AA",
    "1A73E8",
  ];
  const colorHits = bannedSourceColors.filter((color) =>
    xml.toUpperCase().includes(color),
  );
  const requiredText = [
    "Specific Person",
    "Specific Problem",
    "Specific Way",
    "TODO-COPY: tighten ICP",
    "TODO-OFFER: confirm guarantee terms",
    "HUMAN_DECISION_GATE",
    "TODO-PRICE: confirm pricing and scope bands",
    "TODO-METRIC: attach client-approved evidence before external distribution",
    "quick wins found in the assessment routinely fund the pilot",
  ];
  const missingText = requiredText.filter(
    (needle) => !extractedText.includes(needle),
  );
  const audit = {
    bannedSourceColorHits: colorHits,
    missingRequiredText: missingText,
    sourcePdf:
      "assets/source/application-modernization-cloud-devops-sales-deck.pdf",
    slideCount: 16,
    themePurity: colorHits.length === 0,
  };
  writeText(
    path.join(qaDir, "theme-and-offer-audit.json"),
    JSON.stringify(audit, null, 2),
  );
  if (colorHits.length > 0 || missingText.length > 0) {
    throw new Error(
      `Deck audit failed: ${JSON.stringify({ colorHits, missingText })}`,
    );
  }
};

const writeToolchainReport = () => {
  const soffice = spawnSync("soffice", ["--headless", "--version"], {
    encoding: "utf8",
  });
  const pdfinfo = spawnSync("pdfinfo", [pdfPath], { encoding: "utf8" });
  const report = {
    buildDate: fixedBuildDateText,
    outputs: {
      pdf: publicPathFor(pdfPath),
      pptx: publicPathFor(pptxPath),
      previews: [1, 2, 3, 4].map(
        (index) =>
          `/resources/modernization-deck/preview-${String(index).padStart(2, "0")}.png`,
      ),
    },
    pdfinfo: pdfinfo.stdout,
    sourcePdf:
      "assets/source/application-modernization-cloud-devops-sales-deck.pdf",
    toolchain: {
      libreOffice: soffice.stdout.trim(),
      pdfRenderer: "pdftoppm",
      pptx: "pptxgenjs",
    },
  };
  writeText(
    path.join(qaDir, "toolchain.json"),
    JSON.stringify(report, null, 2),
  );
};

const main = async () => {
  if (!fs.existsSync(sourcePdfPath)) {
    throw new Error(`Missing source deck: ${sourcePdfPath}`);
  }

  ensureDir(brandDir);
  ensureDir(resourceDir);
  cleanDir(tempDir);
  const brands = await importBrands();
  const brand = brands.find((item) => item.slug === "northlace");
  if (!brand)
    throw new Error("Northlace brand was not found in src/data/brands.ts.");
  const colors = getPalette(brand);
  const logos = await prepareLogoAssets(brand);

  await writeDeck(brand, colors, logos);
  await normalizePptx(pptxPath);
  convertWithLibreOffice();
  renderPdf();
  await createPreviews();
  await writeOgImage(brand, colors, logos);
  const extractedText = await extractPptxText();
  await writeThemeAudit(extractedText);
  updateManifest();
  writeToolchainReport();

  console.log(`Generated ${publicPathFor(pptxPath)}`);
  console.log(`Generated ${publicPathFor(pdfPath)}`);
  console.log("Rendered 16 QA slide images and 4 resource previews.");
};

await main();
