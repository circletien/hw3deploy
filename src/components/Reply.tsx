
import { Separator } from "@/components/ui/separator";
import { getAvatar } from "@/lib/utils";


type ReplyProps = {
  handle?: string;
  id: number;
  username?: string;
  authorName: string;
  authorHandle: string;
  title: string;
  likes: number;
  liked?: boolean;
};

// note that the event component is also a server component
// all client side things are abstracted away in other components
export default function Reply({
  // handle,
  // id,
  // username,
  authorName,
  authorHandle,
  title,
  // likes,
  // liked,
}: ReplyProps) {
  // console.log("Event");
  return (
    <>
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
            {/* <div className="my-2 flex items-center justify-between gap-4 text-gray-400">
              <LikeButton
                initialLikes={likes}
                initialLiked={liked}
                eventId={id}
                handle={handle}
              />
            </div> */}
          </div>
        </div>
      <Separator />
    </>
  );
}
