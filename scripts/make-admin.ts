/**
 * Promote (or demote) a user.
 *   pnpm make-admin you@example.com          → role "admin"
 *   pnpm make-admin you@example.com --revoke → role "user"
 * The user must log out and back in for the new role to appear in their session.
 */
import mongoose from "mongoose";

try {
  process.loadEnvFile(".env.local");
} catch {
  // Fall back to the existing environment
}

async function main() {
  const email = process.argv[2]?.trim().toLowerCase();
  const role = process.argv.includes("--revoke") ? "user" : "admin";
  if (!email) {
    console.error("Usage: pnpm make-admin <email> [--revoke]");
    process.exit(1);
  }
  if (!process.env.MONGODB_URI) throw new Error("MONGODB_URI is not set (.env.local)");

  await mongoose.connect(process.env.MONGODB_URI);
  const result = await mongoose.connection
    .collection("users")
    .findOneAndUpdate({ email }, { $set: { role } }, { returnDocument: "after" });

  if (!result) {
    console.error(`No user found with email ${email}`);
    process.exitCode = 1;
  } else {
    console.log(`✔ ${result.username} (${email}) is now "${role}". Log out and back in to apply.`);
  }
  await mongoose.disconnect();
}

main().catch(async (error: unknown) => {
  console.error(error);
  await mongoose.disconnect();
  process.exit(1);
});
