# IT Process Assistant Chatbot

A responsive web-based chatbot assistant for onboarding and offboarding IT processes, built with React.

## Features
- Conversational chatbot for onboarding and offboarding workflows
- File upload and download (PDF acknowledgments)
- Progress tracking and completion screen
- Dark mode toggle
- Responsive design (mobile and desktop)
- Animated Spline 3D scene (desktop only)

## Getting Started

### Prerequisites
- Node.js (v14 or higher recommended)
- npm (comes with Node.js)

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/chatbot.git
   cd chatbot/chatbot-frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm start
   ```
   The app will run at [http://localhost:3000](http://localhost:3000).

## Usage
- Enter your name to begin.
- Choose either the onboarding or offboarding process.
- Follow the chatbot prompts to download, sign, and upload required documents, and answer any questions.
- Track your progress with the progress bar.
- On completion, you can start a new process.
- Use the sun/moon button in the header to toggle dark mode.

## Customization
- **Questions and processes** can be edited in `src/App.js` under the `processes` object.
- **Styling** can be customized in `src/App.css`.
- **3D Spline scene** can be changed by updating the Spline URL in `App.js`.

## Responsive Design
- The chat area is optimized for both desktop and mobile.
- The Spline animation is visible only on larger screens for best performance.

## Folder Structure
```
chatbot-frontend/
  ├── public/
  ├── src/
  │   ├── App.js
  │   ├── App.css
  │   ├── index.js
  │   └── ...
  ├── package.json
  └── README.md
```

## License
This project is for internal use. Contact the author for licensing details.
