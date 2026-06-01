"use strict";

const { google } = require("googleapis");

/* Configuration */
const REQUIRED_ENV_VARS = [
  "GOOGLE_SHEET_ID",
  "GOOGLE_SERVICE_ACCOUNT_EMAIL",
  "GOOGLE_PRIVATE_KEY",
  "GOOGLE_SHEET_NAME",
];

const REQUIRED_FIELDS = ["name", "phone"];
const REMOVED_FIELDS = ["line", "instagram", "facebook"];
const MAX_BODY_BYTES = 20 * 1024;

// Keep this order aligned with the Google Sheets columns documented in README.md.
const COLUMN_MAPPING = [
  "Timestamp",
  "Language",
  "Name",
  "Phone",
  "Email",
  "Address",
  "Interested Product",
  "Budget",
  "Message",
  "Consent",
  "User Agent",
  "Source",
];

/* Netlify Function entry point */
exports.handler = async function submitLead(event) {
  if (event.httpMethod !== "POST") {
    return jsonResponse(405, {
      success: false,
      message: "Method Not Allowed",
    });
  }

  try {
    const payload = parseJsonBody(event.body);
    validatePayload(payload);
    assertEnvironmentConfigured();
    await appendLeadToSheet(payload);

    return jsonResponse(200, {
      success: true,
      message: "Submission saved successfully.",
    });
  } catch (error) {
    // Log internal details server-side only. Never return stack traces or
    // credential details to the browser.
    console.error("Lead submission failed:", error);

    return jsonResponse(error.statusCode || 500, {
      success: false,
      message: "Unable to save submission. Please try again.",
    });
  }
};

/* Request parsing */
function parseJsonBody(body) {
  if (!body) {
    throw publicError(400, "Unable to save submission. Please try again.");
  }

  if (Buffer.byteLength(body, "utf8") > MAX_BODY_BYTES) {
    throw publicError(413, "Unable to save submission. Please try again.");
  }

  try {
    const payload = JSON.parse(body);

    if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
      throw new Error("Request body must be a JSON object.");
    }

    return payload;
  } catch (error) {
    throw publicError(400, "Unable to save submission. Please try again.");
  }
}

/* Validation */
function validatePayload(payload) {
  REMOVED_FIELDS.forEach((fieldName) => {
    if (Object.prototype.hasOwnProperty.call(payload, fieldName)) {
      throw publicError(400, "Unable to save submission. Please try again.");
    }
  });

  REQUIRED_FIELDS.forEach((fieldName) => {
    if (!cleanValue(payload[fieldName])) {
      throw publicError(400, "Please enter your name and phone number.");
    }
  });

  if (!isValidPhone(payload.phone)) {
    throw publicError(400, "Please enter a valid phone number.");
  }

  if (payload.email && !isValidEmail(payload.email)) {
    throw publicError(400, "Please enter a valid email address.");
  }

  if (payload.consent !== true) {
    throw publicError(400, "Please confirm your consent before submitting.");
  }
}

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(cleanValue(value));
}

function isValidPhone(value) {
  return /^[0-9+\-()\s]{7,20}$/.test(cleanValue(value));
}

/* Google Sheets API */
async function appendLeadToSheet(payload) {
  const auth = createGoogleAuthClient();
  const sheets = google.sheets({ version: "v4", auth });

  await sheets.spreadsheets.values.append({
    spreadsheetId: process.env.GOOGLE_SHEET_ID,
    range: getAppendRange(process.env.GOOGLE_SHEET_NAME),
    valueInputOption: "USER_ENTERED",
    insertDataOption: "INSERT_ROWS",
    requestBody: {
      values: [createLeadRow(payload)],
    },
  });
}

function createGoogleAuthClient() {
  const privateKey = process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n");

  return new google.auth.JWT({
    email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    key: privateKey,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
}

function getAppendRange(sheetName) {
  const safeSheetName = String(sheetName || "Leads").replace(/'/g, "''");
  return `'${safeSheetName}'!A:L`;
}

/* Row creation */
function createLeadRow(payload) {
  return [
    new Date().toISOString(),
    cleanValue(payload.language),
    cleanValue(payload.name),
    cleanValue(payload.phone),
    cleanValue(payload.email),
    cleanValue(payload.address),
    cleanValue(payload.interestedProduct),
    cleanValue(payload.budget),
    cleanValue(payload.message),
    payload.consent === true ? "Yes" : "No",
    cleanValue(payload.userAgent),
    cleanValue(payload.source),
  ];
}

function cleanValue(value) {
  return String(value || "").trim();
}

/* Environment and response helpers */
function assertEnvironmentConfigured() {
  const missingVars = REQUIRED_ENV_VARS.filter((name) => !process.env[name]);

  if (missingVars.length > 0) {
    throw new Error("Missing required environment variables: " + missingVars.join(", "));
  }
}

function publicError(statusCode, publicMessage) {
  const error = new Error(publicMessage);
  error.statusCode = statusCode;
  error.publicMessage = publicMessage;
  return error;
}

function jsonResponse(statusCode, body) {
  return {
    statusCode,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store",
    },
    body: JSON.stringify(body),
  };
}

module.exports.COLUMN_MAPPING = COLUMN_MAPPING;
