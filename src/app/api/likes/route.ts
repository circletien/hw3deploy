import { NextResponse, type NextRequest } from "next/server";

import { and, eq, sql } from "drizzle-orm";
import { z } from "zod";

import { db } from "@/db";
import { likesTable } from "@/db/schema";

const likeEventRequestSchema = z.object({
  eventId: z.number().positive(),
  userHandle: z.string().min(1).max(50),
});

type LikeEventRequest = z.infer<typeof likeEventRequestSchema>;

export async function GET(request: NextRequest) {
  const data = await request.json();

  try {
    likeEventRequestSchema.parse(data);
  } catch (error) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  // Now we can safely use the data from the request body
  // the `as` keyword is a type assertion, this tells typescript
  // that we know what we're doing and that the data is of type LikeEventRequest.
  // This is safe now because we've already validated the data with zod.
  const { eventId, userHandle } = data as LikeEventRequest;

  try {
    // This is a common pattern to check if a row exists
    // if the query returns a row with a dummy column of value 1
    // then the row which satisfies the condition exists.
    // You can also select any column here, but since we don't need
    // any of those data, we just select a dummy column of constant value 1,
    // this saves us from copying any data from the disk to the memory.
    //
    // You can also do this with count(*) and check if the count is greater than 0.
    const [exist] = await db
      .select({ dummy: sql`1` })
      .from(likesTable)
      .where(
        and(
          eq(likesTable.eventId, eventId),
          eq(likesTable.userHandle, userHandle),
        ),
      )
      .execute();
    // The NextResponse object is a easy to use API to handle responses.
    // IMHO, it's more concise than the express API.
    return NextResponse.json({ liked: Boolean(exist) }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  const data = await request.json();

  try {
    likeEventRequestSchema.parse(data);
  } catch (error) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const { eventId, userHandle } = data as LikeEventRequest;

  try {
    await db
      .insert(likesTable)
      .values({
        eventId,
        userHandle,
      })
      .onConflictDoNothing()
      .execute();
  } catch (error) {
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 },
    );
  }

  return new NextResponse("OK", { status: 200 });
}

export async function DELETE(request: NextRequest) {
  const data = await request.json();

  try {
    likeEventRequestSchema.parse(data);
  } catch (error) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const { eventId, userHandle } = data as LikeEventRequest;

  try {
    await db
      .delete(likesTable)
      .where(
        and(
          eq(likesTable.eventId, eventId),
          eq(likesTable.userHandle, userHandle),
        ),
      )
      .execute();
  } catch (error) {
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 },
    );
  }

  return new NextResponse("OK", { status: 200 });
}
