import sendMail from "../services/mailService.js";

export default async function sendTestMail(req, res) {
  const { to, subject, message } = req.body;

  try {
    const result = await sendMail(to, subject, message);
    res.status(200).json({ success: true, result });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}
