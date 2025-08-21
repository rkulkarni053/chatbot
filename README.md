# IT Process Assistant Chatbot

A modern, responsive web-based chatbot assistant designed to streamline IT onboarding and offboarding processes. Built with React frontend and Node.js backend, featuring an intuitive conversational interface that guides users through complex workflows with ease.

## 🚀 Features

- **Conversational Interface**: Natural language chatbot for onboarding and offboarding workflows
- **Document Management**: File upload and download capabilities with local storage
- **Progress Tracking**: Real-time progress monitoring with visual completion indicators
- **Dark Mode**: Toggle between light and dark themes for user preference
- **Responsive Design**: Optimized for both desktop and mobile devices
- **3D Visual Elements**: Animated Spline 3D scene for enhanced desktop experience
- **User-Friendly**: Intuitive navigation and clear process guidance
- **Backend API**: RESTful API for data persistence and file management
- **SQLite Database**: Local database for storing user responses and file metadata

## 📋 Table of Contents

- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Getting Started](#getting-started)
- [Usage Guide](#usage-guide)
- [Customization](#customization)
- [Troubleshooting](#troubleshooting)
- [Project Structure](#project-structure)
- [API Documentation](#api-documentation)
- [Contributing](#contributing)
- [Support](#support)

## 🔧 Prerequisites

Before you begin, ensure you have the following installed on your system:

- **Node.js**: Version 14.0.0 or higher (recommended: LTS version)
- **npm**: Package manager (automatically installed with Node.js)
- **Git**: For cloning the repository

### Checking Your Installation

Verify your installations by running these commands in your terminal:

```bash
node --version
npm --version
git --version
```

If any of these commands fail, please install the missing component first.

## 📥 Installation

Follow these steps to set up the project on your local machine:

### Step 1: Clone the Repository

```bash
git clone https://github.com/your-username/chatbot.git
cd chatbot
```

### Step 2: Install Backend Dependencies

```bash
cd chatbot-backend
npm install
```

### Step 3: Install Frontend Dependencies

```bash
cd ../chatbot-frontend
npm install
```

## 🚀 Getting Started

### Starting the Backend Server

1. **Navigate to backend directory**:
   ```bash
   cd chatbot-backend
   ```

2. **Start the backend server**:
   ```bash
   npm start
   ```

   The backend will run on `http://localhost:5600` and create a local `uploads` folder for file storage.

### Starting the Frontend Application

1. **Open a new terminal window** and navigate to the frontend directory:
   ```bash
   cd chatbot-frontend
   ```

2. **Start the frontend development server**:
   ```bash
   npm start
   ```

   The application will automatically open in your default browser at `http://localhost:3000`.

### First Time Setup

1. **Backend Setup**: Ensure the backend server is running and the SQLite database is initialized
2. **Frontend Setup**: The React app will connect to the backend API automatically
3. **File Storage**: The backend creates a local `uploads` folder for document storage

### System Requirements

- **Browser**: Modern browsers (Chrome, Firefox, Safari, Edge)
- **Screen Resolution**: Minimum 320px width for mobile compatibility
- **JavaScript**: Must be enabled in your browser
- **Ports**: Backend (5600) and Frontend (3000) must be available

## 📖 Usage Guide

### Starting a New Process

1. **Enter Your Name**: Type your full name in the input field
2. **Choose Process Type**: Select either:
   - **Onboarding**: For new employee setup
   - **Offboarding**: For employee departure procedures

### Following the Workflow

1. **Document Downloads**: The chatbot will provide links to required documents
2. **Document Review**: Download, review, and sign the documents as instructed
3. **Document Upload**: Upload completed documents back to the system
4. **Questionnaire**: Answer any required questions about your process
5. **Progress Tracking**: Monitor your progress using the progress bar

### Completing the Process

- **Progress Bar**: Shows your current completion status
- **Completion Screen**: Displays when all steps are finished
- **New Process**: Option to start another onboarding/offboarding process

### Additional Features

- **Dark Mode Toggle**: Click the sun/moon icon in the header to switch themes
- **Responsive Design**: Optimized layout for all device sizes
- **3D Animation**: Interactive Spline scene on desktop devices

## ⚙️ Customization

### Modifying Processes

Edit the `processes` object in `chatbot-frontend/src/App.js` to customize:

```javascript
const processes = {
  onboarding: {
    questions: [
      // Add or modify questions here
    ],
    documents: [
      // Add or modify required documents
    ]
  }
}
```

### Backend Configuration

- **Port**: Change the server port in `chatbot-backend/server.js` (default: 5600)
- **File Storage**: Modify the uploads directory path in the backend
- **Database**: SQLite database file is created automatically as `responses.db`

### Styling Changes

- **Main Styles**: Modify `chatbot-frontend/src/App.css` for global styling
- **Component Styles**: Update individual component CSS files
- **Theme Colors**: Adjust color variables for brand consistency

### 3D Scene Customization

- **Spline URL**: Update the Spline scene URL in `chatbot-frontend/src/App.js`
- **Animation Settings**: Modify animation parameters as needed
- **Performance**: Optimize for different device capabilities

#### Spline Performance Optimization

The 3D Spline scene is now optimized for better performance:

- **Lazy Loading**: 3D scene only loads after first user interaction
- **Loading States**: Visual feedback during scene loading
- **Error Handling**: Graceful fallback if scene fails to load
- **Performance Tips**:
  - Keep your Spline scene file size under 5MB for optimal loading
  - Use compressed textures and optimized 3D models
  - Consider reducing polygon count for mobile devices
  - Test loading times on different network speeds

**Note**: If Spline continues to load slowly, consider:
1. **Optimizing your 3D scene** in Spline Studio (reduce complexity)
2. **Using a CDN** for faster global delivery
3. **Implementing progressive loading** for complex scenes
4. **Adding a loading timeout** for better user experience

## 🔍 Troubleshooting

### Common Issues and Solutions

#### Installation Problems

**Issue**: `npm install` fails with errors
**Solution**: 
```bash
npm cache clean --force
npm install
```

**Issue**: Node.js version compatibility
**Solution**: Update to Node.js LTS version (recommended: 18.x or higher)

#### Backend Issues

**Issue**: Backend server won't start
**Solution**: 
1. Check if port 5600 is available
2. Ensure all dependencies are installed
3. Check for file permission issues in the uploads directory

**Issue**: Database connection errors
**Solution**: 
1. Verify SQLite3 is properly installed
2. Check file permissions for the database directory
3. Restart the backend server

#### Frontend Issues

**Issue**: App won't start or shows blank screen
**Solution**: 
1. Check browser console for errors
2. Ensure backend server is running on port 5600
3. Verify all dependencies are installed
4. Try clearing browser cache

**Issue**: 3D animation not loading
**Solution**: 
1. Check internet connection (Spline requires external resources)
2. Verify Spline URL is accessible
3. Disable ad blockers temporarily

**Issue**: File upload not working
**Solution**: 
1. Ensure backend server is running
2. Check file size limits
3. Ensure file format is supported
4. Verify browser permissions

### Performance Optimization

- **Mobile Devices**: 3D animations are disabled for better performance
- **Browser Compatibility**: Test on multiple browsers for consistency
- **Network Issues**: Large file uploads may require stable connection
- **File Storage**: Local storage provides faster access than cloud solutions

## 📁 Project Structure

```
chatbot/
├── chatbot-backend/           # Backend server (Node.js/Express)
│   ├── server.js             # Main server file
│   ├── package.json          # Backend dependencies
│   ├── responses.db          # SQLite database (auto-created)
│   ├── uploads/              # File upload directory (auto-created)
│   └── node_modules/         # Backend dependencies
├── chatbot-frontend/          # Frontend application (React)
│   ├── public/               # Static assets and HTML template
│   │   ├── index.html        # Main HTML file
│   │   └── favicon.ico       # Browser icon
│   ├── src/                  # Source code
│   │   ├── App.js           # Main application component
│   │   ├── App.css          # Main stylesheet
│   │   ├── index.js         # Application entry point
│   │   └── components/      # React components (if any)
│   ├── package.json         # Frontend dependencies
│   └── node_modules/        # Frontend dependencies
└── README.md                 # This file
```

### Key Files

- **`chatbot-backend/server.js`**: Backend server logic, API endpoints, and database operations
- **`chatbot-frontend/src/App.js`**: Main application logic and chatbot implementation
- **`chatbot-frontend/src/App.css`**: Global styles and responsive design
- **`chatbot-backend/package.json`**: Backend dependencies and scripts
- **`chatbot-frontend/package.json`**: Frontend dependencies and scripts

## 🔌 API Documentation

### Backend Endpoints

The backend provides the following REST API endpoints:

#### POST `/responses`
Upload user responses and files
- **Body**: `{ process, responses, file }`
- **File**: Single file upload (PDF, DOC, etc.)
- **Response**: Success/error message

#### GET `/download/:fileName`
Download uploaded files
- **Params**: `fileName` - name of the file to download
- **Response**: File download or 404 error

#### GET `/responses`
Fetch all stored responses
- **Response**: JSON array of all responses

#### GET `/`
Health check endpoint
- **Response**: "HI" message

### Database Schema

```sql
CREATE TABLE responses (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  process TEXT,
  question TEXT,
  response TEXT,
  file_path TEXT,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

## 🤝 Contributing

We welcome contributions to improve the chatbot! Here's how you can help:

### Development Setup

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature-name`
3. Make your changes and test thoroughly
4. Test both frontend and backend functionality
5. Commit your changes: `git commit -m 'Add: description of changes'`
6. Push to your branch: `git push origin feature/your-feature-name`
7. Submit a pull request

### Code Standards

- Follow existing code style and formatting
- Add comments for complex logic
- Test changes on multiple devices
- Update documentation as needed
- Ensure both frontend and backend work together

## 🆘 Support

### Getting Help

- **Documentation**: Check this README first
- **Issues**: Report bugs or request features via GitHub Issues
- **Questions**: Contact the development team for technical support

### Contact Information

- **Repository**: [GitHub Repository](https://github.com/your-username/chatbot)
- **Issues**: [GitHub Issues](https://github.com/your-username/chatbot/issues)
- **Team**: Contact your IT department for internal support

## 📄 License

This project is developed for internal organizational use. For licensing details or external use, please contact the development team.

---

**Last Updated**: December 2024
**Version**: 1.0.0
**Maintained By**: IT Development Team

**Note**: This project consists of both frontend (React) and backend (Node.js) components. Both must be running for the application to function properly.

For the most up-to-date information, always refer to the latest version in the repository.
