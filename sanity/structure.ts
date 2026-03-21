import { StructureBuilder } from 'sanity/structure'
import { orderableDocumentListDeskItem } from '@sanity/orderable-document-list'

export const structure = (S: StructureBuilder) =>
  S.list()
    .title('Content')
    .items([
      // =============================
      // 🌳 HIERARCHY NAVIGATION
      // =============================

      // TRACKS
      S.documentTypeListItem('track').title('Tracks'),

      // SUBJECTS
      S.listItem()
        .title('Subjects by Track')
        .child(
          S.documentTypeList('track')
            .title('Select Track')
            .child((trackId) =>
              S.list()
                .title('Subjects')
                .items([
                  // ➕ Create
                  S.listItem()
                    .title('➕ Create Subject')
                    .child(
                     S.document()
                    .schemaType('subject')
                    .initialValueTemplate('subject-with-track', { trackId })
                    .id(`subject-${Date.now()}`)
                    ),

                  S.divider(),

                  // 📄 Drag-drop list
                  orderableDocumentListDeskItem({
                    type: 'subject',
                    title: 'Subjects',
                    S,
                    context: S.context,
                    filter: '_type == "subject" && track._ref == $trackId',
                    params: { trackId },
                  }),
                ])
            )
        ),

      // MODULES
      S.listItem()
        .title('Modules by Subject')
        .child(
          S.documentTypeList('subject')
            .title('Select Subject')
            .child((subjectId) =>
              S.list()
                .title('Modules')
                .items([
                  S.listItem()
                    .title('➕ Create Module')
                    .child(
                      S.document()
                      .schemaType('module')
                      .initialValueTemplate('module-with-subject', { subjectId })
                      .id(`module-${Date.now()}`)
                  ),

                  S.divider(),

                  orderableDocumentListDeskItem({
                    type: 'module',
                    title: 'Modules',
                    S,
                    context: S.context,
                    filter: '_type == "module" && subject._ref == $subjectId',
                    params: { subjectId },
                  }),
                ])
            )
        ),

      // TOPICS
      S.listItem()
        .title('Topics by Module')
        .child(
          S.documentTypeList('module')
            .title('Select Module')
            .child((moduleId) =>
              S.list()
                .title('Topics')
                .items([
                  S.listItem()
                    .title('➕ Create Topic')
                    .child(
                      S.document()
                      .schemaType('topic')
                      .initialValueTemplate('topic-with-module', { moduleId })
                      .id(`topic-${Date.now()}`)
                  ),

                  S.divider(),

                  orderableDocumentListDeskItem({
                    type: 'topic',
                    title: 'Topics',
                    S,
                    context: S.context,
                    filter: '_type == "topic" && module._ref == $moduleId',
                    params: { moduleId },
                  }),
                ])
            )
        ),

      // LESSONS
      S.listItem()
        .title('Lessons by Topic')
        .child(
          S.documentTypeList('topic')
            .title('Select Topic')
            .child((topicId) =>
              S.list()
                .title('Lessons')
                .items([
                  S.listItem()
                    .title('➕ Create Lesson')
                    .child(
                      S.document()
                      .schemaType('lesson')
                      .initialValueTemplate('lesson-with-topic', { topicId })
                      .id(`lesson-${Date.now()}`)
                    ),

                  S.divider(),

                  orderableDocumentListDeskItem({
                    type: 'lesson',
                    title: 'Lessons',
                    S,
                    context: S.context,
                    filter: '_type == "lesson" && topic._ref == $topicId',
                    params: { topicId },
                  }),
                ])
            )
        ),

      S.divider(),

      // =============================
      // 🔍 FILTERED VIEWS
      // =============================

      // Difficulty
      S.listItem()
        .title('🎯 Topics by Difficulty')
        .child(
          S.list()
            .title('Difficulty')
            .items([
              S.listItem()
                .title('Beginner')
                .child(
                  S.documentTypeList('topic')
                    .title('Beginner Topics')
                    .filter('_type == "topic" && difficulty == "beginner"')
                ),
              S.listItem()
                .title('Intermediate')
                .child(
                  S.documentTypeList('topic')
                    .title('Intermediate Topics')
                    .filter('_type == "topic" && difficulty == "intermediate"')
                ),
              S.listItem()
                .title('Advanced')
                .child(
                  S.documentTypeList('topic')
                    .title('Advanced Topics')
                    .filter('_type == "topic" && difficulty == "advanced"')
                ),
            ])
        ),

      // Priority
      S.listItem()
        .title('⚡ Topics by Priority')
        .child(
          S.list()
            .title('Priority')
            .items([
              S.listItem()
                .title('High')
                .child(
                  S.documentTypeList('topic')
                    .title('High Priority Topics')
                    .filter('_type == "topic" && priority == "high"')
                ),
              S.listItem()
                .title('Medium')
                .child(
                  S.documentTypeList('topic')
                    .title('Medium Priority Topics')
                    .filter('_type == "topic" && priority == "medium"')
                ),
              S.listItem()
                .title('Low')
                .child(
                  S.documentTypeList('topic')
                    .title('Low Priority Topics')
                    .filter('_type == "topic" && priority == "low"')
                ),
            ])
        ),

      S.divider(),

      // =============================
      // 🧭 QUICK ACCESS
      // =============================
      S.listItem()
        .title('All Tracks')
        .child(S.documentTypeList('track')),

      S.listItem()
        .title('All Subjects')
        .child(S.documentTypeList('subject')),

      S.listItem()
        .title('All Modules')
        .child(S.documentTypeList('module')),

      S.listItem()
        .title('All Topics')
        .child(S.documentTypeList('topic')),

      S.listItem()
        .title('All Lessons')
        .child(S.documentTypeList('lesson')),
    ])