# Project README

This document serves as the initial README for the project. It will be updated as the team finalizes project specifications and implementation details.

## TeamName

<!--The name of your team.-->
T_06

### Project Abstract

<!--A one paragraph summary of what the software will do.-->
---------------
This project is a web-based application that allows users to create, manage, and solve crossword puzzles. Users can manually design puzzle layouts, add words and clues, and save puzzles to their accounts. Future enhancements may include automatic puzzle generation and validation.



### Customer

---------

<!--A brief description of the customer for this software, both in general (the population who might eventually use such a system) and specifically for this document (the customer(s) who informed this document). Every project will have a customer from the CS506 instructional staff. Requirements should not be derived simply from discussion among team members. Ideally your customer should not only talk to you about requirements but also be excited later in the semester to use the system.-->

The primary customers for this software are individuals who enjoy creating and solving crossword puzzles. This includes puzzle enthusiasts, educators looking to create custom puzzles for students, and casual users who want to generate fun challenges for friends and family.

Additionally, the project is designed with a broader audience in mind, including those who may use crossword puzzles for language learning or cognitive exercises. The initial customer group providing input will be the instructional staff for this project. Their feedback will help guide feature development and ensure usability.

### Specification
---
<!--A detailed specification of the system. UML, or other diagrams, such as finite automata, or other appropriate specification formalisms, are encouraged over natural language.-->
#### Core Features:

- Puzzle Creation: Users can manually specify puzzle layouts, add words, and write clues.
- Puzzle Saving & Retrieval: Users can save their created puzzles to an account and access them later.
- User Accounts: Users can sign up/log in to save puzzles and track progress.
- Puzzle Solving: Users can play and complete their own puzzles.

#### Advanced Features (if time permits):

- Automated Puzzle Generation: Given a list of words, the system will attempt to generate a valid crossword layout.
- Puzzle Validation: A helper function will check if a manually created puzzle is solvable.
- Community Sharing: Users may browse, share, and solve puzzles created by others.
- Customization Options: Themes, fonts, and color schemes for personalized experiences.

#### System Requirements:

- A responsive web application accessible via modern browsers.
- Backend support for storing user-created puzzles and user accounts.
- A scalable database for managing word-clue pairs for automatic generation features.
- Secure authentication for user data protection (if account-based features are implemented).

#### Technology Stack

---

Here are some sample technology stacks that you can use for inspiration:

```mermaid
flowchart RL
subgraph Front End
	A(Javascript: React)
end
	
subgraph Back End
	B(Python: Django with \nDjango Rest Framework)
end
	
subgraph Database
	C[(MySQL)]
end

A <-->|"REST API"| B
B <-->|Django ORM| C
```

```mermaid
flowchart RL
subgraph Front End
	A(Javascript: Vue)
end
	
subgraph Back End
	B(Python: Flask)
end
	
subgraph Database
	C[(MySQL)]
end

A <-->|"REST API"| B
B <-->|SQLAlchemy| C
```

```mermaid
flowchart RL
subgraph Front End
	A(Javascript: Vue)
end
	
subgraph Back End
	B(Javascript: Express)
end
	
subgraph Database
	C[(MySQL)]
end

A <-->|"REST API"| B
B <--> C
```

```mermaid
flowchart RL
subgraph Front End
	A(Static JS, CSS, HTML)
end
	
subgraph Back End
	B(Java: SpringBoot)
end
	
subgraph Database
	C[(MySQL)]
end

A <-->|HTTP| B
B <--> C
```

```mermaid
flowchart RL
subgraph Front End
	A(Mobile App)
end
	
subgraph Back End
	B(Python: Django)
end
	
subgraph Database
	C[(MySQL)]
end

A <-->|REST API| B
B <-->|Django ORM| C
```



#### Database

```mermaid
---
title: Sample Database ERD for an Order System
---
erDiagram
    Customer ||--o{ Order : "placed by"
    Order ||--o{ OrderItem : "contains"
    Product ||--o{ OrderItem : "included in"

    Customer {
        int customer_id PK
        string name
        string email
        string phone
    }

    Order {
        int order_id PK
        int customer_id FK
        string order_date
        string status
    }

    Product {
        int product_id PK
        string name
        string description
        decimal price
    }

    OrderItem {
        int order_item_id PK
        int order_id FK
        int product_id FK
        int quantity
    }
```

#### Class Diagram

```mermaid
---
title: Sample Class Diagram for Animal Program
---
classDiagram
    class Animal {
        - String name
        + Animal(String name)
        + void setName(String name)
        + String getName()
        + void makeSound()
    }
    class Dog {
        + Dog(String name)
        + void makeSound()
    }
    class Cat {
        + Cat(String name)
        + void makeSound()
    }
    class Bird {
        + Bird(String name)
        + void makeSound()
    }
    Animal <|-- Dog
    Animal <|-- Cat
    Animal <|-- Bird
```

#### Flowchart

```mermaid
---
title: Sample Program Flowchart
---
graph TD;
    Start([Start]) --> Input_Data[/Input Data/];
    Input_Data --> Process_Data[Process Data];
    Process_Data --> Validate_Data{Validate Data};
    Validate_Data -->|Valid| Process_Valid_Data[Process Valid Data];
    Validate_Data -->|Invalid| Error_Message[/Error Message/];
    Process_Valid_Data --> Analyze_Data[Analyze Data];
    Analyze_Data --> Generate_Output[Generate Output];
    Generate_Output --> Display_Output[/Display Output/];
    Display_Output --> End([End]);
    Error_Message --> End;
```

#### Behavior

```mermaid
---
title: Sample State Diagram For Coffee Application
---
stateDiagram
    [*] --> Ready
    Ready --> Brewing : Start Brewing
    Brewing --> Ready : Brew Complete
    Brewing --> WaterLowError : Water Low
    WaterLowError --> Ready : Refill Water
    Brewing --> BeansLowError : Beans Low
    BeansLowError --> Ready : Refill Beans
```

#### Sequence Diagram

```mermaid
sequenceDiagram

participant ReactFrontend
participant DjangoBackend
participant MySQLDatabase

ReactFrontend ->> DjangoBackend: HTTP Request (e.g., GET /api/data)
activate DjangoBackend

DjangoBackend ->> MySQLDatabase: Query (e.g., SELECT * FROM data_table)
activate MySQLDatabase

MySQLDatabase -->> DjangoBackend: Result Set
deactivate MySQLDatabase

DjangoBackend -->> ReactFrontend: JSON Response
deactivate DjangoBackend
```
### Contribution Guidelines
---
<!--How team members should contribute (branching strategy, pull requests, issue tracking).-->
- Use feature branches for development.
- Follow code style guidelines.
- Submit pull requests for review before merging.

### Standards & Conventions
---

<!--This is a link to a seperate coding conventions document / style guide-->
[Style Guide & Conventions](STYLE.md)

### Prototype
---

Visit the project's [Figma](https://www.figma.com/design/x1LcIQ4UPfRiuHEANglx8u/T06-Puzzle-game?node-id=0-1&t=LpHs09RGdHmT840l-1). Welcome to view and edit.
