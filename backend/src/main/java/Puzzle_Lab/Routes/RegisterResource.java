package Puzzle_Lab.Routes; 

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.ws.rs.*; 
import jakarta.ws.rs.core.*; 

import java.util.Map; 
import jakarta.transaction.Transactional; 

import Puzzle_Lab.ResponseBody; 
import Puzzle_Lab.TokenService; 
import Puzzle_Lab.Entities.User; 

@ApplicationScoped 
@Path("/register") 
public class RegisterResource { 
  @POST 
  @Consumes(MediaType.APPLICATION_JSON) 
  @Produces(MediaType.APPLICATION_JSON) 
  @Transactional 
  public Response registerUser(Map<String, String> body) { 
    String username = body.get("username"); 
    String password = body.get("password"); 
    String email = body.get("email"); 
    if (username == null) { 
      return new ResponseBody(Response.Status.BAD_REQUEST).addMessage("Missing a 'username' field.").build(); 
    } 
    if (password == null) { 
      return new ResponseBody(Response.Status.BAD_REQUEST).addMessage("Missing a 'password' field.").build(); 
    } 
    if (!User.isValidUsername(username)) { 
      return new ResponseBody(Response.Status.BAD_REQUEST).addMessage("Username must be between 3 - 20 characters.").build(); 
    } 
    if (!User.isValidPassword(password)) { 
      return new ResponseBody(Response.Status.BAD_REQUEST).addMessage("Password must be between 8 - 64 characters.").build(); 
    } 
    if (!User.isUsernameAvailable(username)) { 
      return new ResponseBody(Response.Status.BAD_REQUEST).addMessage("Username already taken.").build(); 
    } 
    User user = new User(username, password, email); 
    user.persist(); // Send a token to the frontend to store. 
    String token = TokenService.generateToken(user.getID()); 
    return new ResponseBody(Response.Status.CREATED).addMessage("User registered successfully!").addObject("token", token).addObject("user", user.getFullDTO()).build(); 
  } 
}
