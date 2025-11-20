package Puzzle_Lab.Routes; 

import jakarta.enterprise.context.ApplicationScoped; 
import jakarta.ws.rs.*; 
import jakarta.ws.rs.core.*; 

import Puzzle_Lab.ResponseBody; 
import Puzzle_Lab.Entities.User; 

@ApplicationScoped 
@Path("/username-available") 
public class UsernameAvailableResource { 
    @GET 
    @Produces(MediaType.APPLICATION_JSON) 
    public Response checkUsername(@QueryParam("username") String username) { 
      if (username == null) { 
        return new ResponseBody(Response.Status.BAD_REQUEST).addMessage("Missing a 'username' query parameter.").build(); 
      } 
      if (!User.isUsernameAvailable(username)) { 
        return new ResponseBody(Response.Status.OK).addMessage("Username already taken.").addObject("available", false).build(); 
      } 
      return new ResponseBody(Response.Status.OK).addMessage("Username is available.").addObject("available", true).build(); 
    } 
  }
