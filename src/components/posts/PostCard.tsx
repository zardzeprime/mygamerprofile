import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Heart, MessageCircle, MoreHorizontal, Trash2, Edit2 } from "lucide-react";
import { useI18n } from "@/i18n";
import { useAuth } from "@/hooks/useAuth";
import { UserAvatar } from "@/components/common/UserAvatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Textarea } from "@/components/ui/textarea";
import {
  toggleReaction,
  updatePost,
  deletePost,
  createComment,
  listComments,
} from "@/lib/posts.functions";
import { useServerFn } from "@tanstack/react-start";

type CommentItem = Awaited<ReturnType<typeof createComment>>;

interface PostCardProps {
  post: {
    id: string;
    body: string;
    image_url?: string | null;
    created_at: string;
    updated_at?: string;
    author?: {
      id: string;
      username: string;
      display_name: string;
      avatar_url?: string | null;
    } | null;
    game?: { id: string; slug: string; name: string } | null;
    reactions?: { user_id: string; reaction_type: string }[] | number;
  };
}

export function PostCard({ post }: PostCardProps) {
  const { t } = useI18n();
  const { user } = useAuth();
  const isOwn = user?.id === post.author?.id;
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(
    Array.isArray(post.reactions)
      ? post.reactions.length
      : typeof post.reactions === "number"
        ? post.reactions
        : 0,
  );
  const [editing, setEditing] = useState(false);
  const [body, setBody] = useState(post.body);
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [commentBody, setCommentBody] = useState("");

  const doToggle = useServerFn(toggleReaction);
  const doUpdate = useServerFn(updatePost);
  const doDelete = useServerFn(deletePost);
  const doComment = useServerFn(createComment);
  const doListComments = useServerFn(listComments);

  const handleLike = async () => {
    if (!user) return;
    const res = await doToggle({ data: { post_id: post.id } });
    setLiked(res.liked);
    setLikeCount((c) => (res.liked ? c + 1 : c - 1));
  };

  const handleUpdate = async () => {
    await doUpdate({ data: { id: post.id, body } });
    setEditing(false);
  };

  const handleDelete = async () => {
    if (!confirm(t("post.deleteConfirm"))) return;
    await doDelete({ data: { id: post.id } });
  };

  const loadComments = async () => {
    if (comments.length > 0) {
      setCommentsOpen((v) => !v);
      return;
    }
    const rows = await doListComments({ data: { postId: post.id } });
    setComments(rows);
    setCommentsOpen(true);
  };

  const submitComment = async () => {
    if (!commentBody.trim() || !user) return;
    const comment = await doComment({ data: { post_id: post.id, body: commentBody.trim() } });
    setComments((prev) => [...prev, comment]);
    setCommentBody("");
  };

  return (
    <article className="surface-panel rounded-xl p-4">
      <div className="flex items-start gap-3">
        <Link to="/u/$username" params={{ username: post.author?.username ?? "" }}>
          <UserAvatar src={post.author?.avatar_url} name={post.author?.display_name} size="md" />
        </Link>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Link
                to="/u/$username"
                params={{ username: post.author?.username ?? "" }}
                className="truncate font-semibold hover:underline"
              >
                {post.author?.display_name}
              </Link>
              <span className="text-sm text-muted-foreground">@{post.author?.username}</span>
              {post.game && (
                <Link
                  to="/games/$slug"
                  params={{ slug: post.game.slug }}
                  className="rounded-full bg-gold-soft/40 px-2 py-0.5 text-xs text-gold-foreground"
                >
                  {post.game.name}
                </Link>
              )}
            </div>
            {isOwn && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="size-8">
                    <MoreHorizontal className="size-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setEditing(true)}>
                    <Edit2 className="mr-2 size-4" />
                    {t("post.edit")}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleDelete} className="text-destructive">
                    <Trash2 className="mr-2 size-4" />
                    {t("post.delete")}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>

          {editing ? (
            <div className="mt-2 space-y-2">
              <Textarea value={body} onChange={(e) => setBody(e.target.value)} />
              <div className="flex gap-2">
                <Button size="sm" onClick={handleUpdate}>
                  {t("common.save")}
                </Button>
                <Button size="sm" variant="outline" onClick={() => setEditing(false)}>
                  {t("common.cancel")}
                </Button>
              </div>
            </div>
          ) : (
            <p className="mt-2 whitespace-pre-wrap text-sm text-foreground">{body}</p>
          )}

          {post.image_url && (
            <img src={post.image_url} alt="" className="mt-3 max-h-80 rounded-lg object-cover" />
          )}

          <div className="mt-4 flex items-center gap-4">
            <button
              type="button"
              onClick={handleLike}
              className={`flex items-center gap-1 text-sm ${liked ? "text-gold-strong" : "text-muted-foreground"}`}
            >
              <Heart className={`size-4 ${liked ? "fill-current" : ""}`} />
              {likeCount}
            </button>
            <button
              type="button"
              onClick={loadComments}
              className="flex items-center gap-1 text-sm text-muted-foreground"
            >
              <MessageCircle className="size-4" />
              {comments.length || t("post.comments")}
            </button>
          </div>

          {commentsOpen && (
            <div className="mt-4 space-y-3 border-t border-border pt-3">
              {comments.map((comment) => (
                <div key={comment.id} className="flex gap-2">
                  <UserAvatar
                    src={comment.author?.avatar_url}
                    name={comment.author?.display_name}
                    size="sm"
                  />
                  <div className="flex-1 rounded-lg bg-muted p-2 text-sm">
                    <span className="font-semibold">{comment.author?.display_name}</span>
                    <p>{comment.body}</p>
                  </div>
                </div>
              ))}
              {user && (
                <div className="flex gap-2">
                  <Textarea
                    value={commentBody}
                    onChange={(e) => setCommentBody(e.target.value)}
                    placeholder={t("post.writeComment")}
                    className="min-h-[3rem] flex-1"
                  />
                  <Button onClick={submitComment} disabled={!commentBody.trim()}>
                    {t("post.comment")}
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
