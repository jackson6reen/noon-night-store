import type { Metadata } from "next";
import { getDocs } from "@/lib/site";
import { PostCard } from "@/components/PostCard";

export const metadata: Metadata = {
  title: "The Journal",
  description: "Straight answers about sleep, periods, bloating and stress, written for real life and backed by research.",
};

export default function JournalPage() {
  return (
    <main id="main" className="nn-main">
      <div className="nn-container">
        <header className="nn-page-head">
          <h1>The Journal</h1>
          <p className="nn-lead">Straight answers about sleep, periods, bloating and stress, written for real life and backed by research.</p>
        </header>
        <div className="nn-post-grid" style={{ paddingBottom: 64 }}>
          {getDocs("post").map((d) => <PostCard key={d.slug} doc={d} />)}
        </div>
      </div>
    </main>
  );
}
