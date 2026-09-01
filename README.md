# Noteverse

> **A secure, full-stack notes application for creating, organizing, and managing personal notes with rich-text editing and user-specific access.**

Noteverse is a MERN-style full-stack web application built with **React, Node.js, Express, and MongoDB**. It provides authenticated users with a private workspace where they can create, edit, search, sort, and delete notes while benefiting from layered backend architecture, structured logging, centralized error handling, automated testing, and SonarQube code-quality analysis.

---

## ✨ Key Features

### 🔐 Authentication & Authorization

* User registration with name, email, and password.
* Secure password hashing using **bcrypt**.
* User login and logout.
* JWT-based authentication.
* Authentication token stored in an **HTTP-only cookie**.
* Protected application routes for authenticated users.
* User-specific note access.
* Authentication state persistence across page reloads.
* CSRF protection for state-changing requests.

### 📝 Note Management

* Create new notes.
* View all notes belonging to the authenticated user.
* View individual notes.
* Edit existing notes.
* Delete notes with confirmation.
* Notes are associated with their owning user.
* Automatic `createdAt` and `updatedAt` timestamps.
* Protection against accessing or modifying another user's notes.

### ✍️ Rich-Text Editing

The note editor uses **Tiptap** and supports a wide range of formatting capabilities, including:

* Headings
* Bold, italic, underline, and other text formatting
* Text alignment
* Links
* Highlighting
* Ordered and unordered lists
* Task lists
* Tables
* Images

### 🔎 Search & Sorting

* Search notes by title.
* Search note content.
* HTML content is stripped when performing content searches.
* Sort by:

  * Newest updated
  * Oldest updated
  * Title A–Z
  * Title Z–A

### 📊 Dashboard

* User-specific notes dashboard.
* Note creation shortcut.
* Note editing navigation.
* Note deletion.
* Search and sorting controls.
* Loading and error states.
* Authenticated user information.
* Logout functionality.

### 🛡️ Security

* HTTP-only authentication cookies.
* JWT verification.
* Protected API endpoints.
* CSRF protection.
* User ownership checks for notes.
* Password hashing.
* Production-safe handling of unexpected server errors.
* Internal database/driver errors are not exposed directly to users.

### 📋 Application Logging

The backend uses **Pino** and **Pino HTTP** for structured application and HTTP logging.

Logging covers important events such as:

* Server startup
* Database connection status
* HTTP requests
* HTTP responses
* Authentication-related activity
* Application errors
* Database failures
* Unexpected exceptions

### ⚠️ Centralized Exception Handling

The backend implements centralized error handling middleware that:

* Handles unexpected application errors.
* Provides appropriate HTTP status codes.
* Logs unhandled exceptions through Pino.
* Prevents sensitive internal error information from being exposed in production.
* Provides a consistent JSON error response format.

### 🧪 Automated Testing

#### Backend

Backend unit tests use:

* **Mocha**
* **Chai**
* **Sinon**
* **esmock**
* **MongoDB Memory Server**

Tests cover:

* Controllers
* Services
* Repositories
* Authentication middleware
* Error handling middleware
* Not-found middleware
* CSRF-related functionality

#### Frontend

Frontend tests use:

* **Jest**
* **React Testing Library**
* **Testing Library User Event**
* **JSDOM**

Tests cover:

* React application behavior
* Pages
* Components
* Authentication context
* Protected routes
* Rich-text editor behavior
* Utility functions

### 📈 Code Quality & Static Analysis

The project includes **SonarQube** integration for:

* JavaScript code-quality analysis
* Code-smell detection
* Potential bug detection
* Maintainability analysis
* Test coverage reporting

Both backend and frontend source code and test coverage reports are configured in `sonar-project.properties`.

### 🌿 Git-Based Development

The project uses Git for source-code management and supports a standard branch-based development workflow for implementing, reviewing, and merging changes.

---

## 🏗️ Architecture

Noteverse follows a layered backend architecture to separate responsibilities:

```text
┌───────────────────────────────┐
│          React Frontend       │
│                               │
│  Pages → Components → APIs    │
└───────────────┬───────────────┘
                │
                │ HTTP / JSON
                ▼
┌───────────────────────────────┐
│       Express REST API        │
│                               │
│ Routes → Middleware           │
│        → Controllers          │
│        → Services             │
│        → Repositories         │
└───────────────┬───────────────┘
                │
                ▼
┌───────────────────────────────┐
│       MongoDB / Mongoose      │
│                               │
│       Users + Notes           │
└───────────────────────────────┘
```

---

## 🛠️ Tech Stack

### Frontend

* **React 19**
* **React Router**
* **Vite**
* **Axios**
* **Tiptap**
* **Lucide React**
* **JavaScript (ES Modules)**
* **CSS**

### Backend

* **Node.js**
* **Express 5**
* **MongoDB**
* **Mongoose**
* **JWT**
* **bcrypt**
* **Pino**
* **Pino HTTP**
* **cookie-parser**
* **CORS**
* **CSRF protection**
* **dotenv**

### Testing

* **Jest**
* **React Testing Library**
* **Mocha**
* **Chai**
* **Sinon**
* **esmock**
* **MongoDB Memory Server**

### Code Quality & Development

* **SonarQube**
* **SonarScanner**
* **ESLint**
* **Git**
* **GitHub**
* **Nodemon**

---

## 📋 Prerequisites

Before running the project locally, make sure you have the following installed:

* **Node.js** — preferably a current LTS release
* **npm**
* **MongoDB** — local MongoDB server
* **Git**
* **SonarQube + SonarScanner** — only required if you want to perform SonarQube analysis

Verify your installations:

```bash
node --version
npm --version
git --version
```

If using a local MongoDB installation, make sure the MongoDB service/server is running before starting the backend.

---

## 🚀 Installation & Setup

### 1. Clone the Repository

```bash
git clone <YOUR_REPOSITORY_URL>
cd <YOUR_REPOSITORY_DIRECTORY>
```

---

### 2. Install Backend Dependencies

Navigate to the backend directory:

```bash
cd backend
npm install
```

---

### 3. Configure Backend Environment Variables

Create a `.env` file inside the `backend` directory:

```env
PORT=5000
MONGO_URI=your-mongodb-connection-string
NODE_ENV=development
JWT_SECRET=your-secure-jwt-secret
JWT_EXPIRES_IN=7d
CSRF_SECRET=your-secure-csrf-secret
```

#### Environment Variables

| Variable         | Description                     | Example                               |
| ---------------- | ------------------------------- | ------------------------------------- |
| `PORT`           | Backend server port             | `5000`                                |
| `MONGO_URI`      | MongoDB connection string       | `mongodb://localhost:27017/notes-app` |
| `NODE_ENV`       | Application environment         | `development`                         |
| `JWT_SECRET`     | Secret used to sign JWTs        | A long random secret                  |
| `JWT_EXPIRES_IN` | JWT expiration period           | `7d`                                  |
| `CSRF_SECRET`    | Secret used for CSRF protection | A long random secret                  |

---

### 4. Start the Backend

From the `backend` directory:

```bash
npm run dev
```

The backend runs on:

```text
http://localhost:5000
```

The API is mounted under:

```text
http://localhost:5000/api
```

---

### 5. Install Frontend Dependencies

Open another terminal and navigate to the frontend:

```bash
cd frontend
npm install
```

---

### 6. Configure Frontend Environment Variables

Create a `.env` file inside the `frontend` directory:

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

The frontend uses this variable as the Axios API base URL.

---

### 7. Start the Frontend

From the `frontend` directory:

```bash
npm run dev
```

Vite will display the local development URL in the terminal, typically:

```text
http://localhost:5173
```

---

## 🔌 API Overview

The backend exposes RESTful endpoints under `/api`.

### Authentication

| Method | Endpoint             | Description                | Authentication |
| ------ | -------------------- | -------------------------- | -------------- |
| `POST` | `/api/auth/register` | Register a new user        | No             |
| `POST` | `/api/auth/login`    | Authenticate a user        | No             |
| `POST` | `/api/auth/logout`   | Log out the current user   | No             |
| `GET`  | `/api/auth/me`       | Get the authenticated user | Yes            |

### Notes

| Method   | Endpoint         | Description         | Authentication |
| -------- | ---------------- | ------------------- | -------------- |
| `POST`   | `/api/notes`     | Create a note       | Yes            |
| `GET`    | `/api/notes`     | Get user's notes    | Yes            |
| `GET`    | `/api/notes/:id` | Get a specific note | Yes            |
| `PUT`    | `/api/notes/:id` | Update a note       | Yes            |
| `DELETE` | `/api/notes/:id` | Delete a note       | Yes            |

### CSRF

```text
GET /api/csrf-token
```

The frontend automatically retrieves and attaches the CSRF token to state-changing requests.

---

## 🧪 Running Tests

### Backend Tests

From `backend/`:

```bash
npm test
```

Run backend tests with coverage:

```bash
npm run test:coverage
```

The coverage report is generated under:

```text
backend/coverage/
```

---

### Frontend Tests

From `frontend/`:

```bash
npm test
```

Run frontend tests with coverage:

```bash
npm run test:coverage
```

The coverage report is generated under:

```text
frontend/coverage/
```

---

## 📊 SonarQube Analysis

The repository contains a `sonar-project.properties` configuration file.

The configured SonarQube project is:

```text
Project Key: noteverse
Project Name: Noteverse
```

The configuration analyzes:

```text
backend/src
frontend/src
```

and uses coverage reports from:

```text
backend/coverage/lcov.info
frontend/coverage/lcov.info
```

### 1. Start SonarQube

Make sure your local SonarQube server is running at:

```text
http://localhost:9000
```

### 2. Generate Test Coverage

Run backend coverage:

```bash
cd backend
npm run test:coverage
```

Run frontend coverage:

```bash
cd ../frontend
npm run test:coverage
```

### 3. Run SonarScanner

Return to the project root:

```bash
cd ..
sonar-scanner
```

If SonarScanner is not configured in your system `PATH`, execute it using its local executable path.

The scanner reads the project's existing `sonar-project.properties` configuration.

---

## 📁 Project Structure

```text
cohort-9-mern-8183-abdullah/
│
├── .coderabbit.yaml
├── .gitignore
├── README.md
├── sonar-project.properties
│
├── sonarqube-analysis/
│   ├── SS1.jpg
│   ├── SS2.jpg
│   ├── SS3.jpg
│   ├── SS4.jpg
│   └── SS5.jpg
│
├── backend/
│   ├── package.json
│   ├── package-lock.json
│   ├── server.js
│   │
│   ├── src/
│   │   │
│   │   ├── config/
│   │   │   ├── csrf.js
│   │   │   ├── db.js
│   │   │   └── logger.js
│   │   │
│   │   ├── controllers/
│   │   │   ├── authController.js
│   │   │   ├── csrfController.js
│   │   │   └── notesController.js
│   │   │
│   │   ├── middleware/
│   │   │   ├── authMiddleware.js
│   │   │   ├── errorHandler.js
│   │   │   ├── notFound.js
│   │   │   └── requestLogger.js
│   │   │
│   │   ├── models/
│   │   │   ├── Note.js
│   │   │   └── User.js
│   │   │
│   │   ├── repositories/
│   │   │   ├── notesRepository.js
│   │   │   └── userRepository.js
│   │   │
│   │   ├── routes/
│   │   │   ├── authRoutes.js
│   │   │   ├── csrfRoutes.js
│   │   │   ├── index.js
│   │   │   └── notesRoutes.js
│   │   │
│   │   └── services/
│   │       ├── authService.js
│   │       └── notesService.js
│   │
│   └── test/
│       └── unit/
│           ├── controllers/
│           │   ├── authControllerTest.js
│           │   ├── csrfControllerTest.js
│           │   └── notesControllerTest.js
│           │
│           ├── middleware/
│           │   ├── authMiddlewareTest.js
│           │   ├── errorHandlerTest.js
│           │   └── notFoundTest.js
│           │
│           ├── repositories/
│           │   ├── notesRepositoryTest.js
│           │   └── userRepositoryTest.js
│           │
│           └── services/
│               ├── authServiceTest.js
│               └── notesServiceTest.js
│
├── frontend/
│   ├── babel.config.cjs
│   ├── eslint.config.js
│   ├── index.html
│   ├── jest.config.cjs
│   ├── jest.setup.cjs
│   ├── package.json
│   ├── package-lock.json
│   ├── vite.config.js
│   │
│   ├── src/
│   │   ├── App.jsx
│   │   ├── index.css
│   │   ├── main.jsx
│   │   │
│   │   ├── components/
│   │   │   ├── NoteCard.jsx
│   │   │   ├── ProtectedRoute.jsx
│   │   │   └── RichTextEditor.jsx
│   │   │
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   │
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Landing.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── NoteEditor.jsx
│   │   │   └── Register.jsx
│   │   │
│   │   ├── services/
│   │   │   ├── api.js
│   │   │   └── notesApi.js
│   │   │
│   │   ├── styles/
│   │   │   ├── AppHeader.css
│   │   │   ├── Dashboard.css
│   │   │   ├── Landing.css
│   │   │   ├── Login.css
│   │   │   ├── NoteCard.css
│   │   │   ├── NoteEditor.css
│   │   │   ├── Register.css
│   │   │   ├── RichTextEditor.css
│   │   │   └── Spinner.css
│   │   │
│   │   └── utils/
│   │       ├── normalizeUrl.js
│   │       └── stripHtml.js
│   │
│   └── test/
│       └── unit/
│           ├── AppTest.jsx
│           │
│           ├── components/
│           │   ├── NoteCardTest.jsx
│           │   ├── ProtectedRouteTest.jsx
│           │   └── RichTextEditorTest.jsx
│           │
│           ├── context/
│           │   └── AuthContextTest.jsx
│           │
│           ├── pages/
│           │   ├── DashboardTest.jsx
│           │   ├── LandingTest.jsx
│           │   ├── LoginTest.jsx
│           │   ├── NoteEditorTest.jsx
│           │   └── RegisterTest.jsx
│           │
│           └── utils/
│               ├── normalizeUrlTest.js
│               └── stripHtmlTest.js
```

---

## 🔄 Application Flow

### Registration

```text
User
 ↓
Registration Form
 ↓
POST /api/auth/register
 ↓
Auth Controller
 ↓
Auth Service
 ↓
User Repository
 ↓
MongoDB
```

Registration creates the account but does not automatically authenticate the user.

### Login

```text
User
 ↓
Login Form
 ↓
POST /api/auth/login
 ↓
Credentials Verified
 ↓
JWT Generated
 ↓
HTTP-only Cookie
 ↓
GET /api/auth/me
 ↓
Dashboard
```

### Note Creation

```text
Dashboard
 ↓
New Note
 ↓
Rich Text Editor
 ↓
POST /api/notes
 ↓
Authentication Middleware
 ↓
Notes Controller
 ↓
Notes Service
 ↓
Notes Repository
 ↓
MongoDB
```

### Note Editing

```text
Dashboard
 ↓
Select Note
 ↓
GET /api/notes/:id
 ↓
Rich Text Editor
 ↓
PUT /api/notes/:id
 ↓
MongoDB
 ↓
Dashboard
```

---

## 🛡️ Security Model

Noteverse uses several complementary security mechanisms.

### Authentication

JWTs are issued after successful login and stored in an HTTP-only cookie. This prevents client-side JavaScript from directly reading the authentication token.

### Authorization

Every protected notes endpoint uses authentication middleware. The authenticated user's ID is used when retrieving, updating, or deleting notes, ensuring users can only operate on their own notes.

### CSRF Protection

The application obtains a CSRF token and sends it with state-changing requests such as:

```text
POST
PUT
PATCH
DELETE
```

### Password Security

Passwords are hashed with bcrypt rather than stored as plaintext.

### Production Error Handling

Unexpected server-side errors are logged internally while generic messages are returned to clients for production `5xx` errors.

---

## 🖥️ Main Application Screens

### Landing Page

Provides the application's entry point and navigation to authentication.

### Sign Up

Allows a new user to create an account using:

* Name
* Email
* Password

### Log In

Authenticates an existing user and takes them into the protected application.

### Dashboard

Displays the authenticated user's notes and provides:

* Note creation
* Note editing
* Note deletion
* Search
* Sorting
* Logout

### Note Editor

Provides a rich-text editing environment for creating and updating notes.

It includes:

* Title editing
* Rich-text content editing
* Save
* Cancel
* Delete when editing an existing note

---

## 🧩 Design & Engineering Practices

The project emphasizes several software-engineering practices:

* Separation of concerns
* Layered backend architecture
* RESTful API design
* Centralized exception handling
* Structured application logging
* Authentication and authorization
* CSRF protection
* Automated unit testing
* Test coverage reporting
* Static code-quality analysis
* Environment-based configuration
* Git-based source control
* Component-based React development
* Protected frontend routes

---

## 🔮 Potential Future Enhancements

The following features can be added in future iterations:

* Real-time note synchronization using Socket.IO
* Note import/export
* Tags and categories
* Advanced filtering
* Pagination for large note collections
* Note archiving
* Favorite/pinned notes
* User profile management
* Password reset functionality
* Email verification
