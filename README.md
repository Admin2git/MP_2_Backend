# Lead Management API

This is a **Lead Management API** built with **Express.js** and **MongoDB** for managing sales agents, leads, and comments. It includes features like creating, updating, retrieving, and deleting agents and leads, and adding comments to leads.

## Features

### 1. Sales Agent Management
- **Create New Sales Agent**: Adds a new sales agent after validating the name and email.
- **Get All Sales Agents**: Retrieves a list of all sales agents.
- **Delete Sales Agent**: Deletes an existing sales agent by ID.

### 2. Lead Management
- **Create New Lead**: Adds a new lead with various attributes such as source, status, priority, and associated sales agent.
- **Get All Leads**: Retrieves a list of leads, with optional filtering by sales agent, status, source, and priority.
- **Get Lead by ID**: Retrieves a lead by its ID.
- **Update Lead**: Updates a lead’s data based on the ID.
- **Delete Lead**: Deletes a lead by its ID.

### 3. Comment Management
- **Add Comment to Lead**: Allows adding comments to a specific lead.
- **Get All Comments for a Lead**: Retrieves all comments related to a specific lead.

### 4. Reporting
- **Closed Leads in the Last Week**: Fetches leads that were marked as closed within the last 7 days.

## Prerequisites

Before you start, ensure the following are installed:

- **Node.js** (v14 or higher)
- **MongoDB** (running locally or using MongoDB Atlas)
- **Postman** or any API testing tool (for testing API endpoints)

## Installation

1. **Clone the repository**:

    ```bash
    git clone https://github.com/Admin2git/MP_2_Backend.git
    cd MP_2_Backend
    ```

2. **Install Dependencies**:

    ```bash
    npm install
    ```

3. **Set up MongoDB**:
    - Ensure MongoDB is running locally, or use **MongoDB Atlas** (cloud-based MongoDB).
    - Update the database connection string in `db/db.connect.js` with your MongoDB URI.

4. **Start the Server**:

    ```bash
    npm start or npm run dev
    ```

    The server will be running at `http://localhost:3000`.

## API Endpoints

### Sales Agent Management

- **POST** `/agents`: Create a new sales agent.
    - **Body**: 
    ```json
    {
      "name": "John Doe",
      "email": "johndoe@example.com"
    }
    ```
    - **Response**:
    ```json
    {
      "name": "John Doe",
      "email": "johndoe@example.com"
    }
    ```

- **GET** `/agents`: Get a list of all sales agents.
- **DELETE** `/agents/:agentId`: Delete a sales agent by ID.

### Lead Management

- **POST** `/leads`: Create a new lead.
    - **Body**: 
    ```json
    {
      "name": "Lead Name",
      "source": "Website",
      "salesAgent": "agentId",
      "status": "New",
      "timeToClose": 30,
      "priority": "High"
    }
    ```
    - **Response**:
    ```json
    {
      "_id": "leadId",
      "name": "Lead Name",
      "source": "Website",
      "status": "New",
      "priority": "High"
    }
    ```

- **GET** `/leads`: Get a list of all leads, optionally filtered by query parameters:
    - `salesAgent`, `status`, `source`, `priority`

- **GET** `/leads/:leadId`: Get a specific lead by ID.

- **POST** `/leads/:leadId`: Update a lead by ID.
    - **Body**:
    ```json
    {
      "status": "Contacted"
    }
    ```

- **DELETE** `/leads/:leadId`: Delete a lead by ID.

### Comment Management

- **POST** `/leads/:id/comments`: Add a comment to a specific lead.
    - **Body**:
    ```json
    {
      "author": "commenterId",
      "text": "This is a comment."
    }
    ```
    - **Response**:
    ```json
    {
      "text": "This is a comment."
    }
    ```

- **GET** `/leads/:id/comments`: Get all comments related to a specific lead.

### Reporting

- **GET** `/report/last-week`: Get leads that were marked as **Closed** in the last 7 days.

## Database Setup

This app uses **MongoDB** to store data for sales agents, leads, and comments. The database connection is established in the `db/db.connect.js` file. Ensure your MongoDB URI is correctly set up.


