package Puzzle_Lab.Routes; 

import jakarta.annotation.security.RolesAllowed; 
import jakarta.enterprise.context.ApplicationScoped; 
import jakarta.transaction.Transactional; 
import jakarta.ws.rs.*; 
import jakarta.ws.rs.core.*; 

import java.util.ArrayList; 
import java.util.Arrays; 
import java.util.List; 
import java.util.Map; 
import java.util.stream.Collectors; 

import Puzzle_Lab.ResponseBody; 
import Puzzle_Lab.Entities.Puzzle; 
import Puzzle_Lab.Entities.User; 
import Puzzle_Lab.Enums.Status; 
import Puzzle_Lab.Enums.Theme; 
import io.quarkus.panache.common.Sort; 

@ApplicationScoped 
@Path("/users") 
public class UserResource { 
  @GET 
  @Path("/{id}") 
  @Produces(MediaType.APPLICATION_JSON) 
  public Response getUser(@PathParam("id") Long id, @Context SecurityContext ctx) { 
    User userToGet = User.getUser(id); 
    if(userToGet == null) { 
      return new ResponseBody(Response.Status.NOT_FOUND).addMessage("Couldn't find a user with that ID.") .build(); 
    } 
    if(!hasFullAccess(id, ctx)) { 
      return new ResponseBody(Response.Status.OK).addMessage("Successfully retrieved public user information.").addObject("user", userToGet.getPublicDTO()).build(); 
    } 
    return new ResponseBody(Response.Status.OK).addMessage("Successfully retrieved full user information").addObject("user", userToGet.getFullDTO()).build(); 
  } 
  
  @GET 
  @Path("/me") 
  @RolesAllowed({"USER"}) 
  @Produces(MediaType.APPLICATION_JSON) 
  public Response getMe(@Context SecurityContext ctx) { 
    Long userID = Long.valueOf(ctx.getUserPrincipal().getName()); 
    User userToGet = User.getUser(userID); 
    if(userToGet == null) { 
      return new ResponseBody(Response.Status.NOT_FOUND).addMessage("Couldn't find the currently logged in user. Did the account get deleted?").build(); 
    } 
    return new ResponseBody(Response.Status.OK).addMessage("Successfully retrieved full user information").addObject("user", userToGet.getFullDTO()).build(); 
  } 
  
  @Transactional 
  @PUT 
  @RolesAllowed({"USER"}) 
  @Path("/{id}") 
  @Produces(MediaType.APPLICATION_JSON) 
  public Response updateUser(@PathParam("id") Long id, Map<String, String> body, @Context SecurityContext ctx) { 
    User userToUpdate = User.getUser(id); 
    if(userToUpdate == null) { 
      return new ResponseBody(Response.Status.NOT_FOUND).addMessage("Couldn't find a user with that ID.").build(); 
    } // Validate that the user is an admin or updating themself 
    if(!hasFullAccess(id, ctx)) { 
      return new ResponseBody(Response.Status.FORBIDDEN).addMessage("You do not have access to update this user.").build(); 
    } // Go through every field and set it 
    
    List<String> invalidFields = new ArrayList<>(); 
    for (String key : body.keySet()) { 
      String value = body.get(key); 
      switch (key) { 
        case "username" -> { 
          if (!User.isUsernameAvailable(value) || !User.isValidUsername(value)) 
            invalidFields.add(key); 
          else userToUpdate.setUsername(value); 
        } 
        case "password" -> { 
          if (!User.isValidPassword(value)) 
            invalidFields.add(key); 
          else userToUpdate.setPassword(value); 
        } 
        case "email" -> { 
          if (!User.isEmailAvailable(value)) 
            invalidFields.add(key); 
          else userToUpdate.setEmail(value); 
        } 
        case "theme" -> { 
          boolean isValidTheme = Arrays.stream(Theme.values()).anyMatch(theme -> theme.name().equals(value)); 
          if (!isValidTheme) 
            invalidFields.add(key); 
          else userToUpdate.setTheme(Theme.valueOf(body.get(key))); 
        } 
        case "avatar" -> { 
          if (key.isEmpty()) 
            invalidFields.add(key); 
          else userToUpdate.setAvatar(value); 
        } 
        default -> invalidFields.add(key); 
      } 
    } 
    return new ResponseBody(Response.Status.OK).addMessage(body.keySet().size() - invalidFields.size() + " fields were updated.").addObject("invalidFields", invalidFields) .build(); 
  } 
  
  @Transactional 
  @DELETE 
  @RolesAllowed({"USER"}) 
  @Path("/{id}") 
  @Produces(MediaType.APPLICATION_JSON) 
  public Response deleteUser(@PathParam("id") Long id, @Context SecurityContext ctx) { 
    User userToDelete = User.getUser(id); 
    if (userToDelete == null) { 
      return new ResponseBody(Response.Status.NOT_FOUND).addMessage("Couldn't find a user with that ID.").build(); 
    } 
    if (!hasFullAccess(id, ctx)) { 
      return new ResponseBody(Response.Status.FORBIDDEN).addMessage("You do not have access to delete this user.").build(); 
    } 
    userToDelete.delete(); 
    return new ResponseBody(Response.Status.OK).addMessage("Successfully deleted the user").build(); 
  }
  
  @GET 
  @Path("/{id}/puzzles") 
  @Produces(MediaType.APPLICATION_JSON) 
  public Response getUsersPuzzles(@PathParam("id") Long id, @Context SecurityContext ctx, @QueryParam("limit") Integer limit, @QueryParam("page") Integer page) { 
    User userToGet = User.getUser(id); 
    if (userToGet == null) { 
      return new ResponseBody(Response.Status.NOT_FOUND).addMessage("Couldn't find a user with that ID.").build(); 
    } 
    if (limit == null) 
      limit = 12; 
    else limit = Math.max(Math.min(limit, 100), 0); // Max 100, min 0 
    if (page == null) 
      page = 0; 
    else page = Math.max(page, 0); // min 0 
    List<Puzzle> userPuzzles; // Return only public puzzles unless they have full access 
    if (!hasFullAccess(id, ctx)) { 
      userPuzzles = Puzzle.find("creator = ?1 and status = ?2", Sort.by("lastUpdated").descending(), userToGet, Status.PUBLIC).page(page, limit).list(); 
    } 
    else { 
      userPuzzles = Puzzle.find("creator = ?1", Sort.by("lastUpdated").descending(), userToGet).page(page, limit).list(); 
    } // Convert the puzzles to their DTO form 
    List<Object> puzzleDTOs = userPuzzles.stream().map(Puzzle::getEmptyDTO).collect(Collectors.toList()); 
    return new ResponseBody(Response.Status.OK).addMessage("Successfully retrieved users puzzles.").addObject("puzzles", puzzleDTOs).build(); 
  } 
  /** 
  * 
  * @param id - The ID of the user that's being interacted with 
  * @param ctx - The SecurityContext 
  * @return a boolean that's true if the requesting user matches the user being interacted with, or if the requesting user is an admin. 
  */ 
  private static boolean hasFullAccess(Long id, SecurityContext ctx) { 
    if (ctx.getUserPrincipal() == null) 
      return false; 
    if (ctx.getUserPrincipal().getName().equals(id.toString())) 
      return true; 
    if (ctx.isUserInRole("ADMIN")) 
      return true; 
    return false; 
  } 
}
