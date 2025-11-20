package Puzzle_Lab.Entities;

import io.quarkus.hibernate.orm.panache.PanacheEntityBase;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.Lob;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Column;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Random;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;

import Puzzle_Lab.Enums.Direction;
import Puzzle_Lab.Enums.Status;

/**
 * Stores puzzle data for easy access. Sometimes stored in JSON String format.
 * Puzzle creates its own 6 digit ID, so it uses PanacheEntityBase instead of
 * PanacheEntity.
 */
@Entity
public class Puzzle extends PanacheEntityBase {
    private final LocalDate createdAt = LocalDate.now();
    private LocalDate lastUpdated = LocalDate.now();

    @Id
    @Column(unique = true)
    private final Long id = generateUniqueId(); // Custom ID so it's random and 6 digits

    @ManyToOne
    @JoinColumn(name = "creator") // Overrides the default "creator_id"
    private User creator;
    private String title;
    private String description;

    @Lob
    @JsonProperty
    private String cellsJson;

    @Lob
    @JsonProperty
    private String hintsJson;

    private Status status;


    private int likeCount = 0;
    private int favoriteCount = 0;
    /////////////////////////////////////////////////////////
    // ------------------- CONSTRUCTORS ------------------ //
    /////////////////////////////////////////////////////////

    @SuppressWarnings("unused")
    private Puzzle() {
        // Constructor required by JPA
    };

    public Puzzle(User creator, String title, String description, String cellsJson, String hintsJson, Status status) {
        this.creator = creator;
        this.title = title;
        this.description = description;
        this.cellsJson = cellsJson;
        this.hintsJson = hintsJson;
        this.status = status;
    }

    /////////////////////////////////////////////////////////
    // ------------------ NESTED CLASSES ----------------- //
    /////////////////////////////////////////////////////////

    public static class Cell {
        public Character character;
        public int label;
        public int hint_across;
        public int hint_down;
        public boolean isBlocked;

        @SuppressWarnings("unused")
        private Cell() {
            // Constructor required by JPA
        };

        public Cell(Character character, int label, int hint_across, int hint_down) {
            this.character = character;
            this.hint_across = hint_across;
            this.hint_down = hint_down;
            this.label = label;
        }
    }

    public static class Hint {
        public String hint;
        public int label;
        public Direction direction;

        @SuppressWarnings("unused")
        private Hint() {
            // Constructor required by JPA
        };

        public Hint(String hint, int label, Direction direction) {
            this.hint = hint;
            this.label = label;
            this.direction = direction;
        }
    }

    /////////////////////////////////////////////////////////
    // --------------------- GETTERS --------------------- //
    /////////////////////////////////////////////////////////

    /**
     * @return The date that the Puzzle was created on
     */
    public LocalDate getCreatedAt() {
        return createdAt;
    }

    /**
     * @return The title of the puzzle
     */
    public String getTitle() {
        return title;
    }

    /**
     * @return The description of the puzzle
     */
    public String getDescription() {
        return description;
    }

    /**
     * Converts the string json format of Hints into a Java list object.
     * 
     * @return A list of hints
     */
    public List<Hint> getHintsList() {
        try {
            ObjectMapper objectMapper = new ObjectMapper();
            List<Hint> hints = objectMapper.readValue(hintsJson, new TypeReference<List<Hint>>() {
            });
            return hints;
        } catch (Exception e) {
            e.printStackTrace();
            return List.of();
        }
    }

    /**
     * Converts the string json format of Cells into a Java list of lists of cells
     * object.
     * 
     * @return A list of lists of cells (2d Array)
     */
    public List<List<Cell>> getCellsList() {
        try {
            ObjectMapper objectMapper = new ObjectMapper();
            List<List<Cell>> hints = objectMapper.readValue(cellsJson, new TypeReference<List<List<Cell>>>() {
            });
            return hints;
        } catch (Exception e) {
            e.printStackTrace();
            return List.of(List.of());
        }
    }

    /**
     * @return A string in JSON format representing a 2D array of cells.
     */
    public String getCellsJson() {
        return cellsJson;
    }

    /**
     * @return A string in JSON format representing an array of hints.
     */
    public String getHintsJson() {
        return hintsJson;
    }

    /**
     * @return A boolean whether the puzzle is listed publicly
     */
    public Status getStatus() {
        return status;
    }

    /**
     * @return A hashmap including only public details about a user
     */
    public Map<String, Object> getEmptyDTO() {
        Map<String, Object> fields = new HashMap<>();
        fields.put("id", id);
        fields.put("creator", creator.getPublicDTO());
        fields.put("createdAt", createdAt);
        fields.put("title", title);
        fields.put("description", description);
        fields.put("status", status);
        fields.put("hints", hintsJson);
        fields.put("lastUpdated", lastUpdated);
        fields.put("likeCount", likeCount);
        fields.put("favoriteCount", favoriteCount);

        // Loop through all cells and clear them so that no "solved" data is sent to the user
        List<List<Cell>> cellsList2D = getCellsList();
        for (List<Cell> cellsList : cellsList2D) {
            for (Cell cell : cellsList) {
                cell.isBlocked = (cell.character == null || cell.character == ' ');
                cell.character = ' ';
            }
        }

        try {
            ObjectMapper objectMapper = new ObjectMapper();
            String json = objectMapper.writeValueAsString(cellsList2D);
            fields.put("cells", json);
        } catch (Exception e) {
            e.printStackTrace();
        }

        return fields;
    }

    /**
     * @return Returns the solved version of the puzzle
     */
    public Map<String, Object> getFullDTO() {
        Map<String, Object> fields = getEmptyDTO();
        fields.put("cells", cellsJson);

        return fields;
    }

    /**
     * @return The user that created the puzzle
     */
    public User getCreator() {
        return creator;
    }

    /**
     * @return a LocalDate representing when this puzzle was last updated.
     */
    public LocalDate getLastUpdated() {
        return lastUpdated;
    }


    /**
     * Returns the total number of likes this puzzle has received.
     * @return The number of likes.
     */
    public int getLikeCount() {
        return likeCount;
    }
    
    /**
     * Returns the total number of times this puzzle has been favorited.
     * @return The number of favorites.
     */
    public int getFavoriteCount() {
        return favoriteCount;
    }
    
    /**
     * Increments the like count for this puzzle by one.
     */
    public void incrementLikeCount() {
        this.likeCount++;
    }
    
    /**
     * Increments the favorite count for this puzzle by one.
     */
    public void incrementFavoriteCount() {
        this.favoriteCount++;
    }

    /////////////////////////////////////////////////////////
    // --------------------- SETTERS --------------------- //
    /////////////////////////////////////////////////////////

    /**
     * Sets the puzzles title
     * 
     * @param title - The string to set the puzzle's title to
     */
    public void setTitle(String title) {
        this.title = title;
    }

    /**
     * Sets the puzzles description
     * 
     * @param title - The string to set the puzzle's description to
     */
    public void setDescription(String description) {
        this.description = description;
    }

    /**
     * The string to set the puzzle's cells to. This string should be a 2D array of
     * cells in JSON format.
     * 
     * @param cellsJson - The list of cells in JSON format.
     */
    public void setCells(String cellsJson) {
        this.cellsJson = cellsJson;
    }

    /**
     * The string to set the puzzle's hints to. This string should be an array of
     * hints in JSON format.
     * 
     * @param hintsJson - The list of hints in JSON format.
     */
    public void setHints(String hintsJson) {
        this.hintsJson = hintsJson;
    }

    /**
     * @param bool - Sets the visibility of the puzzle to public or private
     */
    public void setStatus(Status status) {
        this.status = status;
    }

    /**
     * Sets the lastUpdated variable to the current date
     */
    public void setLastUpdated() {
        lastUpdated = LocalDate.now();
    }

    public void decrementLikeCount() {
        if (this.likeCount > 0) this.likeCount--;
    }
    
    public void decrementFavoriteCount() {
        if (this.favoriteCount > 0) this.favoriteCount--;
    }

    /////////////////////////////////////////////////////////
    // ----------------- HELPFUL METHODS ----------------- //
    /////////////////////////////////////////////////////////

    /**
     * Generates a unique 6 digit ID. If the ID is already in use, it will
     * re-generate repeatedly until a random ID is generated that is not in used.
     * 
     * @return The random unique ID that is 6 digits long.
     */
    private Long generateUniqueId() {
        Long generatedId;
        do {
            generatedId = new Random().nextInt(900000) + 100000L; // 100000 - 999999
        } while (Puzzle.count("id", generatedId) > 0); // Checks if this ID already exists in the database

        return generatedId;
    }
}
