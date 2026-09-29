import HomeThemed from "@/components/HomeThemed";
import { getFeaturedPosts } from "@/lib/blog/featured";

export default function Home() {
  return <HomeThemed featured={getFeaturedPosts(2)} />;
}
