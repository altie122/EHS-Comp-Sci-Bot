import fs from "fs";
import path from "path";

const configFolderPath = path.join(process.cwd(), "config/");

type VerificationConfig = {
  verificationChannelId: string;
  verificationRoleId: string;
  unverifiedRoleId: string;
  verificationMessageId: string;
  rulesChannelId: string;
  rulesMessageId: string;
};

export function GetVerificationConfig() {
  const configFilePath = path.join(configFolderPath, "verification.json");

  if (!fs.existsSync(configFilePath)) {
    fs.writeFileSync(configFilePath, "");
    return undefined;
  }

  return JSON.parse(fs.readFileSync(configFilePath, "utf8")) as VerificationConfig;
};

export function SetVerificationConfig(config: VerificationConfig) {
  const configFilePath = path.join(configFolderPath, "verification.json");
  fs.writeFileSync(configFilePath, JSON.stringify(config));
};