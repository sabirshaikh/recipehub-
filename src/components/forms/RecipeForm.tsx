"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Alert,
  App,
  AutoComplete,
  Button,
  Card,
  Checkbox,
  Form,
  Input,
  InputNumber,
  Radio,
  Select,
  Space,
  Tag,
  Tooltip,
} from "antd";
import {
  ArrowDownOutlined,
  ArrowUpOutlined,
  DeleteOutlined,
  MinusCircleOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import ImageUploadField from "@/components/forms/ImageUploadField";
import { useCreateRecipe, useDeleteRecipe, useUpdateRecipe } from "@/hooks/useRecipeMutations";
import { isApiError } from "@/lib/api-error";
import {
  CATEGORIES,
  CATEGORY_LABELS,
  CUISINES,
  DIET_LABELS,
  DIET_TAGS,
  DIFFICULTIES,
  DIFFICULTY_LABELS,
  type RecipeStatus,
} from "@/lib/constants";
import {
  applyFieldErrors,
  clearChangedFieldErrors,
  clearFieldErrors,
  zodIssuesToFieldErrors,
} from "@/lib/form";
import { recipeInputSchema, type RecipeFormValues } from "@/schemas/recipe";
import type { RecipeDetail } from "@/types/recipe";
import type { UploadMode } from "@/types/upload";

const UNIT_OPTIONS = [
  "g",
  "kg",
  "ml",
  "l",
  "tsp",
  "tbsp",
  "cup",
  "cups",
  "pinch",
  "clove",
  "cloves",
  "slice",
  "slices",
  "piece",
  "pieces",
  "inch",
  "can",
  "bunch",
  "handful",
].map((value) => ({ value }));

const emptyIngredient = { quantity: null, unit: "", name: "" };
const emptyStep = { text: "", image: "" };

function toFormValues(recipe?: RecipeDetail): RecipeFormValues {
  if (!recipe) {
    return {
      title: "",
      description: "",
      coverImage: "",
      cuisine: undefined as unknown as RecipeFormValues["cuisine"],
      category: undefined as unknown as RecipeFormValues["category"],
      dietTags: [],
      difficulty: "easy",
      prepTime: 10,
      cookTime: 20,
      servings: 2,
      ingredients: [emptyIngredient, emptyIngredient, emptyIngredient],
      steps: [emptyStep, emptyStep],
      tags: [],
    };
  }
  return {
    title: recipe.title,
    description: recipe.description,
    coverImage: recipe.coverImage,
    cuisine: recipe.cuisine as RecipeFormValues["cuisine"],
    category: recipe.category,
    dietTags: recipe.dietTags,
    difficulty: recipe.difficulty,
    prepTime: recipe.prepTime,
    cookTime: recipe.cookTime,
    servings: recipe.servings,
    ingredients: recipe.ingredients.map(({ quantity, unit, name }) => ({ quantity, unit, name })),
    steps: recipe.steps.map(({ text, image }) => ({ text, image })),
    tags: recipe.tags,
  };
}

interface RecipeFormProps {
  /** Present when editing an existing recipe. */
  recipe?: RecipeDetail;
  /** Image storage available on the server (Cloudinary or local dev disk). */
  uploadMode: UploadMode;
}

export default function RecipeForm({ recipe, uploadMode }: RecipeFormProps) {
  const router = useRouter();
  const { message, modal } = App.useApp();
  const [form] = Form.useForm<RecipeFormValues>();
  const [formError, setFormError] = useState<string | null>(null);
  const [pending, setPending] = useState<RecipeStatus | "delete" | null>(null);
  const [dirty, setDirty] = useState(false);

  const isEdit = Boolean(recipe);
  const isPublished = recipe?.status === "published";
  const create = useCreateRecipe();
  const update = useUpdateRecipe(recipe?.id ?? "");
  const remove = useDeleteRecipe();

  // Warn before leaving with unsaved changes
  useEffect(() => {
    if (!dirty) return;
    const onBeforeUnload = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [dirty]);

  function clearErrors() {
    setFormError(null);
    clearFieldErrors(form);
  }

  async function submit(status: RecipeStatus) {
    clearErrors();
    const values = form.getFieldsValue(true) as RecipeFormValues;

    // Same Zod schema as the API → identical rules and messages
    const parsed = recipeInputSchema.safeParse({ ...values, status });
    if (!parsed.success) {
      applyFieldErrors(form, zodIssuesToFieldErrors(parsed.error));
      message.error("Please fix the highlighted fields.");
      return;
    }

    setPending(status);
    try {
      const saved = recipe
        ? await update.mutateAsync(parsed.data)
        : await create.mutateAsync(parsed.data);
      setDirty(false);

      if (saved.status === "published") {
        message.success(isPublished ? "Recipe updated" : "Recipe published! 🎉");
        router.push(`/recipes/${saved.slug}`);
      } else {
        message.success("Draft saved");
        // Keep editing the draft (its slug may have changed with the title)
        if (!recipe || saved.slug !== recipe.slug) {
          router.replace(`/recipes/${saved.slug}/edit`);
        }
      }
      router.refresh(); // server-rendered pages (dashboard, detail) pick up the change
    } catch (error) {
      if (isApiError(error)) {
        if (!applyFieldErrors(form, error.fieldErrors)) setFormError(error.message);
      } else {
        setFormError("Something went wrong. Please try again.");
      }
    } finally {
      setPending(null);
    }
  }

  function confirmDelete() {
    if (!recipe) return;
    modal.confirm({
      title: `Delete “${recipe.title}”?`,
      content: "This permanently removes the recipe. This can't be undone.",
      okText: "Delete",
      okButtonProps: { danger: true },
      onOk: async () => {
        setPending("delete");
        try {
          await remove.mutateAsync(recipe);
          setDirty(false);
          message.success("Recipe deleted");
          router.push("/dashboard?tab=recipes");
          router.refresh();
        } catch {
          setPending(null); // global notification already shown by the API client
        }
      },
    });
  }

  const busy = pending !== null;

  return (
    <Form<RecipeFormValues>
      form={form}
      layout="vertical"
      requiredMark="optional"
      initialValues={toFormValues(recipe)}
      onValuesChange={(changed: Partial<RecipeFormValues>) => {
        setDirty(true);
        clearChangedFieldErrors(form, changed);
      }}
      onFinish={() => submit("published")}
      disabled={busy}
      scrollToFirstError
      className="space-y-6"
    >
      {formError && <Alert type="error" showIcon title={formError} role="alert" />}

      {/* ── Basics ─────────────────────────────────────────── */}
      <Card title="The basics">
        <Form.Item label="Title" name="title" required>
          <Input
            size="large"
            placeholder="e.g. Grandma's Chicken Handi"
            maxLength={120}
            showCount
          />
        </Form.Item>
        <Form.Item label="Description" name="description" required>
          <Input.TextArea
            placeholder="What makes this dish special? When do you cook it?"
            autoSize={{ minRows: 3, maxRows: 8 }}
            maxLength={1000}
            showCount
          />
        </Form.Item>
        <Form.Item
          label="Cover photo"
          name="coverImage"
          extra="A bright, close-up photo of the finished dish works best."
        >
          <ImageUploadField label="cover photo" mode={uploadMode} />
        </Form.Item>
      </Card>

      {/* ── Details ────────────────────────────────────────── */}
      <Card title="Details">
        <div className="grid gap-x-6 sm:grid-cols-2">
          <Form.Item label="Cuisine" name="cuisine" required>
            <Select
              showSearch
              placeholder="Select a cuisine"
              options={CUISINES.map((c) => ({ value: c, label: c }))}
            />
          </Form.Item>
          <Form.Item label="Category" name="category" required>
            <Select
              placeholder="Select a category"
              options={CATEGORIES.map((c) => ({ value: c, label: CATEGORY_LABELS[c] }))}
            />
          </Form.Item>
        </div>

        <Form.Item label="Difficulty" name="difficulty" required>
          <Radio.Group
            optionType="button"
            buttonStyle="solid"
            options={DIFFICULTIES.map((d) => ({ value: d, label: DIFFICULTY_LABELS[d] }))}
          />
        </Form.Item>

        <div className="grid grid-cols-2 gap-x-6 sm:grid-cols-3">
          <Form.Item label="Prep time" name="prepTime" required>
            <InputNumber min={0} max={1440} suffix="min" className="!w-full" />
          </Form.Item>
          <Form.Item label="Cook time" name="cookTime" required>
            <InputNumber min={0} max={1440} suffix="min" className="!w-full" />
          </Form.Item>
          <Form.Item label="Servings" name="servings" required>
            <InputNumber min={1} max={100} className="!w-full" />
          </Form.Item>
        </div>

        <Form.Item label="Diet" name="dietTags">
          <Checkbox.Group options={DIET_TAGS.map((d) => ({ value: d, label: DIET_LABELS[d] }))} />
        </Form.Item>

        <Form.Item
          label="Tags"
          name="tags"
          extra="Press Enter or comma after each tag, e.g. curry, weeknight, spicy."
        >
          <Select
            mode="tags"
            tokenSeparators={[","]}
            maxCount={15}
            placeholder="Add tags"
            open={false}
          />
        </Form.Item>
      </Card>

      {/* ── Ingredients ────────────────────────────────────── */}
      <Card title="Ingredients">
        <Form.List name="ingredients">
          {(fields, { add, remove: removeRow, move }, { errors }) => (
            <div className="space-y-3">
              <div className="hidden grid-cols-[6rem_7rem_1fr_auto] gap-2 text-xs font-medium text-muted uppercase sm:grid">
                <span>Qty</span>
                <span>Unit</span>
                <span>Ingredient</span>
                <span className="sr-only">Actions</span>
              </div>
              {fields.map((field, index) => (
                <div
                  key={field.key}
                  className="grid grid-cols-[5.5rem_6.5rem_1fr] gap-2 border-b border-border pb-3 sm:grid-cols-[6rem_7rem_1fr_auto] sm:border-0 sm:pb-0"
                >
                  <Form.Item name={[field.name, "quantity"]} noStyle>
                    <InputNumber
                      min={0}
                      step={0.25}
                      placeholder="Qty"
                      className="!w-full"
                      aria-label={`Ingredient ${index + 1} quantity`}
                    />
                  </Form.Item>
                  <Form.Item name={[field.name, "unit"]} noStyle>
                    <AutoComplete
                      options={UNIT_OPTIONS}
                      placeholder="Unit"
                      aria-label={`Ingredient ${index + 1} unit`}
                      filterOption={(input, option) =>
                        (option?.value ?? "").toLowerCase().startsWith(input.toLowerCase())
                      }
                    />
                  </Form.Item>
                  <Form.Item name={[field.name, "name"]} className="!mb-0">
                    <Input placeholder="e.g. paneer" aria-label={`Ingredient ${index + 1} name`} />
                  </Form.Item>
                  <Space.Compact className="col-span-3 justify-end sm:col-span-1">
                    <Tooltip title="Move up">
                      <Button
                        icon={<ArrowUpOutlined />}
                        disabled={index === 0}
                        onClick={() => move(index, index - 1)}
                        aria-label={`Move ingredient ${index + 1} up`}
                      />
                    </Tooltip>
                    <Tooltip title="Move down">
                      <Button
                        icon={<ArrowDownOutlined />}
                        disabled={index === fields.length - 1}
                        onClick={() => move(index, index + 1)}
                        aria-label={`Move ingredient ${index + 1} down`}
                      />
                    </Tooltip>
                    <Tooltip title="Remove">
                      <Button
                        danger
                        icon={<MinusCircleOutlined />}
                        disabled={fields.length === 1}
                        onClick={() => removeRow(field.name)}
                        aria-label={`Remove ingredient ${index + 1}`}
                      />
                    </Tooltip>
                  </Space.Compact>
                </div>
              ))}
              <Form.ErrorList errors={errors} />
              <Button
                type="dashed"
                block
                icon={<PlusOutlined />}
                onClick={() => add(emptyIngredient)}
              >
                Add ingredient
              </Button>
              <p className="text-xs text-muted">
                Leave quantity empty for things like “salt, to taste”.
              </p>
            </div>
          )}
        </Form.List>
      </Card>

      {/* ── Method ─────────────────────────────────────────── */}
      <Card title="Method">
        <Form.List name="steps">
          {(fields, { add, remove: removeStep, move }, { errors }) => (
            <ol className="space-y-5">
              {fields.map((field, index) => (
                <li key={field.key} className="flex gap-3">
                  <span
                    aria-hidden
                    className="mt-1 grid size-8 shrink-0 place-items-center rounded-full bg-brand text-sm font-bold text-white"
                  >
                    {index + 1}
                  </span>
                  <div className="min-w-0 flex-1 space-y-2">
                    <Form.Item name={[field.name, "text"]} className="!mb-0">
                      <Input.TextArea
                        autoSize={{ minRows: 2, maxRows: 8 }}
                        placeholder={
                          index === 0 ? "e.g. Heat the oil in a heavy pan…" : "Next step…"
                        }
                        aria-label={`Step ${index + 1}`}
                        maxLength={2000}
                      />
                    </Form.Item>
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <Form.Item name={[field.name, "image"]} noStyle>
                        <ImageUploadField
                          compact
                          label={`step ${index + 1} photo`}
                          mode={uploadMode}
                        />
                      </Form.Item>
                      <Space.Compact>
                        <Button
                          icon={<ArrowUpOutlined />}
                          disabled={index === 0}
                          onClick={() => move(index, index - 1)}
                          aria-label={`Move step ${index + 1} up`}
                        />
                        <Button
                          icon={<ArrowDownOutlined />}
                          disabled={index === fields.length - 1}
                          onClick={() => move(index, index + 1)}
                          aria-label={`Move step ${index + 1} down`}
                        />
                        <Button
                          danger
                          icon={<MinusCircleOutlined />}
                          disabled={fields.length === 1}
                          onClick={() => removeStep(field.name)}
                          aria-label={`Remove step ${index + 1}`}
                        />
                      </Space.Compact>
                    </div>
                  </div>
                </li>
              ))}
              <Form.ErrorList errors={errors} />
              <Button type="dashed" block icon={<PlusOutlined />} onClick={() => add(emptyStep)}>
                Add step
              </Button>
            </ol>
          )}
        </Form.List>
      </Card>

      {/* ── Actions (sticky) ───────────────────────────────── */}
      <div className="sticky bottom-0 z-10 -mx-4 flex flex-wrap items-center gap-2 border-t border-border bg-background/95 px-4 py-3 backdrop-blur sm:mx-0 sm:rounded-brand-lg sm:border">
        {recipe && (
          <Tag color={isPublished ? "green" : "gold"} className="!m-0">
            {isPublished ? "Published" : "Draft"}
          </Tag>
        )}
        {isEdit && (
          <Button
            danger
            type="text"
            icon={<DeleteOutlined />}
            onClick={confirmDelete}
            loading={pending === "delete"}
          >
            Delete
          </Button>
        )}
        <div className="ml-auto flex flex-wrap gap-2">
          <Button onClick={() => router.back()} disabled={false}>
            Cancel
          </Button>
          <Button onClick={() => submit("draft")} loading={pending === "draft"}>
            {isPublished ? "Unpublish & save as draft" : "Save draft"}
          </Button>
          <Button type="primary" htmlType="submit" loading={pending === "published"}>
            {isPublished ? "Save changes" : "Publish"}
          </Button>
        </div>
      </div>
    </Form>
  );
}
