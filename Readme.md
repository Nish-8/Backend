# YouTube + Twitter Backend 

## Overview

This project comprehensive backend project that combines the functionalities of YouTube and Twitter, integrating them seamlessly providing a comprehensive backend solution. Detailed documentation is available via the links below.

## Key Links

| Content            | Link                                                                        |
| ------------------ | ----------------------------------------------------------------------------|
| API Documentation  | [API Documentation](https://documenter.getpostman.com/view/24856556/2sA3QtfBnV)    |
| Data Model         | [Model Documentation](https://app.eraser.io/workspace/YtPqZ1VogxGy1jzIDkzj)         |

## Features

### User Management:

- Account creation, login, logout, and password reset
- Profile customization (including avatar and cover image)
- Watch history management

### Video Management:

- Uploading and publishing videos
- Advanced video search, sorting, and pagination
- Video editing and removal
- Control over video visibility (publish/unpublish)

### Tweet Management:

- Creating and posting tweets
- Viewing user-specific tweets
- Editing and deleting tweets

### Subscription Management:

- Subscribing to channels
- Viewing lists of subscribers and subscribed channels

### Playlist Management:

- Creating, updating, and deleting playlists
- Adding and removing videos from playlists
- Viewing user playlists

### Like Management:

- Liking and unliking videos, comments, and tweets
- Viewing liked videos

### Comment Management:

- Adding, updating, and deleting comments on videos

### Dashboard:

- Viewing channel metrics (views, subscribers, videos, likes)
- Managing uploaded videos

### Health Check:

- Endpoint to check the server's health status

## Technologies Utilized

- Node.js 
- Express.js
- MongoDB
- Cloudinary (account required)

## Setup Instructions

1. **Clone the repository:**

    ```bash
    https://github.com/Nish-8/VdoTube-Backend.git
    ```

2. **Install dependencies:**

    ```bash
    cd vdotube-backend
    npm install
    ```

3. **Configure environment variables:**
    Create a `.env` file in the project's root directory and populate it with the necessary values as outlined in the `.env.example` file.

4. **Launch the server:**

    ```bash
    npm run dev
    ```

## Contributing

Contributions to this project are welcome. Please feel free to submit pull requests or issues.


