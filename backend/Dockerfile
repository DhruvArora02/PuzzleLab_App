# Use the standard OpenJDK 17 image (likely Alpine-based)
FROM openjdk:17-jdk-alpine

# Set the working directory
WORKDIR /workdir/

# Copy files over
COPY gradlew build.gradle /workdir/
COPY gradle/wrapper/ /workdir/gradle/wrapper/
COPY src /workdir/src

RUN chmod +x /workdir/gradlew

# Build project
RUN ./gradlew clean build quarkusBuild --no-daemon
    
# Uncomment the line below to keep the docker up so you can view files without running the actual jar file
# CMD ["tail", "-f", "/dev/null"]

# Run the application (adjust the JAR filename if necessary)
CMD ["java", "-jar", "/workdir/build/quarkus-app/quarkus-run.jar"]


