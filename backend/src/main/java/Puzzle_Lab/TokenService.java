package Puzzle_Lab;

import io.smallrye.jwt.build.Jwt;

import java.time.Duration;
import java.util.Set;

import Puzzle_Lab.Entities.User;

public class TokenService {
    public static String generateToken(Long userID) {
        boolean isAdmin = User.getUser(userID).isAdmin();

        return Jwt.issuer("your-issuer").upn(userID.toString()) // Store the User ID as a string instead of the name
                .groups(isAdmin ? Set.of("USER", "ADMIN") : Set.of("USER")) // Include admin if admin is set to true in database
                .expiresIn(Duration.ofDays(7)) // Token valid for 1 week
                .sign();
    }
}
