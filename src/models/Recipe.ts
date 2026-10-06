import mongoose, {
  Schema,
  type HydratedDocument,
  type InferSchemaType,
  type Model,
} from "mongoose";
import { CATEGORIES, DIET_TAGS, DIFFICULTIES, RECIPE_STATUSES } from "@/lib/constants";
import { normalizeIngredient, slugify } from "@/lib/utils";

const ingredientSchema = new Schema(
  {
    // null = "to taste" / unquantified (e.g. "salt")
    quantity: { type: Number, min: 0, default: null },
    unit: { type: String, trim: true, default: "" },
    name: { type: String, required: true, trim: true, maxlength: 120 },
  },
  { _id: false },
);

const stepSchema = new Schema(
  {
    order: { type: Number, required: true, min: 1 },
    text: { type: String, required: true, trim: true, maxlength: 2000 },
    image: { type: String, default: "" },
  },
  { _id: false },
);

const recipeSchema = new Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 120 },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    description: { type: String, required: true, trim: true, maxlength: 1000 },
    coverImage: { type: String, default: "" },
    author: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    cuisine: { type: String, required: true, trim: true },
    category: { type: String, enum: CATEGORIES, required: true },
    dietTags: [{ type: String, enum: DIET_TAGS }],
    difficulty: { type: String, enum: DIFFICULTIES, required: true },
    prepTime: { type: Number, required: true, min: 0 }, // minutes
    cookTime: { type: Number, required: true, min: 0 }, // minutes
    totalTime: { type: Number, min: 0, default: 0 }, // computed
    servings: { type: Number, required: true, min: 1, max: 100 },
    ingredients: { type: [ingredientSchema], default: [] },
    ingredientNames: { type: [String], default: [] }, // computed, normalized
    steps: { type: [stepSchema], default: [] },
    tags: [{ type: String, lowercase: true, trim: true }],
    status: { type: String, enum: RECIPE_STATUSES, default: "draft" },
    averageRating: { type: Number, default: 0, min: 0, max: 5 },
    ratingsCount: { type: Number, default: 0, min: 0 },
    savesCount: { type: Number, default: 0, min: 0 },
  },
  { timestamps: true },
);

// Derived fields are always recomputed from the source data
recipeSchema.pre("validate", function () {
  if (!this.slug && this.title) this.slug = slugify(this.title);
  this.totalTime = (this.prepTime ?? 0) + (this.cookTime ?? 0);
  this.ingredientNames = [
    ...new Set(this.ingredients.map((i) => normalizeIngredient(i.name)).filter(Boolean)),
  ];
  this.steps.forEach((step, index) => {
    step.order = index + 1;
  });
});

recipeSchema.index(
  { title: "text", description: "text", tags: "text" },
  { weights: { title: 10, tags: 5, description: 1 }, name: "recipe_text" },
);
recipeSchema.index({ ingredientNames: 1 });
recipeSchema.index({ cuisine: 1 });
recipeSchema.index({ category: 1 });
recipeSchema.index({ dietTags: 1 });
recipeSchema.index({ averageRating: -1 });
recipeSchema.index({ createdAt: -1 });
recipeSchema.index({ status: 1, createdAt: -1 });

export type RecipeSchema = InferSchemaType<typeof recipeSchema>;
export type RecipeDocument = HydratedDocument<RecipeSchema>;

export const Recipe: Model<RecipeSchema> =
  (mongoose.models.Recipe as Model<RecipeSchema> | undefined) ??
  mongoose.model("Recipe", recipeSchema);

export default Recipe;
