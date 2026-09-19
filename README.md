# SeniorBuddy - AI Daily Companion

A GenAI-powered daily companion that helps seniors understand information, identify what needs attention, decide what to do next, and stay organized.

## Features

- **AI Agent**: Powered by OpenAI-compatible API with tool calling capabilities
- **Message Analysis**: Understand emails, notices, and documents in simple terms
- **Image Upload**: Analyze bills, documents, and suspicious messages via image upload
- **Smart Reminders**: Create reminders through natural language
- **My Day Dashboard**: View upcoming tasks, reminders, and appointments
- **Safety Check**: Analyze suspicious messages for warning signs
- **Senior-Friendly UI**: Large fonts, high contrast, simple navigation

## Tech Stack

- **Frontend**: Next.js 15 with TypeScript and Tailwind CSS
- **Backend**: Next.js API routes
- **Database**: SQLite with better-sqlite3
- **AI**: OpenAI SDK (compatible with OpenAI-compatible APIs)
- **Styling**: Tailwind CSS with senior-friendly accessibility features

## Setup

1. **Install dependencies**:

    ```bash
    npm install
    ```

2. **Set up environment variables**:
   Create a `.env.local` file in the project root:

    ```env
    OPENAI_API_KEY=your-api-key-here
    OPENAI_BASE_URL=https://api.openai.com/v1
    OPENAI_MODEL=gpt-4o-mini
    DATABASE_PATH=./senior-buddy.db
    ```

3. **Run the development server**:

    ```bash
    npm run dev
    ```

4. **Open in browser**:
   Navigate to [http://localhost:3000](http://localhost:3000)

## Project Structure

```
src/
├── app/
│   ├── page.tsx              # Home page
│   ├── assistant/            # AI assistant interface
│   ├── my-day/              # My Day dashboard
│   ├── safety/              # Safety check page
│   ├── help/                # Help page
│   └── api/
│       ├── agent/           # AI agent endpoint
│       ├── reminders/       # Reminders CRUD
│       └── my-day/          # My Day data
├── lib/
│   ├── agent/
│   │   ├── agent.ts         # AI agent logic
│   │   └── tools.ts         # Tool definitions
│   └── db/
│       ├── schema.ts        # Database schemas
│       └── index.ts         # Database operations
```

## AI Agent Tools

The AI agent has access to the following tools:

1. **analyze_message**: Analyze messages/emails/notices
2. **create_reminder**: Create reminders from natural language
3. **get_my_day**: Retrieve upcoming tasks and reminders
4. **search_information**: Search for relevant information
5. **safety_check**: Analyze suspicious messages

## Main User Flow

1. User receives a message
2. Asks AI: "What does this mean?"
3. AI analyzes and explains simply
4. AI identifies action/deadline/risk
5. User: "Remind me tomorrow morning"
6. AI creates reminder
7. Reminder appears in My Day

## Senior-Friendly Design

- Large, readable typography (18px base)
- High contrast colors
- Large touch targets (48px minimum)
- Simple navigation with 4 main sections
- Clear icons + text labels
- Generous spacing
- Guided actions instead of empty chatbot

## API Endpoints

- `POST /api/agent` - Interact with AI agent
- `POST /api/analyze-image` - Analyze uploaded images (bills, documents, messages)
- `GET /api/my-day` - Get user's daily overview
- `GET /api/reminders` - Get all reminders
- `POST /api/reminders` - Create new reminder
- `PATCH /api/reminders/[id]` - Update reminder
- `DELETE /api/reminders/[id]` - Delete reminder

## Development

```bash
# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## Database

The application uses SQLite for simplicity. The database file is created automatically at the location specified in `DATABASE_PATH` environment variable.

## Notes

- This is a hackathon project optimized for speed and simplicity
- Uses SQLite for lightweight persistence
- AI API key should be kept server-side
- No authentication included (as per hackathon scope)
- Graceful fallback if external APIs fail
