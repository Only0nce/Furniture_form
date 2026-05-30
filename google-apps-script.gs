"use strict";

/* Configuration */
// Paste your Google Spreadsheet ID here. It is the long ID in the Sheet URL.
const SPREADSHEET_ID = "1vQ8s5UKh34ZcSosbOUQTZG-IoblIspb5UpxE6KEzPaU";

// Change this if your lead sheet tab uses a different name.
const SHEET_NAME = "Leads";

// Keep this order aligned with the Google Sheets columns documented in README.md.
const COLUMN_MAPPING = [
  "Timestamp",
  "Language",
  "Name",
  "Email",
  "Phone",
  "Line",
  "Instagram",
  "Facebook",
  "Address",
  "Interested Product",
  "Budget",
  "Message",
  "Consent",
  "User Agent",
  "Source",
];

const REQUIRED_FIELDS = ["name", "email", "phone", "address"];

/* Web App entry point */
function doPost(e) {
  try {
    const payload = parseRequestBody(e);
    validatePayload(payload);

    const sheet = getLeadSheet();
    ensureHeaderRow(sheet);
    sheet.appendRow(createLeadRow(payload));

    return createJsonResponse({
      success: true,
      message: "Lead saved successfully.",
    });
  } catch (error) {
    return createJsonResponse({
      success: false,
      message: error.message || "Unable to save lead.",
    });
  }
}

/* Optional health check for deployment testing */
function doGet() {
  return createJsonResponse({
    success: true,
    message: "Furniture lead form endpoint is running.",
  });
}

/* Request parsing */
function parseRequestBody(e) {
  if (!e || !e.postData || !e.postData.contents) {
    throw new Error("Missing request body.");
  }

  try {
    return JSON.parse(e.postData.contents);
  } catch (error) {
    throw new Error("Request body must be valid JSON.");
  }
}

/* Validation */
function validatePayload(payload) {
  REQUIRED_FIELDS.forEach(function (fieldName) {
    if (!String(payload[fieldName] || "").trim()) {
      throw new Error("Missing required field: " + fieldName);
    }
  });

  if (!isValidEmail(payload.email)) {
    throw new Error("Email format is invalid.");
  }

  if (!isValidPhone(payload.phone)) {
    throw new Error("Phone format is invalid.");
  }

  if (payload.consent !== true) {
    throw new Error("Consent is required.");
  }
}

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(value || "").trim());
}

function isValidPhone(value) {
  return /^[0-9+\-()\s]{7,20}$/.test(String(value || "").trim());
}

/* Google Sheets helpers */
function getLeadSheet() {
  if (SPREADSHEET_ID === "PASTE_YOUR_SPREADSHEET_ID_HERE") {
    throw new Error("Spreadsheet ID is not configured.");
  }

  const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = spreadsheet.getSheetByName(SHEET_NAME) || spreadsheet.insertSheet(SHEET_NAME);
  return sheet;
}

function ensureHeaderRow(sheet) {
  if (sheet.getLastRow() > 0) {
    return;
  }

  sheet.appendRow(COLUMN_MAPPING);
}

/* Row creation */
function createLeadRow(payload) {
  return [
    new Date(),
    cleanValue(payload.language),
    cleanValue(payload.name),
    cleanValue(payload.email),
    cleanValue(payload.phone),
    cleanValue(payload.line),
    cleanValue(payload.instagram),
    cleanValue(payload.facebook),
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

/* JSON response */
function createJsonResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
