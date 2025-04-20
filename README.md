# FishSky 🎴

[![Node.js Version](https://img.shields.io/badge/node-22.14.0-brightgreen.svg)](https://nodejs.org/)
[![Astro](https://img.shields.io/badge/Astro-5.5.5-orange.svg)](https://astro.build/)
[![React](https://img.shields.io/badge/React-19.0.0-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue.svg)](https://www.typescriptlang.org/)

An AI-powered flashcard creation and management system that helps users create high-quality study materials efficiently using LLM models.

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Available Scripts](#available-scripts)
- [Project Scope](#project-scope)
- [Project Status](#project-status)
- [License](#license)

## Features

- 🤖 AI-powered flashcard generation from text input
- ✍️ Manual flashcard creation and management
- 🔄 Spaced repetition learning algorithm
- 👤 User authentication and data privacy
- 📊 Generation statistics and analytics

## Tech Stack

### Frontend

- [Astro](https://astro.build/) v5 - Fast and efficient web framework
- [React](https://reactjs.org/) v19 - Interactive components
- [TypeScript](https://www.typescriptlang.org/) v5 - Type safety
- [Tailwind CSS](https://tailwindcss.com/) v4 - Styling
- [Shadcn/ui](https://ui.shadcn.com/) - Accessible React components

### Backend

- [Supabase](https://supabase.com/) - Backend-as-a-Service
  - PostgreSQL database
  - Built-in authentication
  - Type-safe SDK

### AI Integration

- [OpenRouter.ai](https://openrouter.ai/) - LLM API aggregator
  - Access to multiple AI models
  - Cost management and usage limits

### DevOps

- GitHub Actions - CI/CD pipelines
- DigitalOcean - Docker-based hosting

## Getting Started

### Prerequisites

- Node.js 22.14.0
- Supabase account
- OpenRouter.ai API key

### Installation

1. Clone the repository

```bash
git clone https://github.com/yourusername/10x-cards.git
cd 10x-cards
```

2. Install dependencies

```bash
bun install
```

3. Set up environment variables

```bash
cp .env.example .env
```

4. Start the development server

```bash
bun dev
```

## Available Scripts

```bash
# Development
bun dev          # Start development server

# Building
bun build        # Build for production
bun preview      # Preview production build

# Code Quality
bun lint         # Run ESLint
bun lint:fix     # Fix ESLint issues
bun format       # Format code with Prettier
```

## Project Scope

### Current Features

- User authentication and account management
- AI-powered flashcard generation
- Manual flashcard creation and editing
- Basic spaced repetition algorithm integration
- User data privacy and GDPR compliance

### MVP Limitations

- No mobile applications (web-only)
- No document import (PDF, DOCX)
- No public API
- No flashcard sharing between users
- Basic notification system
- Simple keyword-based flashcard search

### Success Metrics

- 75% AI-generated flashcard acceptance rate
- 75% of new flashcards created using AI
- User engagement tracking through generation/acceptance statistics

## Project Status

🚧 **Current Status**: In Development

### Version

- Current Version: 0.0.1
- Node Version Required: 22.14.0

### Development Focus

- Core flashcard generation functionality
- User authentication and data security
- Basic spaced repetition implementation

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
