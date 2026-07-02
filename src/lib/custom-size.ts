export const CUSTOM_SIZE_FEE = 3.99;

export type CustomMeasurementField = {
  key: string;
  label: string;
  hint: string;
};

/**
 * The made-to-measure fields we ask the customer for. Values are free-form
 * strings (e.g. "24", "24 in") kept short. All optional, but at least one
 * must be provided to submit a custom-fit request.
 */
export const CUSTOM_MEASUREMENT_FIELDS: CustomMeasurementField[] = [
  { key: "chest", label: "Chest", hint: "around the fullest part" },
  { key: "shoulder", label: "Shoulder width", hint: "seam to seam" },
  { key: "sleeveLength", label: "Sleeve length", hint: "shoulder to wrist" },
  { key: "shirtLength", label: "Shirt / top length", hint: "shoulder to hem" },
  { key: "waist", label: "Waist", hint: "around natural waist" },
  { key: "trouserLength", label: "Trouser length", hint: "waist to ankle" },
];

export const CUSTOM_MEASUREMENT_KEYS = CUSTOM_MEASUREMENT_FIELDS.map((f) => f.key);

export const CUSTOM_NOTES_KEY = "notes";
const VALUE_MAX = 40;
const NOTES_MAX = 160;

export type CustomMeasurements = Record<string, string>;

export function measurementLabel(key: string): string {
  if (key === CUSTOM_NOTES_KEY) return "Notes";
  return CUSTOM_MEASUREMENT_FIELDS.find((f) => f.key === key)?.label ?? key;
}

/**
 * Trim + clamp an untrusted measurements object down to the allowed keys.
 * Used on both the client (before adding to cart) and the server (checkout).
 */
export function sanitizeMeasurements(
  input: Record<string, unknown> | null | undefined,
): CustomMeasurements {
  const out: CustomMeasurements = {};
  if (!input || typeof input !== "object") return out;

  for (const { key } of CUSTOM_MEASUREMENT_FIELDS) {
    const value = input[key];
    if (typeof value === "string" && value.trim()) {
      out[key] = value.trim().slice(0, VALUE_MAX);
    }
  }

  const notes = input[CUSTOM_NOTES_KEY];
  if (typeof notes === "string" && notes.trim()) {
    out[CUSTOM_NOTES_KEY] = notes.trim().slice(0, NOTES_MAX);
  }

  return out;
}

/** True when at least one real measurement (not just notes) is provided. */
export function hasMeasurements(measurements: CustomMeasurements): boolean {
  return CUSTOM_MEASUREMENT_KEYS.some((key) => Boolean(measurements[key]));
}

/**
 * Stable identity for a custom cart line so that identical measurements for the
 * same variant merge, while different measurements stay as separate lines and
 * never collide with the standard (non-custom) line of the same variant.
 */
export function buildCustomLineId(
  variantId: string,
  measurements: CustomMeasurements,
): string {
  const serialized = [...CUSTOM_MEASUREMENT_KEYS, CUSTOM_NOTES_KEY]
    .map((key) => `${key}:${measurements[key] ?? ""}`)
    .join("|");

  let hash = 0;
  for (let i = 0; i < serialized.length; i++) {
    hash = (hash * 31 + serialized.charCodeAt(i)) | 0;
  }

  return `${variantId}::custom::${(hash >>> 0).toString(36)}`;
}

/** Human-readable measurement summary, e.g. "Chest 24 in · Waist 22 in". */
export function summarizeMeasurements(measurements: CustomMeasurements): string {
  return CUSTOM_MEASUREMENT_FIELDS.filter((f) => measurements[f.key])
    .map((f) => `${f.label} ${measurements[f.key]}`)
    .join(" · ");
}
