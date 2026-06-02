# Furniture Customer Lead Form Website

A responsive customer inquiry form for a furniture business. Customers scan a QR Code, open the website, submit contact details, and a Google Apps Script Web App validates and writes the lead to Google Sheets.

## File Structure

```text
.
├── public/
│   ├── index.html
│   ├── style.css
│   ├── app.js
│   └── assets/
│       ├── logo.png
│       ├── furniture-showroom-hero.png
│       └── furniture-showroom-hero.webp
├── netlify/
│   └── functions/
│       └── submit-lead.js
├── scripts/
│   ├── lead-form-web-app.gs
│   └── google-sheets-weekly-backup.gs
├── netlify.toml
├── package.json
├── README.md
└── .gitignore
```

## Purpose of Each File

- `public/index.html`: Public page markup, language switcher, theme toggle, hero content, benefits, contact block, company footer, and customer form.
- `public/style.css`: Responsive light/dark furniture-inspired UI styling.
- `public/app.js`: Browser-safe UI validation, language/theme persistence, payload creation, and submission to the Google Apps Script Web App.
- `scripts/lead-form-web-app.gs`: Google Apps Script Web App backend that validates requests, verifies Cloudflare Turnstile, maps fields to the latest Google Sheets columns, and appends leads.
- `scripts/google-sheets-weekly-backup.gs`: Google Apps Script for weekly CSV backups from Google Sheets to Google Drive.
- `netlify.toml`: Safe Netlify static-site build configuration.
- `package.json`: Node dependency configuration for local checks and the legacy Netlify Function.
- `.gitignore`: Prevents credentials, local environment files, Netlify output, and dependencies from being committed.

## Frontend Setup

Only files inside `public/` are served to website visitors. The frontend submits to this public Google Apps Script Web App endpoint:

```javascript
fetch("https://script.google.com/macros/s/AKfycbwE-4ztZy39OS86U6emWKAp2puhCVFkgtf-x0AOh5KM938U9G0JcufTS77ZnsbwLKIoQQ/exec", {
  method: "POST",
  headers: {
    "Content-Type": "text/plain;charset=utf-8"
  },
  body: JSON.stringify(payload)
});
```

The request body is still JSON. `text/plain;charset=utf-8` keeps the browser request simple so Google Apps Script does not need to answer a CORS preflight `OPTIONS` request.

`public/app.js` must never contain Google Sheet IDs, sheet names, Google credentials, private keys, service account data, or Google Sheets column mapping. Browser JavaScript is always visible to users, so the real backend validation and spreadsheet write logic live in Apps Script.

Logo file path:

```text
public/assets/logo.png
```

Frontend logo path:

```text
assets/logo.png
```

## Company Information

Thai display:

```text
Brand display name: เนสท์ โมเดิร์น ดีไซน์
Legal company name: ห้างหุ้นส่วนจำกัด เนสท์ โมเดิร์น ดีไซน์ (สำนักงานใหญ่)
English company name: Nest Modern Design Ltd., Part.
Address: เลขที่ 22 หมู่ 6 ตำบลในเมือง อำเภอเมืองขอนแก่น จังหวัดขอนแก่น 40000
Tax ID: 0-4035-68004-38-7
Email: qu.acc66@gmail.com
```

English and Chinese display:

```text
Brand display name: Nest Modern Design Ltd., Part.
Legal company name: Nest Modern Design Ltd., Part. (Head Office)
Address: No. 22, Moo 6, Nai Mueang Subdistrict, Mueang Khon Kaen District, Khon Kaen Province 40000, Thailand
Tax ID: 0-4035-68004-38-7
Email: qu.acc66@gmail.com
```

The website renders company data from the `companyInfo` object in `public/app.js`. Update that object when company details change so the header, contact card, and footer stay consistent.

## Form Fields

Required:

- Name
- Phone number
- Consent checkbox

Optional:

- Email
- Address
- Interested product
- Estimated budget
- Additional message

Removed fields:

- Line ID
- Facebook
- Instagram

## Google Sheets Setup

1. Open the target Google Sheet.
2. Use this spreadsheet ID only inside Apps Script, not in `public/app.js`:

```text
1vQ8s5UKh34ZcSosbOUQTZG-IoblIspb5UpxE6KEzPaU
```

3. Rename the target tab to the same value set in `CONFIG.SHEET_NAME` inside `scripts/lead-form-web-app.gs`, for example `Leads`.
4. Add this header row manually, or run `setupHeader()` from Apps Script after pasting the backend code:

```text
Timestamp | Language | Name | Phone | Email | Address | Interested Product | Budget | Message | Consent | User Agent | Source
```

The Apps Script backend maps submitted values to this column order in `createLeadRow()` inside `scripts/lead-form-web-app.gs`. For lower production resource use, `CONFIG.CHECK_HEADER_ON_EVERY_SUBMIT` defaults to `false`, so normal submissions append directly and do not read the Sheet just to check headers.

Current Google Sheets columns:

```text
Timestamp
Language
Name
Phone
Email
Address
Interested Product
Budget
Message
Consent
User Agent
Source
```

New rows do not include Line, Instagram, or Facebook fields. If an older Google Sheet still has those columns, back up the sheet before manually removing old columns; the site and function do not delete existing Sheet data automatically.

## Apps Script Backend Setup

Use `scripts/lead-form-web-app.gs` as the full replacement backend code.

1. Open the Google Sheet.
2. Go to `Extensions > Apps Script`.
3. Replace the Apps Script editor contents with `scripts/lead-form-web-app.gs`.
4. Confirm this configuration at the top of the Apps Script file:

```javascript
const CONFIG = {
  SPREADSHEET_ID: "1vQ8s5UKh34ZcSosbOUQTZG-IoblIspb5UpxE6KEzPaU",
  SHEET_NAME: "Leads",
  CHECK_HEADER_ON_EVERY_SUBMIT: false,
  MIN_SUBMIT_SECONDS: 3,
  SAME_PHONE_COOLDOWN_SECONDS: 60,
  MAX_REQUEST_BODY_LENGTH: 8000,
  TURNSTILE_ENABLED: true,
  TURNSTILE_REQUIRED: true,
  TURNSTILE_SECRET_KEY: "",
  TURNSTILE_SECRET_PROPERTY_NAME: "TURNSTILE_SECRET_KEY"
};
```

5. Save the Apps Script project.
6. Select `setupHeader` and click `Run` to create or refresh the header row.
7. Authorize the script when Google prompts for Spreadsheet permissions.
8. Add the `TURNSTILE_SECRET_KEY` script property before testing submissions.
9. Deploy the script as a Web App:

```text
Deploy > Manage deployments > Edit
Select type: Web app
Execute as: Me
Who has access: Anyone or Anyone with the link
Create a new version
Deploy
```

10. Confirm the deployed `/exec` URL matches:

```text
https://script.google.com/macros/s/AKfycbwE-4ztZy39OS86U6emWKAp2puhCVFkgtf-x0AOh5KM938U9G0JcufTS77ZnsbwLKIoQQ/exec
```

## Cloudflare Turnstile Setup

Turnstile is enabled in the frontend and backend. The public site key is in `public/index.html`; the private secret key must be stored only in Google Apps Script.

1. Create a Cloudflare Turnstile widget for the deployed website domain.
2. Confirm `public/index.html` uses the public site key in the `.cf-turnstile` element.
3. In Apps Script, open `Project Settings > Script properties` and add `TURNSTILE_SECRET_KEY` with the Cloudflare secret key.
4. Leave `CONFIG.TURNSTILE_SECRET_KEY` empty unless you intentionally manage the secret inside Apps Script. Do not commit a real secret key to this repository.
5. Save Apps Script and deploy a new Web App version.

When `CONFIG.TURNSTILE_ENABLED` is `true`, Apps Script verifies `turnstileToken` only after JSON parsing, local validation, honeypot rejection, submit-time checks, phone validation, consent validation, language validation, and duplicate cooldown checks pass. Invalid local submissions do not call Cloudflare.

If Turnstile is enabled but no secret key is available, Apps Script returns a generic failure and does not open Google Sheets.

If Turnstile is enabled, `testDoPost()` with a fake token will fail verification. Use the live page for end-to-end Turnstile testing, or temporarily test backend validation before adding the secret key.

## Performance and Quota Optimization

Apps Script has execution, service, and URL fetch quotas, so normal submissions are ordered to avoid expensive work until cheaper checks pass.

- `doGet()` returns a simple health response and does not access `SpreadsheetApp`.
- `doPost()` rejects missing, invalid, or oversized bodies before validation work.
- Unknown fields, length limits, honeypot, `formStartedAt`, required fields, phone, email, consent, and language are validated before any Cloudflare or Google Sheets calls.
- Duplicate cooldown uses `CacheService` with `submit_phone_NORMALIZED_PHONE` for 60 seconds and stores only a flag, not customer details.
- Cloudflare Turnstile verification runs only when enabled and only after cheap local checks and the duplicate cooldown check pass.
- `SpreadsheetApp.openById()` runs only after validation succeeds and, when enabled, Turnstile verification succeeds.
- `CONFIG.CHECK_HEADER_ON_EVERY_SUBMIT` defaults to `false`; run `setupHeader()` manually during setup or after changing columns.
- Normal submissions append one row, do not read the full Sheet, do not scan rows for duplicates, and do not migrate or delete old columns.
- `LockService` is used only around the final optional header check and `appendRow()` step, keeping the lock duration short.

## Weekly CSV Backup in Google Drive

The weekly backup exports the current Google Sheet tab to a UTF-8 CSV file and saves it in a Google Drive folder. This protects submitted lead data outside the live Sheet and gives you a dated file that can be opened in Excel or restored manually if needed.

Backup script location:

```text
scripts/google-sheets-weekly-backup.gs
```

The script is designed for Google Apps Script attached to the Google Sheet. It runs every Monday at 01:00 Asia/Bangkok after you create the trigger.

1. In Google Drive, create a folder for backups, for example `Nest Modern Design Lead Backups`.
2. Open that folder and copy the folder ID from the URL. In `https://drive.google.com/drive/folders/FOLDER_ID_HERE`, the last part is `BACKUP_FOLDER_ID`.
3. Open the Google Sheet that receives leads.
4. Go to `Extensions > Apps Script`.
5. Paste the contents of `scripts/google-sheets-weekly-backup.gs` into the Apps Script editor.
6. Set the configuration values near the top:

```javascript
const BACKUP_CONFIG = {
  SPREADSHEET_ID: "YOUR_SPREADSHEET_ID",
  SHEET_NAME: "Leads",
  BACKUP_FOLDER_ID: "YOUR_GOOGLE_DRIVE_BACKUP_FOLDER_ID",
  TIMEZONE: "Asia/Bangkok",
};
```

Configuration notes:

- `SPREADSHEET_ID` is the long ID in the Google Sheet URL.
- `SHEET_NAME` must match the Sheet tab name, for example `Leads`.
- `BACKUP_FOLDER_ID` is the Google Drive folder ID copied above.
- `TIMEZONE` should stay `Asia/Bangkok` unless the business reporting timezone changes.

Manual test:

1. In Apps Script, select `testWeeklyBackupNow`.
2. Click `Run`.
3. Authorize the script when Google prompts for Spreadsheet and Drive permissions.
4. Open the backup folder and verify a CSV file appears with a name like `nest-modern-design-leads-weekly-backup-2026-06-01.csv`.

Create the weekly trigger:

1. In Apps Script, select `createWeeklyBackupTrigger`.
2. Click `Run`.
3. The script deletes existing triggers for `backupLeadsToCsvWeekly` before creating a new Monday 01:00 trigger, so duplicate weekly backup triggers are avoided.

Delete backup triggers:

1. In Apps Script, select `deleteWeeklyBackupTriggers`.
2. Click `Run`.
3. Existing triggers for `backupLeadsToCsvWeekly` are removed. Existing CSV backup files in Google Drive are not deleted.

## Local Development

Install dependencies:

```bash
npm install
```

For static frontend testing, serve the `public/` directory with any local web server. For Netlify-hosted testing, install or use Netlify CLI:

```bash
npm install -g netlify-cli
```

Run locally:

```bash
npm run dev
```

The form should call the Google Apps Script `/exec` endpoint configured in `public/app.js`.

## Deployment

1. Push the repository to GitHub.
2. In Netlify, create a new site from the GitHub repository.
3. Netlify reads `netlify.toml`:

```toml
[build]
publish = "public"
functions = "netlify/functions"
```

4. No Google credentials or Spreadsheet ID are required in Netlify environment variables for the Apps Script backend.
5. Deploy the site.

## Test Submission After Deploy

1. Open the deployed Netlify URL.
2. Submit once with missing name or phone to confirm validation.
3. Submit with name, phone, consent, and any optional fields.
4. Confirm the button shows a loading state and duplicate submissions are blocked while sending.
5. Confirm a success message appears.
6. Open Google Sheets and verify a new row appears.

If submission fails:

- Confirm `public/app.js` uses the latest Apps Script `/exec` URL.
- Confirm Apps Script was deployed as a new Web App version after code changes.
- Confirm the Web App is set to execute as `Me`.
- Confirm access is `Anyone` or `Anyone with the link`.
- Confirm `CONFIG.SHEET_NAME` matches the target tab name.
- Run `testDoPost()` in Apps Script and authorize the project if prompted.

Manual endpoint test:

```bash
FORM_STARTED_AT="$(($(date +%s%3N) - 5000))"

curl -i -L "https://script.google.com/macros/s/AKfycbwE-4ztZy39OS86U6emWKAp2puhCVFkgtf-x0AOh5KM938U9G0JcufTS77ZnsbwLKIoQQ/exec" \
  -H "Content-Type: text/plain;charset=utf-8" \
  -d '{
    "language":"th",
    "name":"Test Customer",
    "phone":"0812345678",
    "email":"",
    "address":"",
    "interestedProduct":"Chair",
    "budget":"Need consultation",
    "message":"Test message",
    "consent":true,
    "website":"",
    "formStartedAt":"'"${FORM_STARTED_AT}"'",
    "turnstileToken":"PASTE_FRESH_TURNSTILE_TOKEN_FROM_LIVE_PAGE",
    "userAgent":"curl-test",
    "source":"manual-test"
  }'
```

This manual endpoint test requires a fresh Turnstile token generated by the live page because backend verification is enabled.

Expected response:

```json
{
  "success": true,
  "message": "Lead saved successfully."
}
```

## QR Code Generation

The customer-facing website must not show a visible QR Code section, QR Code mockup, or deployment explanation. QR Code instructions belong only in this README.

1. Deploy the site on Netlify.
2. Copy the public Netlify site URL.
3. Generate a QR Code from the website URL, not the function URL.
4. Customers can scan the generated QR Code to open the website and submit the form.
5. Test the QR Code on a mobile phone before printing.

## Security

- Frontend JavaScript can always be viewed in the browser. Do not try to hide `public/app.js`.
- `public/app.js` may contain UI handling, basic user-friendly validation, loading state, success/error handling, and the public Apps Script endpoint.
- `public/app.js` must not contain Spreadsheet IDs, sheet names, Google credentials, private keys, service account data, or Google Sheets column mapping.
- Apps Script Web App source code is not served to normal website visitors.
- Apps Script performs the real backend validation, Turnstile verification, duplicate cooldown checks, column mapping, and row append.
- Backend files must stay outside `public/`.
- `.env`, `.env.*`, `service-account.json`, private keys, `node_modules/`, and `.netlify/` are ignored by git.
