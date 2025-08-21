import express from "express";
import sendTestMail from "../Controllers/mailSend.js";

export const Mail_send = express.Router();

Mail_send.post("/send-mail", sendTestMail);