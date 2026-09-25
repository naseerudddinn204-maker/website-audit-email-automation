# Website Audit → AI Email Automation

A no-n8n Node.js automation that reads READY leads from Google Sheets, audits websites with Playwright, generates personalized outreach with Gemini/OpenAI, sends through SMTP/webmail, and updates the sheet.

## Exact Setup

### 1. Requirements

Install:

- Node.js 20 or newer
- A Google account
- A Google Cloud project
- Google Sheets API enabled
- A Google Cloud Service Account with a JSON key
- Gemini or OpenAI API access
- SMTP/webmail credentials for sending email

### 2. Google Sheet

Create a Google Sheet and add these headers in row 1, exactly:

```
Company Name | Website | Contact Name | Email | Industry | Website Issue | Notes | Status | Opted Out | Last Checked | Last Emailed
```

Example:

```
ABC Company | https://example.com | John | john@example.com | E-commerce | | | READY | No | |
```

Use `Status=READY` for leads that should be processed.

The worksheet/tab name is configured with `GOOGLE_SHEET_NAME`. The default is `Leads`.

### 3. Google Cloud Service Account

1. Open Google Cloud Console.
2. Select or create the project for this automation.
3. Go to **APIs & Services → Library**.
4. Search for **Google Sheets API** and click **Enable**.
5. Go to **IAM & Admin → Service Accounts**.
6. Create a service account, for example `website-audit-bot`.
7. Open the service account → **Keys → Add Key → Create new key → JSON**.
8. Download the JSON key.
9. Never commit the JSON key to GitHub or share its private key.

### 4. Share the Google Sheet

Copy the **service account email** from the Service Account details page.

Open the Google Sheet → **Share** → add the service-account email → give it **Editor** access.

The Sheet must be shared with the service account or the automation will not be able to read/update it.

### 5. Put the Google JSON key in the local project

Do **not** upload the JSON key to GitHub.

In your local project, create/use:

```
credentials/
└── google-service-account.json
```

The repository's `.gitignore` is configured to keep credential JSON files out of Git.

### 6. Create the local `.env`

Do not create or upload the real `.env` file in GitHub. Create it in the root of your local project:

```
website-audit-email-automation/
├── .env
├── .env.example
├── credentials/
│   └── google-service-account.json
├── src/
└── package.json
```

Start with:

```env
GOOGLE_SHEET_ID=YOUR_GOOGLE_SHEET_ID
GOOGLE_SHEET_NAME=Leads
GOOGLE_SERVICE_ACCOUNT_JSON=./credentials/google-service-account.json

AI_PROVIDER=gemini
GEMINI_API_KEY=YOUR_GEMINI_API_KEY
GEMINI_MODEL=gemini-2.5-flash

OPENAI_API_KEY=
OPENAI_MODEL=gpt-5-mini

SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=you@example.com
SMTP_PASS=YOUR_SMTP_PASSWORD
MAIL_FROM="Your Name <you@example.com>"

MAX_LEADS_PER_RUN=5
MIN_DELAY_MS=15000
REQUEST_TIMEOUT_MS=30000
DRY_RUN=true
SCHEDULE_MINUTES=30
```

**Security:** Never commit `.env`, API keys, SMTP passwords, or Google service-account JSON files to GitHub.

### 7. Find the Google Sheet ID

Open your Sheet. Its URL looks like:

```
https://docs.google.com/spreadsheets/d/GOOGLE_SHEET_ID/edit
```

Copy the value between `/d/` and `/edit`, then put it in:

```env
GOOGLE_SHEET_ID=GOOGLE_SHEET_ID
```

### 8. Install dependencies

From the local project directory:

```bash
npm install
npx playwright install chromium
```

### 9. Test safely with DRY_RUN

Keep:

```env
DRY_RUN=true
```

Then run:

```bash
npm run audit
```

The automation will read eligible leads, audit their websites, and generate the email. In dry-run mode it does not send the email and resets the processed lead to `READY` after the test flow.

Check the terminal output and your Google Sheet before enabling real sending.

### 10. Enable email sending

After you have verified the audit results and generated emails:

1. Add the correct SMTP/webmail host, port, username, password, and sender address to `.env`.
2. Change:
   ```env
   DRY_RUN=false
   ```
3. Run:
   ```bash
   npm run audit
   ```

For continuous scheduled processing, use:

```bash
npm start
```

The interval is controlled by:

```env
SCHEDULE_MINUTES=30
```

### 11. How processing works

The worker:

1. Reads rows where `Status=READY`, the email and website are valid, and `Opted Out` is not `YES`.
2. Opens the website with Playwright.
3. Checks HTTP status, slow initial load, viewport meta, meta description, H1 count, image alt text, and links.
4. Writes the detected website issues back to `Website Issue`.
5. Generates a short personalized email from the actual findings using Gemini or OpenAI.
6. In dry-run mode, does not send the message.
7. In live mode, sends through SMTP and marks the row `SENT`.
8. Records `Last Checked` and `Last Emailed` timestamps and processing notes.

### 12. Troubleshooting

**Google Sheets permission error**
- Confirm the Sheet is shared with the service-account email as **Editor**.
- Confirm `GOOGLE_SHEET_ID` is correct.
- Confirm `GOOGLE_SHEET_NAME` exactly matches the worksheet/tab name.
- Confirm the JSON path in `GOOGLE_SERVICE_ACCOUNT_JSON` is correct.

**Credentials file not found**
- Confirm this file exists locally:
  `credentials/google-service-account.json`
- Do not rename the folder/path unless you also update `.env`.

**No leads are processed**
- Make sure the row has `Status=READY`.
- Make sure Email and Website are valid.
- Make sure `Opted Out` is not `YES`.

**Playwright/browser error**
Run:

```bash
npx playwright install chromium
```

**AI error**
- Confirm `AI_PROVIDER` is `gemini` or `openai`.
- Confirm the matching API key is set.
- Check the configured model name and your provider's current limits.

**SMTP/email error**
- Confirm SMTP host, port, secure setting, username, and password.
- Check whether your webmail provider requires an app password or another authentication method.

## Compliance

Use only for contacts you are permitted to contact. Respect applicable anti-spam/privacy laws, provider terms, and opt-outs. Keep sending volume controlled and provide appropriate opt-out handling where required.
