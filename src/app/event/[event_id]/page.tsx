import Link from "next/link";
import { redirect } from "next/navigation";

import { eq, desc, sql, and } from "drizzle-orm";
import {
  ArrowLeft,
  MessageCircle,
  MoreHorizontal,
  Repeat2,
  Share,
} from "lucide-react";

import LikeButton from "@/components/LikeButton";
import ReplyInput from "@/components/ReplyInput";
import TimeText from "@/components/TimeText";
import Event from "@/components/Event";
import Reply from "@/components/Reply";
import { Separator } from "@/components/ui/separator";
import { db } from "@/db";
import { likesTable, eventsTable, usersTable } from "@/db/schema";
import { getAvatar } from "@/lib/utils";

type EventPageProps = {
  params: {
    // this came from the file name: [event_id].tsx
    event_id: string;
  };
  searchParams: {
    // this came from the query string: ?username=madmaxieee
    username?: string;
    handle?: string;
  };
};

// these two fields are always available in the props object of a page component
export default async function EventPage({
  params: { event_id },
  searchParams: { username, handle },
}: EventPageProps) {
  // this function redirects to the home page when there is an error
  const errorRedirect = () => {
    const params = new URLSearchParams();
    username && params.set("username", username);
    handle && params.set("handle", handle);
    redirect(`/?${params.toString()}`);
  };

  // if the event_id can not be turned into a number, redirect to the home page
  const event_id_num = parseInt(event_id);
  if (isNaN(event_id_num)) {
    errorRedirect();
  }

  // This is the easiest way to get the event data
  // you can run separate queries for the event data, likes, and liked
  // and then combine them in javascript.
  //
  // This gets things done for now, but it's not the best way to do it
  // relational databases are highly optimized for this kind of thing
  // we should always try to do as much as possible in the database.

  // This piece of code runs the following SQL query on the events table:
  // SELECT
  //   id,
  //   content,
  //   user_handle,
  //   created_at
  //   FROM events
  //   WHERE id = {event_id_num};
  const [eventData] = await db
    .select({
      id: eventsTable.id,
      title: eventsTable.title,
      userHandle: eventsTable.userHandle,
      startTime: eventsTable.startTime,
      endTime: eventsTable.endTime,
    })
    .from(eventsTable)
    .where(eq(eventsTable.id, event_id_num))
    .execute();

  // Although typescript thinks eventData is not undefined, it is possible
  // that eventData is undefined. This can happen if the event doesn't exist.
  // Thus the destructuring assignment above is not safe. We need to check
  // if eventData is undefined before using it.
  if (!eventData) {
    errorRedirect();
  }

  // This piece of code runs the following SQL query on the events table:
  // SELECT
  //  id,
  //  FROM likes
  //  WHERE event_id = {event_id_num};
  // Since we only need the number of likes, we don't actually need to select
  // the id here, we can select a constant 1 instead. Or even better, we can
  // use the count aggregate function to count the number of rows in the table.
  // This is what we do in the next code block in likesSubquery.
  const likes = await db
    .select({
      id: likesTable.id,
    })
    .from(likesTable)
    .where(
      and(
        eq(likesTable.eventId, event_id_num),
        // eq(likesTable.userHandle, handle ?? ""),
        ),
    )
    .execute();
    // console.log(likesTable.userHandle);

  const numLikes = likes.length;

  const [liked] = await db
    .select({
      id: likesTable.id,
    })
    .from(likesTable)
    .where(
      and(
        eq(likesTable.eventId, event_id_num),
        eq(likesTable.userHandle, handle ?? ""),
      ),
    )
    .execute();
    // console.log("liked = "+liked);

  const [user] = await db
    .select({
      displayName: usersTable.displayName,
      handle: usersTable.handle,
    })
    .from(usersTable)
    .where(eq(usersTable.handle, eventData.userHandle))
    .execute();

  const event = {
    id: eventData.id,
    title: eventData.title,
    username: user.displayName,
    handle: user.handle,
    likes: numLikes,
    startTime: eventData.startTime,
    endTime: eventData.endTime,
    liked: Boolean(liked),
  };

  // The following code is almost identical to the code in src/app/page.tsx
  // read the comments there for more info.
  const likesSubquery = db.$with("likes_count").as(
    db
      .select({
        eventId: likesTable.eventId,
        likes: sql<number | null>`count(*)`.mapWith(Number).as("likes"),
      })
      .from(likesTable)
      .groupBy(likesTable.eventId),
  );

  const likedSubquery = db.$with("liked").as(
    db
      .select({
        eventId: likesTable.eventId,
        liked: sql<number>`1`.mapWith(Boolean).as("liked"),
      })
      .from(likesTable)
      .where(eq(likesTable.userHandle, handle ?? "")),
  );
  // console.log("likedSubquery"+likedSubquery);

  const replies = await db
    .with(likesSubquery, likedSubquery)
    .select({
      id: eventsTable.id,
      title: eventsTable.title,
      username: usersTable.displayName,
      handle: usersTable.handle,
      likes: likesSubquery.likes,
      startTime: eventsTable.startTime,
      endTime: eventsTable.endTime,
      liked: likedSubquery.liked,
      replyToEventId: eventsTable.replyToEventId,
    })
    .from(eventsTable)
    .where(eq(eventsTable.replyToEventId, event_id_num))
    .orderBy(desc(eventsTable.id))
    .innerJoin(usersTable, eq(eventsTable.userHandle, usersTable.handle))
    .leftJoin(likesSubquery, eq(eventsTable.id, likesSubquery.eventId))
    .leftJoin(likedSubquery, eq(eventsTable.id, likedSubquery.eventId))
    .execute();

  return (
    <>
      <div className="flex h-screen w-full flex-col pt-2">
        <div className="mb-2 flex items-center gap-8 px-4">
          <Link href={{ pathname: "/", query: { username, handle } }}>
            <ArrowLeft size={18} />
          </Link>
          <h1 className="text-xl font-bold">Forum</h1>
        </div>
        <div className="flex flex-col px-4 pt-3">
          <div className="flex justify-between">
            <div className="flex w-full gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={getAvatar(event.username)}
                alt="user avatar"
                width={48}
                height={48}
                className="h-12 w-12 rounded-full"
              />
              <div>
                <p className="font-bold">{event.username ?? ""}</p>
                <p className="font-normal text-gray-500">
                  @{event.handle ?? "..."}
                </p>
              </div>
            </div>
            <button className="h-fit rounded-full p-2.5 text-gray-400 transition-colors duration-300 hover:bg-brand/10 hover:text-brand">
              <MoreHorizontal size={16} />
            </button>
          </div>
          <article className="mt-3 whitespace-pre-wrap text-xl">
            {event.title}
          </article>
          <time className="my-4 block text-sm text-gray-500 flex gap-3">
            <div> start at <TimeText date={event.startTime} format="YYYY-MM-DD HH" /></div>
            <div> end at <TimeText date={event.endTime} format="YYYY-MM-DD HH" /></div>
          </time>
          <Separator />
          <div className="my-2 flex items-center justify-between gap-4 text-gray-400">
            {/* <button className="rounded-full p-1.5 transition-colors duration-300 hover:bg-brand/10 hover:text-brand">
              <MessageCircle size={20} className="-scale-x-100" />
            </button>
            <button className="rounded-full p-1.5 transition-colors duration-300 hover:bg-brand/10 hover:text-brand">
              <Repeat2 size={22} />
            </button> */}
            {/* <LikeYourself handle={handle} likes={event.likes} liked={event.liked} eventId={event.id}/> */}
            <LikeButton
              handle={handle}
              initialLikes={event.likes}
              initialLiked={event.liked}
              eventId={event.id}
            />
            {/* <button className="rounded-full p-1.5 transition-colors duration-300 hover:bg-brand/10 hover:text-brand">
              <Share size={18} />
            </button> */}
          </div>
          <Separator />
        </div>
        <ReplyInput replyToEventId={event.id} replyToHandle={event.handle} replyToTitle={event.title} ableReply={event.liked}/>
        <Separator />
        {replies.map((reply) => (
          <Reply
            key={reply.id} //for mapping only
            id={reply.id}
            username={username}
            handle={handle}
            authorName={reply.username}
            authorHandle={reply.handle}
            title={reply.title}
            likes={reply.likes}
            liked={reply.liked}
          />
        ))}
      </div>
    </>
  );
}
