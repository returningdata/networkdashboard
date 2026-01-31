import crypto from "crypto";

const pepper = process.env.AUTH_CODE_PEPPER || "dev_pepper";

export function hashAuthCode(raw: string) {
  return crypto.createHash("sha256").update(`${raw}:${pepper}`).digest("hex");
}
