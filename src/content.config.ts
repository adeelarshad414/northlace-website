import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";

import { blogSchema, careerSchema, caseStudySchema } from "./content/schemas";

const caseStudies = defineCollection({
  loader: glob({ pattern: "**/*.mdx", base: "./src/content/case-studies" }),
  schema: caseStudySchema,
});

const careers = defineCollection({
  loader: glob({ pattern: "**/*.mdx", base: "./src/content/careers" }),
  schema: careerSchema,
});

const blog = defineCollection({
  loader: glob({ pattern: "**/*.mdx", base: "./src/content/blog" }),
  schema: blogSchema,
});

export const collections = {
  "case-studies": caseStudies,
  careers,
  blog,
};
