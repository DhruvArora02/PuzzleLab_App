Naming Conventions
Variables: Use camelCase (e.g., exampleVariable).
Functions: Use camelCase with descriptive names (e.g., exampleFunction()).
Constants: Use all uppercase with underscores (e.g., EXAMPLE_CONSTANT).
Classes: Use PascalCase (e.g., ExampleClass).
Files: Use snake_case (e.g., example_file.py).

Style Guidelines
Indentation: Use a tab or 3 spaces.
Line Length: Limit lines to 80-120 characters.
Comments:
Use docstrings for functions, classes, and modules.
Every module should start with a high-level comment describing its purpose.
Functions should have docstrings explaining input parameters, return values, and expected behavior.
Include inline comments for complex or non-intuitive code sections.

Brace Style
Always use braces, even if the body of a statement or loop contains only one line.
This helps prevent errors from inadvertently introducing extra lines without braces.

Example:
statement header
{
   body
   body
}
or 

statement header{
   body
   body
}

Horizontal Whitespace
Use horizontal whitespace to separate parts of a single line for clarity:
Add spaces around operators, assignments, and between control flow constructs and their conditions.

Example: 
Good style:
result = 5 * Math.abs(xCoord - ++yCoord) / (11 % -time);

Bad style:
result=5*Math.abs(xCoord-++yCoord)/(11%-time);