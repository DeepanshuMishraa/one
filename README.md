

<p align="center">
  <a href="https://github.com/DeepanshuMishraa/One">
   <img src="https://raw.githubusercontent.com/DeepanshuMishraa/One/87386f66e1f293a49c08c40f445dd8b54434125d/public/logo.svg" alt="Logo">
  </a>

  <h3 align="center">One - Talk to Your Calendar</h3>

  <p align="center">
    The open-source Google Calendar successor.
    <br />
    <a href="https://one.deepanshumishra.xyz"><strong>Learn more »</strong></a>
    <br />
    <br />
    <a href="https://github.com/DeepanshuMishraa/One/discussions">Discussions</a>
    ·
    <a href="https://one.deepanshumishra.xyz">Website</a>
    ·
    <a href="https://github.com/DeepanshuMishraa/One/issues">Issues</a>
  </p>
</p>

# About the Project

<img width="100%" alt="Hero" src="https://raw.githubusercontent.com/DeepanshuMishraa/one/refs/heads/main/public/img.png">

One is a modern calendar application that lets you interact with your schedule through natural language. No more clicking through complex interfaces - simply tell One what you want to do.

## Features

- 🗣️ Natural language interactions with your calendar
- ✨ Add events and meetings with simple messages
- 🔄 Easily reschedule and move meetings
- 📝 Get quick summaries of your schedule
- 🎨 Beautiful, minimal interface

## Built with

- Next.js
- TypeScript
- Tailwind CSS
- Motion
- Shadcn UI
- TRPC
- PostgreSQL
- Drizzle

## Getting Started

This project is currently in early access. Join the waitlist at [one](https://one.deepanshumishra.xyz) to be notified when it launches.

## Development

1. Clone the repository

2. Install dependencies

```bash
bun install
```

3. Create a `.env` file and add the following variables:

```bash
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/postgres"
BETTERAUTH_SECRET=
BETTERAUTH_URL="http://localhost:3000"
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

```

4. Run the database migrations

```bash
cd packages/db
bun db:generate
bun db:push
```

5. Run the development server

```bash
bun dev
```

4. Build the project

```bash
bun build
```
