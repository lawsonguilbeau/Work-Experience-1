const path = require("path");
const express = require("express");
const { sendToSupport } = require("./support");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(
  express.static(path.join(__dirname, "..", "public"), {
    extensions: ["html"],
  }),
);

app.post("/contact", (req, res) => {
  const name = (req.body.name || "").trim();
  const email = (req.body.email || "").trim();
  const message = (req.body.message || "").trim();
  const website = (req.body.website || "").trim(); // Honeypot field
  const formLoadTime = parseInt(req.body.form_load_time, 10); // Timing check field

  // Basic validation check
  if (!name || !email || !message) {
    return res
      .status(400)
      .json({
        ok: false,
        error: "Please fill in your name, email and message.",
      });
  }

  // 1. Honeypot check: If the hidden 'website' field has any value, it's a bot.
  const isHoneypotTriggered = website !== "";

  // 2. Timing check: If submitted less than 3 seconds after page load, it's a bot.
  const currentTime = Date.now();
  const elapsedSeconds = (currentTime - formLoadTime) / 1000;
  const isTooFast = isNaN(formLoadTime) || elapsedSeconds < 3;

  // If either anti-spam check fails, silently drop the submission
  if (isHoneypotTriggered || isTooFast) {
    console.warn(
      `[SPAM BLOCKED] Dropped submission (Honeypot: ${isHoneypotTriggered}, Duration: ${elapsedSeconds.toFixed(2)}s)`,
    );
    // Return success to trick bots into thinking it went through
    return res.json({ ok: true });
  }

  // Real user submission — forward to support / record in submissions.jsonl
  sendToSupport({ name, email, message });
  res.json({ ok: true });
});

app.listen(PORT, () => {
  console.log(`Calico Media site running at http://localhost:${PORT}`);
});
