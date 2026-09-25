require("dotenv").config();

const express = require("express");
const { auditWebsite } = require("./audit");
const { generateEmail } = require("./gemini");
const { getRows, updateRow } = require("./googleSheets");
const { sendEmail } = require("./email");

const app = express();
app.use(express.json({ limit: "100kb" }));

const port = Number(process.env.PORT || 3000);

function checkSecret(req, res, next) {
  const expected = process.env.AUTOMATION_SECRET;
  if (!expected) return next();

  const supplied = req.get("x-automation-secret");
  if (supplied !== expected) {
    return res.status(401).json({ ok: false, error: "Unauthorized" });
  }
  next();
}

app.get("/health", (_req, res) => {
  res.json({ ok: true, service: "website-audit-email-automation" });
});

app.post("/audit", checkSecret, async (req, res) => {
  try {
    const audit = await auditWebsite(req.body.website);
    res.json({ ok: true, audit });
  } catch (error) {
    res.status(400).json({ ok: false, error: error.message });
  }
});

app.post("/send-pending", checkSecret, async (_req, res) => {
  const maxEmails = Math.max(1, Number(process.env.MAX_EMAILS_PER_RUN || 5));
  const rows = await getRows();

  const pending = rows
    .filter(row => String(row.Status || "").trim().toLowerCase() === "pending")
    .slice(0, maxEmails);

  const results = [];

  for (const row of pending) {
    try {
      if (!row.Website || !row.Email) {
        throw new Error("Website and Email are required.");
      }

      const audit = await auditWebsite(row.Website);
      const email = await generateEmail({
        companyName: row["Company Name"],
        contactName: row["Contact Name"],
        website: row.Website,
        industry: row.Industry,
        audit
      });

      await sendEmail({
        to: row.Email,
        subject: email.subject,
        text: email.text
      });

      const issueSummary = audit.issues.length
        ? audit.issues.join(" | ")
        : "No obvious issues detected by the lightweight audit.";

      await updateRow(row.rowNumber, {
        "Website Issue": issueSummary,
        Notes: `Audited ${new Date().toISOString()}. Email sent.`,
        Status: "Sent"
      });

      results.push({
        rowNumber: row.rowNumber,
        email: row.Email,
        status: "Sent",
        issues: audit.issues
      });
    } catch (error) {
      await updateRow(row.rowNumber, {
        Notes: `Failed: ${error.message}`,
        Status: "Failed"
      }).catch(() => {});

      results.push({
        rowNumber: row.rowNumber,
        email: row.Email,
        status: "Failed",
        error: error.message
      });
    }
  }

  res.json({
    ok: true,
    processed: results.length,
    results
  });
});

app.listen(port, () => {
  console.log(`Website audit email automation running on port ${port}`);
});
