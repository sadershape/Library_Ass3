# Library Project

## Overview
This is a Library Management System that allows users to search for books from various sources like Gutenberg and Open Library. Admins can manage items related to the library, including adding, editing, and deleting items. The system also tracks user activity, such as quiz results and API request histories.

## Admin Credentials
- **Username:** admin
- **Password:** admin123

## Features

### User Features
- **Book Search:** Users can search for books from Gutenberg and Open Library.
- **Quiz:** Users can take quizzes to test their knowledge.
- **User Profiles:** Users can view their profiles and quiz results.
- **Request History:** The system tracks user search queries and displays them on the respective pages.

### Admin Features
- **Add New Items:** Admins can add new items related to the library.
  - **Item Details:** Each item includes three pictures, two names (for localization in different languages), two descriptions (for localization), and timestamps for creation, update, and deletion.
- **Edit Items:** Admins can edit existing items.
- **Delete Items:** Admins can delete items.
- **User Management:** Admins can add, delete, and update user passwords.

## Installed Dependencies
- **express:** Web framework for Node.js.
- **axios:** Promise-based HTTP client for the browser and Node.js.
- **mongoose:** MongoDB object modeling tool designed to work in an asynchronous environment.
- **express-session:** Simple session middleware for Express.
- **connect-mongo:** MongoDB session store for Connect and Express.
- **bcryptjs:** Library to help hash passwords.
- **dotenv:** Module to load environment variables from a `.env` file into `process.env`.
- **ejs:** Embedded JavaScript templates for generating HTML.

