const LEAD_FORM_CONFIG = {
  SPREADSHEET_ID: "1vQ8s5UKh34ZcSosbOUQTZG-IoblIspb5UpxE6KEzPaU",
  SHEET_NAME: "Leads",
};

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

const REQUIRED_FIELDS = ["name", "phone"];

function doGet() {
  return createJsonResponse({
    success: true,
    message: "Nest Modern Design lead form endpoint is running.",
    sheetName: LEAD_FORM_CONFIG.SHEET_NAME,
    columns: COLUMN_MAPPING.length,
  });
}

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
    console.error("Lead submission failed:", error);

    return createJsonResponse({
      success: false,
      message: error.publicMessage || "Unable to save submission. Please try again.",
    });
  }
}

function parseRequestBody(e) {
  if (!e || !e.postData || !e.postData.contents) {
    throw publicError("Unable to save submission. Please try again.");
  }

  try {
    const payload = JSON.parse(e.postData.contents);

    if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
      throw new Error("Request body must be a JSON object.");
    }

    return payload;
  } catch (error) {
    throw publicError("Unable to save submission. Please try again.");
  }
}

function validatePayload(payload) {
  REQUIRED_FIELDS.forEach((fieldName) => {
    if (!cleanValue(payload[fieldName])) {
      throw publicError("Missing required field: " + fieldName);
    }
  });

  if (!isValidPhone(payload.phone)) {
    throw publicError("Please enter a valid phone number.");
  }

  if (cleanValue(payload.email) && !isValidEmail(payload.email)) {
    throw publicError("Please enter a valid email address.");
  }

  if (payload.consent !== true) {
    throw publicError("Please confirm your consent before submitting.");
  }
}

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(cleanValue(value));
}

function isValidPhone(value) {
  return /^[0-9+\-()\s]{7,20}$/.test(cleanValue(value));
}

function getLeadSheet() {
  const spreadsheet = SpreadsheetApp.openById(LEAD_FORM_CONFIG.SPREADSHEET_ID);
  let sheet = spreadsheet.getSheetByName(LEAD_FORM_CONFIG.SHEET_NAME);

  if (!sheet) {
    sheet = spreadsheet.insertSheet(LEAD_FORM_CONFIG.SHEET_NAME);
  }

  return sheet;
}

function ensureHeaderRow(sheet) {
  if (sheet.getLastRow() === 0) {
    sheet.getRange(1, 1, 1, COLUMN_MAPPING.length).setValues([COLUMN_MAPPING]);
  }
}

function setupHeader() {
  const sheet = getLeadSheet();
  sheet.getRange(1, 1, 1, COLUMN_MAPPING.length).setValues([COLUMN_MAPPING]);

  return createJsonResponse({
    success: true,
    message: "Header row updated.",
    columns: COLUMN_MAPPING.length,
  });
}

function createLeadRow(payload) {
  return [
    new Date(),
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

function publicError(publicMessage) {
  const error = new Error(publicMessage);
  error.publicMessage = publicMessage;
  return error;
}

function createJsonResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

function testDoPost() {
  const event = {
    postData: {
      contents: JSON.stringify({
        language: "th",
        name: "Test Customer",
        phone: "0812345678",
        email: "",
        address: "",
        interestedProduct: "Chair",
        budget: "Need consultation",
        message: "Test message",
        consent: true,
        userAgent: "apps-script-test",
        source: "manual-test",
      }),
    },
  };

  return doPost(event);
}
