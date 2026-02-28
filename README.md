# EHS Computer Science Discord Bot

A lightweight bot built with [discord.js](https://discord.js.org/) and [Drizzle ORM](https://orm.drizzle.team/) running on the [Bun](https://bun.com) JavaScript runtime.  
It is designed for Cheyenne East High School's Computer Science server.

---

This bot was created to help manage the verification process for new members, and to provide a way to easily support new features in the server.
---

## 🛠 Prerequisites

- **Bun** (v1.3.6 or later) – the runtime used to run and build the project
- **PostgreSQL** database (URL must be exposed via `DATABASE_URL`)
- **Discord bot token** with the necessary gateway intents (`Guilds`, `GuildMembers`)

---

## ✅ Setup

1. **Clone the repository** and change into the project directory:

   ```powershell
   git clone https://github.com/altie122/EHS-Comp-Sci-Bot.git
   cd EHS-Comp-Sci-Bot
   ```

2. **Install dependencies**:

   ```bash
   bun install
   ```

3. **Environment variables** – create a `.env` file or export in your shell:

   ```env
   DISCORD_TOKEN=your_bot_token_here
   DATABASE_URL=postgres://user:pass@host:port/dbname
   ```

4. **Prepare the database** using Drizzle migrations:

   ```bash
   # generate new migration skeleton:
   bunx drizzle-kit generate:pg
   # or run all pending migrations:
   bunx drizzle-kit migrate:up
   ```

   The schema currently defines a simple `config` table to hold JSON data.

5. **Start the bot**:
   ```bash
   bun run .
   ```
   You should see `Logged in as <bot-username>!` in the console.

---

## 📦 Deploying & Development

- Use `bun run .` for development; Bun’s fast rebuilds make edits quick.
- You can run TypeScript files directly – there’s no separate build step.
- Add new commands in `src/bot.ts` under the `interaction.isChatInputCommand()` section.
- Database helpers live in `src/config.ts`; Drizzle’s typed queries are defined in `src/db/schema.ts`.

---

## 📋 Commands

| Command              | Description                           | Restriction    |
| -------------------- | ------------------------------------- | -------------- |
| `/ping`              | Replies with `Pong!`                  | anyone         |
| `/init_verification` | Sets up verification embeds and roles | administrators |

> **Configuration arguments** for `/init_verification`:
>
> - `unverified_role` – role to remove after verification
> - `verified_role` – role to grant when verified
> - `verification_channel` – channel where the bot posts the button
> - `rules_channel` & `rules_message_id` – where the rules are stored

---

## 🧠 How it Works

1. Admin runs `/init_verification` with appropriate channels/roles.
2. Bot sends an embed with a **Verify Me** button in the chosen channel.
3. User clicks button → modal pops up asking for full name.
4. Submission sets the member’s nickname and swaps their roles.
5. All configuration is saved to the `config` table in JSON form.

---

## 📁 Project Structure

```
src/
 ├─ bot.ts            # main event handling, commands & interactions
 ├─ config.ts         # persistence helpers for verification config
 ├─ db/               # Drizzle client & schema
 │   ├─ client.ts
 │   └─ schema.ts
```

Migration files live in the `drizzle/` directory and are managed by `drizzle-kit`.

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/foo`)
3. Make your changes, add tests if appropriate
4. Submit a pull request describing your work

Please keep dependencies minimal and maintain compatibility with Bun and PostgreSQL.
