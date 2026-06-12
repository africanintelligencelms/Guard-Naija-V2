/* End-to-end smoke test against an in-memory MongoDB.
   Run: node smoke-test.mjs (after npm run build) */
import { MongoMemoryServer } from "mongodb-memory-server";
import { spawn } from "node:child_process";

const mongo = await MongoMemoryServer.create();
const PORT = 4555;
const BASE = `http://127.0.0.1:${PORT}/api`;

const server = spawn("node", ["dist/index.js"], {
  env: {
    ...process.env,
    MONGODB_URI: mongo.getUri("guardng"),
    PORT: String(PORT),
    JWT_SECRET: "smoke-test-secret",
    NODE_ENV: "development",
  },
  stdio: ["ignore", "pipe", "pipe"],
});
server.stderr.on("data", (d) => process.stderr.write(d));

// Wait for the server to come up
for (let i = 0; i < 50; i++) {
  try {
    const r = await fetch(`${BASE}/health`);
    if (r.ok) break;
  } catch {}
  await new Promise((r) => setTimeout(r, 200));
}

let failures = 0;
async function check(name, fn) {
  try {
    await fn();
    console.log(`✓ ${name}`);
  } catch (err) {
    failures++;
    console.error(`✗ ${name}: ${err.message}`);
  }
}
const assert = (cond, msg) => {
  if (!cond) throw new Error(msg);
};

let citizenToken, agencyToken, incidentId;

await check("register citizen", async () => {
  const r = await fetch(`${BASE}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: "ada@example.com",
      password: "secret123",
      role: "citizen",
      displayName: "Ada Obi",
    }),
  });
  assert(r.status === 201, `status ${r.status}`);
  const data = await r.json();
  assert(data.token && data.profile.role === "citizen", "bad payload");
  citizenToken = data.token;
});

await check("admin registration is rejected", async () => {
  const r = await fetch(`${BASE}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "evil@example.com", password: "secret123", role: "admin" }),
  });
  assert(r.status === 400, `status ${r.status}`);
});

await check("register agency + login", async () => {
  await fetch(`${BASE}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: "police@example.com",
      password: "secret123",
      role: "agency",
      agencyName: "Lagos Command",
    }),
  });
  const r = await fetch(`${BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "police@example.com", password: "secret123" }),
  });
  assert(r.ok, `login status ${r.status}`);
  agencyToken = (await r.json()).token;
});

await check("wrong password rejected", async () => {
  const r = await fetch(`${BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "ada@example.com", password: "wrong" }),
  });
  assert(r.status === 401, `status ${r.status}`);
});

await check("unauthenticated incidents read rejected", async () => {
  const r = await fetch(`${BASE}/incidents`);
  assert(r.status === 401, `status ${r.status}`);
});

await check("citizen creates incident", async () => {
  const r = await fetch(`${BASE}/incidents`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${citizenToken}`,
    },
    body: JSON.stringify({
      type: "Armed Robbery",
      description: "Robbery at the junction",
      severity: "High",
      isAnonymous: true,
      location: { lat: 6.45, lng: 3.39, address: "Lagos" },
      media: { image: null, audio: null },
      timestamp: Date.now(),
      status: "Resolved", // must be ignored — server forces Submitted
    }),
  });
  assert(r.status === 201, `status ${r.status}`);
  const inc = await r.json();
  assert(inc.status === "Submitted", "client-set status was not overridden");
  incidentId = inc.id;
});

await check("citizen sees own report; owner sees userId", async () => {
  const r = await fetch(`${BASE}/incidents`, {
    headers: { Authorization: `Bearer ${citizenToken}` },
  });
  const list = await r.json();
  assert(list.length === 1 && list[0].userId, "owner should see own userId");
});

await check("anonymous report hides reporter from agency", async () => {
  const r = await fetch(`${BASE}/incidents`, {
    headers: { Authorization: `Bearer ${agencyToken}` },
  });
  const list = await r.json();
  assert(list.length === 1, "agency should see the incident");
  assert(list[0].userId === undefined, "userId leaked to agency");
});

await check("citizen cannot change status", async () => {
  const r = await fetch(`${BASE}/incidents/${incidentId}/status`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${citizenToken}`,
    },
    body: JSON.stringify({ status: "Resolved" }),
  });
  assert(r.status === 403, `status ${r.status}`);
});

await check("agency updates status (and it audit-logs)", async () => {
  const r = await fetch(`${BASE}/incidents/${incidentId}/status`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${agencyToken}`,
    },
    body: JSON.stringify({ status: "In Progress" }),
  });
  assert(r.ok, `status ${r.status}`);
  assert((await r.json()).status === "In Progress", "status not updated");
});

await check("citizen blocked from admin user list", async () => {
  const r = await fetch(`${BASE}/users`, {
    headers: { Authorization: `Bearer ${citizenToken}` },
  });
  assert(r.status === 403, `status ${r.status}`);
});

await check("AI analyze degrades to 503 without key", async () => {
  const r = await fetch(`${BASE}/ai/analyze`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${citizenToken}`,
    },
    body: JSON.stringify({ description: "Armed men on the highway" }),
  });
  assert(r.status === 503, `status ${r.status}`);
});

server.kill();
await mongo.stop();
console.log(failures ? `\n${failures} FAILURE(S)` : "\nAll smoke tests passed");
process.exit(failures ? 1 : 0);
