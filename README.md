# Authentication System

This repository contains an authentication system built with **Node.js**, **Express.js**, **JWT**, **bcrypt**, and **Two-Factor Authentication (2FA)**. It includes user registration, email verification, login, and 2FA for added security.

## Features

- User Registration with **email verification**.
- Secure password storage using **bcrypt**.
- User Login with **JWT token generation**.
- **Two-Factor Authentication (2FA)** for extra account security.
- Protected routes using JWT for authentication.

## Prerequisites

- **Node.js** v20.16.0 or higher
- **Mongoose** for MongoDB
- **JWT**
- **bcrypt**

## Environment Variables

Make sure to set the following environment variables:

- `jwtSecret=""` - Secret key for signing JWT tokens.
- `emailPass=""` - Password for the email service used for sending verification emails.
- `email=""` - Email address used for sending verification emails.
- `baseUrl=""` - Base URL of your application (e.g., http://localhost:3000).
- `mongodbUri=""` - MongoDB connection URI.
