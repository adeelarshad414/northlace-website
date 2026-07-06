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
const brandPublicDir = path.join(publicDir, "brand");
const qaDir = path.join(root, "work", "brand-qa");
const tempDir = path.join(qaDir, "tmp");
const generatedDataPath = path.join(tempDir, "brands.json");

const fontStack =
  "Inter, Geist, Sora, Space Grotesk, Poppins, Arial, sans-serif";
const fixedBuildDate = new Date("2026-07-06T00:00:00.000Z");
const fixedBuildDateText = "2026-07-06T00:00:00Z";

const ensureDir = (dir) => fs.mkdirSync(dir, { recursive: true });

const toPublicPath = (filePath) =>
  `/${path.relative(publicDir, filePath).split(path.sep).join("/")}`;

const hexToRgb = (hex) => {
  const value = hex.replace("#", "");
  return {
    b: Number.parseInt(value.slice(4, 6), 16) / 255,
    g: Number.parseInt(value.slice(2, 4), 16) / 255,
    r: Number.parseInt(value.slice(0, 2), 16) / 255,
  };
};

const luminance = (hex) => {
  const { r, g, b } = hexToRgb(hex);
  const channel = (value) =>
    value <= 0.03928 ? value / 12.92 : Math.pow((value + 0.055) / 1.055, 2.4);
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
};

const contrast = (a, b) => {
  const l1 = luminance(a);
  const l2 = luminance(b);
  return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
};

const readable = (brand, surface) =>
  [
    brand.primaryAccent,
    brand.primaryLight,
    brand.primaryDark,
    ...brand.palette.map((color) => color.hex),
  ]
    .filter((hex) => contrast(hex, surface) >= 3)
    .at(0) ?? brand.primaryAccent;

const escapeXml = (value) =>
  String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");

const svg = (width, height, body, attrs = "") =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" ${attrs}>${body}</svg>`;

const iconBody = (brand, stroke, surface = "transparent") => {
  const common = `fill="none" stroke-linecap="round" stroke-linejoin="round"`;
  switch (brand.slug) {
    case "northlace":
      return `
        <g ${common} stroke="${stroke}" stroke-width="18">
          <circle cx="200" cy="200" r="112"/>
          <ellipse cx="200" cy="200" rx="62" ry="112" transform="rotate(22 200 200)"/>
          <ellipse cx="200" cy="200" rx="62" ry="112" transform="rotate(-22 200 200)"/>
          <path d="M82 200h236"/>
        </g>
        <circle cx="200" cy="200" r="13" fill="${stroke}"/>`;
    case "adeel-codes-cloud":
      return `
        <g ${common} stroke="${stroke}" stroke-width="17">
          <path d="M72 232 150 126l62 76 44-58 78 100"/>
          <path d="M94 292h78m52 0h82"/>
          <path d="M172 292v-45m52 45v-36"/>
        </g>
        <circle cx="94" cy="292" r="9" fill="${stroke}"/>
        <circle cx="306" cy="292" r="9" fill="${stroke}"/>
        <circle cx="198" cy="292" r="14" fill="${surface === "light" ? brand.primaryDark : brand.primaryDark}" stroke="${stroke}" stroke-width="12"/>
        <circle cx="306" cy="96" r="15" fill="#D85A30"/>`;
    case "signal-and-scale":
      return `
        <path d="M54 218 88 136l34 160 42-198 44 178 42-122" ${common} stroke="#6B7280" stroke-width="17"/>
        <path d="M250 154c30 56 56 86 88 90 16 1 29-4 42-18" ${common} stroke="${stroke}" stroke-width="17"/>
        <circle cx="380" cy="226" r="14" fill="${stroke}"/>`;
    case "the-cloud-lounge":
      return `
        <path d="M78 220c0-36 29-65 65-65 14 0 28 5 39 13 20-38 58-64 104-64 46 0 83 33 92 78" ${common} stroke="${stroke}" stroke-width="17"/>
        <path d="M84 285c80 34 188 38 260-4" ${common} stroke="${stroke}" stroke-width="17"/>
        <circle cx="344" cy="281" r="13" fill="${stroke}"/>`;
    default:
      throw new Error(`Unknown brand slug: ${brand.slug}`);
  }
};

const iconSvg = (brand, stroke, surface) =>
  svg(
    400,
    400,
    `<title>${escapeXml(brand.name)} icon</title><desc>${escapeXml(
      brand.logoGeometry,
    )}</desc>${iconBody(brand, stroke, surface)}`,
    `role="img" aria-labelledby="${brand.slug}-icon-title"`,
  ).replace("<title>", `<title id="${brand.slug}-icon-title">`);

const markSvg = (brand, mode) => {
  const dark = mode === "dark";
  const background = dark ? brand.primaryDark : brand.primaryLight;
  const stroke = dark ? brand.primaryAccent : brand.primaryDark;
  return svg(
    400,
    400,
    `<title id="${brand.slug}-mark-${mode}-title">${escapeXml(
      brand.name,
    )} mark ${mode}</title><rect width="400" height="400" rx="48" fill="${background}"/>${iconBody(
      brand,
      stroke,
      dark ? "dark" : "light",
    )}`,
    `role="img" aria-labelledby="${brand.slug}-mark-${mode}-title"`,
  );
};

const lockupSvg = (brand, mode) => {
  const dark = mode === "dark";
  const background = dark ? brand.primaryDark : brand.primaryLight;
  const text = dark ? brand.primaryLight : brand.primaryDark;
  const stroke = dark ? brand.primaryAccent : brand.primaryDark;
  const taglineColor = readable(brand, background);
  return svg(
    1400,
    400,
    `<title id="${brand.slug}-lockup-${mode}-title">${escapeXml(
      brand.name,
    )} lockup ${mode}</title>
    <rect width="1400" height="400" rx="48" fill="${background}"/>
    <g transform="translate(58 48) scale(0.76)">${iconBody(
      brand,
      stroke,
      dark ? "dark" : "light",
    )}</g>
    <text x="390" y="178" fill="${text}" font-family="${fontStack}" font-size="78" font-weight="500" letter-spacing="3">${escapeXml(
      brand.name.toUpperCase(),
    )}</text>
    <text x="394" y="246" fill="${taglineColor}" font-family="${fontStack}" font-size="34" font-weight="400">${escapeXml(
      brand.tagline,
    )}</text>`,
    `role="img" aria-labelledby="${brand.slug}-lockup-${mode}-title"`,
  );
};

const ogSvg = (brand) =>
  svg(
    1200,
    630,
    `<rect width="1200" height="630" fill="${brand.primaryDark}"/>
    <g transform="translate(84 115)">
      <rect width="1032" height="400" rx="34" fill="${brand.primaryDark}" stroke="${brand.primaryAccent}" stroke-width="3" opacity="0.95"/>
      <g transform="translate(48 54) scale(0.55)">${iconBody(
        brand,
        brand.primaryAccent,
        "dark",
      )}</g>
      <text x="300" y="148" fill="${brand.primaryLight}" font-family="${fontStack}" font-size="74" font-weight="500">${escapeXml(
        brand.name,
      )}</text>
      <text x="304" y="212" fill="${readable(
        brand,
        brand.primaryDark,
      )}" font-family="${fontStack}" font-size="32" font-weight="400">${escapeXml(
        brand.tagline,
      )}</text>
      <text x="304" y="308" fill="${brand.primaryLight}" font-family="${fontStack}" font-size="26" font-weight="400">${escapeXml(
        brand.pillars.map((pillar) => pillar.name).join(" / "),
      )}</text>
    </g>`,
  );

const renderPng = async (svgContent, outPath, width) => {
  ensureDir(path.dirname(outPath));
  await sharp(Buffer.from(svgContent)).resize({ width }).png().toFile(outPath);
};

const writeText = (filePath, contents) => {
  ensureDir(path.dirname(filePath));
  fs.writeFileSync(filePath, `${contents.trim()}\n`);
};

const normalizePptx = async (pptxPath) => {
  const zip = await JSZip.loadAsync(fs.readFileSync(pptxPath));

  for (const file of Object.values(zip.files)) {
    file.date = fixedBuildDate;
  }

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
  fs.writeFileSync(pptxPath, buffer);
};

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

const svgFilesForBrand = async (brand) => {
  const dir = path.join(brandPublicDir, brand.slug);
  ensureDir(dir);
  const files = {
    iconTransparent: path.join(dir, `${brand.slug}-icon-transparent.svg`),
    lockupDark: path.join(dir, `${brand.slug}-lockup-horizontal-dark.svg`),
    lockupLight: path.join(dir, `${brand.slug}-lockup-horizontal-light.svg`),
    markDark: path.join(dir, `${brand.slug}-mark-dark.svg`),
    markLight: path.join(dir, `${brand.slug}-mark-light.svg`),
  };
  const svgs = {
    [files.iconTransparent]: iconSvg(brand, brand.primaryAccent, "transparent"),
    [files.markDark]: markSvg(brand, "dark"),
    [files.markLight]: markSvg(brand, "light"),
    [files.lockupDark]: lockupSvg(brand, "dark"),
    [files.lockupLight]: lockupSvg(brand, "light"),
  };
  for (const [filePath, contents] of Object.entries(svgs)) {
    writeText(filePath, contents);
    const pngName = path.basename(filePath, ".svg");
    await renderPng(
      contents,
      path.join(qaDir, "svg-renders", `${pngName}.png`),
      filePath.includes("lockup") ? 900 : 400,
    );
    await renderPng(
      contents,
      path.join(
        qaDir,
        "embed-assets",
        brand.slug,
        `${path.basename(filePath, ".svg")}.png`,
      ),
      filePath.includes("lockup") ? 900 : 400,
    );
  }

  const ogPath = path.join(dir, `${brand.slug}-og.png`);
  await renderPng(ogSvg(brand), ogPath, 1200);

  return files;
};

const addText = (slide, text, x, y, w, h, options = {}) => {
  slide.addText(text, {
    breakLine: false,
    color: options.color,
    fit: "shrink",
    fontFace: options.fontFace ?? "Inter",
    fontSize: options.fontSize ?? 18,
    h,
    margin: options.margin ?? 0.08,
    valign: options.valign ?? "mid",
    w,
    x,
    y,
    ...options,
  });
};

const addBox = (slide, x, y, w, h, fill, line = fill, radius = 0.16) => {
  slide.addShape("roundRect", {
    fill: { color: fill.replace("#", "") },
    h,
    line: { color: line.replace("#", ""), width: 1 },
    radius,
    w,
    x,
    y,
  });
};

const pptxColor = (hex) => hex.replace("#", "");

const makeDeck = async (brand) => {
  const dir = path.join(brandPublicDir, brand.slug);
  const pptx = new pptxgen();
  pptx.layout = "LAYOUT_WIDE";
  pptx.author = "Northlace";
  pptx.company = "Northlace";
  pptx.subject = `${brand.name} brand deck template`;
  pptx.title = `${brand.name} Deck Template`;
  pptx.lang = "en-US";
  pptx.theme = {
    headFontFace: "Inter",
    bodyFontFace: "Inter",
    lang: "en-US",
  };
  const dark = pptxColor(brand.primaryDark);
  const light = pptxColor(brand.primaryLight);
  const accent = pptxColor(brand.primaryAccent);
  const embedDir = path.join(qaDir, "embed-assets", brand.slug);
  const mark = path.join(embedDir, `${brand.slug}-mark-dark.png`);
  const lockup = path.join(
    embedDir,
    `${brand.slug}-lockup-horizontal-dark.png`,
  );

  const titleSlide = pptx.addSlide();
  titleSlide.background = { color: dark };
  titleSlide.addImage({ path: mark, x: 0.6, y: 0.6, w: 1.35, h: 1.35 });
  addText(titleSlide, "Presentation title", 0.75, 2.35, 8.8, 0.7, {
    color: light,
    fontSize: 42,
    bold: false,
  });
  addText(titleSlide, "Subtitle or meeting purpose", 0.78, 3.15, 8.5, 0.38, {
    color: accent,
    fontSize: 22,
  });
  addText(titleSlide, "Presenter name", 0.78, 5.8, 5.2, 0.35, {
    color: light,
    fontSize: 16,
  });

  const agenda = pptx.addSlide();
  agenda.background = { color: light };
  addText(agenda, "Agenda", 0.55, 0.45, 5, 0.45, {
    color: dark,
    fontSize: 35,
  });
  brand.pillars.forEach((pillar, idx) => {
    const x = 0.8 + (idx % 2) * 5.85;
    const y = 1.55 + Math.floor(idx / 2) * 1.55;
    addBox(
      agenda,
      x,
      y,
      5.05,
      1.05,
      brand.palette[3]?.hex ?? brand.primaryLight,
      brand.primaryAccent,
    );
    addText(agenda, `0${idx + 1}`, x + 0.25, y + 0.22, 0.6, 0.35, {
      color: dark,
      fontSize: 19,
      bold: true,
    });
    addText(agenda, pillar.name, x + 1.0, y + 0.18, 3.6, 0.3, {
      color: dark,
      fontSize: 21,
      bold: true,
    });
    addText(agenda, pillar.description, x + 1.0, y + 0.55, 3.7, 0.3, {
      color: dark,
      fontSize: 13,
    });
  });
  agenda.addImage({ path: mark, x: 10.9, y: 5.65, w: 0.72, h: 0.72 });

  const divider = pptx.addSlide();
  divider.background = { color: dark };
  addText(divider, "01", 0.65, 1.25, 3.2, 1.1, {
    color: accent,
    fontSize: 68,
  });
  addText(divider, "Section title", 0.78, 3.0, 7.6, 0.7, {
    color: light,
    fontSize: 40,
  });
  divider.addImage({ path: mark, x: 10.45, y: 4.9, w: 1.05, h: 1.05 });

  const content = pptx.addSlide();
  content.background = { color: light };
  addText(content, "The work has one main point", 0.65, 0.45, 8.2, 0.52, {
    color: dark,
    fontSize: 35,
  });
  ["Point one", "Point two", "Point three"].forEach((point, idx) => {
    addText(content, `${idx + 1}`, 0.85, 1.55 + idx * 0.8, 0.45, 0.35, {
      color: accent,
      fontSize: 23,
      bold: true,
    });
    addText(content, point, 1.45, 1.55 + idx * 0.8, 4.3, 0.35, {
      color: dark,
      fontSize: 22,
    });
  });
  addBox(
    content,
    7.35,
    1.25,
    4.7,
    4.45,
    brand.palette[3]?.hex ?? brand.primaryLight,
    brand.primaryAccent,
  );
  addText(
    content,
    "Drop image, chart, or diagram here",
    7.85,
    3.15,
    3.65,
    0.35,
    {
      color: dark,
      fontSize: 18,
      align: "center",
    },
  );

  const compare = pptx.addSlide();
  compare.background = { color: light };
  addText(
    compare,
    "Use contrast to make decisions easier",
    0.65,
    0.45,
    9,
    0.52,
    {
      color: dark,
      fontSize: 35,
    },
  );
  addBox(compare, 0.85, 1.45, 5.1, 4.3, brand.primaryDark, brand.primaryAccent);
  addBox(
    compare,
    6.55,
    1.45,
    5.1,
    4.3,
    brand.palette[3]?.hex ?? brand.primaryLight,
    brand.primaryAccent,
  );
  addText(compare, "Current state", 1.25, 2.0, 4.0, 0.35, {
    color: light,
    fontSize: 25,
  });
  addText(
    compare,
    "Describe the pattern that needs attention.",
    1.25,
    2.65,
    3.7,
    1.1,
    { color: light, fontSize: 18 },
  );
  addText(compare, "Better state", 6.95, 2.0, 4.0, 0.35, {
    color: dark,
    fontSize: 25,
  });
  addText(
    compare,
    "Describe the specific improvement or choice.",
    6.95,
    2.65,
    3.7,
    1.1,
    { color: dark, fontSize: 18 },
  );

  const stats = pptx.addSlide();
  stats.background = { color: dark };
  addText(stats, "Numbers need a real source", 0.65, 0.45, 9, 0.52, {
    color: light,
    fontSize: 35,
  });
  ["00%", "00h", "00x"].forEach((value, idx) => {
    const x = 0.85 + idx * 4.05;
    addBox(stats, x, 1.7, 3.25, 2.55, brand.primaryDark, brand.primaryAccent);
    addText(stats, value, x + 0.35, 2.25, 2.4, 0.55, {
      color: accent,
      fontSize: 42,
      align: "center",
    });
    addText(stats, "Metric label", x + 0.42, 3.05, 2.35, 0.3, {
      color: light,
      fontSize: 17,
      align: "center",
    });
  });
  addText(
    stats,
    "Source: TODO-METRIC - never ship a fabricated number.",
    0.9,
    5.7,
    8.2,
    0.3,
    {
      color: light,
      fontSize: 13,
    },
  );

  const timeline = pptx.addSlide();
  timeline.background = { color: light };
  addText(
    timeline,
    "The system moves through four steps",
    0.65,
    0.45,
    9,
    0.52,
    {
      color: dark,
      fontSize: 35,
    },
  );
  brand.pillars.forEach((pillar, idx) => {
    const x = 0.75 + idx * 3.05;
    addBox(
      timeline,
      x,
      2.0,
      2.55,
      2.45,
      brand.palette[3]?.hex ?? brand.primaryLight,
      brand.primaryAccent,
    );
    addText(timeline, `0${idx + 1}`, x + 0.25, 2.3, 0.7, 0.35, {
      color: accent,
      fontSize: 22,
    });
    addText(timeline, pillar.name, x + 0.25, 2.85, 2.0, 0.35, {
      color: dark,
      fontSize: 19,
    });
    addText(timeline, pillar.description, x + 0.25, 3.35, 2.0, 0.65, {
      color: dark,
      fontSize: 12,
    });
  });

  const quote = pptx.addSlide();
  quote.background = { color: dark };
  addText(quote, `"${brand.tagline}"`, 1.05, 1.85, 10, 1.1, {
    color: light,
    fontSize: 44,
    italic: true,
    align: "center",
  });
  addText(quote, brand.name, 3.95, 4.1, 5.2, 0.4, {
    color: accent,
    fontSize: 22,
    align: "center",
  });
  quote.addImage({ path: mark, x: 5.7, y: 5.25, w: 0.75, h: 0.75 });

  const thanks = pptx.addSlide();
  thanks.background = { color: dark };
  thanks.addImage({ path: lockup, x: 0.85, y: 1.1, w: 5.2, h: 1.5 });
  addText(thanks, "Thank you", 0.9, 3.4, 6, 0.7, {
    color: light,
    fontSize: 42,
  });
  addText(
    thanks,
    "#TODO-LINK contact line to be announced",
    0.95,
    4.35,
    6.5,
    0.35,
    {
      color: accent,
      fontSize: 18,
    },
  );
  thanks.addNotes(
    "Install the brand font family locally before presenting or exporting final production decks.",
  );

  const pptxPath = path.join(dir, `${brand.slug}-deck-template.pptx`);
  await pptx.writeFile({ fileName: pptxPath });
  await normalizePptx(pptxPath);
};

const runPythonPdfs = (brands) => {
  writeText(generatedDataPath, JSON.stringify(brands, null, 2));
  const python = process.env.PYTHON ?? "python3";
  const result = spawnSync(
    python,
    [
      path.join(root, "scripts", "brand", "generate-pdfs.py"),
      generatedDataPath,
      publicDir,
    ],
    { encoding: "utf8", stdio: "pipe" },
  );
  if (result.status !== 0) {
    throw new Error(
      `PDF generation failed with ${python}:\n${result.stdout}\n${result.stderr}`,
    );
  }
};

const renderPdfPages = (pdfPath, prefix) => {
  ensureDir(path.dirname(prefix));
  const fontCacheDir = path.join(qaDir, "font-cache");
  ensureDir(fontCacheDir);
  const pdftoppm = process.env.PDFTOPPM ?? "pdftoppm";
  const result = spawnSync(pdftoppm, ["-png", pdfPath, prefix], {
    encoding: "utf8",
    env: { ...process.env, XDG_CACHE_HOME: fontCacheDir },
    stdio: "pipe",
  });
  if (result.status !== 0) {
    throw new Error(
      `PDF rasterization failed for ${pdfPath}: ${result.stderr}`,
    );
  }
};

const qaDeck = (pptxPath, slug) => {
  const soffice = process.env.SOFFICE ?? "soffice";
  const outDir = path.join(qaDir, "pptx-pdf");
  ensureDir(outDir);
  const result = spawnSync(
    soffice,
    ["--headless", "--convert-to", "pdf", "--outdir", outDir, pptxPath],
    { encoding: "utf8", stdio: "pipe" },
  );
  if (result.status !== 0) {
    console.warn(
      `PPTX render QA skipped for ${slug}: ${result.stderr || result.stdout}`,
    );
    return;
  }
  const pdfPath = path.join(outDir, `${path.basename(pptxPath, ".pptx")}.pdf`);
  renderPdfPages(pdfPath, path.join(qaDir, "pptx-renders", slug, "slide"));
};

const buildManifest = (brands) => {
  const manifest = {
    brands: Object.fromEntries(
      brands.map((brand) => {
        const dir = path.join(brandPublicDir, brand.slug);
        const files = [
          `${brand.slug}-icon-transparent.svg`,
          `${brand.slug}-mark-dark.svg`,
          `${brand.slug}-mark-light.svg`,
          `${brand.slug}-lockup-horizontal-dark.svg`,
          `${brand.slug}-lockup-horizontal-light.svg`,
          `${brand.slug}-brand-guidelines.pdf`,
          `${brand.slug}-deck-template.pptx`,
          `${brand.slug}-og.png`,
        ].map((name) => {
          const filePath = path.join(dir, name);
          const buffer = fs.readFileSync(filePath);
          const ext = path.extname(name);
          const mime =
            ext === ".svg"
              ? "image/svg+xml"
              : ext === ".pdf"
                ? "application/pdf"
                : ext === ".pptx"
                  ? "application/vnd.openxmlformats-officedocument.presentationml.presentation"
                  : "image/png";
          return {
            bytes: buffer.length,
            mime,
            path: toPublicPath(filePath),
            sha256: crypto.createHash("sha256").update(buffer).digest("hex"),
          };
        });
        return [brand.slug, { files }];
      }),
    ),
  };
  writeText(
    path.join(brandPublicDir, "manifest.json"),
    JSON.stringify(manifest, null, 2),
  );
};

const main = async () => {
  ensureDir(brandPublicDir);
  ensureDir(qaDir);
  ensureDir(tempDir);
  const brands = await importBrands();

  for (const brand of brands) {
    await svgFilesForBrand(brand);
  }

  runPythonPdfs(brands);

  for (const brand of brands) {
    await makeDeck(brand);
  }

  for (const brand of brands) {
    const slug = brand.slug;
    const dir = path.join(brandPublicDir, slug);
    renderPdfPages(
      path.join(dir, `${slug}-brand-guidelines.pdf`),
      path.join(qaDir, "pdf-renders", slug, "page"),
    );
    qaDeck(path.join(dir, `${slug}-deck-template.pptx`), slug);
  }

  buildManifest(brands);
  fs.writeFileSync(
    path.join(qaDir, "toolchain.json"),
    `${JSON.stringify(
      {
        node: process.version,
        platform: `${os.platform()} ${os.arch()}`,
        python: process.env.PYTHON ?? "python3",
        qa: {
          pdfRenders: "work/brand-qa/pdf-renders",
          pptxRenders: "work/brand-qa/pptx-renders",
          svgRenders: "work/brand-qa/svg-renders",
        },
      },
      null,
      2,
    )}\n`,
  );
  console.log(`Generated ${brands.length} brand kits in ${brandPublicDir}`);
};

await main();
