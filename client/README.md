# ChatFlow Client

React frontend for the ChatFlow real-time chat application.

## Features

- Modern React with Hooks
- Vite for fast development
- Tailwind CSS for styling
- Zustand for state management
- Socket.io for real-time communication
- React Hook Form with Zod validation
- Dark/Light mode support
- Responsive design

## Project Structure

```
src/
├── assets/              # Static assets
├── components/          # Reusable components
│   ├── chat/           # Chat-related components
│   ├── common/         # Common UI components
│   ├── layout/         # Layout components
│   └── profile/        # Profile components
├── config/             # Configuration files
│   ├── api.js          # Axios configuration
│   └── socket.js       # Socket.io configuration
├── hooks/              # Custom React hooks
│   ├── useSocket.js    # Socket hook
│   ├── useChat.js      # Chat hook
│   └── useNotifications.js  # Notifications hook
├── pages/              # Page components
│   ├── Auth/           # Auth pages (Login, Register, etc.)
│   ├── Chat/           # Chat page
│   ├── Profile/        # Profile page
│   └── Settings/       # Settings page
├── store/              # Zustand stores
│   ├── useAuthStore.js     # Auth state
│   ├── useChatStore.js     # Chat state
│   └── useThemeStore.js    # Theme state
├── utils/              # Utility functions
│   ├── date.js         # Date formatting
│   ├── validation.js   # Form validation schemas
│   └── notifications.js # Notification helpers
├── App.jsx             # Main app component
├── main.jsx            # Entry point
└── index.css           # Global styles
```

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file:
```bash
cp .env.example .env
```

3. Update environment variables in `.env`

4. Start development server:
```bash
npm run dev
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Lint code

## Key Technologies

- **React 18** - UI library
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Zustand** - State management
- **React Router v6** - Routing
- **Socket.io Client** - Real-time communication
- **Axios** - HTTP client
- **React Hook Form** - Form handling
- **Zod** - Schema validation
- **date-fns** - Date formatting
- **emoji-picker-react** - Emoji support
- **sonner** - Toast notifications

## Features Implementation

### Authentication
- Login/Register with validation
- OAuth support (Google, GitHub)
- Password reset flow
- Token refresh mechanism

### Real-time Chat
- Instant messaging
- Online/offline status
- Typing indicators
- Read receipts
- Message status (sent, delivered, seen)

### User Interface
- Dark/Light mode toggle
- Responsive sidebar
- Skeleton loaders
- Empty states
- Toast notifications
- Smooth animations

### Notifications
- In-app notifications
- Browser push notifications
- Sound notifications (with mute toggle)

### Search
- Search users
- Search conversations
- Search within messages

## Component Guidelines

- Use functional components with hooks
- Extract reusable logic into custom hooks
- Keep components small and focused
- Use proper prop validation
- Implement proper error boundaries
- Follow accessibility best practices

## Styling Guidelines

- Use Tailwind utility classes
- Follow dark mode conventions
- Maintain consistent spacing
- Use design tokens from tailwind.config
- Ensure proper contrast ratios

## Performance Optimizations

- Code splitting with React.lazy
- Memoization with useMemo/useCallback
- Virtual scrolling for message lists
- Image optimization
- Debounced search and typing indicators

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

MIT
