# LOLVibeCoder Frontend

A modern React frontend for the LOLVibeCoder AI code detection tool. This application provides a beautiful, responsive interface for analyzing GitHub repositories to detect if they are "vibe-coded" (AI-generated) or human-written.

## Features

- 🎨 **Modern UI**: Beautiful gradient design with smooth animations
- 📱 **Responsive**: Works perfectly on desktop, tablet, and mobile
- ⚡ **Fast**: Optimized React components with efficient state management
- 🔍 **Real-time Analysis**: Live progress indicators during repository analysis
- 📊 **Detailed Results**: Comprehensive scoring and metrics visualization
- 🎯 **User-Friendly**: Intuitive interface with helpful examples and error handling

## Components

### Core Components
- **Header**: Navigation and branding
- **AnalysisForm**: Repository URL input with validation
- **Results**: Comprehensive analysis results display
- **LoadingSpinner**: Animated loading with progress steps
- **ErrorMessage**: User-friendly error handling

### Result Components
- **VerdictCard**: Final AI detection verdict with visual indicators
- **ScoreCard**: Individual metric scores with progress bars
- **MetricsCard**: Repository statistics and metadata
- **HighlightsCard**: Analysis highlights with categorized icons

## Getting Started

### Prerequisites
- Node.js 16+ 
- npm or yarn
- LOLVibeCoder backend running on `http://localhost:3001`

### Installation

1. **Install dependencies:**
   ```bash
   cd frontend
   npm install
   ```

2. **Start the development server:**
   ```bash
   npm run dev
   ```

3. **Open your browser:**
   Navigate to `http://localhost:5173`

### Building for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## Usage

1. **Enter Repository URL**: Paste a GitHub repository URL in the input field
2. **Click Analyze**: The system will clone, analyze, and score the repository
3. **View Results**: See detailed scores, metrics, and final verdict
4. **Try Examples**: Use the provided example repositories to test the system

## API Integration

The frontend communicates with the LOLVibeCoder backend API:

- **Endpoint**: `GET /analyze?repo=<github_url>`
- **Response**: JSON with AI detection scores and metrics
- **Error Handling**: Comprehensive error messages and retry options

## Styling

The application uses modern CSS with:
- **CSS Grid & Flexbox**: Responsive layouts
- **CSS Custom Properties**: Consistent theming
- **Gradient Backgrounds**: Beautiful visual design
- **Smooth Animations**: Enhanced user experience
- **Mobile-First**: Responsive design principles

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Development

### Project Structure
```
frontend/
├── src/
│   ├── components/          # React components
│   │   ├── Header.jsx
│   │   ├── AnalysisForm.jsx
│   │   ├── Results.jsx
│   │   ├── VerdictCard.jsx
│   │   ├── ScoreCard.jsx
│   │   ├── MetricsCard.jsx
│   │   ├── HighlightsCard.jsx
│   │   ├── LoadingSpinner.jsx
│   │   └── ErrorMessage.jsx
│   ├── App.jsx             # Main application component
│   ├── App.css             # Main stylesheet
│   ├── index.css           # Global styles
│   └── main.jsx            # Application entry point
├── index.html              # HTML template
├── package.json            # Dependencies and scripts
└── README.md               # This file
```

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details