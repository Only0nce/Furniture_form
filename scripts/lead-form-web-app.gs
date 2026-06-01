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
const ALLOWED_FIELDS = [
  "language",
  "name",
  "phone",
  "email",
  "address",
  "interestedProduct",
  "budget",
  "message",
  "consent",
  "website",
  "formStartedAt",
  "userAgent",
  "source",
];

const FIELD_LIMITS = {
  language: 5,
  name: 80,
  phone: 30,
  email: 120,
  address: 500,
  interestedProduct: 100,
  budget: 100,
  message: 1000,
  website: 100,
  formStartedAt: 30,
  userAgent: 300,
  source: 500,
};

const ALLOWED_LANGUAGES = ["th", "en", "zh"];
const MIN_SUBMIT_SECONDS = 3;
const SAME_PHONE_COOLDOWN_SECONDS = 60;

function doGet() {
  return createJsonResponse({
    success: true,
    message: "Endpoint is running.",
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
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    throw new Error("Invalid request.");
  }

  rejectUnknownFields(payload);
  validateFieldLengths(payload);

  if (cleanValue(payload.website)) {
    throw new Error("Invalid request.");
  }

  validateSubmitTime(payload.formStartedAt);

  REQUIRED_FIELDS.forEach((fieldName) => {
    if (!cleanValue(payload[fieldName])) {
      throw new Error("Missing required field: " + fieldName);
    }
  });

  if (!isValidPhone(payload.phone)) {
    throw new Error("Phone format is invalid.");
  }

  if (cleanValue(payload.email) && !isValidEmail(payload.email)) {
    throw new Error("Email format is invalid.");
  }

  if (payload.consent !== true) {
    throw new Error("Consent is required.");
  }

  const language = cleanValue(payload.language);
  if (language && ALLOWED_LANGUAGES.indexOf(language) === -1) {
    throw new Error("Invalid language.");
  }

  checkDuplicateCooldown(payload.phone);
}

function rejectUnknownFields(payload) {
  Object.keys(payload).forEach((key) => {
    if (ALLOWED_FIELDS.indexOf(key) === -1) {
      throw new Error("Invalid field: " + key);
    }
  });
}

function validateFieldLengths(payload) {
  Object.keys(FIELD_LIMITS).forEach((key) => {
    const value = cleanValue(payload[key]);

    if (value.length > FIELD_LIMITS[key]) {
      throw new Error("Field is too long: " + key);
    }
  });
}

function validateSubmitTime(formStartedAt) {
  const startedAt = Number(formStartedAt);

  if (!startedAt || isNaN(startedAt)) {
    throw new Error("Invalid submit time.");
  }

  const elapsedMs = Date.now() - startedAt;

  if (elapsedMs < MIN_SUBMIT_SECONDS * 1000) {
    throw new Error("Please wait before submitting.");
  }

  if (elapsedMs > 24 * 60 * 60 * 1000) {
    throw new Error("Form session expired.");
  }
}

function checkDuplicateCooldown(phone) {
  const normalizedPhone = cleanValue(phone).replace(/\D/g, "");

  if (!normalizedPhone) {
    throw new Error("Phone format is invalid.");
  }

  const cache = CacheService.getScriptCache();
  const cacheKey = "phone_submit_" + normalizedPhone;

  if (cache.get(cacheKey)) {
    throw new Error("Please wait before submitting again.");
  }

  cache.put(cacheKey, "1", SAME_PHONE_COOLDOWN_SECONDS);
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
    cleanCell(payload.language, FIELD_LIMITS.language),
    cleanCell(payload.name, FIELD_LIMITS.name),
    cleanCell(payload.phone, FIELD_LIMITS.phone),
    cleanCell(payload.email, FIELD_LIMITS.email),
    cleanCell(payload.address, FIELD_LIMITS.address),
    cleanCell(payload.interestedProduct, FIELD_LIMITS.interestedProduct),
    cleanCell(payload.budget, FIELD_LIMITS.budget),
    cleanCell(payload.message, FIELD_LIMITS.message),
    payload.consent === true ? "Yes" : "No",
    cleanCell(payload.userAgent, FIELD_LIMITS.userAgent),
    cleanCell(payload.source, FIELD_LIMITS.source),
  ];
}

function cleanValue(value) {
  return String(value || "").trim();
}

function cleanCell(value, maxLength) {
  const text = cleanValue(value).slice(0, maxLength || 500);

  if (/^[=+\-@]/.test(text)) {
    return "'" + text;
  }

  return text;
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
        website: "",
        formStartedAt: String(Date.now() - 5000),
        userAgent: "apps-script-test",
        source: "manual-test",
      }),
    },
  };

  return doPost(event);
}
