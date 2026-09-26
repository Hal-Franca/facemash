import { redirect } from "next/navigation";

// Single-universe for now (DC). Marvel/Anime mount under /marvel, /anime later.
export default function Root() {
  redirect("/dc/arena");
}
