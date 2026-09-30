import { useState } from "react";
import { useI18n } from "@/i18n";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { createPost } from "@/lib/posts.functions";
import { useServerFn } from "@tanstack/react-start";

interface PostComposerProps {
  gameId?: string;
  onCreated?: (post: Awaited<ReturnType<typeof createPost>>) => void;
}

export function PostComposer({ gameId, onCreated }: PostComposerProps) {
  const { t } = useI18n();
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(false);
  const submit = useServerFn(createPost);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!body.trim()) return;
    setLoading(true);
    const post = await submit({ data: { body: body.trim(), game_id: gameId } });
    setLoading(false);
    setBody("");
    onCreated?.(post);
  };

  return (
    <form onSubmit={handleSubmit} className="surface-panel rounded-xl p-4">
      <Textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder={t("post.placeholder")}
        rows={3}
        maxLength={2000}
      />
      <div className="mt-3 flex justify-end">
        <Button type="submit" disabled={!body.trim() || loading}>
          {loading ? t("common.loading") : t("post.submit")}
        </Button>
      </div>
    </form>
  );
}
