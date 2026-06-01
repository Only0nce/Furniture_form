const BACKUP_CONFIG = {
  SPREADSHEET_ID: "YOUR_SPREADSHEET_ID",
  SHEET_NAME: "Leads",
  BACKUP_FOLDER_ID: "YOUR_GOOGLE_DRIVE_BACKUP_FOLDER_ID",
  TIMEZONE: "Asia/Bangkok",
};

const BACKUP_TRIGGER_FUNCTION = "backupLeadsToCsvWeekly";
const BACKUP_FILE_PREFIX = "nest-modern-design-leads-weekly-backup";
const UTF8_BOM = "\uFEFF";

function backupLeadsToCsvWeekly() {
  const spreadsheet = SpreadsheetApp.openById(BACKUP_CONFIG.SPREADSHEET_ID);
  const sheet = spreadsheet.getSheetByName(BACKUP_CONFIG.SHEET_NAME);

  if (!sheet) {
    throw new Error(`Sheet not found: ${BACKUP_CONFIG.SHEET_NAME}`);
  }

  const values = getSheetValues_(sheet);
  const csv = UTF8_BOM + values.map(rowToCsvLine_).join("\r\n");
  const fileName = `${BACKUP_FILE_PREFIX}-${getBackupDate_()}.csv`;
  const folder = DriveApp.getFolderById(BACKUP_CONFIG.BACKUP_FOLDER_ID);
  const blob = Utilities.newBlob(csv, "text/csv;charset=utf-8", fileName);

  return folder.createFile(blob);
}

function testWeeklyBackupNow() {
  return backupLeadsToCsvWeekly();
}

function createWeeklyBackupTrigger() {
  deleteWeeklyBackupTriggers();

  return ScriptApp.newTrigger(BACKUP_TRIGGER_FUNCTION)
    .timeBased()
    .onWeekDay(ScriptApp.WeekDay.MONDAY)
    .atHour(1)
    .inTimezone(BACKUP_CONFIG.TIMEZONE)
    .create();
}

function deleteWeeklyBackupTriggers() {
  ScriptApp.getProjectTriggers().forEach((trigger) => {
    if (trigger.getHandlerFunction() === BACKUP_TRIGGER_FUNCTION) {
      ScriptApp.deleteTrigger(trigger);
    }
  });
}

function getSheetValues_(sheet) {
  const lastRow = sheet.getLastRow();
  const lastColumn = sheet.getLastColumn();

  if (lastRow === 0 || lastColumn === 0) {
    return [];
  }

  return sheet.getRange(1, 1, lastRow, lastColumn).getDisplayValues();
}

function rowToCsvLine_(row) {
  return row.map(valueToCsvCell_).join(",");
}

function valueToCsvCell_(value) {
  const text = value === null || value === undefined ? "" : String(value);
  return `"${text.replace(/"/g, '""')}"`;
}

function getBackupDate_() {
  return Utilities.formatDate(new Date(), BACKUP_CONFIG.TIMEZONE, "yyyy-MM-dd");
}
