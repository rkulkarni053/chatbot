# IT Process Assistant Backend

Backend server for the IT Process Assistant chatbot with OneDrive file storage.

## Features
- REST API for saving user responses
- File upload handling to OneDrive folder
- SQLite database for response storage
- CORS enabled for frontend communication

## Setup

### Prerequisites
- Node.js (v14 or higher)
- npm
- OneDrive folder access

### Installation
1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the server:
   ```bash
   npm start
   ```
   Server runs on `http://localhost:5600`

## Configuration

### Port
- Default: 5600
- Can be changed via `PORT` environment variable

### File Storage
- Files are uploaded to: `C:\Users\rkulkarni\OneDrive - Tumas Group Management Co\IT Department - Documents\notebook list 2024 - 2025\uploads`
- The uploads folder will be created automatically if it doesn't exist

### Database
- SQLite database: `responses.db`
- Stores user responses and file paths

## API Endpoints

- `POST /responses` - Save user responses and files
- `GET /responses` - Fetch all responses
- `GET /download/:fileName` - Download files

## File Upload Process

1. User uploads a PDF through the chatbot
2. File is saved to the OneDrive uploads folder
3. File path is stored in the database
4. Console logs show the upload location

## Troubleshooting

### Common Issues:

1. **"Permission denied" error**
   - Check that the OneDrive folder path exists
   - Ensure the application has write permissions to the folder

2. **"File not found" error**
   - Verify the uploads folder exists in the specified OneDrive path
   - Check file permissions

3. **"Path too long" error**
   - The OneDrive path might be too long for Windows
   - Consider using a shorter path or moving the uploads folder

### Debug Mode:
Check the server console for detailed upload logs:
```
File uploaded to OneDrive: filename.pdf
Full path: C:\Users\rkulkarni\OneDrive - Tumas Group Management Co\IT Department - Documents\notebook list 2024 - 2025\uploads\filename.pdf
``` 