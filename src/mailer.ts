import nodemailer from "nodemailer"; import {config} from "./config.js";
const transporter=nodemailer.createTransport({host:config.smtpHost,port:config.smtpPort,secure:config.smtpSecure,auth:{user:config.smtpUser,pass:config.smtpPass}});
export async function verifyMailer(){await transporter.verify();}
export async function sendEmail(to:string,subject:string,body:string){return transporter.sendMail({from:config.mailFrom,to,subject,text:body});}