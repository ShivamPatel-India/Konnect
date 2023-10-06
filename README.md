# Konnect

This repository contains a MERN (MongoDB, Express.js, React, Node.js) stack project with two main folders: `backend` and `frontend`. Follow the steps below to set up the project on your local machine.

## Prerequisites

Before you begin, make sure you have the following prerequisites installed on your system:

- Node.js version 18.18.0
- npm version 10

## Getting Started

1. Clone this repository to your local machine:

   ```bash
   git clone https://github.com/your-username/your-mern-project.git
   ```

2. Navigate to the project's root directory:

   ```bash
   cd Konnect
   ```

3. Install dependencies for both the backend and frontend. Run the following commands in separate terminals:

   - Install backend dependencies:

     ```bash
     cd backend
     npm init
     ```

   - Install frontend dependencies:

     ```bash
     cd ../frontend
     npm init
     ```

## Environment Variables

In the `backend` folder, you'll find a `.env` file with the following environment variables:

```dotenv
MONGODB_URL = #
JWT_KEY = #
SENDGRID_API_KEY = #

CLOUDINARY_CLOUD_NAME = #
CLOUDINARY_API_KEY = #
CLOUDINARY_SECRET_KEY = #
```

Replace the values with your actual MongoDB URL, JWT secret key, SendGrid API key, Cloudinary cloud name, API key, and secret key.

## Starting the Project

Once you've installed the dependencies and set up the environment variables, you can start the backend and frontend servers:

- Start the backend server:

  ```bash
  cd backend
  npm start
  ```

  The backend will be running on `http://localhost:5000`.

- Start the frontend development server:

  ```bash
  cd ../frontend
  npm start
  ```

  The frontend will be running on `http://localhost:3000`.

You can access the project in your web browser at `http://localhost:3000`.
