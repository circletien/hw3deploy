import { faker } from "@faker-js/faker";
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// this utility function is used to merge tailwind classes safely
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// generate a random avatar for a user
export function getAvatar(username?: string | null) {
  faker.seed(username ? getSeed(username) : 42069);
  return faker.internet.avatar();
}

// convert username to a number for consistent seeding
function getSeed(username: string) {
  const code = new TextEncoder().encode(username);
  return Array.from(code).reduce(
    (acc, curr, i) => (acc + curr * i) % 1_000_000,
    0,
  );
}

export function validateHandle(handle?: string | null) {
  if (!handle) return false;
  return /^[a-z0-9\\._-]{1,25}$/.test(handle);
}

export function validateUsername(username?: string | null) {
  if (!username) return false;
  return /^[a-zA-Z0-9 ]{1,50}$/.test(username);
}

export function validateTime(time?: string | null) {
  if (!time) return false;
  // console.log("time.substring(4,1) = "+time.substring(4,1));
  // if (time.substring(0,1) === '0') return false;
  // if (time.substring(4,1) !== '-' || time.substring(7,1) !== '-' || time.substring(10,1) !== ' ') return false;
  

  return /^[0-9\\ -]{13}$/.test(time);
}

export function checkTimeDetail(startTime: string | undefined, endTime: string | undefined) {
  if (!startTime) return false;
  if (!endTime) return false;

  // const start = Number(startTime.substring(0,4))*365.25*24 + Number(startTime.substring(5,2))*30.5*24 + Number(startTime.substring(8,2))*24 + Number(startTime.substring(11,2));
  // const end = Number(endTime.substring(0,4))*365.25*24 + Number(endTime.substring(5,2))*30.5*24 + Number(endTime.substring(8,2))*24 + Number(endTime.substring(11,2));
  // if(start < end) return true;
  // else return false;
}