import { z } from "astro/zod";

const metricSchema = z.object({
  value: z.string(),
  label: z.string(),
});

const seoSchema = z.object({
  title: z.string().max(60),
  description: z.string().max(160),
});

export const caseStudySchema = z.object({
  title: z.string(),
  clientLabel: z.string(),
  anonymized: z.boolean().default(false),
  draft: z.boolean().default(false),
  summary: z.string().max(200),
  pillars: z.array(z.enum(["run", "shield", "ledger", "shift"])).min(1),
  featured: z.boolean().default(false),
  publishDate: z.date(),
  heroMetric: metricSchema,
  challenge: z.string(),
  approach: z.string(),
  outcomeMetrics: z.array(metricSchema).min(1),
  architectureDiagram: z.string().optional(),
  seo: seoSchema,
});

export const careerSchema = z.object({
  title: z.string(),
  draft: z.boolean().default(false),
  department: z.enum([
    "cloud-devops",
    "sre",
    "platform",
    "security",
    "finops",
    "ai-engineering",
    "other",
  ]),
  locationType: z.enum(["remote", "hybrid", "onsite"]),
  locationDetail: z.string(),
  employmentType: z.enum(["full-time", "part-time", "contract"]),
  postedDate: z.date(),
  closesDate: z.date().optional(),
  summary: z.string().max(200),
  responsibilities: z.array(z.string()).min(1),
  mustHave: z.array(z.string()).min(1),
  niceToHave: z.array(z.string()).optional(),
  applyEmail: z.email().optional(),
});

export const blogSchema = z.object({
  title: z.string(),
  publishDate: z.date(),
  author: z.string(),
  tags: z.array(z.string()).min(1),
  summary: z.string().max(200),
  heroImage: z.string().optional(),
  seo: seoSchema,
});

export type CaseStudy = z.infer<typeof caseStudySchema>;
export type Career = z.infer<typeof careerSchema>;
export type BlogPost = z.infer<typeof blogSchema>;
