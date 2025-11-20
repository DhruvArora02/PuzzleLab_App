"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "./ui/input";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "./ui/dialog";

export function PlayPuzzle() {
  const [puzzleId, setPuzzleId] = useState("");
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handlePlay = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    if (!puzzleId.trim()) {
      setError("Please enter a valid Puzzle ID.");
      return;
    }

    // Redirect to the play page using the provided puzzle id
    router.push(`/play/${puzzleId}`);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Play Puzzle</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Enter Puzzle ID</DialogTitle>
          <DialogDescription>
            Type the Puzzle ID to start playing.
          </DialogDescription>
        </DialogHeader>
        {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
        <form onSubmit={handlePlay} className="flex flex-col gap-3 mt-3">
          <Input
            type="text"
            placeholder="Puzzle ID"
            value={puzzleId}
            onChange={(e) => setPuzzleId(e.target.value)}
            className="border p-2 rounded"
            required
          />
          <DialogFooter className="flex justify-between">
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button type="submit" variant="default">
              Start
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}