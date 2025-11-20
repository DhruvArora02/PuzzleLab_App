<!-- Here is where you will explain your plan for the Walking Skeleton.

We will talk more about this in the future. In summary, the Walking Skeleton is a plan for setting up a minimal version of your tech stack. This is less than a MVP (minimum viable product) as this is not meant to be a product. It is to prove that you are able to integrate the three main components of your application: front end, back end, and database. 

To complete the Skeleton you must be able to interact with your front end, have that interaction be sent to your backend, have something be stored in your database, and return a result back to the front end. This feature does not have to be particularly powerful or meaningful, but you must prove that you can communicate between each component of your application. -->

# Frontend
Any frontend elements that are interacted with will have the new information sent to the backend to store. Many backend elements will be viewable or interactable by the user.
- A page for a user to register a new account.
- A page for a user to login to an existing account
- A page for a user to edit the account information
- A page for a user to create a new Crossword Puzzle
- A page for a user to view/edit their Crossword Puzzles
- A page for a user to play their Crossword Puzzle

# Backend
Backend handles all changes made to the frontend by the user, including buttons pressed. Stores all information regarding temporary changes that are not yet saved by the user. All permanent changes will be stored in the database. Pulls from the database to retrieve said information, and displays it on the frontend.
- Receives login attempts and verifies the account
- Receives new registers and verifies the account
- Ensures username/passwords meet minimum requirements
- Allows user to click buttons to switch between pages
- Provides intuitive tools for the user to easily create their own crossword puzzle, handles all button presses and events

# Database
Database receives information the backend wants permanetnly stored, aka user data and puzzle data. It sends the information back to the backend when it is requested.
- User: A unique ID, username, password, name, email, last-login-timestamp
- Puzzle: A unique puzzle ID, a valid account ID, word information (word, hint, x-position, y-position), status (draft, published)


