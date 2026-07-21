#!/usr/bin/env node
/**
 * Patches concierge workflow JSON: adds Webhook + Code nodes feeding IF: private chat.
 * Usage: MINIAPP_INGEST_SECRET='...' node patch-n8n-workflow.mjs <export.json> > out.json
 */
import fs from "fs";

const inputPath = process.argv[2];
if (!inputPath) {
  console.error("Usage: MINIAPP_INGEST_SECRET='secret' node patch-n8n-workflow.mjs <export.json>");
  process.exit(1);
}
const raw = fs.readFileSync(inputPath, "utf8");
const arr = JSON.parse(raw);
const wf = Array.isArray(arr) ? arr[0] : arr;

const ingestSecret = process.env.MINIAPP_INGEST_SECRET || "";
if (!ingestSecret) {
  console.error("MINIAPP_INGEST_SECRET is required");
  process.exit(1);
}

const WEBHOOK_ID = "a1b2c3d4-e5f6-7890-abcd-ef1234567890";
const CODE_ID = "b2c3d4e5-f6a7-8901-bcde-f12345678901";

const webhookNode = {
  parameters: {
    httpMethod: "POST",
    path: "gordost-concierge-miniapp",
    responseMode: "onReceived",
    options: { responseCode: 200 },
  },
  id: WEBHOOK_ID,
  name: "Webhook: Mini App",
  type: "n8n-nodes-base.webhook",
  typeVersion: 2.1,
  position: [72320, 62608],
  webhookId: "f47ac10b-58cc-4372-a567-0e02b2c3d479",
};

const escapedSecret = JSON.stringify(ingestSecret);
const codeJs = `const root = $json;
const secret = String(root.miniappSecret ?? "").trim();
const expected = ${escapedSecret};
if (!expected || secret !== expected) {
  return [];
}
const uid = Number(root.telegramUserId);
const text = String(root.text ?? "").trim();
if (!Number.isFinite(uid) || !text) {
  return [];
}
const username = String(root.username ?? "");
return [
  {
    json: {
      updateType: "message",
      chatId: uid,
      chatType: "private",
      threadId: null,
      fromId: uid,
      username,
      text,
      message_id: Math.floor(Date.now() / 1000),
      messageId: Math.floor(Date.now() / 1000),
      callbackMessageId: null,
      callbackData: null,
      callbackId: null,
      startPayload: "",
      photoFileId: null,
    },
  },
];
`;

const codeNode = {
  parameters: { jsCode: codeJs },
  id: CODE_ID,
  name: "Code: Mini App → normalize shape",
  type: "n8n-nodes-base.code",
  typeVersion: 2,
  position: [72576, 62608],
};

const hasWebhook = wf.nodes.some((n) => n.name === "Webhook: Mini App");
if (!hasWebhook) {
  wf.nodes.push(webhookNode, codeNode);
}

wf.connections = wf.connections || {};
if (!wf.connections["Webhook: Mini App"]) {
  wf.connections["Webhook: Mini App"] = {
    main: [[{ node: "Code: Mini App → normalize shape", type: "main", index: 0 }]],
  };
}
if (!wf.connections["Code: Mini App → normalize shape"]) {
  wf.connections["Code: Mini App → normalize shape"] = {
    main: [[{ node: "IF: private chat", type: "main", index: 0 }]],
  };
}

// bump version for editor
wf.meta = wf.meta || {};
wf.updatedAt = new Date().toISOString();

process.stdout.write(JSON.stringify(wf, null, 2));
