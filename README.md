# AI Assistant Frontend

A modern, responsive React frontend built with Next.js 15 that provides an intuitive chat interface for the AI Assistant API. Features real-time conversation management, web search integration, and deep research capabilities with a clean, accessible UI.

## Features

- **Modern React Architecture**: Built with Next.js 15 and React 19 for optimal performance
- **Real-time Chat Interface**: Seamless conversation experience with the AI Assistant
- **Deep Research UI**: Interactive interface for multi-iteration research workflows  
- **Responsive Design**: Mobile-first design that works across all devices
- **Accessible Components**: Built with Radix UI primitives for accessibility
- **TypeScript Support**: Full type safety throughout the application
- **Optimized Performance**: Turbopack for fast development and optimized builds
- **Modern Styling**: Tailwind CSS with custom animations and themes

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 4 with custom animations
- **UI Components**: Radix UI primitives
- **Icons**: Lucide React
- **AI Integration**: Vercel AI SDK
- **Development**: Turbopack for fast builds

## Project Structure

```
├── app/                    # Next.js App Router
│   ├── globals.css         # Global styles and Tailwind imports
│   ├── layout.tsx          # Root layout component
│   └── page.tsx            # Home page component
├── components/             # Reusable UI components
│   ├── ui/                 # Base UI components (buttons, inputs, etc.)
│   ├── chat/               # Chat-specific components
│   └── research/           # Research interface components
├── lib/                    # Utility functions and configurations
│   ├── utils.ts            # Common utility functions
│   └── api.ts              # API client configuration
├── hooks/                  # Custom React hooks
├── types/                  # TypeScript type definitions
└── public/                 # Static assets
```

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm, yarn, pnpm, or bun
- AI Assistant Backend API running (see backend README)

### Environment Variables

Create a `.env.local` file in the root directory:

```env
# Backend API Configuration
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api

# Optional: Analytics and monitoring
# NEXT_PUBLIC_ANALYTICS_ID=your_analytics_id
```

### Installation & Development

```bash
# Clone the repository
git clone <repository-url>
cd ai-assistant-frontend

# Install dependencies
npm install
# or
yarn install
# or
pnpm install
# or
bun install

# Start the development server
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

### Building for Production

```bash
# Build the application
npm run build

# Start the production server
npm run start

# Lint the codebase
npm run lint
```

## API Integration

The frontend connects to the AI Assistant Backend API with the following endpoints:

### Chat Features
- **Real-time Messaging**: Send queries and receive AI responses
- **Thread Management**: Maintain conversation context across messages
- **Web Search Integration**: Display search results and sources

### Research Features  
- **Deep Research**: Initiate comprehensive research processes
- **Progress Tracking**: Monitor research status in real-time
- **Results Display**: Present research findings with proper formatting

### Configuration

Update the API base URL in your environment variables to match your backend deployment:

```env
# For local development
NEXT_PUBLIC_API_URL=http://localhost:8000

# For production
NEXT_PUBLIC_API_URL=https://your-api-domain.com
```

## Key Components

### Chat Interface
- Message bubbles with proper formatting
- Loading states and typing indicators  
- Source citations and links
- Error handling and retry mechanisms

### Research Dashboard
- Research query input with validation
- Progress visualization and status updates
- Comprehensive results presentation
- Export and sharing capabilities

### UI Components
- Accessible form controls using Radix UI
- Consistent design system with Tailwind CSS
- Smooth animations and transitions
- Responsive layouts for all screen sizes

## Development Guidelines

### Component Structure
```typescript
// Example component structure
interface ComponentProps {
  // Define prop types
}

export function Component({ ...props }: ComponentProps) {
  // Component logic
  return (
    // JSX with proper TypeScript types
  );
}
```

### Styling Guidelines
- Use Tailwind CSS utility classes
- Follow mobile-first responsive design
- Implement proper hover and focus states
- Maintain consistent spacing and typography

### API Integration
```typescript
// Use the configured API client
import { apiClient } from '@/lib/api';

const response = await apiClient.post('/query', {
  message: userInput,
  thread_id: threadId
});
```

## Deployment

### Vercel (Recommended)
The easiest way to deploy is using the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme):

1. Connect your GitHub repository
2. Configure environment variables
3. Deploy with automatic builds on push

### Other Platforms
- **Netlify**: Configure build command as `npm run build`
- **Docker**: Use the provided Dockerfile for containerized deployment
- **Static Export**: Run `npm run build` for static site generation

## Browser Support

- Chrome 90+
- Firefox 88+  
- Safari 14+
- Edge 90+

## Contributing

1. Follow the existing code style and patterns
2. Add TypeScript types for all new components
3. Include proper error handling and loading states
4. Test responsive design across different screen sizes
5. Update documentation for new features

## Learn More

- [Next.js Documentation](https://nextjs.org/docs) - Learn about Next.js features and API
- [React Documentation](https://react.dev) - Learn React concepts and patterns  
- [Tailwind CSS](https://tailwindcss.com/docs) - Utility-first CSS framework
- [Radix UI](https://www.radix-ui.com/) - Accessible component primitives
- [TypeScript Handbook](https://www.typescriptlang.org/docs/) - TypeScript language guide

## License

MIT