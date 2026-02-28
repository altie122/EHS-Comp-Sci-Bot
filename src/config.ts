import { db } from "./db/client";
import { config } from "./db/schema";
import { eq } from "drizzle-orm";

export type VerificationConfig = {
  verificationChannelId: string;
  verificationRoleId: string;
  unverifiedRoleId: string;
  verificationMessageId: string;
  rulesChannelId: string;
  rulesMessageId: string;
};

// Fetch config
export async function getVerificationConfig() {
  const row = await db
    .select()
    .from(config)
    .where(eq(config.id, "verification_config"))
    .limit(1);

  return row[0]?.data as VerificationConfig | undefined;
}

// Save config
export async function setVerificationConfig(data: VerificationConfig) {
  await db
    .insert(config)
    .values({ id: "verification_config", data })
    .onConflictDoUpdate({
      target: config.id,
      set: { data },
    });
}