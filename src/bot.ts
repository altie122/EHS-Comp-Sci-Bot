import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChannelType,
  Client,
  EmbedBuilder,
  Events,
  GatewayIntentBits,
  ModalBuilder,
  TextChannel,
  TextInputBuilder,
  TextInputStyle,
} from "discord.js";
import { GetVerificationConfig, SetVerificationConfig } from "./config";

export async function startBot({ DISCORD_TOKEN }: { DISCORD_TOKEN: string }) {
  const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers],
  });

  client.on(Events.ClientReady, (readyClient) => {
    console.log(`Logged in as ${readyClient.user.tag}!`);
  });

  client.on(Events.InteractionCreate, async (interaction) => {
    try {
      //
      // Slash commands
      //
      if (interaction.isChatInputCommand()) {
        if (interaction.commandName === "ping") {
          return await interaction.reply("Pong!");
        }

        if (interaction.commandName === "init_verification") {
          try {
            //
            // Validate inputs
            //
            const savedConfig = GetVerificationConfig();
            const unverifiedRole = interaction.options.getRole("unverified_role");
            const verifiedRole = interaction.options.getRole("verified_role");
            const verificationChannel = interaction.options.getChannel("verification_channel");
            const rulesChannel = interaction.options.getChannel("rules_channel");
            const rulesMessageId = interaction.options.get("rules_message_id");

            if (!unverifiedRole || !verifiedRole || !verificationChannel || !rulesChannel || !rulesMessageId) {
              return await interaction.reply({ content: "Invalid arguments!", flags: 64 });
            }
            if (verificationChannel.type !== ChannelType.GuildText || rulesChannel.type !== ChannelType.GuildText) {
              return await interaction.reply({ content: "Channels must be text-based.", flags: 64 });
            }
            if (!rulesMessageId.value || typeof rulesMessageId.value !== "string") {
              return await interaction.reply({ content: "Rules message ID must be a string.", flags: 64 });
            }
            if (!(verificationChannel instanceof TextChannel) || !verificationChannel.isSendable()) {
              return await interaction.reply({ content: "Verification channel must be sendable.", flags: 64 });
            }
            if (!(rulesChannel instanceof TextChannel)) {
              return await interaction.reply({ content: "Rules channel must be text-based.", flags: 64 });
            }

            //
            // Fetch rules message
            //
            let rulesMessage;
            try {
              rulesMessage = await rulesChannel.messages.fetch(rulesMessageId.value);
            } catch (err) {
              console.error("Failed to fetch rules message:", err);
              return await interaction.reply({
                content: "Could not fetch the rules message. Check the ID.",
                flags: 64,
              });
            }

            //
            // Build embed
            //
            const embed = new EmbedBuilder()
              .setTitle("Student Verification")
              .setDescription(
                `Click the button below to verify that you agree to the following rules:\n\n${rulesMessage.content}`
              )
              .setColor(0x00aaff);

            const button = new ActionRowBuilder<ButtonBuilder>().addComponents(
              new ButtonBuilder()
                .setCustomId("open_verification_modal")
                .setLabel("Verify Me")
                .setStyle(ButtonStyle.Primary)
            );

            //
            // Send verification message
            //
            let sentMessage;
            try {
              sentMessage = await verificationChannel.send({
                embeds: [embed],
                components: [button],
              });
            } catch (err) {
              console.error("Failed to send verification message:", err);
              return await interaction.reply({
                content: "Failed to send verification message.",
                flags: 64,
              });
            }

            //
            // Delete old message if exists
            //
            if (savedConfig) {
              const previousChannel = client.channels.cache.get(savedConfig.verificationChannelId);
              if (previousChannel?.isTextBased()) {
                try {
                  const oldMessage = await previousChannel.messages.fetch(savedConfig.verificationMessageId);
                  await oldMessage.delete();
                } catch (_) {
                  // ignore missing or deleted messages
                }
              }
            }

            //
            // Save config
            //
            SetVerificationConfig({
              verificationChannelId: verificationChannel.id,
              verificationRoleId: verifiedRole.id,
              unverifiedRoleId: unverifiedRole.id,
              verificationMessageId: sentMessage.id,
              rulesChannelId: rulesChannel.id,
              rulesMessageId: rulesMessageId.value,
            });

            await interaction.reply("Verification system initialized!");
          } catch (error) {
            console.error("init_verification failed:", error);
            return await interaction.reply({
              content: "Something went wrong during setup.",
              flags: 64,
            });
          }
        }
      }

      //
      // Button press → open modal
      //
      if (interaction.isButton()) {
        if (interaction.customId === "open_verification_modal") {
          try {
            const modal = new ModalBuilder()
              .setTitle("Student Verification")
              .setCustomId("verification_modal");

            const nameInput = new TextInputBuilder()
              .setCustomId("student_name")
              .setLabel("Your full name")
              .setStyle(TextInputStyle.Short)
              .setRequired(true);

            const row1 = new ActionRowBuilder<TextInputBuilder>().addComponents(nameInput);

            modal.addComponents(row1);

            await interaction.showModal(modal);
          } catch (error) {
            console.error("Modal open failed:", error);
          }
        }
        return;
      }

      //
      // Modal submit
      //
      if (interaction.isModalSubmit()) {
        if (interaction.customId === "verification_modal") {
          try {
            const savedConfig = GetVerificationConfig();
            if (!savedConfig) return;

            const name = interaction.fields.getTextInputValue("student_name");
            const guild = interaction.guild;
            if (!guild) return;

            const member = await guild.members.fetch(interaction.user.id);

            //
            // Set nickname
            //
            try {
              await member.setNickname(name);
            } catch (err) {
              console.error("Failed to set nickname:", err);
            }

            //
            // Assign roles
            //
            try {
              await member.roles.add(savedConfig.verificationRoleId);
            } catch (err) {
              console.error("Failed to add verification role:", err);
            }

            try {
              await member.roles.remove(savedConfig.unverifiedRoleId);
            } catch (err) {
              console.error("Failed to remove unverified role:", err);
            }

            await interaction.reply({
              content: `Thanks! Verification submitted.\nName: ${name}`,
              flags: 64,
            });
          } catch (error) {
            console.error("Modal submit failed:", error);
          }
        }
      }
    } catch (fatalErr) {
      console.error("Unhandled interaction error:", fatalErr);
    }
  });

  //
  // GLOBAL SAFETY NET (bot will NEVER crash)
  //
  process.on("unhandledRejection", (err) => {
    console.error("UNHANDLED PROMISE REJECTION:", err);
  });

  process.on("uncaughtException", (err) => {
    console.error("UNCAUGHT EXCEPTION:", err);
  });

  client.login(DISCORD_TOKEN);
}