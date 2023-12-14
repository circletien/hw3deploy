"use client";

import { useState } from "react";
import type { EventHandler, MouseEvent } from "react";

import { UserCheck } from "lucide-react";

import useLike from "@/hooks/useLike";
import { cn } from "@/lib/utils";

type LikeButtonProps = {
  initialLikes: number;
  initialLiked?: boolean;
  eventId: number;
  handle?: string;
};

export default function LikeButton({
  initialLikes,
  initialLiked,
  eventId,
  handle,
}: LikeButtonProps) {
  const [liked, setLiked] = useState(initialLiked);
  const [likesCount, setLikesCount] = useState(initialLikes);
  const { likeEvent, unlikeEvent, loading } = useLike();

  const handleClick: EventHandler<MouseEvent> = async (e) => {
    // since the parent node of the button is a Link, when we click on the
    // button, the Link will also be clicked, which will cause the page to
    // navigate to the tweet page, which is not what we want. So we stop the
    // event propagation and prevent the default behavior of the event.
    e.stopPropagation();
    e.preventDefault();
    if (!handle) return;
    if (liked) {
      await unlikeEvent({
        eventId,
        userHandle: handle,
      });
      setLikesCount((prev) => prev - 1);
      setLiked(false);
    } else {
      await likeEvent({
        eventId,
        userHandle: handle,
      });
      setLikesCount((prev) => prev + 1);
      setLiked(true);
    }
  };

  return (
    <button
      className={cn(
        "flex w-16 items-center gap-1 hover:text-brand",
        liked && "text-brand",
      )}
      onClick={handleClick}
      disabled={loading}
    >
      <div
        className={cn(
          "flex items-center gap-1 rounded-full p-1.5 transition-colors duration-300 hover:bg-brand/10",
          liked && "bg-brand/10",
        )}
      >
        <UserCheck size={18} /><span>join</span>
      </div>
      {likesCount > 0 && likesCount}
    </button>
  );
}
