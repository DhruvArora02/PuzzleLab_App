package Puzzle_Lab;

import io.quarkus.runtime.annotations.QuarkusMain;
import io.quarkus.runtime.Quarkus;

@QuarkusMain
public class Main {

    public static void main(String... args) {
        System.out.println("Hello, world!");
        Quarkus.run(args);

        Quarkus.waitForExit();
        System.out.println("Goodbye, world!");
    }
}