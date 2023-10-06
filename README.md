# Konnect

## Project Functionalities

- **User Authentication**: Users can register and log in, and their email addresses can be verified. Passwords can be reset if forgotten.
  
- **Create and Manage Posts**: Users can create posts that can contain text and images. They also have the ability to edit or delete their own posts.
  
- **Reactions**: Users can react to posts with likes and dislikes, providing a way to express their opinions.
  
- **Profile Views**: Users can see the number of viewers of their profiles, along with their names, offering insights into their post's reach.
  
- **Content Moderation**: The system includes a feature to automatically block users if their posts contain profane or unhealthy words, utilizing the "bad-words" library in JavaScript to maintain a safe environment.
  
- **Follow System**: Users can follow other users, enabling them to see their posts and interact with their content through comments.
  
- **Account Tiers**: Users start with a "Starter Account" tag, which limits them to creating only two posts. After gaining more than two followers, they can upgrade to a "Pro Account" and create more posts.

- **Admin Portal**: There's a separate admin portal for managing user blocking and unblocking, ensuring effective content moderation.

![Screenshot (38)](https://github.com/ShivamPatel-India/Konnect/assets/70719016/c10fa7b9-a851-41a5-99f7-d5966abac4b9)
![Screenshot (39)](https://github.com/ShivamPatel-India/Konnect/assets/70719016/a7a55a5f-27dc-436d-900f-f7e9be0e4659)
![image](https://github.com/ShivamPatel-India/Konnect/assets/70719016/a75bfd4d-6d53-428d-a194-aa781ee03113)
![image](https://github.com/ShivamPatel-India/Konnect/assets/70719016/99f1589d-1432-4d2b-bf9a-e6d39f955066)
![image](https://github.com/ShivamPatel-India/Konnect/assets/70719016/0c6ad18a-d57b-46a0-8c6e-53db23f37b49)


## Structure and Third-Party Services

This repository contains a MERN (MongoDB, Express.js, React, Node.js) stack + Tailwind CSS project with two main folders: backend and frontend. Follow the steps below to set up the project on your local machine.

- Project uses **SendGrid Email Services** in order to perform user authentication-related tasks such as verification and password reset.
- Project stores all the media such as profile pictures and post images to **Cloudinary Media Storage**.

Follow the instructions given below to set up and run this project on your local machine.

## Prerequisites

Before you begin, make sure you have the following prerequisites installed on your system:

- Node.js version 18.18.0
- npm version 10

## Getting Started

1. Clone this repository to your local machine:

   ```bash
   git clone https://github.com/your-username/your-mern-project.git](https://github.com/ShivamPatel-India/Konnect.git
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
