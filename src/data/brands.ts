export type BrandKind = "company" | "personal-media";

export interface BrandColor {
  name: string;
  hex: `#${string}`;
  role: string;
}

export interface BrandPillar {
  name: string;
  description: string;
}

export interface BrandAssetPaths {
  deck: string;
  guidelines: string;
  iconTransparent: string;
  lockupDark: string;
  lockupLight: string;
  markDark: string;
  markLight: string;
  og: string;
}

export interface Brand {
  altTaglines: string[];
  assets: BrandAssetPaths;
  bio?: string;
  kind: BrandKind;
  logoGeometry: string;
  name: string;
  pending: string[];
  pillars: BrandPillar[];
  positioning?: string;
  primaryDark: string;
  primaryLight: string;
  primaryAccent: string;
  palette: BrandColor[];
  slug: string;
  tagline: string;
  typography: string;
}

const assetPaths = (slug: string): BrandAssetPaths => ({
  deck: `/brand/${slug}/${slug}-deck-template.pptx`,
  guidelines: `/brand/${slug}/${slug}-brand-guidelines.pdf`,
  iconTransparent: `/brand/${slug}/${slug}-icon-transparent.svg`,
  lockupDark: `/brand/${slug}/${slug}-lockup-horizontal-dark.svg`,
  lockupLight: `/brand/${slug}/${slug}-lockup-horizontal-light.svg`,
  markDark: `/brand/${slug}/${slug}-mark-dark.svg`,
  markLight: `/brand/${slug}/${slug}-mark-light.svg`,
  og: `/brand/${slug}/${slug}-og.png`,
});

export const brands = [
  {
    altTaglines: [
      "Infrastructure you don't have to think about.",
      "We run what runs your business.",
    ],
    assets: assetPaths("northlace"),
    kind: "company",
    logoGeometry:
      "A circle globe crossed by two curved meridian arcs rotated plus and minus 22 degrees, one straight horizontal line, and a small filled center dot.",
    name: "Northlace",
    pending: [
      "Northlace trademark clearance",
      "Final public domain",
      "Real contact links",
    ],
    pillars: [
      {
        name: "Northlace Run",
        description: "DevOps, SRE, CI/CD, and observability.",
      },
      {
        name: "Northlace Shield",
        description: "Security, compliance, and IaC governance.",
      },
      {
        name: "Northlace Ledger",
        description: "FinOps and cloud cost optimization.",
      },
      {
        name: "Northlace Shift",
        description: "Migrations, modernization, and AI-native adoption.",
      },
    ],
    positioning:
      "Northlace runs the cloud, DevOps, and security operations behind growing companies - so engineering teams ship, and leadership teams sleep.",
    primaryAccent: "#5DCAA5",
    primaryDark: "#04342C",
    primaryLight: "#F1EFE8",
    palette: [
      {
        hex: "#04342C",
        name: "Deep Teal",
        role: "Primary backgrounds and chrome.",
      },
      {
        hex: "#0F6E56",
        name: "Mid Teal",
        role: "Accent, links, and CTAs.",
      },
      {
        hex: "#5DCAA5",
        name: "Signal Teal",
        role: "Highlights, badges, and hover states.",
      },
      {
        hex: "#9FE1CB",
        name: "Light Tint",
        role: "Soft fills and supportive surfaces.",
      },
      {
        hex: "#E1F5EE",
        name: "Lightest Tint",
        role: "Light panels and quiet contrast.",
      },
      {
        hex: "#F1EFE8",
        name: "Warm White",
        role: "Page background; never pure white.",
      },
      {
        hex: "#BA7517",
        name: "Amber",
        role: "Utility only for alerts or status.",
      },
    ],
    slug: "northlace",
    tagline: "Every cloud. One standard.",
    typography:
      "Inter or Geist, weights 400 and 500 only, with -0.02em letter spacing on display and H1 only.",
  },
  {
    altTaglines: [],
    assets: assetPaths("adeel-codes-cloud"),
    bio: "Head of DevOps & Cloud at Tkxel. Kubestronaut. Building Pakistan's DevOps community, one cluster (and one career) at a time.",
    kind: "personal-media",
    logoGeometry:
      "A mountain peak polyline with double summit, a segmented circuit underline with end node dots and one open-circle center node, and one small coral satellite dot above-right of the peak.",
    name: "Adeel Codes Cloud",
    pending: [
      "YouTube channel URL",
      "Podcast platform URL",
      "Instagram URL",
      "Real contact links",
    ],
    pillars: [
      {
        name: "Build it",
        description: "Kubernetes, multi-cloud, and infrastructure as code.",
      },
      {
        name: "Lead it",
        description: "Teams, career growth, and mentoring.",
      },
      {
        name: "Call it",
        description: "AI hype versus reality, trends, and certifications.",
      },
      {
        name: "Represent it",
        description:
          "Pakistan's tech scene, the Kubestronaut journey, and community.",
      },
    ],
    primaryAccent: "#6FE3B4",
    primaryDark: "#0F2A1F",
    primaryLight: "#F1EFE8",
    palette: [
      {
        hex: "#0F2A1F",
        name: "Deep Forest",
        role: "Primary dark surface.",
      },
      {
        hex: "#6FE3B4",
        name: "Signal Mint",
        role: "Primary accent.",
      },
      {
        hex: "#9FE1CB",
        name: "Light Mint",
        role: "Tint and secondary accent.",
      },
      {
        hex: "#E1F5EE",
        name: "Mint Tint",
        role: "Light fills.",
      },
      {
        hex: "#F1EFE8",
        name: "Warm White",
        role: "Light surface.",
      },
      {
        hex: "#1A1A18",
        name: "Near-Black",
        role: "Text on light surfaces.",
      },
      {
        hex: "#5F5E5A",
        name: "Slate",
        role: "Secondary text.",
      },
      {
        hex: "#BA7517",
        name: "Amber",
        role: "Tertiary, sparing.",
      },
      {
        hex: "#D85A30",
        name: "Coral",
        role: "Satellite accent only.",
      },
    ],
    slug: "adeel-codes-cloud",
    tagline: "Cloud, DevOps, and the career behind it.",
    typography: "Inter or Sora - rounder, approachable, face-and-voice brand.",
  },
  {
    altTaglines: [],
    assets: assetPaths("signal-and-scale"),
    bio: "A show about what actually scales in cloud, DevOps, and AI-native engineering - hosted by Adeel Arshad, Head of DevOps & Cloud at Tkxel and CNCF Kubestronaut.",
    kind: "personal-media",
    logoGeometry:
      "A waveform polyline that is jagged and chaotic on the left in Steel and resolves into a clean smooth curve on the right in Signal Cyan, ending in a filled cyan dot.",
    name: "Signal & Scale",
    pending: [
      "YouTube channel URL",
      "Podcast platform URL",
      "Instagram URL",
      "Real contact links",
    ],
    pillars: [
      {
        name: "Signal",
        description: "Cutting hype.",
      },
      {
        name: "Systems",
        description: "K8s, multi-cloud, IaC, and observability.",
      },
      {
        name: "Scale",
        description: "Teams, careers, and self.",
      },
      {
        name: "Field notes",
        description: "Community and guests.",
      },
    ],
    primaryAccent: "#4FD1C5",
    primaryDark: "#14171C",
    primaryLight: "#F4F6F7",
    palette: [
      {
        hex: "#14171C",
        name: "Charcoal",
        role: "Primary dark surface.",
      },
      {
        hex: "#0B0D10",
        name: "Near-Black",
        role: "Deep background.",
      },
      {
        hex: "#4FD1C5",
        name: "Signal Cyan",
        role: "Primary accent.",
      },
      {
        hex: "#8FE0D6",
        name: "Light Cyan",
        role: "Tint and secondary accent.",
      },
      {
        hex: "#DDF5F2",
        name: "Cyan Tint",
        role: "Light fills.",
      },
      {
        hex: "#F4F6F7",
        name: "Cool White",
        role: "Light surface.",
      },
      {
        hex: "#6B7280",
        name: "Steel",
        role: "Chaotic waveform stroke and secondary text.",
      },
      {
        hex: "#BA7517",
        name: "Amber",
        role: "Tertiary, sparing.",
      },
      {
        hex: "#D4537E",
        name: "Pink",
        role: "Tertiary, sparing.",
      },
    ],
    slug: "signal-and-scale",
    tagline: "Cutting the noise on cloud, careers, and AI-native work.",
    typography: "Space Grotesk or Sohne - tighter, angular, media register.",
  },
  {
    altTaglines: [
      "DevOps, cloud, and a chair that doesn't squeak.",
      "The control plane, with a drink in hand.",
      "Production's on fire. Pull up a seat.",
    ],
    assets: assetPaths("the-cloud-lounge"),
    bio: "Cloud, DevOps, SRE, platform, and now AI - talked through like you're not on call. Hosted by Adeel Arshad, Head of DevOps & Cloud at Tkxel and CNCF Kubestronaut.",
    kind: "personal-media",
    logoGeometry:
      "A cloud drawn as a single relaxed continuous line with three connected bumps, resting on a low wide arc below it that doubles as a lounge chair or hammock, the arc ending in a small filled dot.",
    name: "The Cloud Lounge",
    pending: [
      "YouTube channel URL",
      "Podcast platform URL",
      "Instagram URL",
      "The Cloud Lounge name collision check",
      "Real contact links",
    ],
    pillars: [
      {
        name: "Check-in",
        description: "News and hot takes.",
      },
      {
        name: "The deep end",
        description: "K8s, multi-cloud, IaC, and observability.",
      },
      {
        name: "Off the clock",
        description: "Career, leadership, and the human side of operations.",
      },
      {
        name: "New arrivals",
        description: "AI-native workflows and agentic engineering.",
      },
    ],
    primaryAccent: "#F2A65A",
    primaryDark: "#1B2A3D",
    primaryLight: "#F5EFE4",
    palette: [
      {
        hex: "#10131A",
        name: "Near-Black",
        role: "Deep background.",
      },
      {
        hex: "#1B2A3D",
        name: "Twilight Blue",
        role: "Primary golden-hour surface.",
      },
      {
        hex: "#F2A65A",
        name: "Amber",
        role: "Primary accent.",
      },
      {
        hex: "#F7C893",
        name: "Light Amber",
        role: "Tint and secondary accent.",
      },
      {
        hex: "#FBE7CC",
        name: "Amber Tint",
        role: "Light fills.",
      },
      {
        hex: "#F5EFE4",
        name: "Cream",
        role: "Light surface.",
      },
      {
        hex: "#2A2620",
        name: "Espresso",
        role: "Warm dark text and panels.",
      },
      {
        hex: "#6B6457",
        name: "Sand",
        role: "Secondary text.",
      },
      {
        hex: "#4F8A7B",
        name: "Palm Green",
        role: "Tertiary, sparing.",
      },
      {
        hex: "#C75D4D",
        name: "Sunset Coral",
        role: "Tertiary, sparing.",
      },
    ],
    slug: "the-cloud-lounge",
    tagline: "Where infrastructure unwinds.",
    typography: "Poppins or Sora - soft, rounded, warm, conversational.",
  },
] as const satisfies readonly Brand[];

export type BrandSlug = (typeof brands)[number]["slug"];

export const getBrand = (slug: string): Brand | undefined =>
  brands.find((brand) => brand.slug === slug);
