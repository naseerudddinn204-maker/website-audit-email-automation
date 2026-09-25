import {chromium} from "playwright"; import {config} from "./config.js"; import type {AuditResult} from "./types.js";
export async function auditWebsite(url:string):Promise<AuditResult>{
 const browser=await chromium.launch({headless:true}); const page=await browser.newPage({userAgent:"WebsiteAuditBot/1.0 (authorized audit)"}); const started=Date.now(); const issues:string[]=[];
 try{const response=await page.goto(url,{waitUntil:"domcontentloaded",timeout:config.timeoutMs}); const httpStatus=response?.status(); const finalUrl=page.url(); const title=await page.title().catch(()=> ""); const loadMs=Date.now()-started;
 if(!httpStatus||httpStatus>=400)issues.push(`Homepage returned HTTP ${httpStatus??"unknown"}.`);
 if(loadMs>5000)issues.push(`Initial page load exceeded 5 seconds (${loadMs} ms).`);
 if(await page.locator('meta[name="viewport"]').count()===0)issues.push("Missing mobile viewport meta tag.");
 if(!(await page.locator('meta[name="description"]').getAttribute("content").catch(()=>null)))issues.push("Missing meta description.");
 const h1=await page.locator("h1").count(); if(h1===0)issues.push("No H1 heading found."); if(h1>1)issues.push(`Multiple H1 headings found (${h1}).`);
 const imgs=await page.locator("img").all(); let missing=0; for(const img of imgs.slice(0,100)){if(await img.getAttribute("alt")===null)missing++;} if(missing)issues.push(`${missing} image(s) are missing alt attributes.`);
 if(await page.locator("a[href]").count()===0)issues.push("No links were detected on the homepage.");
 return {url,finalUrl,httpStatus,title,loadMs,issues,summary:issues.length?`Detected ${issues.length} potential issue(s).`:"No basic technical issues were detected by this automated check."};
 }catch(e){return {url,issues:[`Website could not be audited: ${e instanceof Error?e.message:String(e)}`],summary:"The automated audit could not complete."};}finally{await browser.close();}
}