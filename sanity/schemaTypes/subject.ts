import { defineType, defineField } from "sanity";
import { orderRankField } from "@sanity/orderable-document-list";

export default defineType({
  name: "subject",
  title: "Subject",
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
      name: "track",
      title: "Track",
      type: "reference",
      to: [{ type: "track" }],
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

    // ✅ NEW FIELD (required for drag-drop)
    orderRankField({ type: "subject" }),
  ],
  orderings: [
    {
      title: "Order",
      name: "orderAsc",
      by: [{ field: "order", direction: "asc" }],
    },
  ],
  preview: {
    select: { title: "title", order: "order", track: "track.title" },
    prepare: ({ title, order, track }) => ({
      title: `${order}. ${title}`,
      subtitle: track ? `Track: ${track}` : "",
    }),
  },
});
