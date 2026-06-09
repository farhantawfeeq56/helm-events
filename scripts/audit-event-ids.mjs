import fs from "node:fs";
import path from "node:path";
import mongoose from "mongoose";

function loadMongoUri() {
  if (process.env.MONGODB_URI) {
    return process.env.MONGODB_URI;
  }

  const envPath = path.join(process.cwd(), ".env.local");

  if (!fs.existsSync(envPath)) {
    return null;
  }

  const envFile = fs.readFileSync(envPath, "utf8");
  const line = envFile
    .split(/\r?\n/)
    .find((entry) => entry.startsWith("MONGODB_URI="));

  if (!line) {
    return null;
  }

  return line.slice("MONGODB_URI=".length).trim();
}

const mongoUri = loadMongoUri();

if (!mongoUri) {
  console.error("Error: Missing MONGODB_URI. Set it in the environment or .env.local.");
  process.exit(1);
}

async function runAudit() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(mongoUri, { bufferCommands: false });
    console.log("Connected successfully.\n");

    const collections = [
      { name: "attendees", label: "Attendees" },
      { name: "speakers", label: "Speakers" },
      { name: "sponsors", label: "Sponsors" },
      { name: "volunteers", label: "Volunteers" },
      { name: "sessions", label: "Sessions" },
      { name: "rooms", label: "Rooms" },
      { name: "organizers", label: "Organizers" },
      { name: "facilities", label: "Facilities" },
    ];

    console.log("--- Event ID Audit Report ---");
    console.log(`Generated on: ${new Date().toISOString()}\n`);
    
    let totalOrphaned = 0;
    let collectionsAnalyzed = 0;

    for (const col of collections) {
      try {
        const count = await mongoose.connection.db
          .collection(col.name)
          .countDocuments({
            $or: [
              { eventId: { $exists: false } },
              { eventId: null }
            ],
          });

        if (count > 0) {
          console.log(`[!] ${col.label.padEnd(12)}: ${count} records missing eventId`);
          totalOrphaned += count;
        } else {
          console.log(`[✓] ${col.label.padEnd(12)}: All records have eventId`);
        }
        collectionsAnalyzed++;
      } catch (err) {
        console.log(`[?] ${col.label.padEnd(12)}: Could not access collection (${err.message})`);
      }
    }

    console.log("\n-------------------------------------------");
    if (totalOrphaned > 0) {
      console.log(`TOTAL: Found ${totalOrphaned} orphaned records across ${collectionsAnalyzed} collections.`);
      console.log("Action required: Please assign a valid eventId to these records.");
    } else {
      console.log("TOTAL: No orphaned records found. Data integrity is maintained.");
    }
    console.log("-------------------------------------------\n");

  } catch (error) {
    console.error("Audit failed:", error);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB.");
  }
}

runAudit();
