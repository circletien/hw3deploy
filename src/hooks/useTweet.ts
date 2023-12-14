import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import useLike from "./useLike";

export default function useTweet() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { likeEvent } = useLike();

  const postTweet = async ({
    handle,
    title,
    startTime,
    endTime,
    replyToEventId,
  }: {
    handle: string;
    title: string;
    startTime?: string;
    endTime?: string;
    replyToEventId?: number;
  }) => {
    setLoading(true);

    const res = await fetch("/api/tweets", {
      method: "POST",
      body: JSON.stringify({
        handle,
        title,
        startTime,
        endTime,
        replyToEventId,
      }),
    });

    if (!res.ok) {
      const body = await res.json();
      // console.log("hooooo");
      // console.log(body.error);
      throw new Error(body.error);
    }

    // router.refresh() is a Next.js function that refreshes the page without
    // reloading the page. This is useful for when we want to update the UI
    // from server components.
    const body = await res.json();
    if(startTime){
      // console.log("hiii");
      router.push(`/event/${body.eventId}/?${searchParams.toString()}`);
      await likeEvent({
        eventId: body.eventId,
        userHandle: handle,
      });
    }
    else{
      router.refresh();
    }   
    setLoading(false);
  };

  return {
    postTweet,
    loading,
  };
}
