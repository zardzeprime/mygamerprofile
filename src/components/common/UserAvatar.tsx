import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { User } from "@supabase/supabase-js";

interface UserAvatarProps {
  user: User | null;
  src?: string | null;
  name?: string | null;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const SIZE_CLASSES = {
  sm: "size-8",
  md: "size-10",
  lg: "size-16",
};

export function UserAvatar({ user, src, name, size = "md", className }: UserAvatarProps) {
  const displayName = name ?? user?.user_metadata?.display_name ?? user?.email?.split("@")[0] ?? "?";
  const imageUrl = src ?? user?.user_metadata?.avatar_url;
  const initials = displayName.slice(0, 2).toUpperCase();

  return (
    <Avatar className={`${SIZE_CLASSES[size]} ${className ?? ""}`}>
      <AvatarImage src={imageUrl ?? undefined} alt={displayName} />
      <AvatarFallback className="bg-gold-soft text-gold-foreground text-xs font-semibold">
        {initials}
      </AvatarFallback>
    </Avatar>
  );
}
