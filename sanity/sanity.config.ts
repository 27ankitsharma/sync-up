import { defineConfig } from 'sanity'
import { structureTool } from 'sanity/structure'
import { schemaTypes } from './schemaTypes'
import { structure } from './structure'
import { codeInput } from '@sanity/code-input'
import { visionTool } from '@sanity/vision'
import { orderableDocumentListDeskItem } from '@sanity/orderable-document-list'

export default defineConfig({
  name: 'default',
  title: 'Minicourse',

  projectId: 'x92kshl7',
  dataset: 'production',

  plugins: [structureTool({ structure }),codeInput(),visionTool(),],

  schema: {
    types: schemaTypes,

    templates: (prev) => [
      ...prev,

      // Topic template
      {
        id: 'topic-with-module',
        schemaType: 'topic',
        parameters: [{ name: 'moduleId', type: 'string' }],
        value: async ({ moduleId }, { getClient }) => {
          const client = getClient({ apiVersion: '2023-10-01' })

          const topics = await client.fetch(
            '*[_type=="topic" && module._ref==$moduleId]{order}',
            { moduleId }
          )

          const maxOrder = Math.max(0, ...topics.map(t => t.order || 0))

          return {
            module: { _type: 'reference', _ref: moduleId },
            order: maxOrder + 1,
          }
        },
      },

      // Lesson template
      {
        id: 'lesson-with-topic',
        schemaType: 'lesson',
        parameters: [{ name: 'topicId', type: 'string' }],
        value: async ({ topicId }, { getClient }) => {
          const client = getClient({ apiVersion: '2023-10-01' })

          const lessons = await client.fetch(
            '*[_type=="lesson" && topic._ref==$topicId]{order}',
            { topicId }
          )

          const maxOrder = Math.max(0, ...lessons.map(l => l.order || 0))

          return {
            topic: { _type: 'reference', _ref: topicId },
            order: maxOrder + 1,
          }
        },
      },

      // Subject under Track
      {
      id: 'subject-with-track',
      schemaType: 'subject',
      parameters: [{ name: 'trackId', type: 'string' }],
      value: async ({ trackId }, { getClient }) => {
        const client = getClient({ apiVersion: '2023-10-01' })

        const subjects = await client.fetch(
          '*[_type=="subject" && track._ref==$trackId]{order}',
          { trackId }
        )

        const maxOrder = Math.max(0, ...subjects.map(s => s.order || 0))

        return {
          track: { _type: 'reference', _ref: trackId },
          order: maxOrder + 1,
        }
        },
      },



            // Module under Subject
      {
        id: 'module-with-subject',
        schemaType: 'module',
        parameters: [{ name: 'subjectId', type: 'string' }],
        value: async ({ subjectId }, { getClient }) => {
          const client = getClient({ apiVersion: '2023-10-01' })

          const modules = await client.fetch(
            '*[_type=="module" && subject._ref==$subjectId]{order}',
            { subjectId }
          )

          const maxOrder = Math.max(0, ...modules.map(m => m.order || 0))

          return {
            subject: { _type: 'reference', _ref: subjectId },
            order: maxOrder + 1,
          }
        },
      },


    ],
  },
})