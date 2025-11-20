'use client';
import { useState, useEffect } from 'react';
import { Square, ChevronLeft } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider"
import { useRouter } from 'next/navigation';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { LoginAndRegister } from '@/components/LoginAndRegister';
import { HelpCircle } from 'lucide-react';

// ======================
// Type & Interface Declarations
// ======================

// cell object
interface Cell {
  letter: string;
  isBlocked: boolean;
  isWordStart: boolean;
  clue?: {
    across?: string;
    down?: string;
  };
}

type Direction = 'across' | 'down';

// cell object for API
interface APICell {
  character: string;
  label: number;
  hint_across: number;
  hint_down: number;
}

// hint object for API
interface APIHint {
  hint: string;
  label: number;
  direction: "ACROSS" | "DOWN";
}

// crossword object for API
interface CrosswordData {
  title: string;
  description: string;
  cells: APICell[][];
  hints: APIHint[];
  status: string // PRIVATE, PUBLIC, DRAFT_HINT, DRAFT_CREATE, UNLISTED
}

type Mode = 'creating' | 'hinting';

interface HintInput {
  number: number;
  direction: "ACROSS" | "DOWN";
  word: string;
  hint: string;
}

// validation object
interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

// ======================
// Main Component: CreateCrossword
// ======================

export default function CreateCrossword() {
  const router = useRouter();

  const [isAuthChecked, setIsAuthChecked] = useState(false);
  const [showAuthDialog, setShowAuthDialog] = useState(false);

  const [loginDialogOpen, setLoginDialogOpen] = useState(false);
  const [loginTab, setLoginTab] = useState<"Sign In" | "Register">("Sign In"); // Initial tab state
  const [showInstructionsDialog, setShowInstructionsDialog] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setShowAuthDialog(true);
          return;
        }

        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND}/users/me`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          }
        });

        if (!response.ok) {
          setShowAuthDialog(true);
          return;
        }

        setIsAuthChecked(true);
        setShowAuthDialog(false);
      } catch (error) {
        console.error('Error checking authentication:', error);
        setShowAuthDialog(true);
      }
    };

    checkAuth();

    // Add event listener for storage changes to detect token updates
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'token') {
        checkAuth();
      }
    };

    window.addEventListener('storage', handleStorageChange);

    if (!loginDialogOpen) {
      checkAuth();
    }

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [loginDialogOpen]);

  // initialize necessary states
  const [showSizeModal, setShowSizeModal] = useState(false);
  const [gridSize, setGridSize] = useState({ rows: 5, cols: 5 });
  const [grid, setGrid] = useState<Cell[][]>([]);
  const [selectedCell, setSelectedCell] = useState<{ row: number; col: number } | null>(null);
  const [direction, setDirection] = useState<Direction>('across');
  const [showUnusedCellsDialog, setShowUnusedCellsDialog] = useState(false);
  const [crosswordData, setCrosswordData] = useState<CrosswordData | null>(null);
  const [hintInputs, setHintInputs] = useState<HintInput[]>([]);
  const [mode, setMode] = useState<Mode>('creating');
  const [showInvalidCrosswordDialog, setShowInvalidCrosswordDialog] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [crosswordStatus, setCrosswordStatus] = useState<string>("");

  // only show size modal if auth is checked and user is authenticated
  useEffect(() => {
    if (isAuthChecked) {
      setShowSizeModal(true);
    }
  }, [isAuthChecked]);

  // initializes grid after user presses "Create Grid" button
  const initializeGrid = (rows: number, cols: number) => {
    if (rows < 1 || cols < 1) {
      return;
    }
    const newGrid = Array(rows).fill(null).map(() =>
      Array(cols).fill(null).map(() => ({
        letter: '',
        isBlocked: false,
        isWordStart: false,
      }))
    );
    setGrid(newGrid);
    setShowSizeModal(false);
    setDirection('across');
    setSelectedCell(null);
    setCellSize(calculateCellSize(rows, cols));
  };

  // "+ Add Row" button
  const addRow = () => {
    const newRow = Array(gridSize.cols).fill(null).map(() => ({
      letter: '',
      isBlocked: false,
      isWordStart: false,
    }));
    setGrid([...grid, newRow]);
    const newRows = gridSize.rows + 1;
    setGridSize({ ...gridSize, rows: newRows });
    setCellSize(calculateCellSize(newRows, gridSize.cols));
  };

  // "+ Add Column" button
  const addColumn = () => {
    const newGrid = grid.map(row => [
      ...row,
      {
        letter: '',
        isBlocked: false,
        isWordStart: false,
      }
    ]);
    setGrid(newGrid);
    const newCols = gridSize.cols + 1;
    setGridSize({ ...gridSize, cols: newCols });
    setCellSize(calculateCellSize(gridSize.rows, newCols));
  };

  // "-" button for columns
  const removeColumn = () => {
    if (gridSize.cols <= 3) return;

    // Clear selectedCell if it's in the last column to avoid crash
    if (selectedCell && selectedCell.col === gridSize.cols - 1) {
      setSelectedCell(null);
    }

    const newGrid = grid.map(row => row.slice(0, -1));
    setGrid(newGrid);
    const newCols = gridSize.cols - 1;
    setGridSize({ ...gridSize, cols: newCols });
    setCellSize(calculateCellSize(gridSize.rows, newCols));
  };

  // "-" button for rows
  const removeRow = () => {
    if (gridSize.rows <= 3) return;

    // Clear selectedCell if it's in the last row to avoid crash
    if (selectedCell && selectedCell.row === gridSize.rows - 1) {
      setSelectedCell(null);
    }

    const newGrid = grid.slice(0, -1);
    setGrid(newGrid);
    const newRows = gridSize.rows - 1;
    setGridSize({ ...gridSize, rows: newRows });
    setCellSize(calculateCellSize(newRows, gridSize.cols));
  };

  // method that controls enabling / disabling of cells
  const handleCellClick = (row: number, col: number) => {

    // in hinting mode, grid is not editable
    if (mode === 'hinting') return;

    const newGrid = [...grid];
    newGrid[row][col] = {
      ...newGrid[row][col],
      isBlocked: !newGrid[row][col].isBlocked,
      letter: ''
    };
    setGrid(newGrid);
  };

  // method that controls the selecting of a cell
  const handleCellSelect = (row: number, col: number, isClick: boolean = false) => {
    if (mode === 'hinting') return;

    if (!selectedCell || selectedCell.row !== row || selectedCell.col !== col) {
      setSelectedCell({ row, col });
    } else {
      // when clicking same cell, swap direction
      setDirection(prev => prev === 'across' ? 'down' : 'across');
    }
  };

  // mthod to control cell selection while typing
  const moveToNextCell = (currentRow: number, currentCol: number) => {
    if (direction === 'across') {
      // try to move right within same row
      for (let col = currentCol + 1; col < gridSize.cols; col++) {
        if (!grid[currentRow][col].isBlocked) {
          setSelectedCell({ row: currentRow, col });
          return;
        }
      }
      // if no more available cells in same row, move to next row
      for (let row = currentRow + 1; row < gridSize.rows; row++) {
        for (let col = 0; col < gridSize.cols; col++) {
          if (!grid[row][col].isBlocked) {
            setSelectedCell({ row, col });
            return;
          }
        }
      }
    } else {
      // try to move down within same column
      for (let row = currentRow + 1; row < gridSize.rows; row++) {
        if (!grid[row][currentCol].isBlocked) {
          setSelectedCell({ row, col: currentCol });
          return;
        }
      }
      // if no available cells in same column, move to next column
      for (let col = currentCol + 1; col < gridSize.cols; col++) {
        for (let row = 0; row < gridSize.rows; row++) {
          if (!grid[row][col].isBlocked) {
            setSelectedCell({ row, col });
            return;
          }
        }
      }
    }
  };

  // method to find previous cell when user presses backspace
  const findPreviousAvailableCell = (currentRow: number, currentCol: number): { row: number; col: number } | null => {
    if (direction === 'across') {
      // first try previous cells in current row
      for (let col = currentCol - 1; col >= 0; col--) {
        if (!grid[currentRow][col].isBlocked) {
          return { row: currentRow, col };
        }
      }
      // if no cells found in current row, try previous rows from the end
      for (let row = currentRow - 1; row >= 0; row--) {
        for (let col = gridSize.cols - 1; col >= 0; col--) {
          if (!grid[row][col].isBlocked) {
            return { row, col };
          }
        }
      }
    } else {
      // first try previous cells in current column
      for (let row = currentRow - 1; row >= 0; row--) {
        if (!grid[row][currentCol].isBlocked) {
          return { row, col: currentCol };
        }
      }
      // if no cells found in current column, try previous columns from the bottom
      for (let col = currentCol - 1; col >= 0; col--) {
        for (let row = gridSize.rows - 1; row >= 0; row--) {
          if (!grid[row][col].isBlocked) {
            return { row, col };
          }
        }
      }
    }
    return null;
  };

  // size of cells dynamically changes with number of rows/columns
  const calculateCellSize = (rows: number, cols: number) => {
    if (typeof window !== 'undefined') {
      const maxGridWidth = Math.min(1500, window.innerWidth - 500);
      const maxGridHeight = Math.min(1000, window.innerHeight - 250);

      const cellWidthByWidth = Math.floor(maxGridWidth / cols);
      const cellHeightByHeight = Math.floor(maxGridHeight / rows);

      // use smaller of the two dimensions to maintain square cells
      return Math.max(Math.min(cellWidthByWidth, cellHeightByHeight), 40);
    } else return 40;
  };

  // initialize with current grid size
  const [cellSize, setCellSize] = useState(() => calculateCellSize(gridSize.rows, gridSize.cols));

  // resize handler when number of rows or columns change
  useEffect(() => {
    const handleResize = () => {
      setCellSize(calculateCellSize(gridSize.rows, gridSize.cols));
    };

    // event listener so we resize cells when user resizes browser
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [gridSize.rows, gridSize.cols]);

  const cellStyles = {
    container: {
      width: `${cellSize}px`,
      height: `${cellSize}px`
    },
    input: {
      // size of letters scales with size of cell
      fontSize: `${Math.max(cellSize * 0.6, 20)}px`
    }
  };

  // method to find connected cells so highlighting works properly 
  // without this, entire rows / columns would be highlighted, even across blocked cells
  const findConnectedCells = (row: number, col: number): { start: number; end: number } => {
    if (direction === 'across') {
      // find leftmost unblocked connected cell
      let start = col;
      while (start > 0 && !grid[row][start - 1].isBlocked) {
        start--;
      }

      // find rightmost unblocked connected cell
      let end = col;
      while (end < gridSize.cols - 1 && !grid[row][end + 1].isBlocked) {
        end++;
      }

      return { start, end };
    } else {
      // find topmost unblocked connected cell
      let start = row;
      while (start > 0 && !grid[start - 1][col].isBlocked) {
        start--;
      }

      // find bottommost unblocked connected cell
      let end = row;
      while (end < gridSize.rows - 1 && !grid[end + 1][col].isBlocked) {
        end++;
      }

      return { start, end };
    }
  };

  // method to find cell when user presses enter
  const findFirstCellInNextLine = (currentRow: number, currentCol: number): { row: number; col: number; switchDirection?: boolean } | null => {
    if (direction === 'across') {
      // first try to find empty cell in next row
      const nextRow = currentRow + 1;
      if (nextRow < gridSize.rows) {
        for (let col = 0; col < gridSize.cols; col++) {
          if (!grid[nextRow][col].isBlocked && !grid[nextRow][col].letter) {
            return { row: nextRow, col };
          }
        }
      }

      // if no empty cells in next row, search all subsequent rows
      for (let row = nextRow + 1; row < gridSize.rows; row++) {
        for (let col = 0; col < gridSize.cols; col++) {
          if (!grid[row][col].isBlocked && !grid[row][col].letter) {
            return { row, col };
          }
        }
      }

      // if wrapping around to start, switch to down direction

      // look for empty cells column by column
      for (let col = 0; col < gridSize.cols; col++) {
        for (let row = 0; row < gridSize.rows; row++) {
          if (!grid[row][col].isBlocked && !grid[row][col].letter) {
            return { row, col, switchDirection: true };
          }
        }
      }

      // if no empty cells at all, return first non-blocked cell with direction switch
      for (let col = 0; col < gridSize.cols; col++) {
        for (let row = 0; row < gridSize.rows; row++) {
          if (!grid[row][col].isBlocked) {
            return { row, col, switchDirection: true };
          }
        }
      }

    } else { // down direction

      // first try to find empty cell in next column
      const nextCol = currentCol + 1;
      if (nextCol < gridSize.cols) {
        for (let row = 0; row < gridSize.rows; row++) {
          if (!grid[row][nextCol].isBlocked && !grid[row][nextCol].letter) {
            return { row, col: nextCol };
          }
        }
      }

      // if no empty cells in next column, search all subsequent columns
      for (let col = nextCol + 1; col < gridSize.cols; col++) {
        for (let row = 0; row < gridSize.rows; row++) {
          if (!grid[row][col].isBlocked && !grid[row][col].letter) {
            return { row, col };
          }
        }
      }

      // if wrapping around to start, switch to across direction

      // look for empty cells row by row
      for (let row = 0; row < gridSize.rows; row++) {
        for (let col = 0; col < gridSize.cols; col++) {
          if (!grid[row][col].isBlocked && !grid[row][col].letter) {
            return { row, col, switchDirection: true };
          }
        }
      }

      // if no empty cells at all, return first non-blocked cell with direction switch
      for (let row = 0; row < gridSize.rows; row++) {
        for (let col = 0; col < gridSize.cols; col++) {
          if (!grid[row][col].isBlocked) {
            return { row, col, switchDirection: true };
          }
        }
      }
    }
    return null;
  };

  // keyboard functionality
  const handleKeyPress = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (!selectedCell || mode === 'hinting') return;

    // arrow keys
    if (e.key.startsWith('Arrow')) {
      e.preventDefault();
      const { row, col } = selectedCell;

      switch (e.key) {
        case 'ArrowRight':
          if (direction === 'across') {
            // move to next unblocked cell in row
            for (let nextCol = col + 1; nextCol < gridSize.cols; nextCol++) {
              if (!grid[row][nextCol].isBlocked) {
                setSelectedCell({ row, col: nextCol });
                return;
              }
            }
          } else {
            // switch to across direction if arrow right is pressed when direction is down
            setDirection('across');
          }
          break;

        case 'ArrowLeft':
          if (direction === 'across') {
            // move to previous unblocked cell in row
            for (let prevCol = col - 1; prevCol >= 0; prevCol--) {
              if (!grid[row][prevCol].isBlocked) {
                setSelectedCell({ row, col: prevCol });
                return;
              }
            }
          } else {
            // switch to across direction arrow left is pressed when direction is down
            setDirection('across');
          }
          break;

        case 'ArrowDown':
          if (direction === 'down') {
            // move to next unblocked cell in column
            for (let nextRow = row + 1; nextRow < gridSize.rows; nextRow++) {
              if (!grid[nextRow][col].isBlocked) {
                setSelectedCell({ row: nextRow, col });
                return;
              }
            }
          } else {
            // switch to down direction
            setDirection('down');
          }
          break;

        case 'ArrowUp':
          if (direction === 'down') {
            // move to previous unblocked cell in column
            for (let prevRow = row - 1; prevRow >= 0; prevRow--) {
              if (!grid[prevRow][col].isBlocked) {
                setSelectedCell({ row: prevRow, col });
                return;
              }
            }
          } else {
            // switch to down direction
            setDirection('down');
          }
          break;
      }
      return;
    }

    // enter
    if (e.key === 'Enter') {
      e.preventDefault();
      const { row, col } = selectedCell;
      const nextCell = findFirstCellInNextLine(row, col);
      if (nextCell) {
        setSelectedCell({ row: nextCell.row, col: nextCell.col });
        if (nextCell.switchDirection) {
          setDirection(direction === 'across' ? 'down' : 'across');
        }
      }
      return;
    }

    // backspace
    if (e.key === 'Backspace') {
      const { row, col } = selectedCell;
      const newGrid = [...grid];

      // clear the current cell
      newGrid[row][col] = {
        ...newGrid[row][col],
        letter: '',
      };
      setGrid(newGrid);

      // move to previous cell
      const prevCell = findPreviousAvailableCell(row, col);
      if (prevCell) {
        setSelectedCell(prevCell);
      }
    }

    // delete clears the cell without moving
    if (e.key === 'Delete') {
      const { row, col } = selectedCell;
      const newGrid = [...grid];
      newGrid[row][col] = {
        ...newGrid[row][col],
        letter: '',
      };
      setGrid(newGrid);

    } else if (e.key.length === 1 && e.key.match(/[a-zA-Z]/)) {
      const { row, col } = selectedCell;
      const newGrid = [...grid];
      newGrid[row][col] = {
        ...newGrid[row][col],
        letter: e.key.toUpperCase(),
      };
      setGrid(newGrid);
      moveToNextCell(row, col);
    }
  };

  // detects cells that are neither blocked nor contain a letter
  const findUnusedCells = (grid: Cell[][], gridSize: { rows: number; cols: number }) => {
    const unusedCells: { row: number; col: number }[] = [];

    for (let row = 0; row < gridSize.rows; row++) {
      for (let col = 0; col < gridSize.cols; col++) {
        const cell = grid[row][col];
        if (!cell.isBlocked && cell.letter === '') {
          unusedCells.push({ row, col });
        }
      }
    }

    return unusedCells;
  };

  // removes any outer rows / columns with no letters
  const removeUnusedOuterRowsAndColumns = () => {
    let newGrid = [...grid];
    let newRows = gridSize.rows;
    let newCols = gridSize.cols;
    let changed = false;

    // treat empty cells as disabled
    const isDisabledCell = (cell: Cell) => cell.isBlocked || cell.letter === '';

    // remove bottom rows if entirely disabled
    while (newRows > 3 && newGrid[newRows - 1].every(cell => isDisabledCell(cell))) {
      newGrid = newGrid.slice(0, -1);
      newRows--;
      changed = true;
    }

    // remove top rows if entirely disabled
    while (newRows > 3 && newGrid[0].every(cell => isDisabledCell(cell))) {
      newGrid = newGrid.slice(1);
      newRows--;
      changed = true;
    }

    // remove rightmost columns if entirely disabled
    while (newCols > 3 && newGrid.every(row => isDisabledCell(row[newCols - 1]))) {
      newGrid = newGrid.map(row => row.slice(0, -1));
      newCols--;
      changed = true;
    }

    // remove leftmost columns if entirely disabled
    while (newCols > 3 && newGrid.every(row => isDisabledCell(row[0]))) {
      newGrid = newGrid.map(row => row.slice(1));
      newCols--;
      changed = true;
    }

    if (changed) {
      setGrid(newGrid);
      setGridSize({ rows: newRows, cols: newCols });
      setCellSize(calculateCellSize(newRows, newCols));
    }

    return {
      grid: newGrid,
      gridSize: { rows: newRows, cols: newCols }
    };
  };

  // hint detection logic
  const handleAddHints = () => {

    setSelectedCell(null);

    // throw error is puzzle is empty
    const hasAnyLetters = grid.some(row =>
      row.some(cell => !cell.isBlocked && cell.letter)
    );

    if (!hasAnyLetters) {
      setValidationErrors(["The crossword puzzle is empty"]);
      setShowInvalidCrosswordDialog(true);
      return;
    }

    // remove unused outer rows and columns before proceeding
    const { grid: trimmedGrid, gridSize: newGridSize } = removeUnusedOuterRowsAndColumns();

    const unusedCells = findUnusedCells(trimmedGrid, newGridSize);
    const shortWords = findShortWords(trimmedGrid, newGridSize);
    const isConnected = isGridConnected(trimmedGrid, newGridSize);

    const errors: string[] = [];
    if (shortWords.length > 0) {
      errors.push("Some words are less than 3 letters long");
    }
    if (!isConnected) {
      errors.push("The crossword puzzle is not fully connected");
    }

    if (errors.length > 0) {
      setValidationErrors(errors);
      setShowInvalidCrosswordDialog(true);
      return;
    }

    if (unusedCells.length > 0) {
      setShowUnusedCellsDialog(true);
    } else {
      const { apiCells, wordStarts } = prepareGridForHints(trimmedGrid, newGridSize);

      // create hint inputs with empty hints
      const newHintInputs: HintInput[] = [];
      wordStarts.forEach(({ row, col, number, directions }) => {
        directions.forEach(direction => {
          const word = getWordAtPosition(row, col, direction, trimmedGrid, newGridSize);
          newHintInputs.push({
            number,
            direction,
            word,
            hint: ''
          });
        });
      });

      // sort hint inputs by number and direction (ACROSS before DOWN)
      newHintInputs.sort((a, b) => {
        if (a.number !== b.number) return a.number - b.number;
        return a.direction === "ACROSS" ? -1 : 1;
      });

      setHintInputs(newHintInputs);
      setCrosswordData({
        title: "",
        description: "",
        cells: apiCells,
        hints: [],
        status: "",
      });
      setMode('hinting');
    }
  };

  // automatically blocks any empty cells
  const handleDisableUnusedCells = () => {
    const newGrid = [...grid];
    const unusedCells = findUnusedCells(grid, gridSize);

    unusedCells.forEach(({ row, col }) => {
      newGrid[row][col] = {
        ...newGrid[row][col],
        isBlocked: true
      };
    });

    setGrid(newGrid);
    setShowUnusedCellsDialog(false);

    // after blocking unused cells, proceed with hint preparation
    const { apiCells, wordStarts } = prepareGridForHints(grid, gridSize);

    const newHintInputs: HintInput[] = [];
    wordStarts.forEach(({ row, col, number, directions }) => {
      directions.forEach(direction => {
        const word = getWordAtPosition(row, col, direction, grid, gridSize);
        newHintInputs.push({
          number,
          direction,
          word,
          hint: ''
        });
      });
    });

    setHintInputs(newHintInputs);
    setCrosswordData({
      title: "",
      description: "",
      cells: apiCells,
      hints: [],
      status: "",
    });
    setMode('hinting');
  };

  const prepareGridForHints = (grid: Cell[][], gridSize: { rows: number; cols: number }) => {
    let currentNumber = 1;
    const apiCells: APICell[][] = [];
    const wordStarts: { row: number; col: number; number: number; directions: ("ACROSS" | "DOWN")[] }[] = [];

    // initialize API cells with -1 hint values
    for (let row = 0; row < gridSize.rows; row++) {
      apiCells[row] = [];
      for (let col = 0; col < gridSize.cols; col++) {
        apiCells[row][col] = {
          character: grid[row][col].isBlocked ? '' : grid[row][col].letter,
          label: -1,
          hint_across: -1,
          hint_down: -1
        };
      }
    }

    // first pass: find word starts and number them
    for (let row = 0; row < gridSize.rows; row++) {
      for (let col = 0; col < gridSize.cols; col++) {
        if (grid[row][col].isBlocked) continue;

        const directions: ("ACROSS" | "DOWN")[] = [];

        // check if this is the start of an across word
        const isAcrossStart = col === 0 || grid[row][col - 1].isBlocked;
        const hasAcrossWord = isAcrossStart && col + 1 < gridSize.cols && !grid[row][col + 1].isBlocked;

        // check if this is the start of a down word
        const isDownStart = row === 0 || grid[row - 1][col].isBlocked;
        const hasDownWord = isDownStart && row + 1 < gridSize.rows && !grid[row + 1][col].isBlocked;

        if (hasAcrossWord || hasDownWord) {
          if (hasAcrossWord) directions.push("ACROSS");
          if (hasDownWord) directions.push("DOWN");

          apiCells[row][col].label = currentNumber;
          wordStarts.push({ row, col, number: currentNumber, directions });
          currentNumber++;
        }
      }
    }

    // second pass: propagate hint numbers to all cells in each word
    wordStarts.forEach(({ row, col, number, directions }) => {
      directions.forEach(direction => {
        if (direction === "ACROSS") {
          let currentCol = col;
          while (currentCol < gridSize.cols && !grid[row][currentCol].isBlocked) {
            apiCells[row][currentCol].hint_across = number;
            currentCol++;
          }
        } else {
          let currentRow = row;
          while (currentRow < gridSize.rows && !grid[currentRow][col].isBlocked) {
            apiCells[currentRow][col].hint_down = number;
            currentRow++;
          }
        }
      });
    });

    return { apiCells, wordStarts };
  };

  // get entire word to attach to hint object
  const getWordAtPosition = (startRow: number, startCol: number, direction: "ACROSS" | "DOWN", grid: Cell[][], gridSize: { rows: number; cols: number }): string => {
    let word = '';
    if (direction === "ACROSS") {
      for (let col = startCol; col < gridSize.cols && !grid[startRow][col].isBlocked; col++) {
        word += grid[startRow][col].letter;
      }
    } else {
      for (let row = startRow; row < gridSize.rows && !grid[row][startCol].isBlocked; row++) {
        word += grid[row][startCol].letter;
      }
    }
    return word;
  };

  // find any words less than 3 letters
  const findShortWords = (grid: Cell[][], gridSize: { rows: number; cols: number }) => {
    const shortWords: { row: number; col: number; direction: "ACROSS" | "DOWN" }[] = [];

    // Helper function to check if a cell has a valid letter
    const hasValidLetter = (cell: Cell) => cell.letter && cell.letter.trim().length > 0;

    for (let row = 0; row < gridSize.rows; row++) {
      for (let col = 0; col < gridSize.cols; col++) {
        if (grid[row][col].isBlocked || !hasValidLetter(grid[row][col])) continue;

        // check if this letter has any connections
        const hasConnection = (
          (col > 0 && !grid[row][col - 1].isBlocked && hasValidLetter(grid[row][col - 1])) ||
          (col < gridSize.cols - 1 && !grid[row][col + 1].isBlocked && hasValidLetter(grid[row][col + 1])) ||
          (row > 0 && !grid[row - 1][col].isBlocked && hasValidLetter(grid[row - 1][col])) ||
          (row < gridSize.rows - 1 && !grid[row + 1][col].isBlocked && hasValidLetter(grid[row + 1][col]))
        );

        if (!hasConnection) {
          shortWords.push({ row, col, direction: "ACROSS" });
          continue;
        }

        // check across words
        if (col === 0 || grid[row][col - 1].isBlocked || !hasValidLetter(grid[row][col - 1])) {
          let wordLength = 0;
          let currentCol = col;
          while (currentCol < gridSize.cols && !grid[row][currentCol].isBlocked && hasValidLetter(grid[row][currentCol])) {
            wordLength++;
            currentCol++;
          }
          if (wordLength < 3 && wordLength > 1) {
            shortWords.push({ row, col, direction: "ACROSS" });
          }
        }

        // check down words
        if (row === 0 || grid[row - 1][col].isBlocked || !hasValidLetter(grid[row - 1][col])) {
          let wordLength = 0;
          let currentRow = row;
          while (currentRow < gridSize.rows && !grid[currentRow][col].isBlocked && hasValidLetter(grid[currentRow][col])) {
            wordLength++;
            currentRow++;
          }
          if (wordLength < 3 && wordLength > 1) {
            shortWords.push({ row, col, direction: "DOWN" });
          }
        }
      }
    }
    return shortWords;
  };

  // use DFS to confirm crossword is connected
  const isGridConnected = (grid: Cell[][], gridSize: { rows: number; cols: number }) => {
    const visited = Array(gridSize.rows).fill(false).map(() => Array(gridSize.cols).fill(false));
    let startRow = -1, startCol = -1;

    // find first cell with a letter
    outer: for (let row = 0; row < gridSize.rows; row++) {
      for (let col = 0; col < gridSize.cols; col++) {
        if (!grid[row][col].isBlocked && grid[row][col].letter) {
          startRow = row;
          startCol = col;
          break outer;
        }
      }
    }

    if (startRow === -1) return true; // this should never occur because we check for emptiness earlier

    // DFS to check connectivity
    const dfs = (row: number, col: number) => {
      if (row < 0 || row >= gridSize.rows || col < 0 || col >= gridSize.cols) return;
      if (visited[row][col] || grid[row][col].isBlocked || !grid[row][col].letter) return;

      visited[row][col] = true;

      dfs(row + 1, col);
      dfs(row - 1, col);
      dfs(row, col + 1);
      dfs(row, col - 1);
    };

    dfs(startRow, startCol);

    // check if all cells with letters were visited
    for (let row = 0; row < gridSize.rows; row++) {
      for (let col = 0; col < gridSize.cols; col++) {
        if (!grid[row][col].isBlocked && grid[row][col].letter && !visited[row][col]) {
          return false;
        }
      }
    }
    return true;
  };

  // validate that hints are not empty
  const validateHints = (): ValidationResult => {
    const errors: string[] = [];

    if (!crosswordData?.title || crosswordData.title.trim() === '') {
      errors.push('Missing a title for your crossword');
    }

    hintInputs.forEach((hintInput) => {
      if (!hintInput.hint || hintInput.hint.trim() === '') {
        errors.push(`Missing hint for ${hintInput.number} ${hintInput.direction.toLowerCase()} (${hintInput.word})`);
      }
    });

    return {
      isValid: errors.length === 0,
      errors
    };
  };

  return (
    <div className="p-4 pt-20 flex flex-col items-center outline-none" tabIndex={0} onKeyDown={handleKeyPress}>
      {!showAuthDialog && !showSizeModal && mode === 'creating' && (
        <Button variant="ghost" size="icon" onClick={() => setShowInstructionsDialog(true)}>
          <HelpCircle className="h-5 w-5 text-muted-foreground" />
        </Button>
      )}
      <Dialog open={showAuthDialog} onOpenChange={() => { }}>
        <DialogContent
          onPointerDownOutside={(e) => {
            e.preventDefault();
            router.push('/');
          }}
          className="[&>button]:hidden"
        >
          <DialogHeader>
            <DialogTitle>Authentication Required</DialogTitle>
            <DialogDescription>
              You must be signed in to create a puzzle.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <LoginAndRegister isOpen={loginDialogOpen} setIsOpen={setLoginDialogOpen} tab={loginTab} setTab={setLoginTab} />

            <Button onClick={() => { setLoginDialogOpen(true); setLoginTab("Sign In") }}>
              Sign In
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showSizeModal && isAuthChecked} onOpenChange={() => { }}>
        <DialogContent
          onPointerDownOutside={(e) => {
            e.preventDefault();
            router.push('/');
          }}
          className="[&>button]:hidden"
        >
          <DialogHeader>
            <DialogTitle>Create New Crossword</DialogTitle>
            <DialogDescription></DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex flex-col gap-4">
              <div className="space-y-2">
                <Label>Rows: {gridSize.rows}</Label>
                <Slider
                  min={3}
                  max={25}
                  defaultValue={[5]}
                  value={[gridSize.rows]}
                  onValueChange={(value) => setGridSize({ ...gridSize, rows: value[0] })}
                  step={1}
                />
              </div>

              <div className="space-y-2">
                <Label>Columns: {gridSize.cols}</Label>
                <Slider
                  min={3}
                  max={25}
                  defaultValue={[5]}
                  value={[gridSize.cols]}
                  onValueChange={(value) => setGridSize({ ...gridSize, cols: value[0] })}
                  step={1}
                />
              </div>
            </div>
            <DialogClose asChild>
              <Button
                onClick={() => initializeGrid(gridSize.rows, gridSize.cols)}
                className="w-full"
                disabled={gridSize.rows < 1 || gridSize.cols < 1}
              >
                Create Grid
              </Button>
            </DialogClose>
          </div>
        </DialogContent>
      </Dialog>

      <div className="flex gap-8">
        <div className="flex flex-col ">
          <div className="flex">
            <div>
              <div className="grid gap-1" style={{
                gridTemplateColumns: `repeat(${gridSize.cols}, ${cellSize}px)`
              }}>
                {grid.map((row, rowIndex) =>
                  row.map((cell, colIndex) => {
                    const isSelected = selectedCell?.row === rowIndex && selectedCell?.col === colIndex;

                    // determine if cell is in the current word for highlighting
                    let isInCurrentWord = false;
                    if (selectedCell) {
                      const { start, end } = findConnectedCells(selectedCell.row, selectedCell.col);
                      if (direction === 'across') {
                        isInCurrentWord = rowIndex === selectedCell.row &&
                          colIndex >= start &&
                          colIndex <= end;
                      } else {
                        isInCurrentWord = colIndex === selectedCell.col &&
                          rowIndex >= start &&
                          rowIndex <= end;
                      }
                    }

                    return (
                      <div
                        key={`${rowIndex}-${colIndex}`}
                        className={`border relative transition-colors select-none ${cell.isBlocked ? 'bg-black' :
                          mode === 'creating' ? (
                            isSelected ? 'bg-puzzle-selected ring-2 ring-puzzle-selected-ring' :
                              isInCurrentWord ? 'bg-puzzle-connected ring-1 ring-puzzle-selected' :
                                cell.letter ? 'bg-white' : 'bg-gray-100'
                          ) : cell.letter ? 'bg-white' : 'bg-gray-100'
                          } ${mode === 'creating' ? 'hover:ring-1 hover:ring-blue-300' : ''} flex items-center justify-center group`}
                        style={cellStyles.container}
                        onClick={() => mode === 'creating' && !cell.isBlocked && handleCellSelect(rowIndex, colIndex, true)}
                      >
                        {/* cell number in hint mode */}
                        {mode === 'hinting' && (crosswordData?.cells?.[rowIndex]?.[colIndex]?.label ?? -1) > 0 && (
                          <div className="absolute top-0 left-0 text-xs p-0.5">
                            {crosswordData?.cells?.[rowIndex]?.[colIndex]?.label}
                          </div>
                        )}

                        {/* letter display */}
                        <span
                          className="font-medium select-none text-black dark:text-black"
                          style={cellStyles.input}
                        >
                          {cell.letter}
                        </span>

                        {/* swap icon - show when cell is hovered */}
                        {mode === 'creating' && (
                          <div
                            className={`absolute top-0 right-0 w-6 h-6 cursor-pointer text-xs flex items-center justify-center ${'opacity-0 group-hover:opacity-100'
                              }`}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCellClick(rowIndex, colIndex);
                            }}
                          >
                            <Square
                              size={15}
                              fill={cell.isBlocked ? "white" : "black"}
                              stroke={cell.isBlocked ? "white" : "black"}
                              strokeWidth={1.5}
                            />
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {mode === 'creating' && !showSizeModal && !showAuthDialog && isAuthChecked && (
              <div className="ml-2 flex flex-col h-full gap-1 w-16">
                <Button
                  onClick={removeColumn}
                  className="h-[10%] w-full"
                  disabled={gridSize.cols <= 3}
                >
                  -
                </Button>
                <Button
                  onClick={addColumn}
                  className="h-[90%] w-full"
                  disabled={gridSize.cols >= 25}
                >
                  +<br />Add<br />Column
                </Button>
              </div>
            )}
          </div>

          {mode === 'creating' && !showSizeModal && !showAuthDialog && isAuthChecked && (
            <div className="flex flex-col items-start">
              <div className="mt-2 flex gap-1" style={{ width: `${(cellSize * gridSize.cols) + ((gridSize.cols - 1) * 4)}px` }}>
                <Button
                  onClick={removeRow}
                  className="w-[10%]"
                  disabled={gridSize.rows <= 3}
                >
                  -
                </Button>
                <Button
                  onClick={addRow}
                  className="w-[90%]"
                  disabled={gridSize.rows >= 25}
                >
                  + Add Row
                </Button>
              </div>

              <Button
                onClick={handleAddHints}
                className="mt-4"
                style={{ width: `${(cellSize * gridSize.cols) + ((gridSize.cols - 1) * 4)}px` }}
              >
                Add Hints
              </Button>
            </div>
          )}
        </div>

        {/* hint inputs (only in hinting mode) */}
        {mode === 'hinting' && (
          <div className="w-96 flex flex-col gap-4 overflow-y-scroll max-h-[80vh] px-6 border rounded-lg p-4 shadow-sm bg-background [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            <Button
              variant="outline"
              className="w-fit px-2"
              onClick={() => setMode('creating')}
            >
              <ChevronLeft className="-mr-1 -ml-1 h-4 w-4" />
              Back to Edit
            </Button>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Title</label>
                <Input
                  placeholder="Enter puzzle title..."
                  value={crosswordData?.title || ''}
                  onChange={(e) => setCrosswordData(prev => prev ? { ...prev, title: e.target.value } : prev)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <Input
                  placeholder="Enter puzzle description..."
                  value={crosswordData?.description || ''}
                  onChange={(e) => setCrosswordData(prev => prev ? { ...prev, description: e.target.value } : prev)}
                />
              </div>
            </div>

            <div className="flex flex-col gap-4 mt-4">
              <h3 className="font-medium">Hints</h3>
              {hintInputs.map((hintInput, index) => (
                <div key={`${hintInput.number}-${hintInput.direction}`} className="space-y-2 p-3 rounded-lg">
                  <div className="flex items-center gap-2">
                    <span className="text-foreground font-medium min-w-[80px]">{hintInput.number} {hintInput.direction.toLowerCase()}</span>
                    <span className="text-muted-foreground font-mono">({hintInput.word})</span>
                  </div>
                  <Input
                    placeholder="Enter hint..."
                    value={hintInput.hint}
                    onChange={(e) => {
                      const newHintInputs = [...hintInputs];
                      newHintInputs[index].hint = e.target.value;
                      setHintInputs(newHintInputs);
                    }}
                  />
                </div>
              ))}
            </div>

            <div className="flex items-center">
              <Button
                className="mt-4 mb-4 h-10"
                onClick={async () => {
                  const validation = validateHints();

                  // Check if status is set
                  if (!crosswordStatus) {
                    validation.errors.push("Privacy status is required"); // Add error if status is not set
                  }

                  if (!validation.isValid || !crosswordStatus) { // Update condition to check for status
                    setValidationErrors(validation.errors);
                    setShowInvalidCrosswordDialog(true);
                    return;
                  }

                  const finalHints = hintInputs.map(({ number, direction, hint }) => ({
                    hint,
                    label: number,
                    direction
                  }));

                  const finalData = {
                    ...crosswordData,
                    cells: JSON.stringify(crosswordData?.cells),
                    hints: JSON.stringify(finalHints),
                    status: crosswordStatus // Use selected status
                  };

                  try {
                    const token = localStorage.getItem('token');
                    if (!token) {
                      setLoginTab("Sign In");
                      setLoginDialogOpen(true);
                      return;
                    }

                    const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND}/puzzles`, {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                      },
                      body: JSON.stringify(finalData),
                    });

                    if (!response.ok) {
                      const errorData = await response.json();
                      throw new Error(errorData.message || 'Failed to create crossword');
                    }

                    // Redirect to mypuzzles page after successful creation
                    router.push('/mypuzzles');
                  } catch (error) {
                    console.error('Error creating crossword:', error);
                    setValidationErrors([error instanceof Error ? error.message : 'Failed to create crossword. Please try again.']);
                    setShowInvalidCrosswordDialog(true);
                  }
                }}
              >
                Create Crossword
              </Button>
              <Select value={crosswordStatus} onValueChange={setCrosswordStatus}>
                <SelectTrigger className="ml-6 w-[180px] h-10">
                  <SelectValue placeholder="Select Privacy Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="UNLISTED">Unlisted</SelectItem>
                  <SelectItem value="PUBLIC">Public</SelectItem>
                  <SelectItem value="PRIVATE">Private</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}
      </div>

      <Dialog open={showUnusedCellsDialog} onOpenChange={setShowUnusedCellsDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Unused Cells Detected</DialogTitle>
            <DialogDescription>
              Some cells in your crossword are neither filled with letters nor disabled.
              Would you like to automatically disable these cells or go back and make changes manually?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowUnusedCellsDialog(false)}
            >
              Go Back
            </Button>
            <Button
              onClick={handleDisableUnusedCells}
            >
              Disable Unused Cells
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={showInstructionsDialog} onOpenChange={setShowInstructionsDialog}>
        <DialogContent aria-describedby="radix-instructions-description">
          <DialogHeader>
            <DialogTitle>How to Create a Puzzle</DialogTitle>
            <div id="radix-instructions-description" className="text-sm text-muted-foreground">
              <ul className="list-disc pl-4 space-y-2 mt-2">
                <li>Use your keyboard to type letters in cells.</li>
                <li>Click a square to select it; click again to toggle direction (across/down).</li>
                <li>Use the square icon to block/unblock cells.</li>
                <li>Use arrow keys, Enter, and Backspace to navigate.</li>
                <li>Unused tiles will automatically be disabled before saving.</li>
              </ul>
            </div>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => setShowInstructionsDialog(false)}>
              Got it!
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={showInvalidCrosswordDialog} onOpenChange={setShowInvalidCrosswordDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Crossword Invalid</DialogTitle>
          </DialogHeader>
          <DialogDescription asChild>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">The following issues were found:</p>
              <ul className="list-disc pl-6 text-sm text-muted-foreground">
                {validationErrors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>
          </DialogDescription>
          <DialogFooter>
            <Button onClick={() => setShowInvalidCrosswordDialog(false)}>
              Back to Editor
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
