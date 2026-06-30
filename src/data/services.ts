export type ServicePillarId = "run" | "shield" | "ledger" | "shift";

export interface ServicePillar {
  id: ServicePillarId;
  name: string;
  shortName: string;
  href: string;
  description: string;
  value: string;
  covers: string[];
  matters: string;
}

export const servicePillars: ServicePillar[] = [
  {
    id: "run",
    name: "Northlace Run",
    shortName: "Run",
    href: "/services/run",
    description:
      "DevOps, Site Reliability Engineering, continuous integration and continuous delivery, observability, and incident response.",
    value: "Keep delivery moving without making operations fragile.",
    covers: [
      "Continuous integration and continuous delivery (CI/CD) pipeline design",
      "Infrastructure as code (IaC) foundations and review workflows",
      "Site Reliability Engineering (SRE) practices and incident response",
      "Observability dashboards, alerts, and runbooks",
    ],
    matters:
      "Run turns delivery pressure into an operating system. Engineering teams get clearer release paths, and leaders get fewer surprises when systems change.",
  },
  {
    id: "shield",
    name: "Northlace Shield",
    shortName: "Shield",
    href: "/services/shield",
    description:
      "Security, compliance, policy as code, cloud guardrails, and infrastructure governance that teams can actually use.",
    value: "Make secure delivery the default, not a last-minute review.",
    covers: [
      "Cloud security baseline design",
      "Policy as code and infrastructure governance",
      "Compliance evidence workflows",
      "Secure-by-default delivery templates",
    ],
    matters:
      "Shield reduces risk without turning security into a blocker. Controls become part of normal engineering work, so teams can move with more confidence.",
  },
  {
    id: "ledger",
    name: "Northlace Ledger",
    shortName: "Ledger",
    href: "/services/ledger",
    description:
      "Financial Operations (FinOps), cloud cost visibility, tagging, accountability, forecasting, and engineering-owned optimization.",
    value: "Give every cloud decision a cost signal people can act on.",
    covers: [
      "Financial Operations (FinOps) tagging and allocation models",
      "Cloud spend review cadence and ownership paths",
      "Waste detection and cleanup workflows",
      "Forecasting support for product and finance teams",
    ],
    matters:
      "Ledger makes cloud cost visible early enough to change it. Finance gets better signals, and engineering gets practical ways to reduce waste.",
  },
  {
    id: "shift",
    name: "Northlace Shift",
    shortName: "Shift",
    href: "/services/shift",
    description:
      "Migrations, modernization, platform transitions, and artificial intelligence-native workflow adoption.",
    value: "Modernize without pausing the business you already run.",
    covers: [
      "Migration planning and sequencing",
      "Application and platform modernization",
      "Artificial intelligence (AI)-native engineering workflow adoption",
      "Operational handover and enablement",
    ],
    matters:
      "Shift breaks modernization into steps teams can absorb. The result is less disruption, clearer ownership, and faster movement from plan to production.",
  },
];

export const getServicePillar = (id: ServicePillarId) =>
  servicePillars.find((pillar) => pillar.id === id);

export const pillarLabel = (id: ServicePillarId) =>
  getServicePillar(id)?.shortName ?? id;
