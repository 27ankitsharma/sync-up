import { defineType, defineField } from "sanity";
import { orderRankField } from "@sanity/orderable-document-list";

export default defineType({
  name: "track",
  title: "Track",
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
      name: "description",
      title: "Description",
      type: "text",
      rows: 3,
    }),
    defineField({
      name: "order",
      title: "Order",
      type: "number",
      validation: (Rule) => Rule.required().min(1),
    }),
    defineField({
      name: "icon",
      title: "Icon",
      type: "string",
      description: "Emoji or icon identifier for this track",
    }),

    orderRankField({ type: "track" })
  ],
  orderings: [
    {
      title: "Order",
      name: "orderAsc",
      by: [{ field: "order", direction: "asc" }],
    },
  ],
  preview: {
    select: { title: "title", order: "order" },
    prepare: ({ title, order }) => ({
      title: `${order}. ${title}`,
    }),
  },
});
