# Joe Learn Backend - Simplified Setup

This is the backend server for the Joe Learn platform. This guide provides the new, simplified setup instructions that are guaranteed to work.

**The old `.env` file method has been removed.**

## Prerequisites

-   [Node.js](https://nodejs.org/) (v16 or later)
-   [npm](https://www.npmjs.com/) (comes with Node.js)

## Setup and Run in 3 Simple Steps

### Step 1: Install Dependencies
Navigate to the backend directory and install the required packages.
```bash
cd backend
npm install
```

### Step 2: Add Your Firebase Key
This is the only manual step.

1.  **Generate your key:** Go to your Firebase project console and generate a new private key. A JSON file will be downloaded.
    > Link: [https://console.firebase.google.com/project/joe-learn-5a8ff/settings/serviceaccounts/adminsdk](https://console.firebase.google.com/project/joe-learn-5a8ff/settings/serviceaccounts/adminsdk)

2.  **Create the file:** Inside the `backend` directory, create a new file and name it exactly `serviceAccountKey.json`.

3.  **Copy and Paste:** Open the JSON file you downloaded from Firebase. Copy its **entire content** and paste it into your new `serviceAccountKey.json` file. Save it.

That's it! You don't need to worry about formatting or single lines.

### Step 3: Start the Server
Run the start command from the `backend` directory.
```bash
npm start
```

The server will now start successfully. You should see these messages in your terminal:
```
Firebase Admin SDK initialized successfully.
✅ Server is running on http://localhost:8000
```

## Troubleshooting

-   **If the server fails to start,** the terminal will show a clear error:
    -   `"serviceAccountKey.json" was not found`: This means you haven't created the file or named it incorrectly.
    -   `"serviceAccountKey.json" contains invalid JSON`: This means you didn't copy the content from the downloaded Firebase file correctly. Make sure you copy everything.
-   **If the frontend shows "Failed to fetch":** Make sure the backend server is running in your terminal. If it's not, follow the steps above to start it.
