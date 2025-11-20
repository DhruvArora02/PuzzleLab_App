package Puzzle_Lab.Entities;

import jakarta.annotation.security.RolesAllowed;
import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToMany;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.core.Context;
import jakarta.ws.rs.core.MediaType;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Map;
import java.util.List;
import org.mindrot.jbcrypt.BCrypt;

import Puzzle_Lab.Enums.Theme;
import io.quarkus.hibernate.orm.panache.PanacheEntityBase;

/**
 * Stores user authentication in a secure manner.
 * Provides utility methods for validation and checking uniqueness.
 * Managed by JPA with PanacheEntity for simplified database operations.
 * PanacheEntity automatically creates an ID field upon persist.
 */
@Entity
public class User extends PanacheEntityBase {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private final LocalDate createdAt = LocalDate.now();
    @Column(unique = true)
    
    private String username;
    private String password;
    @Column(unique = true)
    private String email;
    private Theme theme = Theme.DEFAULT;
    private String avatar;
    private boolean isAdmin = false;
    @Column(nullable = true)
    private String tempPassword; // Temporary password for one-time use.

    @ElementCollection
    @CollectionTable(name = "user_liked_puzzles", joinColumns = @JoinColumn(name = "user_id"))
    @Column(name = "puzzle_id")
    private List<Long> likedPuzzleIds = new ArrayList<>();

    @ElementCollection
    @CollectionTable(name = "user_favorited_puzzles", joinColumns = @JoinColumn(name = "user_id"))
    @Column(name = "puzzle_id")
    private List<Long> favoritedPuzzleIds = new ArrayList<>();

    @ElementCollection
    @CollectionTable(name = "user_completed_puzzles", joinColumns = @JoinColumn(name = "user_id"))
    @Column(name = "puzzle_id")
    private List<Long> completedPuzzleIds = new ArrayList<>();

    /////////////////////////////////////////////////////////
    // ------------------- CONSTRUCTORS ------------------ //
    /////////////////////////////////////////////////////////
    @SuppressWarnings("unused")
    private User() {
        // Constructor required by JPA
    };

    /**
     * Creates a new user with the specified username and password.
     * @param username The username for the new user.
     * @param password The plaintext password, which will be hashed.
     */
    public User(String username, String password) {
        this(username, password, null);
    }
    
    /**
     * Creates a new user with the specified username, password, and email.
     * @param username The username for the new user.
     * @param password The plaintext password, which will be hashed.
     * @param email The email associated with the user.
     */
    public User(String username, String password, String email) {
        this.username = username;
        this.password = BCrypt.hashpw(password, BCrypt.gensalt()); // Hash the password before storing.
        this.email = email;
    }

    /////////////////////////////////////////////////////////
    // --------------------- GETTERS --------------------- //
    /////////////////////////////////////////////////////////

    /**
     * @return The date that the user was created on
     */
    public LocalDate getCreatedAt() {
        return createdAt;
    }

    /**
     * @return a User's username
     */
    public String getUsername() {
        return username;
    }

    /**
     * @return a User's hashed password.
     */
    public String getHashedPassword() {
        return password;
    }

    /**
     * @return a User's email
     */
    public String getEmail() {
        return email;
    }

    /**
     * @return a User's Theme
     */
    public Theme getTheme() {
        return theme;
    }

    /**
     * @return The users id
     */
    public Long getID() {
        return id;
    }

    /**
     * @return Whether a user is an admin or not
     */
    public boolean isAdmin() {
        return isAdmin;
    }
    
    /**
     * @return The user's temporary password (hashed) if set, otherwise null.
     */
    public String getTempPassword() {
        return tempPassword;
    }

    /**
     * @return A simple string pointing to an image of the users avatar
     */
    public String getAvatar() {
        return avatar;
    }

    /**
     * @return A hashmap including only public details about a user
     */
    public Map<String, Object> getPublicDTO() {
        Map<String, Object> fields = new HashMap<>();
        fields.put("id", id);
        fields.put("username", username);
        fields.put("createdAt", createdAt);
        fields.put("avatar", avatar);

        return fields;
    }

    /**
     * @return A hashmap including full details about a user
     */
    public Map<String, Object> getFullDTO() {
        Map<String, Object> fields = getPublicDTO();
        fields.put("email", email);
        fields.put("theme", theme);
        fields.put("isAdmin", isAdmin);
        fields.put("likedPuzzleIds", likedPuzzleIds);
        fields.put("favoritedPuzzleIds", favoritedPuzzleIds);
        fields.put("completedPuzzleIds", completedPuzzleIds);

        return fields;
    }

    /**
     * Returns a list of puzzle IDs that the user has liked.
     * @return A list of puzzle IDs the user has liked.
     */
    public List<Long> getLikedPuzzleIds() {
        return likedPuzzleIds;
    }

    /**
     * Returns a list of puzzle IDs that the user has favorited.
     * @return A list of puzzle IDs the user has marked as favorite.
     */
    public List<Long> getFavoritedPuzzleIds() {
        return favoritedPuzzleIds;
    }

    /**
     * Returns a list of puzzle IDs that the user has completed.
     * @return A list of puzzle IDs the user has completed.
     */
    public List<Long> getCompletedPuzzleIds() {
        return completedPuzzleIds;
    }

    /////////////////////////////////////////////////////////
    // --------------------- SETTERS --------------------- //
    /////////////////////////////////////////////////////////

    /**
     * Sets a User's username. It's recommended to check if the username is unique
     * prior to setting it.
     * 
     * @param username - The string to set as the User's username
     */
    public void setUsername(String username) {
        this.username = username;

    }

    /**
     * Hashes a user's password, then sets it
     * 
     * @param password - The string to hash and set as the user's password
     */
    public void setPassword(String password) {
        this.password = BCrypt.hashpw(password, BCrypt.gensalt());
    }

    /**
     * Sets a User's email. It's recommended to check if the email is unique
     * prior to setting it.
     * 
     * @param email - The string to set as the User's email
     */
    public void setEmail(String email) {
        this.email = email;
    }

    /**
     * Set's a User's theme. This will be the default Theme whenever the User is
     * logged in.
     * 
     * @param theme - The string to set as the User's theme
     */
    public void setTheme(Theme theme) {
        this.theme = theme;
    }

    /**
     * Sets a temporary password for the user, hashing it before storing.
     * This password is intended for one-time use, such as during password reset.
     * @param tempPassword The temporary password to be hashed and stored.
     */
    public void setTempPassword(String tempPassword) {
        if (tempPassword != null) {
            this.tempPassword = BCrypt.hashpw(tempPassword, BCrypt.gensalt()); // Securely hash temp password before storing
        }
    }

    /**
     * Sets the users avatar
     * 
     * @param avatar - A link to an image
     */
    public void setAvatar(String avatar) {
        this.avatar = avatar;
    }

    /////////////////////////////////////////////////////////
    // ----------------- HELPFUL METHODS ----------------- //
    /////////////////////////////////////////////////////////

    /**
     * Checks if a User with a given username already exists.
     * 
     * @param username - The username to check if a User already has.
     * @return A boolean that's true if the username is available, and false
     *         otherwise.
     */
    public static boolean isUsernameAvailable(String username) {
        return count("username", username) == 0;
    }

    /**
     * Checks if a User with a given email already exists.
     * 
     * @param email - The email to check if a User already has.
     * @return A boolean that's true if the email is available, and false
     *         otherwise.
     */
    public static boolean isEmailAvailable(String email) {
        return count("email", email) == 0;
    }

    /**
     * Checks if a username is valid. A username is valid if the username String is
     * not null, not empty, and has a length between 3-20 inclusive.
     * 
     * @param username - The username to check for validity.
     * @return A boolean that's true if the username is valid, and false otherwise.
     */
    public static boolean isValidUsername(String username) {
        return username != null && !username.isBlank() && username.length() >= 3 && username.length() <= 20;
    }

    /**
     * Checks if a password is valid. A password is valid if the password String is
     * not null, not empty, and has a length between 8-64 inclusive.
     * 
     * @param password - The password to check for validity.
     * @return A boolean that's true if the password is valid, and false otherwise.
     */
    public static boolean isValidPassword(String password) {
        return password != null && password.length() >= 8 && password.length() <= 64;
    }

    /**
     * Retrieves a user by username.
     * @param username The username of the user.
     * @return The user object if found, otherwise null.
     */
    public static User getUser(String username) {
        return User.find("username", username).firstResult();
    }

    /**
     * Retrieves a user by their ID.
     * @param id The ID of the user.
     * @return The user object if found, otherwise null.
     */
    public static User getUser(Long id) {
        return User.find("id", id).firstResult();
    }

    /**
     * Verifies if the provided password matches the stored main or temporary password.
     * @param inputPassword The plaintext password provided by the user.
     * @return True if the password matches, otherwise false.
     */
    public boolean verifyPassword(String inputPassword) {
        
        // Check if input password matches the main password
        if (BCrypt.checkpw(inputPassword, this.password)) {
            return true; 
        } 

        // Check if input password matches the temporary password (if set)
        if (this.tempPassword != null && BCrypt.checkpw(inputPassword, this.tempPassword)) {
            return true;
        }
        
        return false;
    }
    /**
     * Clears the user's temporary password after successful login.
     * This ensures that the temporary password is only used once.
     */
    public void clearTempPassword() {
        this.tempPassword = null;
        this.persist();
    }

    /**
     * Finds a user by their email address.
     * @param email The email of the user.
     * @return The user object if found, otherwise null.
     */
    public static User findByEmail(String email) {
        return find("email", email).firstResult();
    }
}
