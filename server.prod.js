import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import axios from "axios";
import { ConfidentialClientApplication } from "@azure/msal-node";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

const {
  TENANT_ID,
  CLIENT_ID,
  CLIENT_SECRET,
  WORKSPACE_ID,
  REPORT_ID,
  DATASET_ID
} = process.env;

if (!TENANT_ID || !CLIENT_ID || !CLIENT_SECRET || !WORKSPACE_ID || !REPORT_ID || !DATASET_ID) {
  console.warn("[WARN] Missing one or more required env vars. Check your .env file.");
}

const cca = new ConfidentialClientApplication({
  auth: {
    clientId: CLIENT_ID,
    authority: `https://login.microsoftonline.com/${TENANT_ID}`,
    clientSecret: CLIENT_SECRET
  }
});

async function getAzureAccessToken() {
  const tokenResponse = await cca.acquireTokenByClientCredential({
    scopes: ["https://analysis.windows.net/powerbi/api/.default"]
  });
  return tokenResponse.accessToken;
}

app.get("/api/pbi/embed-config", async (req, res) => {
  try {
    const azureToken = await getAzureAccessToken();

    // Get report metadata to fetch embedUrl
    const reportResp = await axios.get(
      `https://api.powerbi.com/v1.0/myorg/groups/${WORKSPACE_ID}/reports/${REPORT_ID}`,
      { headers: { Authorization: `Bearer ${azureToken}` } }
    );
    const embedUrl = reportResp.data.embedUrl;

    // Generate embed token
    const embedResp = await axios.post(
      `https://api.powerbi.com/v1.0/myorg/GenerateToken`,
      {
        datasets: [{ id: DATASET_ID }],
        reports: [{ id: REPORT_ID }],
        targetWorkspaces: [{ id: WORKSPACE_ID }],
        accessLevel: "View",
        identities: [] // add RLS identities here if needed
      },
      { headers: { Authorization: `Bearer ${azureToken}` } }
    );

    res.json({
      embedUrl,
      reportId: REPORT_ID,
      accessToken: embedResp.data.token
    });
  } catch (err) {
    console.error("[embed-config] error:", err?.response?.data || err.message);
    res.status(500).json({ error: "Failed to create embed config" });
  }
});

app.get("/api/health", (req, res) =>
  res.json({ status: "ok", ts: new Date().toISOString() })
);

app.listen(PORT, () => console.log(`Power BI backend running on :${PORT}`));
