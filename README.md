# Website Audit → AI Email Automation

No-n8n Node.js automation that reads READY leads from Google Sheets, audits websites with Playwright, generates personalized outreach with Gemini/OpenAI, sends through SMTP/webmail, and updates the sheet.

## Setup
1. Node.js 20+
2. Google Sheets API + service account; share the Sheet with the service-account email as Editor.
3. SMTP credentials for your webmail provider.
4. Gemini or OpenAI API key.

Create `.env` from `.env.example`, then:
```bash
npm install
npx playwright install chromium
npm run audit
```

Set `DRY_RUN=true` for testing. Change to `false` only after verifying generated emails.

### Sheet columns
Company Name | Website | Contact Name | Email | Industry | Website Issue | Notes | Status | Opted Out | Last Checked | Last Emailed

Only rows with `Status=READY`, valid email/URL, and `Opted Out` not equal to Yes are processed.

## Compliance
Use only for contacts you are permitted to contact. Respect applicable anti-spam/privacy laws, provider terms, and opt-outs. Keep sending volume controlled.
