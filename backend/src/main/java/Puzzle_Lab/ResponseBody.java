package Puzzle_Lab;

import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.core.Response.Status;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;

import java.util.HashMap;
import java.util.Map;

public class ResponseBody {

    private Status status;
    private Map<String, Object> fields;

    // Must specify a status code at least in the response
    public ResponseBody(Status status) {
        fields = new HashMap<>();
        fields.put("status", status.getStatusCode());

        this.status = status;
    }

    // Method to add any object to the response map
    public ResponseBody addObject(String key, Object value) {
        fields.put(key, value);
        return this;
    }

    public ResponseBody addMessage(String message) {
        fields.put("message", message);
        return this;
    }

    // Method to build the final response
    public Response build() {
        try {
            ObjectMapper objectMapper = new ObjectMapper();
            objectMapper.registerModule(new JavaTimeModule()); // Allows LocalDate to be transfered to JSON
            objectMapper.disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS); // Formats dates as String instead of Array

            String json = objectMapper.writeValueAsString(fields);

            return Response.status(status).entity(json).build();
        } catch (Exception e) {
            e.printStackTrace();

            String errorJson = "{\"message\": \"Error occurred while building the response body.\"}";
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR).entity(errorJson).build();
        }
    }
}
