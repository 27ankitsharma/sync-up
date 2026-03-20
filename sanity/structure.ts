import { StructureBuilder } from 'sanity/structure'

export const structure = (S: StructureBuilder) =>
  S.list()
    .title('Content')
    .items([
      // 🌳 FULL HIERARCHY
      S.listItem()
        .title('📚 Learning Hierarchy')
        .child(
          S.documentTypeList('track')
            .title('Tracks')
            .child((trackId) =>
              S.list()
                .title('Subjects')
                .items([
                  // ➕ Create Subject
                  S.listItem()
                    .title('➕ Create Subject')
                    .child(
                      S.documentWithInitialValueTemplate(
                        'subject-with-track',
                        { trackId }
                      )
                    ),

                  S.divider(),

                  // 📄 Subjects
                  S.listItem()
                    .title('All Subjects')
                    .child(
                      S.documentTypeList('subject')
                        .filter('_type == "subject" && track._ref == $trackId')
                        .params({ trackId })
                        .defaultOrdering([{ field: 'order', direction: 'asc' }])
                        .child((subjectId) =>
                          S.list()
                            .title('Modules')
                            .items([
                              // ➕ Create Module
                              S.listItem()
                                .title('➕ Create Module')
                                .child(
                                  S.documentWithInitialValueTemplate(
                                    'module-with-subject',
                                    { subjectId }
                                  )
                                ),

                              S.divider(),

                              // 📄 Modules
                              S.listItem()
                                .title('All Modules')
                                .child(
                                  S.documentTypeList('module')
                                    .filter(
                                      '_type == "module" && subject._ref == $subjectId'
                                    )
                                    .params({ subjectId })
                                    .defaultOrdering([{ field: 'order', direction: 'asc' }])
                                    .child((moduleId) =>
                                      S.list()
                                        .title('Topics')
                                        .items([
                                          // ➕ Create Topic
                                          S.listItem()
                                            .title('➕ Create Topic')
                                            .child(
                                              S.documentWithInitialValueTemplate(
                                                'topic-with-module',
                                                { moduleId }
                                              )
                                            ),

                                          S.divider(),

                                          // 📄 Topics
                                          S.listItem()
                                            .title('All Topics')
                                            .child(
                                              S.documentTypeList('topic')
                                                .filter(
                                                  '_type == "topic" && module._ref == $moduleId'
                                                )
                                                .params({ moduleId })
                                                .defaultOrdering([{ field: 'order', direction: 'asc' }])
                                                .child((topicId) =>
                                                  S.list()
                                                    .title('Lessons')
                                                    .items([
                                                      // ➕ Create Lesson
                                                      S.listItem()
                                                        .title('➕ Create Lesson')
                                                        .child(
                                                          S.documentWithInitialValueTemplate(
                                                            'lesson-with-topic',
                                                            { topicId }
                                                          )
                                                        ),

                                                      S.divider(),

                                                      // 📄 Lessons
                                                      S.listItem()
                                                        .title('All Lessons')
                                                        .child(
                                                          S.documentTypeList('lesson')
                                                            .filter(
                                                              '_type == "lesson" && topic._ref == $topicId'
                                                            )
                                                            .params({ topicId })
                                                            .defaultOrdering([{ field: 'order', direction: 'asc' }])
                                                        ),
                                                    ])
                                                )
                                            ),
                                        ])
                                    )
                                ),
                            ])
                        )
                    ),
                ])
            )
        ),

      S.divider(),

      // 🔍 FILTERED VIEWS
      S.listItem()
        .title('🎯 Topics by Difficulty')
        .child(
          S.list()
            .title('Difficulty')
            .items([
              S.listItem()
                .title('Beginner')
                .child(
                  S.documentTypeList('topic').filter(
                    '_type == "topic" && difficulty == "beginner"'
                  )
                ),
              S.listItem()
                .title('Intermediate')
                .child(
                  S.documentTypeList('topic').filter(
                    '_type == "topic" && difficulty == "intermediate"'
                  )
                ),
              S.listItem()
                .title('Advanced')
                .child(
                  S.documentTypeList('topic').filter(
                    '_type == "topic" && difficulty == "advanced"'
                  )
                ),
            ])
        ),

      S.listItem()
        .title('⚡ Topics by Priority')
        .child(
          S.list()
            .title('Priority')
            .items([
              S.listItem()
                .title('High')
                .child(
                  S.documentTypeList('topic').filter(
                    '_type == "topic" && priority == "high"'
                  )
                ),
              S.listItem()
                .title('Medium')
                .child(
                  S.documentTypeList('topic').filter(
                    '_type == "topic" && priority == "medium"'
                  )
                ),
              S.listItem()
                .title('Low')
                .child(
                  S.documentTypeList('topic').filter(
                    '_type == "topic" && priority == "low"'
                  )
                ),
            ])
        ),

      S.divider(),

      // 🧭 QUICK ACCESS
      S.documentTypeListItem('track').title('All Tracks'),
      S.documentTypeListItem('subject').title('All Subjects'),
      S.documentTypeListItem('module').title('All Modules'),
      S.documentTypeListItem('topic').title('All Topics'),
      S.documentTypeListItem('lesson').title('All Lessons'),
    ])