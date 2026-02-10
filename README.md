# MoneyMitra - Your Personal Financial Advisor

MoneyMitra is a personalized financial advisor chatbot that provides curated financial advice based on your profile and financial goals. Powered by Google's Gemini AI, it offers tailored guidance for different user types including students, working professionals, homemakers, informal workers, and retirees.

## Features

- **Personalized Advice**: Get financial guidance tailored to your occupation, age group, and financial goals
- **Multiple User Profiles**: Support for students, early-career professionals, informal workers, homemakers, and retirees
- **AI-Powered**: Integrated with Google's Gemini API for intelligent and context-aware responses
- **User-Friendly Interface**: Clean, intuitive chat interface built with React and Tailwind CSS
- **Smart Suggestions**: Contextual question suggestions based on your profile

## Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- Google Gemini API Key

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd moneyMitra
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
   - Copy `.env.example` to `.env.local`
   - Add your Gemini API key:
   ```
   VITE_GEMINI_API_KEY=your_gemini_api_key_here
   ```

4. Run the development server:
```bash
npm run dev
```

5. Build for production:
```bash
npm run build
```

## Project Structure

- `src/App.jsx` - Main application component with state management
- `src/ChatInterface.jsx` - Chat interface and message handling
- `src/WelcomePage.jsx` - User profile setup screen
- `src/MessageBubble.jsx` - Message display component
- `src/geminiService.js` - Gemini API integration service

## Technology Stack

- **Frontend**: React 19.2.0
- **Build Tool**: Vite 7.2.4
- **Styling**: Tailwind CSS 4.1.18
- **AI Integration**: Google Generative AI SDK
- **Package Manager**: npm

## Environment Variables

Create a `.env.local` file with the following:
```
VITE_GEMINI_API_KEY=your_api_key_here
```

**Important**: Never commit `.env.local` to version control. The file is already included in `.gitignore`.
