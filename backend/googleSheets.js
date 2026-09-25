const { google } = require("googleapis");

const HEADERS = [
  "Company Name",
  "Website",
  "Contact Name",
  "Email",
  "Industry",
  "Website Issue",
  "Notes",
  "Status"
];

function getAuth() {
  const raw = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  if (!raw) throw new Error("GOOGLE_SERVICE_ACCOUNT_JSON is not configured.");

  const credentials = JSON.parse(raw);
  return new google.auth.GoogleAuth({
    credentials,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"]
  });
}

function getSheets() {
  return google.sheets({ version: "v4", auth: getAuth() });
}

function sheetName() {
  return process.env.GOOGLE_SHEET_NAME || "Sheet1";
}

async function getRows() {
  const sheets = getSheets();
  const spreadsheetId = process.env.GOOGLE_SPREADSHEET_ID;
  if (!spreadsheetId) throw new Error("GOOGLE_SPREADSHEET_ID is not configured.");

  const result = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `${sheetName()}!A:H`
  });

  const values = result.data.values || [];
  if (!values.length) return [];

  const headers = values[0];
  return values.slice(1).map((row, index) => {
    const item = { rowNumber: index + 2 };
    headers.forEach((header, i) => {
      item[header] = row[i] || "";
    });
    return item;
  });
}

async function updateRow(rowNumber, updates) {
  const sheets = getSheets();
  const spreadsheetId = process.env.GOOGLE_SPREADSHEET_ID;
  if (!spreadsheetId) throw new Error("GOOGLE_SPREADSHEET_ID is not configured.");

  const current = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `${sheetName()}!A${rowNumber}:H${rowNumber}`
  });

  const row = current.data.values?.[0] || Array(HEADERS.length).fill("");
  const index = Object.fromEntries(HEADERS.map((h, i) => [h, i]));

  for (const [key, value] of Object.entries(updates)) {
    if (index[key] !== undefined) row[index[key]] = value;
  }

  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: `${sheetName()}!A${rowNumber}:H${rowNumber}`,
    valueInputOption: "USER_ENTERED",
    requestBody: { values: [row] }
  });
}

module.exports = { getRows, updateRow };
