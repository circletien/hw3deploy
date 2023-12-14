import Link from "next/link";

// import { MessageCircle, Repeat2, Share } from "lucide-react";

import { Separator } from "@/components/ui/separator";
import { getAvatar } from "@/lib/utils";
import useLike from "@/hooks/useLike";
import LikeButton from "./LikeButton";
// import TimeText from "./TimeText";
import { useEffect } from "react";


type EventProps = {
  handle: string;
  id: number;
  username: string;
  authorName: string;
  authorHandle: string;
  title: string;
  likes: number;
  liked?: boolean;
};

// note that the event component is also a server component
// all client side things are abstracted away in other components
export default function Event({
  handle,
  id,
  username,
  authorName,
  authorHandle,
  title,
  likes,
  liked,
}: EventProps) {

  const { likeEvent } = useLike();

  const likeYourself = async () => {
      likes = likes + 1;
      // console.log("likes"+likes);
      liked = true;
      // console.log("liked"+liked);

      await likeEvent({
        eventId: id,
        userHandle: handle,
      }); 

  }
  
  useEffect(() => {
    // console.log(handle);
    // console.log(authorHandle);
    if(handle.toString() === authorHandle.toString()){
      likeYourself();
      // console.log("handle the same");  
    }
    
  }, [id]);

  return (
    <>
      <Link
        className="w-full px-4 pt-3 transition-colors hover:bg-gray-50"
        href={{
          pathname: `/event/${id}`,
          query: {
            username,
            handle,
          },
        }}
      >
        <div className="flex gap-4 w-full">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={getAvatar(authorName)}
            alt="avatar"
            className="h-12 w-12 rounded-full"
          />
          <div className="flex">
            <article className="flex grow flex-col">
              <p className="font-bold">
                {authorName}
                <span className="ml-2 font-normal text-gray-400">
                  @{authorHandle}
                </span>
              </p>
              <article className="mt-2 whitespace-pre-wrap">{title}</article>
            </article>
            <div className="my-2 flex items-center justify-between gap-4 text-gray-400">
              <LikeButton
                initialLikes={likes}
                initialLiked={liked}
                eventId={id}
                handle={handle}
              />
            </div>
          </div>
        </div>
      </Link>
      <Separator />
    </>
  );
}
