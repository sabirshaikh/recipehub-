/**
 * Add demo "submitted" recipes to an EXISTING account:
 *   pnpm seed:user <username>
 *
 * Idempotent: re-running replaces only these demo recipes (matched by slug) for
 * that user. Never creates users and never touches other authors' recipes.
 */
import mongoose from "mongoose";
import { slugify } from "../src/lib/utils";
import { Recipe } from "../src/models/Recipe";
import { User } from "../src/models/User";
import { USER_RECIPES } from "./user-recipes-data";

try {
  process.loadEnvFile(".env.local");
} catch {
  // Fall back to the existing environment
}

const DAY = 24 * 60 * 60 * 1000;

async function main() {
  const username = process.argv[2]?.trim().toLowerCase();
  if (!username) {
    console.error("Usage: pnpm seed:user <username>");
    process.exit(1);
  }
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI is not set (.env.local)");

  await mongoose.connect(uri);
  await Recipe.syncIndexes();

  const user = await User.findOne({ username });
  if (!user) {
    console.error(`No user with username "${username}". Register the account first.`);
    process.exitCode = 1;
    return;
  }

  const slugs = USER_RECIPES.map((r) => slugify(r.title));
  // Slugs are globally unique — refuse rather than overwrite someone else's recipe
  const takenByOthers = await Recipe.find({ slug: { $in: slugs }, author: { $ne: user._id } })
    .select("slug")
    .lean();
  if (takenByOthers.length) {
    throw new Error(
      `Slug(s) already used by other authors: ${takenByOthers.map((r) => r.slug).join(", ")}`,
    );
  }

  const removed = await Recipe.deleteMany({ author: user._id, slug: { $in: slugs } });
  if (removed.deletedCount) console.log(`Replacing ${removed.deletedCount} previous demo recipes`);

  const now = Date.now();
  for (const { daysAgo, steps, status, ...recipe } of USER_RECIPES) {
    const doc = await Recipe.create({
      ...recipe,
      author: user._id,
      status: status ?? "published",
      steps: steps.map((text, index) => ({ order: index + 1, text, image: "" })),
    });
    const createdAt = new Date(now - daysAgo * DAY - Math.floor(Math.random() * 6) * 3600_000);
    // Backdate via the raw collection (Mongoose treats createdAt as immutable)
    await Recipe.collection.updateOne(
      { _id: doc._id },
      { $set: { createdAt, updatedAt: createdAt } },
    );
    console.log(
      `  ${doc.status === "draft" ? "[draft]    " : "[published]"} ${doc.title}  → /recipes/${doc.slug}`,
    );
  }

  const total = await Recipe.countDocuments({ author: user._id });
  console.log(`\nDone: @${user.username} now has ${total} recipes.`);
}

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => mongoose.disconnect());
