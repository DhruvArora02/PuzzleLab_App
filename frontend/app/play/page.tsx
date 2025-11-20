"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";

interface APICell {
    character: string;
    label: number;
    hint_across: number;
    hint_down: number;
    isBlocked: boolean;
}
interface Hint {
    number: number;
    direction: "ACROSS" | "DOWN";
    hint: string;
}
interface PuzzleData {
    id: string;
    title: string;
    description: string;
    gridRows: number;
    gridCols: number;
    hints: Hint[];
    likeCount: number;
    favoriteCount: number;
}

export default function PlayPuzzlePage() {
    const { puzzleId } = useParams<{ puzzleId: string }>();
    const router = useRouter();

    // — state
    const [puzzleData, setPuzzleData] = useState<PuzzleData | null>(null);
    const [rawCells, setRawCells] = useState<APICell[][]>([]);
    const [userGrid, setUserGrid] = useState<string[][]>([]);
    const [message, setMessage] = useState("");

    const [likeCount, setLikeCount] = useState(0);
    const [favoriteCount, setFavoriteCount] = useState(0);
    const [liked, setLiked] = useState(false);
    const [favorited, setFavorited] = useState(false);

    const [showFailModal, setShowFailModal] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);

    const [selectedCell, setSelectedCell] = useState<{ row: number; col: number } | null>(null);

    // — sizing
    const calculateCellSize = (rows: number, cols: number) => {
        if (typeof window === "undefined") return 40;
        const maxW = Math.min(1500, window.innerWidth - 500);
        const maxH = Math.min(1000, window.innerHeight - 250);
        const w = Math.floor(maxW / cols);
        const h = Math.floor(maxH / rows);
        return Math.max(Math.min(w, h), 40);
    };
    const [cellSize, setCellSize] = useState(40);
    useEffect(() => {
        const onResize = () => {
            if (puzzleData) {
                setCellSize(calculateCellSize(puzzleData.gridRows, puzzleData.gridCols));
            }
        };
        window.addEventListener("resize", onResize);
        return () => window.removeEventListener("resize", onResize);
    }, [puzzleData]);

    // — fetch puzzle
    useEffect(() => {
        async function fetchPuzzle() {
            setMessage(""); // clear any old error

            try {
                const token = localStorage.getItem("token");
                const headers: Record<string, string> = {};
                if (token) headers.Authorization = `Bearer ${token}`;

                const res = await fetch(
                    `${process.env.NEXT_PUBLIC_BACKEND}/puzzles/${puzzleId}?mode=play`,
                    { headers }
                );

                if (res.status === 404) {
                    setMessage("Puzzle not found.");
                    return;
                }
                if (!res.ok) {
                    setMessage(`Error ${res.status} loading puzzle.`);
                    return;
                }

                const { puzzle: raw } = await res.json();

                // parse grid
                let parsed: APICell[][];
                try {
                    parsed = JSON.parse(raw.cells);
                } catch {
                    setMessage("Corrupted puzzle data.");
                    return;
                }
                const rows = parsed.length;
                const cols = parsed[0]?.length || 0;

                // parse hints
                let hints: Hint[];
                try {
                    hints = JSON.parse(raw.hints).map((h: any) => ({
                        number: h.label,
                        direction: h.direction,
                        hint: h.hint,
                    }));
                } catch {
                    setMessage("Corrupted hints data.");
                    return;
                }

                // seed everything
                setPuzzleData({
                    id: raw.id.toString(),
                    title: raw.title,
                    description: raw.description,
                    gridRows: rows,
                    gridCols: cols,
                    hints,
                    likeCount: raw.likeCount,
                    favoriteCount: raw.favoriteCount,
                });
                setRawCells(parsed);
                setUserGrid(Array(rows).fill(null).map(() => Array(cols).fill("")));
                setCellSize(calculateCellSize(rows, cols));
                setLikeCount(raw.likeCount);
                setFavoriteCount(raw.favoriteCount);

                // load whether user already liked/favorited
                if (token) {
                    try {
                        const meRes = await fetch(`${process.env.NEXT_PUBLIC_BACKEND}/users/me`, { headers });
                        if (meRes.ok) {
                            const meData = await meRes.json();
                            // Adjust these if your me endpoint nests inside `user`
                            const likedIds: number[] = meData.likedPuzzleIds ?? meData.user?.likedPuzzleIds ?? [];
                            const favIds: number[] = meData.favoritedPuzzleIds ?? meData.user?.favoritedPuzzleIds ?? [];
                            setLiked(likedIds.includes(+puzzleId));
                            setFavorited(favIds.includes(+puzzleId));
                        }
                    } catch {
                        // silently ignore
                    }
                }

            } catch (err) {
                console.error(err);
                setMessage("Error loading puzzle. Please try again later.");
            }
        }
        fetchPuzzle();
    }, [puzzleId]);

    // — focus first non-block
    useEffect(() => {
        if (!rawCells.length) return;
        outer: for (let r = 0; r < rawCells.length; r++) {
            for (let c = 0; c < rawCells[0].length; c++) {
                if (!rawCells[r][c].isBlocked) {
                    setSelectedCell({ row: r, col: c });
                    break outer;
                }
            }
        }
    }, [rawCells]);

    // — navigation helper
    function findNextCell(r: number, c: number) {
        const rows = rawCells.length;
        const cols = rawCells[0].length;
        let rr = r, cc = c;
        do {
            cc++;
            if (cc >= cols) {
                cc = 0;
                rr++;
                if (rr >= rows) rr = 0;
            }
            if (!rawCells[rr][cc].isBlocked) return { row: rr, col: cc };
        } while (rr !== r || cc !== c);
        return null;
    }

    // — catch keystrokes
    const handleKeyPress = (e: React.KeyboardEvent<HTMLDivElement>) => {
        if (!selectedCell) return;
        const { row, col } = selectedCell;

        if (e.key.length === 1 && /[a-zA-Z]/.test(e.key)) {
            const g = userGrid.map(r => [...r]);
            g[row][col] = e.key.toUpperCase();
            setUserGrid(g);
            const nxt = findNextCell(row, col);
            if (nxt) setSelectedCell(nxt);
            return;
        }
        if (e.key === "Backspace") {
            const g = userGrid.map(r => [...r]);
            g[row][col] = "";
            setUserGrid(g);
            return;
        }
        if (e.key === "ArrowRight") {
            const nxt = findNextCell(row, col);
            if (nxt) setSelectedCell(nxt);
        }
    };

    // — submit
    const handleSubmit = async () => {
        if (!puzzleData) return;
        const completed = rawCells.map((row, r) =>
            row.map((cell, c) => ({
                character: userGrid[r][c] || "",
                label: cell.label,
                hint_across: cell.hint_across,
                hint_down: cell.hint_down,
            }))
        );
        try {
            const res = await fetch(
                `${process.env.NEXT_PUBLIC_BACKEND}/puzzles/${puzzleId}/validate`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ cells: JSON.stringify(completed) }),
                }
            );
            if (!res.ok) throw new Error();
            const { complete } = await res.json();
            complete ? setShowSuccessModal(true) : setShowFailModal(true);
        } catch {
            setMessage("Error checking answer. Please try again.");
        }
    };

    // — like/fav
    const token = localStorage.getItem("token");
    const handleLike = async () => {
        if (!puzzleData || !token) return;
        try {
            const action = liked ? "unlike" : "like";
            const res = await fetch(
                `${process.env.NEXT_PUBLIC_BACKEND}/puzzles/${puzzleId}/${action}`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            if (!res.ok) throw new Error();
            setLiked(!liked);
            setLikeCount(c => c + (liked ? -1 : 1));
        } catch {
            setMessage("Could not update like. Please try again.");
        }
    };
    const handleFavorite = async () => {
        if (!puzzleData || !token) return;
        try {
            const action = favorited ? "unfavorite" : "favorite";
            const res = await fetch(
                `${process.env.NEXT_PUBLIC_BACKEND}/puzzles/${puzzleId}/${action}`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            if (!res.ok) throw new Error();
            setFavorited(!favorited);
            setFavoriteCount(c => c + (favorited ? -1 : 1));
        } catch {
            setMessage("Could not update favorite. Please try again.");
        }
    };

    // — loading / error
    if (!puzzleData) {
        return (
            <div className="py-8 text-center">
                <span className="text-red-500 dark:text-red-400">{message}</span>
            </div>
        );
    }

    // — render
    const { gridRows, gridCols, title, description, hints } = puzzleData;
    const cellStyles = {
        container: { width: `${cellSize}px`, height: `${cellSize}px` },
        input: { fontSize: `${Math.max(cellSize * 0.6, 20)}px` },
    };

    return (
        <div
            className="p-4 flex flex-col items-center outline-none focus:outline-none focus:ring-0 max-w-full overflow-x-hidden"
            tabIndex={0}
            onKeyDown={handleKeyPress}
        >
            <div className="flex flex-wrap gap-8 w-full justify-center">
                {/* Grid */}
                <div>
                    <div
                        className="grid gap-1"
                        style={{ gridTemplateColumns: `repeat(${gridCols}, ${cellSize}px)` }}
                    >
                        {rawCells.map((row, r) =>
                            row.map((cell, c) => {
                                const isSel =
                                    selectedCell?.row === r && selectedCell?.col === c;
                                return (
                                    <div
                                        key={`${r}-${c}`}
                                        className={`
                      relative select-none flex items-center justify-center
                      border border-gray-300 dark:border-gray-600
                      ${cell.isBlocked ? "bg-black" : "bg-white"}
                      ${isSel ? "ring-2 ring-blue-500" : ""}
                    `}
                                        style={cellStyles.container}
                                        onClick={() =>
                                            !cell.isBlocked && setSelectedCell({ row: r, col: c })
                                        }
                                    >
                                        {cell.label > 0 && (
                                            <div className="absolute top-0 left-0 text-sm p-1 text-black dark:text-white">
                                                {cell.label}
                                            </div>
                                        )}
                                        {!cell.isBlocked && (
                                            <span
                                                className="w-full h-full flex items-center justify-center select-none text-black dark:text-white"
                                                style={cellStyles.input}
                                            >
                                                {userGrid[r][c]}
                                            </span>
                                        )}
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>

                {/* Sidebar */}
                <div className="w-70 flex flex-col overflow-y-auto max-h-[80vh] px-1">
                    <h1 className="text-2xl font-semibold mb-2 text-foreground">
                        {title}
                    </h1>
                    <p className="mb-4 text-muted-foreground">{description}</p>

                    <h2 className="font-medium mb-2 text-foreground">Hints</h2>
                    {hints.map((h, i) => (
                        <p key={i} className="text-muted-foreground">
                            {h.number} {h.direction}: {h.hint}
                        </p>
                    ))}

                    <Button className="mt-4" onClick={handleSubmit}>
                        Submit Answer
                    </Button>
                    {message && (
                        <p className="text-red-500 dark:text-red-400 mt-2">{message}</p>
                    )}

                    <div className="flex gap-2 mt-8">
                        <Button variant="outline" onClick={handleLike} disabled={!token}>
                            {liked ? "💔 Unlike" : "❤️ Like"} ({likeCount})
                        </Button>
                        <Button variant="outline" onClick={handleFavorite} disabled={!token}>
                            {favorited ? "★ Unfavorite" : "☆ Favorite"} ({favoriteCount})
                        </Button>
                    </div>
                </div>
            </div>

            {/* Failure Modal */}
            {showFailModal && (
                <Dialog open onOpenChange={(o) => !o && setShowFailModal(false)}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>😿 Oops! Try again!</DialogTitle>
                            <DialogDescription className="text-center">
                                A few letters didn’t land in the right spots. Give it another go!
                            </DialogDescription>
                        </DialogHeader>
                    </DialogContent>
                </Dialog>
            )}

            {/* Success Modal */}
            {showSuccessModal && (
                <Dialog open onOpenChange={(o) => !o && setShowSuccessModal(false)}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>🎉 Congratulations!</DialogTitle>
                            <DialogDescription>
                                You’ve solved the puzzle!
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter className="flex justify-center space-x-4">
                            <Button
                                onClick={() => {
                                    setShowSuccessModal(false);
                                    router.push("/mypuzzles");
                                }}
                                disabled={!token}
                            >
                                My Puzzles
                            </Button>
                            <Button
                                onClick={() => {
                                    setShowSuccessModal(false);
                                    router.push("/");
                                }}
                            >
                                Home
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            )}
        </div>
    );
}
