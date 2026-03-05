import { useParams } from "react-router-dom";
import { TopicDetail } from "@/components/TopicDetail";

export default function TopicPage() {
  const { slug } = useParams<{ slug: string }>();

  if (!slug) return null;

  return (
    <div className="max-w-5xl mx-auto">
      <TopicDetail slug={slug} />
    </div>
  );
}
