import "dotenv/config";
function required(name:string){const v=process.env[name];if(!v)throw new Error(`Missing environment variable: ${name}`);return v;}
export const config={
 googleSheetId:required("GOOGLE_SHEET_ID"), googleSheetName:process.env.GOOGLE_SHEET_NAME||"Leads", googleCredentials:process.env.GOOGLE_SERVICE_ACCOUNT_JSON||"./credentials/google-service-account.json",
 aiProvider:(process.env.AI_PROVIDER||"gemini").toLowerCase(), geminiKey:process.env.GEMINI_API_KEY||"", geminiModel:process.env.GEMINI_MODEL||"gemini-2.5-flash", openaiKey:process.env.OPENAI_API_KEY||"", openaiModel:process.env.OPENAI_MODEL||"gpt-5-mini",
 smtpHost:required("SMTP_HOST"), smtpPort:Number(process.env.SMTP_PORT||587), smtpSecure:(process.env.SMTP_SECURE||"false").toLowerCase()==="true", smtpUser:required("SMTP_USER"), smtpPass:required("SMTP_PASS"), mailFrom:process.env.MAIL_FROM||required("SMTP_USER"),
 maxLeads:Number(process.env.MAX_LEADS_PER_RUN||5), minDelayMs:Number(process.env.MIN_DELAY_MS||15000), timeoutMs:Number(process.env.REQUEST_TIMEOUT_MS||30000), dryRun:(process.env.DRY_RUN||"true").toLowerCase()==="true", scheduleMinutes:Number(process.env.SCHEDULE_MINUTES||30)
};