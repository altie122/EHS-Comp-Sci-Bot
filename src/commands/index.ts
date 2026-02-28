import { ChannelType, REST, Routes } from "discord.js";

const commands = [
  {
    name: "ping",
    description: "Replies with Pong!",
  },
  {
    name: "init_verification",
    description: "Initializes verification channel",
    default_member_permissions: "8",
    options: [
      {
        name: "unverified_role",
        description: "Role to remove after verification",
        type: 8,
        required: true,
      },
      {
        name: "verified_role",
        description: "Role to assign after verification",
        type: 8,
        required: true,
      },
      {
        name: "verification_channel",
        description: "Channel to create for verification",
        type: 7,
        required: true,
        ChannelType: ChannelType.GuildText,
      },
      {
        name: "rules_channel",
        description: "Channel to create for rules",
        type: 7,
        required: true,
        ChannelType: ChannelType.GuildText,
      },
      {
        name: "rules_message_id",
        description: "Message to create for rules",
        type: 3,
        required: true,
      }
    ],
  },
];

export async function setupCommands({
  DISCORD_TOKEN,
  CLIENT_ID,
}: {
  DISCORD_TOKEN: string;
  CLIENT_ID: string;
}) {
  const rest = new REST({ version: "10" }).setToken(DISCORD_TOKEN);

  try {
    console.log("Started refreshing application (/) commands.");

    await rest.put(Routes.applicationCommands(CLIENT_ID), {
      body: commands,
    });

    console.log("Successfully reloaded application (/) commands.");
  } catch (error) {
    console.error(error);
  }
}
