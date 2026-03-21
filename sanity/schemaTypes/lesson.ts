import { defineType, defineField } from "sanity";
import { orderRankField } from '@sanity/orderable-document-list'


export default defineType({
  name: "lesson",
  title: "Lesson",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "topic",
      title: "Topic",
      type: "reference",
      to: [{ type: "topic" }],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "order",
      title: "Order",
      type: "number",
      validation: (Rule) => Rule.required().min(1),
    }),
    defineField({
      name: "duration",
      title: "Duration (minutes)",
      type: "number",
      validation: (Rule) => Rule.min(0),
    }),
    defineField({
      name: "content",
      title: "Content",
      type: "array",
      of: [
        { type: "block" },
        {
          type: "image",
          options: { hotspot: true },
          fields: [
            defineField({
              name: "alt",
              title: "Alt Text",
              type: "string",
            }),
          ],
        },
        {
          type: "code",
          title: "Code Block",
        },
      ],
    }),

    // ✅ NEW FIELD (required for drag-drop)
    orderRankField({ type: "lesson" }),
  ],
  orderings: [
    {
      title: "Order",
      name: "orderAsc",
      by: [{ field: "order", direction: "asc" }],
    },
  ],
  preview: {
    select: { title: "title", order: "order", topic: "topic.title" },
    prepare: ({ title, order, topic }) => ({
      title: `${order}. ${title}`,
      subtitle: topic || "",
    }),
  },
});
