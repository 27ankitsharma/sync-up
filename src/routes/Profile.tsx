import { FormEvent, useEffect, useMemo, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuthUser } from "@/hooks/useAuth";
import { useAllTopics } from "@/hooks/useSyllabus";
import { useLens } from "@/contexts/LensContext";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useProgress,
  useQuizAttempts,
  useSaveUserProfile,
  useSyncScoreOverview,
  useUserProfile,
} from "@/hooks/useUser";

export default function Profile() {
  const { data: user, isLoading: isUserLoading } = useAuthUser();
  const { data: profile } = useUserProfile();
  const { selectedLens, lenses, setSelectedLens } = useLens();
  const { data: syncScore } = useSyncScoreOverview(selectedLens);
  const { data: progress = [] } = useProgress();
  const { data: quizAttempts = [] } = useQuizAttempts();
  const { data: topics = [] } = useAllTopics();
  const saveProfile = useSaveUserProfile();
  const [role, setRole] = useState("");
  const [experience, setExperience] = useState("");
  const [interests, setInterests] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!profile) return;
    setRole(selectedLens || profile.role || "");
    setExperience(profile.experience ?? "");
    setInterests(profile.interests.join(", "));
  }, [profile, selectedLens]);

  const topicsBySlug = useMemo(() => new Map(topics.map((topic) => [topic.slug, topic])), [topics]);
  const completedSlugs = useMemo(() => new Set(progress.map((item) => item.topicSlug)), [progress]);
  const knowledgeGaps = useMemo(
    () => topics.filter((topic) => topic.is_radar && !completedSlugs.has(topic.slug)).slice(0, 4),
    [completedSlugs, topics],
  );
  const recentProgress = progress.slice(0, 5);
  const averageQuizScore =
    quizAttempts.length === 0
      ? 0
      : Math.round(quizAttempts.reduce((sum, attempt) => sum + attempt.score, 0) / quizAttempts.length);

  if (!isUserLoading && !user) {
    return <Navigate to="/login?redirect=/profile" replace />;
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage(null);

    try {
      await saveProfile.mutateAsync({
        role: role || null,
        experience: experience || null,
        interests: interests
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),
      });
      if (role) setSelectedLens(role);
      setMessage("Profile saved.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not save profile.");
    }
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
        <p className="text-muted-foreground mt-1">
          Manage your learning profile and see your current SyncRadar status.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <MetricCard label="Sync Score" value={`${syncScore?.syncScore ?? 0}%`} />
        <MetricCard label="Important Topics" value={`${syncScore?.importantTopics ?? 0}`} />
        <MetricCard label="Completed" value={`${syncScore?.completedTopics ?? 0}`} />
        <MetricCard label="Quiz Accuracy" value={`${syncScore?.quizAccuracy || averageQuizScore}%`} />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
        <Card>
          <CardHeader>
            <CardTitle>Your Profile</CardTitle>
            <CardDescription>
              Used later for role-aware Radar recommendations and learning paths.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input value={user?.email ?? ""} disabled />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Role / Lens</Label>
                <Select
                  value={role}
                  onValueChange={(value) => {
                    setRole(value);
                    setSelectedLens(value);
                  }}
                >
                  <SelectTrigger id="role">
                    <SelectValue placeholder="Select a lens" />
                  </SelectTrigger>
                  <SelectContent>
                    {lenses.map((lens) => (
                      <SelectItem key={lens} value={lens}>
                        {lens}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="experience">Experience</Label>
                <Input
                  id="experience"
                  placeholder="Beginner, intermediate, senior..."
                  value={experience}
                  onChange={(event) => setExperience(event.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="interests">Interests</Label>
                <Textarea
                  id="interests"
                  placeholder="Agents, RAG, evaluations, MLOps"
                  value={interests}
                  onChange={(event) => setInterests(event.target.value)}
                />
                <p className="text-xs text-muted-foreground">Separate interests with commas.</p>
              </div>
              <Button type="submit" disabled={saveProfile.isPending}>
                {saveProfile.isPending ? "Saving..." : "Save profile"}
              </Button>
              {message && <p className="text-sm text-muted-foreground">{message}</p>}
            </form>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Knowledge Gap Radar</CardTitle>
              <CardDescription>Important Radar topics you have not completed yet.</CardDescription>
            </CardHeader>
            <CardContent>
              {knowledgeGaps.length === 0 ? (
                <p className="text-sm text-muted-foreground">No current Radar gaps found.</p>
              ) : (
                <div className="space-y-3">
                  {knowledgeGaps.map((topic) => (
                    <Link
                      key={topic.id}
                      to={`/topic/${topic.slug}`}
                      className="block rounded-md border p-3 transition-colors hover:bg-muted/50"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-medium text-sm">{topic.title}</p>
                          <p className="text-xs text-muted-foreground mt-1">{topic.summary}</p>
                        </div>
                        <Badge variant="secondary">{topic.layer}</Badge>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Progress</CardTitle>
              <CardDescription>Latest topics completed from quizzes.</CardDescription>
            </CardHeader>
            <CardContent>
              {recentProgress.length === 0 ? (
                <p className="text-sm text-muted-foreground">No completed topics yet.</p>
              ) : (
                <div className="space-y-3">
                  {recentProgress.map((item) => {
                    const topic = topicsBySlug.get(item.topicSlug);
                    return (
                      <div key={item.id} className="flex items-center justify-between gap-3 rounded-md border p-3">
                        <div>
                          <p className="text-sm font-medium">{topic?.title ?? item.topicSlug}</p>
                          <p className="text-xs text-muted-foreground">
                            Completed {new Date(item.completedAt).toLocaleDateString()}
                          </p>
                        </div>
                        {topic && (
                          <Button asChild size="sm" variant="ghost">
                            <Link to={`/topic/${topic.slug}`}>Open</Link>
                          </Button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <Card>
      <CardContent className="p-4">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-2xl font-bold mt-1">{value}</p>
      </CardContent>
    </Card>
  );
}
