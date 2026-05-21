import "dotenv/config";
import { createServer } from "node:http";
import app from "./app.js";
import { initSocketServer } from "./realtime/socketServer.js";
import { getTransporter } from "./services/emailService.js";

const PORT = process.env.PORT || 4000;

const httpServer = createServer(app);
initSocketServer(httpServer);

httpServer.listen(PORT, async () => {
  console.log(`Server is running on http://localhost:${PORT}`);

  const transporter = getTransporter();
  if (!transporter) {
    console.log("No transporter");
    return;
  }

  try {
    await transporter.verify();
    console.log("SMTP connection works ✅");
  } catch (err) {
    console.error("SMTP connection failed ❌", err);
  }
});
