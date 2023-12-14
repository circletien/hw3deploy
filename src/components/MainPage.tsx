"use client";

// import Link from "next/link";
import ProfileButton from "./ProfileButton";
import useUserInfo from "@/hooks/useUserInfo";
import { Button } from "@/components/ui/button";
// import search from "@/assets/search.png";
import search from "@/assets/search.png";
import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import EventDialog from "@/components/EventDialog";
import { Input } from "@/components/ui/input";
import Event from "@/components/Event";
import { useRouter } from "next/navigation";
import { Router } from "lucide-react";

type MainPageProps = {
    events: {
        id: number;
        title: string;
        username: string;
        handle: string;
        likes: number;
        liked: boolean;
        startTime: string | null;
        endTime: string | null;
    }[];
};

export default function MainPage({ events }: MainPageProps) {
    const { username, handle } = useUserInfo();
    const [dialogOpen, setDialogOpen] = useState(false);
    const InputRef = useRef<HTMLInputElement>(null);
    const [searchText, setSearchText] = useState(InputRef.current?.value??"");
    const router = useRouter();

    if(!username) return;
    if(!handle) return;
    // var searchText = InputRef.current?.value??"";
    
    const handleSearch = () => {
        // console.log("search");
        setSearchText(InputRef.current?.value??"");
        // console.log(searchText);
    };
    const handleAdd = () => {
        // console.log("add");
        setDialogOpen(true);
    };
    // console.log(InputRef.current?.value??"");
    // useEffect(() => {
    //     router.refresh();
    //   }, [dialogOpen]);

    return (
        <>
        <div className="flex-col">
            {/* <h1>start here</h1>         */}
            <div className="flex justify-between ">
                <h1 className="px-4 font-bold">user name: {username ?? ""}</h1>
                <ProfileButton />
                {/* <Link href="/">another account</Link> */}
            </div>
            <div className="flex justify-center gap-10">
                <div className="flex w-4/5 gap-2 items-center">
                    <Input type="text" placeholder="  search..." ref={InputRef} onChange={handleSearch}></Input> 
                         {/* className="items-center h-8 w-4/5 rounded-full bg-transparent border placeholder:text-gray-500" /> */}
                    <button onClick={handleSearch}><Image src={search} alt="search"/></button>
                </div>
                
                <Button onClick={handleAdd}>Add event</Button> 
                
            </div>
            <h1 className="mb-2 bg-white px-4 text-xl font-bold h-5">Events</h1>
            {events && events.filter((event => event.title.toLowerCase().includes(searchText.toLowerCase())))
    // {events
          .map((event) => (
          <Event
            key={event.id} //for mapping only
            id={event.id}
            handle={handle}
            username={username}
            authorName={event.username}
            authorHandle={event.handle}
            title={event.title}
            likes={event.likes}
            liked={event.liked}
          />
          
        ))}
        </div>
        <EventDialog open={dialogOpen} setOpen={setDialogOpen}/>
        </>
    );
  }