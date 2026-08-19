import { useParams } from "react-router-dom";
import { TopicDetail } from "@/components/TopicDetail";

export default function TopicPage() {
  const { slug } = useParams<{ slug: string }>();

  if (!slug) return null;

  return <TopicDetail slug={slug} />;
}
