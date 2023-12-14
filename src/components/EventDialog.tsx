"use client";

import { useRef, useState } from "react";

// import { usePathname, useRouter } from "next/navigation";
// import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogFooter,
//   DialogHeader,
//   DialogTitle,
// } from "@/components/ui/dialog";
import Dialog from "@mui/material/Dialog";
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
// import { cn, validateTime, checkTimeDetail } from "@/lib/utils";
import { cn, validateTime } from "@/lib/utils";
import useTweet from "@/hooks/useTweet";
import useUserInfo from "@/hooks/useUserInfo";

type EventDialogProps = {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

export default function EventDialog({open, setOpen}: EventDialogProps) {
  // const router = useRouter();
  // const pathname = usePathname();
  // const searchParams = useSearchParams();
  const titleInputRef = useRef<HTMLInputElement>(null);
  const startTimeInputRef = useRef<HTMLInputElement>(null);
  const endTimeInputRef = useRef<HTMLInputElement>(null);
  const [startTimeError, setStartTimeError] = useState(false);
  const [endTimeError, setEndTimeError] = useState(false);
  const { postTweet } = useTweet();
  const { handle } = useUserInfo();
  

  // handleSave modifies the query params to set the title and time
  // we get from the input fields. src/app/page.tsx will read the query params
  // and insert the event into the database.
  const handleSave = async () => {
    const title = titleInputRef.current?.value;
    const start = startTimeInputRef.current?.value;
    const end = endTimeInputRef.current?.value;

    const newStartTimeError = !validateTime(start);
    setStartTimeError(newStartTimeError);
    const newEndTimeError = !validateTime(end);
    setEndTimeError(newEndTimeError);
    // const timeDetailError = !checkTimeDetail(start, end);
    if (newStartTimeError || newEndTimeError /*|| timeDetailError*/) {
      return false;
    }



    if (!title) return;
    if (!handle) return;
    if (!start) return;
    if (!end) return;
    try {
      await postTweet({
        handle,
        title,
        startTime: start,
        endTime: end,
      });
      titleInputRef.current.value = "";
      
    } catch (e) {
      console.error(e);
      alert("Error posting tweet");
    }
    // when navigating to the same page with different query params, we need to
    // preserve the pathname, so we need to manually construct the url
    // we can use the URLSearchParams api to construct the query string
    // We have to pass in the current query params so that we can preserve the
    // other query params. We can't set new query params directly because the
    // searchParams object returned by useSearchParams is read-only.
    // const params = new URLSearchParams(searchParams);
    // params.set("startTime", start!);
    // params.set("endTime", end!);
    // params.set("title", title!);
    // router.push(`${pathname}?${params.toString()}`);
    setOpen(false);
    // like the event he added
 
    // router.push(`${pathname}/event/{id}`);


    return true;
  };


  return (
    <Dialog open={open} onClose={()=>setOpen(false)}>
      <DialogContent className="sm:max-w-[425px]">
        {/* <DialogHeader> */}
          <DialogTitle>Add Event</DialogTitle>
        {/* </DialogHeader> */}
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Event title
            </Label>
            <Input
              placeholder="Event title"
              // defaultValue={searchParams.get("title") ?? ""}
              className={"col-span-3"}
              ref={titleInputRef}
              required
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Date
            </Label>
            <div className="col-span-3 flex-col items-center gap-2">
              <div className="flex col-span-3 items-center gap-2">
              <span>From</span>
              <Input
                placeholder="YYYY-MM-DD HH"
                // defaultValue={searchParams.get("startTime") ?? ""}
                className={cn(startTimeError && "border-red-500")}
                ref={startTimeInputRef}
              /></div>
              {startTimeError && (<p className="col-span-3 col-start-2 text-xs text-red-500">wrong format. YYYY-MM-DD HH</p>)}
              <div className="flex col-span-2 items-center gap-2">
              <span>To</span>
              <Input
                placeholder="YYYY-MM-DD HH"
                // defaultValue={searchParams.get("endTime") ?? ""}
                className={cn(endTimeError && "border-red-500")}
                ref={endTimeInputRef}
              /></div>
              {endTimeError && (<p className="col-span-3 col-start-2 text-xs text-red-500">wrong format. YYYY-MM-DD HH</p>)}
            </div>
          </div>
        </div>
        {/* <DialogFooter> */}
          <Button onClick={handleSave}>save</Button>
        {/* </DialogFooter> */}
      </DialogContent>
    </Dialog>
  );
}
