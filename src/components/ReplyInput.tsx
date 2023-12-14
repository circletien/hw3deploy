"use client";

import { useRef } from "react";

import GrowingTextarea from "@/components/GrowingTextarea";
import UserAvatar from "@/components/UserAvatar";
import useTweet from "@/hooks/useTweet";
import useUserInfo from "@/hooks/useUserInfo";
import { cn } from "@/lib/utils";

type ReplyInputProps = {
  replyToEventId: number;
  replyToHandle: string;
  replyToTitle: string;
  ableReply: boolean;
};

export default function ReplyInput({
  replyToEventId,
  // replyToHandle,
  replyToTitle,
  ableReply,
}: ReplyInputProps) {
  const { handle } = useUserInfo();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { postTweet, loading } = useTweet();
  // const [ableReply, setAbleReply] = useState(false);

  // useEffect(() => {
  //   console.log(replyToHandle);
  //   console.log(handle);
  //   console.log(loading);
    
  //   console.log("ableReply = "+ableReply);
  // }, [ableReply]);

  const handleReply = async () => {
    const title = textareaRef.current?.value;
    if (!title) return;
    if (!handle) return;

    try {
      await postTweet({
        handle,
        title,
        replyToEventId,
      });
      textareaRef.current.value = "";
      // this triggers the onInput event on the growing textarea
      // thus triggering the resize
      // for more info, see: https://developer.mozilla.org/en-US/docs/Web/API/Event
      textareaRef.current.dispatchEvent(
        new Event("input", { bubbles: true, composed: true }),
      );
    } catch (e) {
      console.error(e);
      alert("Error posting reply");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if(e.key === 'Enter' && !e.shiftKey)
    {
      // console.log("enter");
      e.preventDefault();
      handleReply();
    }
  }

  return (
    // this allows us to focus (put the cursor in) the textarea when the user
    // clicks anywhere on the div
    <div onClick={() => textareaRef.current?.focus()}>
      <div className="grid grid-cols-[fit-content(48px)_1fr] gap-4 px-4 pt-4">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <UserAvatar className="col-start-1 row-start-2 h-12 w-12" />
        {!ableReply && <p className="col-start-2 row-start-1 text-gray-500">
          Join <span className="text-brand">{replyToTitle}</span> to reply!
        </p>}
        {ableReply && 
        <GrowingTextarea
          ref={textareaRef}
          wrapperClassName="col-start-2 row-start-2"
          className="bg-transparent text-xl outline-none placeholder:text-gray-500 w-full"
          placeholder="say something..."
          onKeyPress={handleKeyPress}
          // onChange={handleKeyPress}
        />}
      </div>
      <div className="p-4 text-end">
        <button
          className={cn(
            "my-2 rounded-full bg-brand px-4 py-2 text-white transition-colors hover:bg-brand/70",
            "disabled:cursor-not-allowed disabled:bg-brand/40 disabled:hover:bg-brand/40",
          )}
          onClick={handleReply}
          disabled={loading || !ableReply}
        >
          Reply
        </button>
      </div>
    </div>
  );
}
