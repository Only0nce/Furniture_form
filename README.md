# Furniture Customer Lead Form Website

A responsive customer inquiry form for a furniture business. Customers scan a QR Code, open the Netlify-hosted website, submit contact details, and a Netlify Function writes the lead to Google Sheets using the Google Sheets API.

## File Structure

```text
.
├── public/
│   ├── index.html
│   ├── style.css
│   ├── app.js
│   └── assets/
│       ├── furniture-showroom-hero.png
│       └── furniture-showroom-hero.webp
├── netlify/
│   └── functions/
│       └── submit-lead.js
├── netlify.toml
├── package.json
├── README.md
└── .gitignore
```

## Purpose of Each File

- `public/index.html`: Public page markup, language switcher, theme toggle, hero content, benefits, QR explanation, and customer form.
- `public/style.css`: Responsive light/dark furniture-inspired UI styling.
- `public/app.js`: Browser-safe form validation, language/theme persistence, payload creation, and submission to the Netlify Function.
- `netlify/functions/submit-lead.js`: Server-side Netlify Function that validates the request and appends rows to Google Sheets.
- `netlify.toml`: Safe Netlify build configuration.
- `package.json`: Node dependency configuration for `googleapis`.
- `.gitignore`: Prevents credentials, local environment files, Netlify output, and dependencies from being committed.

## Frontend Setup

Only files inside `public/` are served to website visitors. The frontend submits to this safe public endpoint:

```javascript
fetch("/.netlify/functions/submit-lead", {
  method: "POST",
  headers: {
    "Content-Type": "application/json"
  },
  body: JSON.stringify(payload)
});
```

`public/app.js` must never contain Google Sheet IDs, service account emails, private keys, API keys, or database credentials.

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

1. Create a new Google Sheet.
2. Rename the tab to the same value you will set in `GOOGLE_SHEET_NAME`, for example `Leads`.
3. Add this header row:

```text
Timestamp | Language | Name | Phone | Email | Address | Interested Product | Budget | Message | Consent | User Agent | Source
```

The Netlify Function maps submitted values to this column order in `createLeadRow()` inside `netlify/functions/submit-lead.js`.

## Google Cloud Service Account Setup

1. Open Google Cloud Console.
2. Create or select a project.
3. Enable the `Google Sheets API`.
4. Go to `IAM & Admin > Service Accounts`.
5. Create a service account.
6. Create a JSON key for that service account.
7. From the JSON file, copy:
   - `client_email`
   - `private_key`

Do not commit the JSON file. The repository ignores `service-account.json`.

## Google Sheets Permission Setup

1. Open your Google Sheet.
2. Click `Share`.
3. Paste the service account `client_email`.
4. Give it `Editor` access.
5. Save.

Without this share permission, the function can authenticate but cannot write rows.

## Netlify Environment Variables

In Netlify, open the site settings and add these environment variables:

```text
GOOGLE_SHEET_ID=your_google_sheet_id
GOOGLE_SERVICE_ACCOUNT_EMAIL=service-account@project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n
GOOGLE_SHEET_NAME=Leads
```

Notes:

- `GOOGLE_SHEET_ID` is the long ID in the Google Sheet URL.
- `GOOGLE_PRIVATE_KEY` may contain escaped newline characters. The function converts `\n` back to real newline characters.
- Do not store secrets in `netlify.toml`.
- Do not commit `.env` files.

## Local Development

Install dependencies:

```bash
npm install
```

Install or use Netlify CLI:

```bash
npm install -g netlify-cli
```

Create a local `.env` file for testing only:

```text
GOOGLE_SHEET_ID=your_google_sheet_id
GOOGLE_SERVICE_ACCOUNT_EMAIL=service-account@project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n
GOOGLE_SHEET_NAME=Leads
```

Run locally:

```bash
npm run dev
```

Netlify Dev serves the frontend and function together. The form should call:

```text
/.netlify/functions/submit-lead
```

## Deployment

1. Push the repository to GitHub.
2. In Netlify, create a new site from the GitHub repository.
3. Netlify reads `netlify.toml`:

```toml
[build]
publish = "public"
functions = "netlify/functions"
```

4. Add the required environment variables in Netlify.
5. Deploy the site.

## Test Submission After Deploy

1. Open the deployed Netlify URL.
2. Submit once with missing name or phone to confirm validation.
3. Submit with name, phone, consent, and any optional fields.
4. Confirm the button shows a loading state and duplicate submissions are blocked while sending.
5. Confirm a success message appears.
6. Open Google Sheets and verify a new row appears.

If submission fails:

- Confirm the Google Sheet is shared with the service account email.
- Confirm all Netlify environment variables are set.
- Confirm `GOOGLE_PRIVATE_KEY` includes newline escapes as `\n`.
- Confirm the Google Sheets API is enabled for the Google Cloud project.

## QR Code Generation

1. Deploy the site on Netlify.
2. Copy the public Netlify site URL.
3. Generate a QR Code from the website URL, not the function URL.
4. Test the QR Code on a mobile phone before printing.

## Security

- Frontend JavaScript can always be viewed in the browser.
- Secrets must never be placed in `public/app.js`.
- Netlify Functions run server-side and can safely read environment variables.
- Backend files must stay outside `public/`.
- Google credentials must be stored in Netlify Environment Variables.
- If this GitHub repository is public, backend source code may still be visible, but secrets remain protected because credentials are not committed.
- `.env`, `.env.*`, `service-account.json`, private keys, `node_modules/`, and `.netlify/` are ignored by git.
