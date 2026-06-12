# Match-Oracle

AI-powered football prediction platform with real-time oracle intelligence.

## Overview

Match Oracle is a sophisticated football prediction system that uses advanced analytics to provide accurate match predictions and bankroll management recommendations.

## Features

- 📊 **Real-time Dashboard** - Live prediction updates and system metrics
- 🎯 **Forensic Analysis** - Detailed match analysis and prediction breakdowns
- 💰 **Bankroll Management** - Automatic stake sizing based on system health
- 📈 **Performance Tracking** - Calibration grades and ROI metrics
- 🗓️ **Fixture Calendar** - Browse upcoming matches and leagues
- 📋 **Leg Management** - View and filter all analyzed predictions

## Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **UI Components**: Radix UI, Tailwind CSS, Lucide Icons
- **Charts**: Recharts
- **Real-time**: WebSocket support
- **State Management**: Zustand
- **Backend**: Python (Streamlit demo included)

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd Match-Oracle

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
```

### Development

```bash
# Start the development server
npm run dev

# Open http://localhost:3000 in your browser
```

### Build

```bash
# Build for production
npm run build

# Start production server
npm run start
```

## Project Structure

```
.
├── app/                    # Next.js app directory
│   ├── page.tsx           # Dashboard home
│   ├── layout.tsx         # Root layout
│   ├── globals.css        # Global styles
│   ├── legs/              # Legs analysis page
│   ├── calendar/          # Fixture calendar
│   ├── performance/       # Performance metrics
│   ├── bankroll/          # Bankroll tracking
│   ├── parlays/           # Parlay management
│   ├── countries/         # League browsing
│   ├── top-picks/         # Top predictions
│   └── admin/             # Admin panel
├── components/            # React components
│   ├── ui/               # UI component library
│   ├── sidebar.tsx       # Main navigation
│   ├── providers.tsx     # App providers
│   └── forensic-modal.tsx # Analysis modal
├── hooks/                # Custom React hooks
│   └── useWebSocket.ts   # WebSocket hook
├── lib/                  # Utilities and helpers
│   ├── api.ts           # API client
│   └── utils.ts         # Utility functions
├── types/               # TypeScript types
└── streamlit_app.py     # Python demo app
```

## API Integration

The frontend communicates with a backend API (default: `http://localhost:8000`).

### Environment Variables

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### Available API Endpoints

- `GET /frontend/dashboard` - Dashboard data
- `GET /frontend/legs` - All analyzed legs
- `GET /frontend/performance` - Performance metrics
- `POST /frontend/scan/{date}` - Trigger fixture analysis
- `GET /frontend/calendar/months` - Calendar events
- And more...

## Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT License - see LICENSE file for details

## Support

For issues and questions, please open an issue on GitHub.
