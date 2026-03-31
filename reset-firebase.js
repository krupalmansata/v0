#!/usr/bin/env node

/**
 * reset-firebase.js
 * ─────────────────
 * Wipes ALL data from Firebase so you can start fresh.
 *
 *   1. Deletes every node in Realtime Database
 *   2. Deletes all Firebase Auth users
 *   3. (Optional) Empties the Supabase 'job-photos' storage bucket
 *
 * Usage:
 *   node reset-firebase.js              # interactive confirmation
 *   node reset-firebase.js --yes        # skip confirmation
 *   node reset-firebase.js --skip-storage  # keep Supabase photos
 */

const { execSync } = require("child_process");
const readline = require("readline");

// ── Config ──────────────────────────────────────────────────────────
const PROJECT_ID = "services-ab4a2";
const DATABASE_URL = "https://services-ab4a2-default-rtdb.firebaseio.com";

// All top-level RTDB nodes your app uses
const DB_NODES = [
  "users",
  "businesses",
  "jobs",
  "staff",
  "bookings",
  "invoices",
  "notifications",
  "slugIndex",
  "staffEmailIndex",
];

// ── Helpers ─────────────────────────────────────────────────────────
function run(cmd) {
  try {
    return execSync(cmd, { encoding: "utf8", stdio: ["pipe", "pipe", "pipe"] }).trim();
  } catch (err) {
    // Return stderr so callers can decide what to do
    return err.stderr?.trim() || err.message;
  }
}

function ask(question) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) => rl.question(question, (ans) => { rl.close(); resolve(ans); }));
}

// ── Main ────────────────────────────────────────────────────────────
async function main() {
  const args = process.argv.slice(2);
  const skipConfirm = args.includes("--yes");
  const skipStorage = args.includes("--skip-storage");

  console.log("\n🔥  Firebase Full Reset");
  console.log("─".repeat(40));
  console.log(`   Project  : ${PROJECT_ID}`);
  console.log(`   Database : ${DATABASE_URL}`);
  console.log(`   Storage  : ${skipStorage ? "SKIP" : "Supabase job-photos"}`);
  console.log("─".repeat(40));
  console.log("⚠️   This will DELETE everything:\n");
  console.log("   • All Realtime Database data");
  console.log("   • All Firebase Auth users");
  if (!skipStorage) console.log("   • All photos in Supabase job-photos bucket");
  console.log();

  if (!skipConfirm) {
    const answer = await ask('   Type "RESET" to confirm: ');
    if (answer !== "RESET") {
      console.log("\n   Cancelled.\n");
      process.exit(0);
    }
  }

  // ── 1. Wipe Realtime Database ───────────────────────────────────
  console.log("\n📦 Wiping Realtime Database...");
  for (const node of DB_NODES) {
    process.stdout.write(`   /${node} ... `);
    const result = run(
      `npx firebase database:remove /${node} --project ${PROJECT_ID} --force`
    );
    if (result.includes("Error") || result.includes("error")) {
      console.log(`⚠️  ${result}`);
    } else {
      console.log("✅");
    }
  }

  // ── 2. Delete all Auth users ────────────────────────────────────
  console.log("\n👤 Deleting all Auth users...");
  const os = require("os");
  const path = require("path");
  const fs = require("fs");
  const tmpFile = path.join(os.tmpdir(), `fb-reset-users-${Date.now()}.json`);
  run(`npx firebase auth:export ${tmpFile} --format=json --project ${PROJECT_ID}`);
  let deletedCount = 0;
  try {
    const raw = fs.readFileSync(tmpFile, "utf8");
    const parsed = JSON.parse(raw);
    const users = parsed.users || [];
    if (users.length === 0) {
      console.log("   No users found.");
    } else {
      const uids = users.map((u) => u.localId);
      // Delete in batches of 10
      for (let i = 0; i < uids.length; i += 10) {
        const batch = uids.slice(i, i + 10);
        for (const uid of batch) {
          const email = users.find((u) => u.localId === uid)?.email || uid;
          process.stdout.write(`   Deleting ${email} ... `);
          run(`npx firebase auth:delete ${uid} --project ${PROJECT_ID} --force`);
          console.log("✅");
          deletedCount++;
        }
      }
      console.log(`   Deleted ${deletedCount} user(s).`);
    }
    fs.unlinkSync(tmpFile);
  } catch (err) {
    console.log(`   ⚠️  Could not delete users: ${err.message}`);
    try { fs.unlinkSync(tmpFile); } catch {}
  }

  // ── 3. Clear Supabase storage ───────────────────────────────────
  if (!skipStorage) {
    console.log("\n🗂️  Clearing Supabase job-photos bucket...");
    try {
      const envFile = fs.readFileSync(".env.local", "utf8");
      const getEnv = (key) => {
        const match = envFile.match(new RegExp(`^${key}=(.*)$`, "m"));
        return match ? match[1].trim() : null;
      };
      const supabaseUrl = getEnv("NEXT_PUBLIC_SUPABASE_URL");
      const supabaseKey = getEnv("SUPABASE_SERVICE_ROLE_KEY") || getEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY");

      if (supabaseUrl && supabaseKey) {
        // List all files in job-photos bucket via REST API
        const listRes = run(
          `curl -s -H "apikey: ${supabaseKey}" -H "Authorization: Bearer ${supabaseKey}" "${supabaseUrl}/storage/v1/object/list/job-photos" -d '{"prefix":"","limit":1000}' -H "Content-Type: application/json"`
        );
        const files = JSON.parse(listRes);
        if (Array.isArray(files) && files.length > 0) {
          // Recursively list all files including inside sub-folders
          const allFiles = [];
          const listFolder = (prefix) => {
            const res = run(
              `curl -s -H "apikey: ${supabaseKey}" -H "Authorization: Bearer ${supabaseKey}" "${supabaseUrl}/storage/v1/object/list/job-photos" -d '{"prefix":"${prefix}","limit":10000}' -H "Content-Type: application/json"`
            );
            try {
              const items = JSON.parse(res);
              for (const item of items) {
                const path = prefix ? `${prefix}/${item.name}` : item.name;
                if (item.id) {
                  allFiles.push(path);
                } else {
                  listFolder(path);
                }
              }
            } catch {}
          };
          listFolder("");

          if (allFiles.length > 0) {
            const prefixes = JSON.stringify(allFiles.map(f => `job-photos/${f}`));
            // Batch delete
            const delRes = run(
              `curl -s -X DELETE -H "apikey: ${supabaseKey}" -H "Authorization: Bearer ${supabaseKey}" "${supabaseUrl}/storage/v1/object/job-photos" -d '{"prefixes":${prefixes}}' -H "Content-Type: application/json"`
            );
            console.log(`   Deleted ${allFiles.length} files ✅`);
          } else {
            console.log("   No files found in bucket.");
          }
        } else {
          console.log("   Bucket is already empty.");
        }
      } else {
        console.log("   ⚠️  Supabase env vars not found — skipped.");
      }
    } catch (err) {
      console.log(`   ⚠️  Could not clear storage: ${err.message}`);
    }
  }

  // ── Done ────────────────────────────────────────────────────────
  console.log("\n" + "─".repeat(40));
  console.log("✅ Firebase reset complete — fresh start!");
  console.log("─".repeat(40) + "\n");
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
