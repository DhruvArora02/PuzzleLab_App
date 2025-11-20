"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useSettings } from "@/contexts/SettingsContext"; // Import SettingsContext

interface Puzzle {
  id: number;
  title: string;
  description: string;
  createdAt: string;
  lastUpdated: string;
  status: "PRIVATE" | "PUBLIC" | "UNLISTED" | "DRAFT_CREATE" | "DRAFT_HINT";
  creator: { id: number; username: string };
  likeCount?: number;
  favoriteCount?: number;
}

export default function MyPuzzles() {
  const router = useRouter();
  const { settings } = useSettings(); // Use settings to check login
  const [activeTab, setActiveTab] = useState<"my" | "public">("my");

  const [myPuzzles, setMyPuzzles] = useState<Puzzle[]>([]);
  const [publicPuzzles, setPublicPuzzles] = useState<Puzzle[]>([]);

  const [page, setPage] = useState({ my: 0, public: 0 });
  const [loading, setLoading] = useState({ my: false, public: false });
  const [hasMore, setHasMore] = useState({ my: true, public: true });

  const LIMIT = 12;
  const BACKEND = process.env.NEXT_PUBLIC_BACKEND;

  const fetchPuzzles = async (type: "my" | "public") => {
    if (loading[type] || !hasMore[type]) return;

    // If fetching my puzzles but not logged in, do nothing
    if (type === "my" && !settings.isLoggedIn) return;

    setLoading((l) => ({ ...l, [type]: true }));
    try {
      const token = localStorage.getItem("token");
      const userId = localStorage.getItem("userId");
      const currentPage = type === "my" ? page.my : page.public;

      let url = "";
      let headers: Record<string, string> = {};

      if (type === "my") {
        url = `${BACKEND}/users/${userId}/puzzles?page=${currentPage}&limit=${LIMIT}`;
        if (token) headers.Authorization = `Bearer ${token}`;
      } else {
        url = `${BACKEND}/puzzles?page=${currentPage}&limit=${LIMIT}`;
        // For public puzzles, do NOT send Authorization if token doesn't exist
        if (token) headers.Authorization = `Bearer ${token}`;
      }

      const res = await fetch(url, {
        headers,
      });
      
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || `HTTP ${res.status}`);
      }      

      const { puzzles: incoming }: { puzzles: Puzzle[] } = await res.json();

      if (type === "my") {
        setMyPuzzles((prev) => {
          const unique = incoming.filter((p) => !prev.some((x) => x.id === p.id));
          return [...prev, ...unique];
        });
        setPage((p) => ({ ...p, my: p.my + 1 }));
        setHasMore((h) => ({ ...h, my: incoming.length === LIMIT }));
      } else {
        setPublicPuzzles((prev) => {
          const unique = incoming.filter((p) => !prev.some((x) => x.id === p.id));
          return [...prev, ...unique];
        });
        setPage((p) => ({ ...p, public: p.public + 1 }));
        setHasMore((h) => ({ ...h, public: incoming.length === LIMIT }));
      }
    } catch (err) {
      console.error("Error fetching puzzles:", err);
    } finally {
      setLoading((l) => ({ ...l, [type]: false }));
    }
  };

  useEffect(() => {
    if (activeTab === "my" && myPuzzles.length === 0) fetchPuzzles("my");
    if (activeTab === "public" && publicPuzzles.length === 0) fetchPuzzles("public");
  }, [activeTab, settings.isLoggedIn]); // Watch login state!

  useEffect(() => {
    const onScroll = () => {
      if (
        window.innerHeight + document.documentElement.scrollTop >=
          document.documentElement.offsetHeight - 100 &&
        hasMore[activeTab] &&
        !loading[activeTab]
      ) {
        fetchPuzzles(activeTab);
      }
    };
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, [activeTab, hasMore, loading, settings.isLoggedIn]);

  // Helper: Render small badge for status
  const renderStatusBadge = (status: Puzzle["status"]) => {
    let color = "";
    let label = "";

    switch (status) {
      case "PUBLIC":
        color = "bg-green-200 text-green-800";
        label = "Public";
        break;
      case "PRIVATE":
        color = "bg-gray-300 text-gray-700";
        label = "Private";
        break;
      case "UNLISTED":
        color = "bg-yellow-200 text-yellow-800";
        label = "Unlisted";
        break;
      case "DRAFT_CREATE":
        color = "bg-blue-200 text-blue-800";
        label = "Draft (Create)";
        break;
      case "DRAFT_HINT":
        color = "bg-purple-200 text-purple-800";
        label = "Draft (Hint)";
        break;
    }

    return (
      <span className={`text-xs font-semibold px-2 py-1 rounded ${color}`}>
        {label}
      </span>
    );
  };

  const renderPuzzleList = (list: Puzzle[], type: "my" | "public") => {
    if (loading[type] && list.length === 0) {
      return (
        <p className="text-center text-muted-foreground">
          Loading {type} puzzles…
        </p>
      );
    }
    if (!loading[type] && list.length === 0 && type === "my") {
      return (
        <div className="text-center mt-6">
          <p className="text-muted-foreground">You haven't created any puzzles yet.</p>
          <Button variant="outline" onClick={() => router.push("/create")}>
            Create a Puzzle
          </Button>
        </div>
      );
    }

    return (
      <div className="space-y-4 mt-4">
        {list.map((puzzle) => (
          <div
            key={puzzle.id}
            className="p-4 border rounded-lg shadow-md hover:cursor-pointer"
            onClick={() => router.push(`/play/${puzzle.id}`)} // modified link
          >
            <div className="flex justify-between items-center mb-1">
              <p className="text-xs text-gray-500">ID: {puzzle.id}</p>
              {renderStatusBadge(puzzle.status)}
            </div>
            <h2 className="text-2xl font-semibold">{puzzle.title}</h2>
            <p className="text-muted-foreground">{puzzle.description}</p>
            <p className="text-[10px] mt-2">
              by {puzzle.creator.username} on {puzzle.createdAt}
            </p>
          </div>
        ))}

        {!loading[type] && !hasMore[type] && (
          <p className="text-center text-gray-500">No more puzzles to load.</p>
        )}
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto px-4 pt-20">
      <h1 className="text-4xl font-bold mb-8 text-center">Puzzles</h1>
      <Tabs
        defaultValue="my"
        value={activeTab}
        onValueChange={(v) => setActiveTab(v as "my" | "public")}
        className="w-full"
      >
        <div className="flex justify-center">
          <TabsList className="mb-6 text-lg">
            <TabsTrigger value="my" className="px-6 py-2 text-lg">My Puzzles</TabsTrigger>
            <TabsTrigger value="public" className="px-6 py-2 text-lg">Public Puzzles</TabsTrigger>
          </TabsList>
        </div>
        <TabsContent value="my">{renderPuzzleList(myPuzzles, "my")}</TabsContent>
        <TabsContent value="public">{renderPuzzleList(publicPuzzles, "public")}</TabsContent>
      </Tabs>
    </div>
  );
}
