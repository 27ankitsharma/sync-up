import { defineType, defineField } from "sanity";

export default defineType({
  name: "topic",
  title: "Topic",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: { source: "title", maxLength: 96 },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "module",
      title: "Module",
      type: "reference",
      to: [{ type: "module" }],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "roles",
      title: "Roles",
      type: "array",
      of: [{ type: "string" }],
      options: {
        list: [
          { title: "Developer", value: "developer" },
          { title: "Designer", value: "designer" },
          { title: "Product Manager", value: "product-manager" },
          { title: "Data Scientist", value: "data-scientist" },
          { title: "Marketer", value: "marketer" },
        ],
      },
      validation: (Rule) => Rule.required().min(1),
    }),
    defineField({
      name: "difficulty",
      title: "Difficulty",
      type: "string",
      options: {
        list: [
          { title: "Beginner", value: "beginner" },
          { title: "Intermediate", value: "intermediate" },
          { title: "Advanced", value: "advanced" },
        ],
        layout: "radio",
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "layer",
      title: "Layer",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "status",
      title: "Status",
      type: "string",
      options: {
        list: [
          { title: "Draft", value: "draft" },
          { title: "Published", value: "published" },
          { title: "Coming Soon", value: "coming-soon" },
        ],
        layout: "radio",
      },
      initialValue: "draft",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "lastUpdated",
      title: "Last Updated",
      type: "datetime",
      initialValue: () => new Date().toISOString(),
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "order",
      title: "Order",
      type: "number",
      validation: (Rule) => Rule.required().min(1),
    }),
    defineField({
      name: "priority",
      title: "Priority",
      type: "string",
      options: {
        list: [
          { title: "High", value: "high" },
          { title: "Medium", value: "medium" },
          { title: "Low", value: "low" },
        ],
        layout: "radio",
      },
    }),
    defineField({
      name: "whyItMatters",
      title: "Why It Matters",
      type: "array",
      of: [{ type: "block" }],
    }),
  ],
  orderings: [
    {
      title: "Order",
      name: "orderAsc",
      by: [{ field: "order", direction: "asc" }],
    },
  ],
  preview: {
    select: { title: "title", module: "module.title" },
    prepare: ({ title, module }) => ({
      title,
      subtitle: module ? `Module: ${module}` : "",
    }),
  },
});
