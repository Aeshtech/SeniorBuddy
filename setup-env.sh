#!/bin/bash

# Setup script for environment variables
# Copy this to .env.local and fill in your actual API key

cat > .env.local << 'EOF'
# OpenAI Configuration
OPENAI_API_KEY=your-api-key-here
OPENAI_BASE_URL=https://api.openai.com/v1
OPENAI_MODEL=gpt-4o-mini

# Database Configuration
DATABASE_PATH=./senior-buddy.db
EOF

echo "Created .env.local file. Please edit it and add your actual OpenAI API key."