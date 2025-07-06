# Smart Task Manager

A full-stack task management application built with React (frontend) and Node.js/Express (backend).

## Quick Start

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Installation

1. **Install all dependencies (root, client, and server):**
   ```bash
   npm run install:all
   ```

   Or install manually:
   ```bash
   npm install
   cd client && npm install
   cd ../server && npm install
   ```

### Running the Application

#### Option 1: Run Both Client and Server Together (Recommended)
```bash
npm run dev
```

This will start both the client (React/Vite) and server (Node.js/Express) concurrently.

#### Option 2: Run Separately

**Client only:**
```bash
npm run dev:client
```

**Server only:**
```bash
npm run dev:server
```

### Available Scripts

- `npm run dev` - Start both client and server in development mode
- `npm run dev:client` - Start only the client
- `npm run dev:server` - Start only the server
- `npm run build` - Build the client for production
- `npm run start` - Start both client and server in production mode
- `npm run install:all` - Install dependencies for all packages

### Ports

- **Client (React/Vite):** http://localhost:5173
- **Server (Express):** http://localhost:3000 (or as configured in server.js)

### Development

The application uses:
- **Frontend:** React with Vite, Tailwind CSS, Redux Toolkit
- **Backend:** Node.js with Express
- **Database:** MySQL (configured in server/config/db.js)

## Project Structure

```
Smart Task Manager/
├── client/          # React frontend
├── server/          # Node.js backend
├── package.json     # Root package.json with concurrent scripts
└── README.md        # This file
``` 