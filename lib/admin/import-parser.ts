import type { HeritageTimelineEvent } from "@/lib/types/heritage";

export type ImportRawRecord = Record<string, string>;

function normalizeHeader(value: string) {
  return value.trim().replace(/^\uFEFF/, "").toLowerCase().replace(/\s+/g, "_");
}

function parseCsvLine(line: string) {
  const cells: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let index = 0; index < line.length; index += 1) {
    const character = line[index];
    const nextCharacter = line[index + 1];

    if (character === '"' && inQuotes && nextCharacter === '"') {
      current += '"';
      index += 1;
      continue;
    }

    if (character === '"') {
      inQuotes = !inQuotes;
      continue;
    }

    if (character === "," && !inQuotes) {
      cells.push(current.trim());
      current = "";
      continue;
    }

    current += character;
  }

  cells.push(current.trim());
  return cells;
}

function splitCsvRows(source: string) {
  const rows: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let index = 0; index < source.length; index += 1) {
    const character = source[index];
    const nextCharacter = source[index + 1];

    if (character === '"' && inQuotes && nextCharacter === '"') {
      current += character + nextCharacter;
      index += 1;
      continue;
    }

    if (character === '"') {
      inQuotes = !inQuotes;
    }

    if ((character === "\n" || character === "\r") && !inQuotes) {
      if (current.trim()) {
        rows.push(current);
      }

      current = "";

      if (character === "\r" && nextCharacter === "\n") {
        index += 1;
      }

      continue;
    }

    current += character;
  }

  if (current.trim()) {
    rows.push(current);
  }

  return rows;
}

export function parseCsvRecords(source: string): ImportRawRecord[] {
  const lines = splitCsvRows(source);

  if (lines.length < 2) {
    return [];
  }

  const headers = parseCsvLine(lines[0]).map(normalizeHeader);

  return lines.slice(1).map((line) => {
    const cells = parseCsvLine(line);
    return Object.fromEntries(headers.map((header, index) => [header, cells[index] ?? ""]));
  });
}

export async function parseSpreadsheetFile(file: File): Promise<ImportRawRecord[]> {
  const lowerName = file.name.toLowerCase();

  if (lowerName.endsWith(".csv") || file.type.includes("csv")) {
    return parseCsvRecords(await file.text());
  }

  if (lowerName.endsWith(".xlsx")) {
    throw new Error("XLSX parsing requires a standard workbook XML parser in this deployment.");
  }

  throw new Error("Only CSV and XLSX files are supported.");
}

export function parseListValue(value: unknown) {
  if (Array.isArray(value)) {
    return value.map(String).map((item) => item.trim()).filter(Boolean);
  }

  if (typeof value !== "string") {
    return [];
  }

  return value
    .split(/\r?\n|,/)
    .map((item) => item.trim())
    .filter(Boolean);
}

export function parseTimelineValue(value: unknown): HeritageTimelineEvent[] {
  if (Array.isArray(value)) {
    return value.filter((item): item is HeritageTimelineEvent => {
      return (
        typeof item === "object" &&
        item !== null &&
        "year" in item &&
        "title" in item &&
        "description" in item
      );
    });
  }

  if (typeof value !== "string" || !value.trim()) {
    return [];
  }

  try {
    const parsed = JSON.parse(value) as unknown;

    if (Array.isArray(parsed)) {
      return parseTimelineValue(parsed);
    }
  } catch {
    // Fall through to compact text parsing.
  }

  return value
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => line.split("|").map((part) => part.trim()))
    .filter((parts) => parts.length >= 3)
    .map(([year, title, ...description]) => ({
      year,
      title,
      description: description.join(" | ")
    }))
    .filter((event) => event.year && event.title && event.description);
}
