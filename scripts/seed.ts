/**
 * Seed demo users and recipes:   pnpm seed
 *
 * Idempotent: removes the seed users (by email) and their recipes, then recreates
 * them. Data created by other users is never touched.
 */
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import { Recipe } from "../src/models/Recipe";
import { User } from "../src/models/User";
import { DEFAULT_SEED_PASSWORD, SEED_RECIPES, SEED_USERS, type SeedAuthor } from "./seed-data";

try {
  process.loadEnvFile(".env.local");
} catch {
  // Fall back to the existing environment
}

const DAY = 24 * 60 * 60 * 1000;

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI is not set (.env.local)");
  if (process.env.NODE_ENV === "production" && !process.argv.includes("--force")) {
    throw new Error("Refusing to seed in production without --force");
  }

  await mongoose.connect(uri);
  console.log(`Connected to ${mongoose.connection.name}`);

  // Make sure unique + text indexes exist before inserting
  await Promise.all([User.syncIndexes(), Recipe.syncIndexes()]);

  // ── Clean previous seed data
  const emails = Object.values(SEED_USERS).map((u) => u.email);
  const oldUsers = await User.find({ email: { $in: emails } }).select("_id");
  const oldIds = oldUsers.map((u) => u._id);
  const removedRecipes = await Recipe.deleteMany({ author: { $in: oldIds } });
  await User.deleteMany({ _id: { $in: oldIds } });
  console.log(`Removed ${oldIds.length} seed users and ${removedRecipes.deletedCount} recipes`);

  // ── Users
  const passwordHash = await bcrypt.hash(
    process.env.SEED_USER_PASSWORD ?? DEFAULT_SEED_PASSWORD,
    12,
  );
  const userIds = {} as Record<SeedAuthor, mongoose.Types.ObjectId>;
  for (const [key, data] of Object.entries(SEED_USERS) as [
    SeedAuthor,
    (typeof SEED_USERS)[SeedAuthor],
  ][]) {
    const user = await User.create({ ...data, passwordHash });
    userIds[key] = user._id;
    console.log(`  user  @${user.username} (${user.role})`);
  }

  // ── Recipes (create() runs the model's validate hooks: slug, totalTime, ingredientNames)
  const now = Date.now();
  for (const { author, daysAgo, steps, status, ...recipe } of SEED_RECIPES) {
    const doc = await Recipe.create({
      ...recipe,
      author: userIds[author],
      status: status ?? "published",
      steps: steps.map((text, index) => ({ order: index + 1, text, image: "" })),
    });
    // Backdate via the raw collection (Mongoose treats createdAt as immutable)
    const createdAt = new Date(now - daysAgo * DAY - Math.floor(Math.random() * 6) * 3600_000);
    await Recipe.collection.updateOne(
      { _id: doc._id },
      { $set: { createdAt, updatedAt: createdAt } },
    );
    console.log(`  recipe ${doc.status === "draft" ? "[draft] " : ""}${doc.title}`);
  }

  const published = await Recipe.countDocuments({ status: "published" });
  console.log(`\nDone: ${SEED_RECIPES.length} recipes seeded (${published} published in total).`);
  console.log(
    "Seed users can log in with the password in scripts/seed-data.ts (or SEED_USER_PASSWORD).",
  );
}

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => mongoose.disconnect());
