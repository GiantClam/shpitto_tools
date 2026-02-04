import { promises as fs } from "fs";
import path from "path";

const logDir = path.join(process.cwd(), "logs");
const logFile = path.join(logDir, "creation.log");

const ensureLogDir = async () => {
  await fs.mkdir(logDir, { recursive: true });
};

const appendLine = async (line: string) => {
  try {
    await ensureLogDir();
    await fs.appendFile(logFile, line);
  } catch (error) {
    // Avoid throwing from logger; console is still the primary sink.
  }
};

const formatLine = (level: string, payloads: unknown[]) => {
  const timestamp = new Date().toISOString();
  const text = payloads
    .map((payload) => {
      if (typeof payload === "string") return payload;
      try {
        return JSON.stringify(payload);
      } catch {
        return String(payload);
      }
    })
    .join(" ");
  return `[${timestamp}] ${level.toUpperCase()} ${text}\n`;
};

export const logInfo = (...payloads: unknown[]) => {
  const line = formatLine("info", payloads);
  void appendLine(line);
  console.info(...payloads);
};

export const logWarn = (...payloads: unknown[]) => {
  const line = formatLine("warn", payloads);
  void appendLine(line);
  console.warn(...payloads);
};

export const logError = (...payloads: unknown[]) => {
  const line = formatLine("error", payloads);
  void appendLine(line);
  console.error(...payloads);
};
