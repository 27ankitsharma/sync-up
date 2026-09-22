-- Development sample only. Uses the existing LoRA syllabus topic identifier.
-- Does not invent catalogue metadata. Lesson copy is the existing syllabus
-- summary / why-it-matters, plus an explicit development-sample callout.

insert into public.courses (id, topic_id, title, slug, description, status)
values (
  '11111111-1111-4111-8111-111111111111',
  'model-adaptation-parameter-efficient-adaptation-lora',
  'LoRA',
  'lora',
  'Development sample course attached to the existing LoRA syllabus topic.',
  'published'
)
on conflict (slug) do update
set
  topic_id = excluded.topic_id,
  title = excluded.title,
  description = excluded.description,
  status = excluded.status;

insert into public.lessons (id, course_id, title, slug, order_index, duration_minutes, status, content_json)
values
(
  '21111111-1111-4111-8111-111111111111',
  '11111111-1111-4111-8111-111111111111',
  'Introduction',
  'introduction',
  1,
  8,
  'published',
  '{
    "type": "doc",
    "content": [
      {"type": "callout", "tone": "info", "text": "Development sample. This course is attached to the existing LoRA topic and uses syllabus copy until authored lesson content is published."},
      {"type": "heading", "level": 2, "text": "What this topic covers"},
      {"type": "paragraph", "text": "Core concept covering lora within Parameter-Efficient Adaptation."},
      {"type": "paragraph", "text": "Builds practical understanding of lora for AI learning and application."}
    ]
  }'::jsonb
),
(
  '21111111-1111-4111-8111-111111111112',
  '11111111-1111-4111-8111-111111111111',
  'LoRA Architecture',
  'lora-architecture',
  2,
  12,
  'published',
  '{
    "type": "doc",
    "content": [
      {"type": "heading", "level": 2, "text": "Where LoRA sits"},
      {"type": "paragraph", "text": "Core concept covering lora within Parameter-Efficient Adaptation."},
      {"type": "list", "style": "bullet", "items": ["Foundation Models", "Model Adaptation", "Parameter-Efficient Adaptation", "LoRA"]},
      {"type": "image", "src": "lora/lora-architecture.png", "alt": "Upload lora/lora-architecture.png to the course-assets bucket to display this figure."},
      {"type": "link", "href": "https://arxiv.org/abs/2106.09685", "text": "LoRA paper (external reference)"}
    ]
  }'::jsonb
),
(
  '21111111-1111-4111-8111-111111111113',
  '11111111-1111-4111-8111-111111111111',
  'Training with LoRA',
  'training-with-lora',
  3,
  12,
  'published',
  '{
    "type": "doc",
    "content": [
      {"type": "heading", "level": 2, "text": "Training notes"},
      {"type": "paragraph", "text": "Builds practical understanding of lora for AI learning and application."},
      {"type": "code", "language": "python", "code": "# Sample structure only — replace with authored training notes.\\n# adapter = LoraConfig(r=8, lora_alpha=16)"},
      {"type": "callout", "tone": "tip", "text": "Replace this development sample with reviewed training guidance before treating the course as production content."}
    ]
  }'::jsonb
),
(
  '21111111-1111-4111-8111-111111111114',
  '11111111-1111-4111-8111-111111111111',
  'Practical Example',
  'practical-example',
  4,
  10,
  'published',
  '{
    "type": "doc",
    "content": [
      {"type": "heading", "level": 2, "text": "Apply the concept"},
      {"type": "paragraph", "text": "Builds practical understanding of lora for AI learning and application."},
      {"type": "list", "style": "ordered", "items": ["Re-read the syllabus summary", "Note where LoRA sits in Parameter-Efficient Adaptation", "Replace this sample with a reviewed exercise"]}
    ]
  }'::jsonb
),
(
  '21111111-1111-4111-8111-111111111115',
  '11111111-1111-4111-8111-111111111111',
  'Summary',
  'summary',
  5,
  6,
  'published',
  '{
    "type": "doc",
    "content": [
      {"type": "heading", "level": 2, "text": "Summary"},
      {"type": "paragraph", "text": "Core concept covering lora within Parameter-Efficient Adaptation."},
      {"type": "paragraph", "text": "Builds practical understanding of lora for AI learning and application."}
    ]
  }'::jsonb
)
on conflict (course_id, slug) do update
set
  title = excluded.title,
  order_index = excluded.order_index,
  duration_minutes = excluded.duration_minutes,
  status = excluded.status,
  content_json = excluded.content_json;
