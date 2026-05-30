# Furniture Customer Lead Form Website

A static customer inquiry website for a furniture business. Customers scan a QR Code, open the form on mobile, tablet, or desktop, and submit contact details into Google Sheets through a Google Apps Script Web App.

## File Structure

```text
.
├── index.html
├── style.css
├── app.js
├── google-apps-script.gs
├── README.md
└── assets/
    ├── furniture-showroom-hero.png
    └── furniture-showroom-hero.webp
```

## Purpose of Each File

- `index.html`: Semantic page structure, header, hero, benefits, customer form, QR explanation, footer, language switcher, and theme toggle.
- `style.css`: Responsive layout, light and dark theme variables, furniture-inspired styling, form states, and mobile/tablet/desktop media queries.
- `app.js`: Language switching, theme persistence, form validation, loading/success/error states, duplicate-submit prevention, and Google Apps Script submission.
- `google-apps-script.gs`: Google Apps Script backend that validates incoming JSON and appends each lead to Google Sheets.
- `assets/furniture-showroom-hero.webp`: Optimized hero image used by modern browsers.
- `assets/furniture-showroom-hero.png`: PNG fallback for the hero image.

## Google Sheets Setup

1. Create a new Google Sheet.
2. Rename the first tab to `Leads`.
3. Add this header row in row 1:

```text
Timestamp | Language | Name | Email | Phone | Line | Instagram | Facebook | Address | Interested Product | Budget | Message | Consent | User Agent | Source
```

The Apps Script also creates this header row automatically if the sheet is empty, but adding it manually makes testing easier.

## Google Apps Script Setup

1. In the Google Sheet, go to `Extensions > Apps Script`.
2. Delete any starter code.
3. Paste the full contents of `google-apps-script.gs`.
4. In `google-apps-script.gs`, set:

```javascript
const SPREADSHEET_ID = "PASTE_YOUR_SPREADSHEET_ID_HERE";
```

Use the long ID from your Google Sheet URL:

```text
https://docs.google.com/spreadsheets/d/SPREADSHEET_ID_HERE/edit
```

5. Confirm the sheet tab name:

```javascript
const SHEET_NAME = "Leads";
```

## Deploy Google Apps Script as a Web App

1. In Apps Script, click `Deploy > New deployment`.
2. Choose `Web app`.
3. Set `Execute as` to `Me`.
4. Set `Who has access` to `Anyone` or `Anyone with the link`.
5. Click `Deploy`.
6. Authorize the script when prompted.
7. Copy the Web App URL ending in `/exec`.

## Connect the Website to Google Sheets

Open `app.js` and paste the deployed Web App URL here:

```javascript
GOOGLE_APPS_SCRIPT_WEB_APP_URL: "https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec",
```

Do not paste Google account credentials or private keys into the frontend. The Web App URL is the only value the static website needs.

## Static Website Deployment

You can deploy the static files to GitHub Pages, Netlify, Vercel, or normal web hosting.

For GitHub Pages:

1. Push this folder to a GitHub repository.
2. Go to `Settings > Pages`.
3. Select the branch and root folder.
4. Save and wait for the deployed URL.

For Netlify:

1. Drag this project folder into Netlify Drop, or connect the GitHub repository.
2. No build command is required.
3. Publish directory is the project root.

For Vercel:

1. Import the GitHub repository.
2. Keep framework as `Other`.
3. No build command is required.
4. Output directory is the project root.

## Generate a QR Code

1. Deploy the website and copy the final public URL.
2. Use a QR Code generator, browser extension, Canva, or your print design tool.
3. Paste the public website URL.
4. Test the QR Code with a mobile phone before printing.

The QR Code should point to the website URL, not the Google Apps Script URL.

## Test Form Submission

1. Open the deployed website.
2. Switch language and theme, then reload to confirm both settings persist.
3. Submit once with missing required fields to confirm validation works.
4. Submit with valid name, email, phone, address, and consent checked.
5. Confirm the button shows a loading state and cannot be clicked twice while submitting.
6. Confirm a success message appears.
7. Open Google Sheets and verify a new row was added.

If submission fails, check that:

- `GOOGLE_APPS_SCRIPT_WEB_APP_URL` in `app.js` uses the deployed `/exec` URL.
- `SPREADSHEET_ID` in `google-apps-script.gs` is correct.
- Apps Script is deployed with access set to `Anyone` or `Anyone with the link`.
- The `Leads` tab exists or Apps Script has permission to create it.

## Form Field Mapping

Frontend payload fields map to Google Sheets columns in this order:

| Google Sheets Column | Frontend Payload Field |
| --- | --- |
| Timestamp | Added by Apps Script |
| Language | `language` |
| Name | `name` |
| Email | `email` |
| Phone | `phone` |
| Line | `line` |
| Instagram | `instagram` |
| Facebook | `facebook` |
| Address | `address` |
| Interested Product | `interestedProduct` |
| Budget | `budget` |
| Message | `message` |
| Consent | `consent` |
| User Agent | `userAgent` |
| Source | `source` |

To change the column order later, update `COLUMN_MAPPING` and `createLeadRow()` in `google-apps-script.gs` together.

## Customize Theme Colors

Edit the CSS variables at the top of `style.css`.

- Light mode colors are in `:root`.
- Dark mode colors are in `html[data-theme="dark"]`.
- Shared spacing, radius, shadows, font sizes, and transition tokens are also in `:root`.

## Add More Languages

In `app.js`:

1. Add a new language object inside `translations`.
2. Keep the same keys used by `en`, `th`, and `zh`.
3. Add an `<option>` for the new language in `index.html`.

The `data-i18n`, `data-i18n-placeholder`, and `data-i18n-alt` attributes automatically update visible text when a language is selected.

## Add More Form Fields

1. Add the field markup in `index.html`.
2. Add labels and placeholders to every language in `translations`.
3. Add the field name to `FIELD_CONFIG.optional` or `FIELD_CONFIG.required` in `app.js`.
4. Add the field to `createPayload()` in `app.js`.
5. Add a Google Sheets column to `COLUMN_MAPPING` in `google-apps-script.gs`.
6. Add the value to `createLeadRow()` in `google-apps-script.gs`.

## Privacy Notes

- No secret keys or Google credentials are stored in the frontend.
- Customer data should be used only for furniture inquiry follow-up.
- The required consent checkbox must stay enabled for production use.
