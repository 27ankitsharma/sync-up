import { getSupabaseClient } from "@/lib/supabase";

const COURSE_ASSETS_BUCKET = "course-assets";

export function resolveCourseAssetUrl(src: string) {
  if (!src || src.startsWith("http://") || src.startsWith("https://") || src.startsWith("/")) {
    return src;
  }

  const supabase = getSupabaseClient();
  if (!supabase) return src;

  return supabase.storage.from(COURSE_ASSETS_BUCKET).getPublicUrl(src).data.publicUrl;
}

export function isEmbeddableVideoUrl(src: string) {
  return /youtube\.com|youtu\.be|vimeo\.com/.test(src);
}
