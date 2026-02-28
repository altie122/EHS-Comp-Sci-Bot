import { setupCommands } from "./src/commands/index";
import { startBot } from "./src/bot";
import { getVerificationConfig } from "./src/config";

async function main() {
  // Initialize environment variables
  const DISCORD_TOKEN = process.env.DISCORD_TOKEN;
  if (!DISCORD_TOKEN) throw new Error("DISCORD_TOKEN is not set");
  const CLIENT_ID = process.env.CLIENT_ID;
  if (!CLIENT_ID) throw new Error("CLIENT_ID is not set");
  const GUILD_ID = process.env.GUILD_ID;
  if (!GUILD_ID) throw new Error("GUILD_ID is not set");

  // Set up application (/) commands
  await setupCommands({ DISCORD_TOKEN, CLIENT_ID });

  // Start bot
  await startBot({ DISCORD_TOKEN });

  console.log(await getVerificationConfig())
}

main();
