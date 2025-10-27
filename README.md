# OpenAI Chat Assistant

A modern OpenAI chat application built with Vite and JavaScript, featuring file upload and intelligent analysis capabilities.

## Features

### Smart Chat
- **Streaming responses**: Real-time AI replies with smooth conversation experience
- **Message history**: Automatic conversation saving and history review
- **Multi-model support**: GPT-3.5, GPT-4, and other OpenAI models
- **Markdown formatting**: Code highlighting and rich text display

### File Processing
- **Multi-file upload**: Drag & drop and batch file selection
- **Format support**: TXT, MD, JSON, CSV, HTML, CSS, JS, TS, PY and other text files
- **Content preview**: Real-time file content preview and parsing
- **AI analysis**: Ask questions about uploaded files

### Modern UI
- **Responsive design**: Perfect adaptation for desktop and mobile
- **Dark theme**: Elegant color scheme for eye comfort
- **Smooth animations**: Carefully designed interactive effects
- **Intuitive interface**: Clean and user-friendly design

### Security
- **Local storage**: API keys securely stored locally
- **Error handling**: Comprehensive error messages and handling
- **Data protection**: No data upload or leakage

## Quick Start

### Requirements
- Node.js 16+
- Modern browser (Chrome, Firefox, Safari, Edge)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd openai-chat-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open browser**
   Visit `http://localhost:5173`

### Configure API Key

1. Click the "Settings" button in the left sidebar
2. Enter your OpenAI API Key
3. Select the model to use (recommend GPT-4)
4. Click "Test Connection" to verify configuration

> **Get API Key**: Visit [OpenAI Platform](https://platform.openai.com/api-keys) to create your API Key

## Usage Guide

### Basic Chat
1. Type your question in the input box at the bottom
2. Press Enter to send (Shift + Enter for new line)
3. AI will stream the response in real-time

### File Upload Analysis
1. Click the "Files" button in the left sidebar
2. Drag files to upload area or click to select files
3. Wait for file processing to complete
4. Ask questions about the files in the chat

### Quick Actions
- **New conversation**: Click "New Chat" in sidebar
- **Clear history**: Click "Clear Chat History" in settings
- **Copy message**: Click copy button next to AI replies
- **Download file**: Click download button in file panel

## Tech Stack

- **Build tool**: Vite 7.x
- **Language**: JavaScript ES6+
- **Styling**: Tailwind CSS
- **HTTP client**: Axios
- **State management**: Custom Store (Observer pattern)

## Development

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## FAQ

**Q: Where is the API Key stored?**
A: API Key is securely stored locally in browser localStorage, not uploaded to any server.

**Q: Which OpenAI models are supported?**
A: All OpenAI Chat Completions API models including GPT-3.5-turbo, GPT-4, etc.

**Q: What file formats are supported?**
A: All text formats including .txt, .md, .json, .csv, .html, .css, .js, .py, etc.

**Q: What's the file size limit?**
A: Maximum 10MB per file.

**Q: Why do messages fail to send?**
A: Check: 1) API Key configuration 2) Network connection 3) API quota

## License

This project is licensed under the MIT License. See [LICENSE](LICENSE) file for details.

## Contributing

Issues and Pull Requests are welcome!

