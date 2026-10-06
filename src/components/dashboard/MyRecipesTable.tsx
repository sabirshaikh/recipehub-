"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { App, Button, Empty, Popconfirm, Rate, Table, Tag, Tooltip, type TableProps } from "antd";
import { DeleteOutlined, EditOutlined, EyeOutlined, PlusOutlined } from "@ant-design/icons";
import LinkButton from "@/components/ui/LinkButton";
import { useDeleteRecipe } from "@/hooks/useRecipeMutations";
import { CATEGORIES, CATEGORY_LABELS, type Category } from "@/lib/constants";
import { isOptimizableImage } from "@/lib/images";
import { formatMinutes } from "@/lib/utils";
import type { RecipeSummary } from "@/types/recipe";

const dateFormat = new Intl.DateTimeFormat("en-IN", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

export default function MyRecipesTable({ recipes }: { recipes: RecipeSummary[] }) {
  const router = useRouter();
  const { message } = App.useApp();
  const remove = useDeleteRecipe();

  async function handleDelete(recipe: RecipeSummary) {
    try {
      await remove.mutateAsync(recipe);
      message.success(`Deleted “${recipe.title}”`);
      router.refresh(); // this table is server-rendered
    } catch {
      // The API client already shows a notification for server errors
    }
  }

  const columns: TableProps<RecipeSummary>["columns"] = [
    {
      title: "Recipe",
      key: "title",
      sorter: (a, b) => a.title.localeCompare(b.title),
      render: (_, r) => (
        <div className="flex min-w-56 items-center gap-3">
          <div className="relative size-14 shrink-0 overflow-hidden rounded-brand bg-brand-50">
            {r.coverImage && (
              <Image
                src={r.coverImage}
                alt=""
                fill
                sizes="56px"
                unoptimized={!isOptimizableImage(r.coverImage)}
                className="object-cover"
              />
            )}
          </div>
          <div className="min-w-0">
            <Link
              // Drafts open the editor; published recipes open the public page
              href={r.status === "published" ? `/recipes/${r.slug}` : `/recipes/${r.slug}/edit`}
              className="font-semibold hover:text-brand"
            >
              {r.title}
            </Link>
            <div className="text-xs text-muted">
              {r.cuisine} · {formatMinutes(r.totalTime)}
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      filters: [
        { text: "Published", value: "published" },
        { text: "Draft", value: "draft" },
      ],
      onFilter: (value, r) => r.status === value,
      render: (status: RecipeSummary["status"]) =>
        status === "published" ? <Tag color="green">Published</Tag> : <Tag color="gold">Draft</Tag>,
    },
    {
      title: "Category",
      dataIndex: "category",
      responsive: ["md"],
      filters: CATEGORIES.map((c) => ({ text: CATEGORY_LABELS[c], value: c })),
      onFilter: (value, r) => r.category === value,
      render: (c: Category) => CATEGORY_LABELS[c],
    },
    {
      title: "Rating",
      key: "rating",
      responsive: ["lg"],
      sorter: (a, b) => a.averageRating - b.averageRating,
      render: (_, r) =>
        r.ratingsCount ? (
          <span className="whitespace-nowrap">
            <Rate disabled allowHalf value={r.averageRating} className="!text-sm" />{" "}
            <span className="text-xs text-muted">({r.ratingsCount})</span>
          </span>
        ) : (
          <span className="text-xs text-muted">No ratings yet</span>
        ),
    },
    {
      title: "Created",
      dataIndex: "createdAt",
      responsive: ["sm"],
      defaultSortOrder: "descend",
      sorter: (a, b) => a.createdAt.localeCompare(b.createdAt),
      render: (d: string) => (
        <span className="whitespace-nowrap">{dateFormat.format(new Date(d))}</span>
      ),
    },
    {
      title: <span className="sr-only">Actions</span>,
      key: "actions",
      align: "right",
      render: (_, r) => (
        <div className="flex justify-end gap-1">
          <Tooltip title={r.status === "published" ? "View" : "Preview draft"}>
            <LinkButton
              href={`/recipes/${r.slug}`}
              type="text"
              icon={<EyeOutlined />}
              aria-label={`View ${r.title}`}
            />
          </Tooltip>
          <Tooltip title="Edit">
            <LinkButton
              href={`/recipes/${r.slug}/edit`}
              type="text"
              icon={<EditOutlined />}
              aria-label={`Edit ${r.title}`}
            />
          </Tooltip>
          <Popconfirm
            title="Delete this recipe?"
            description="This can't be undone."
            okText="Delete"
            okButtonProps={{ danger: true }}
            onConfirm={() => handleDelete(r)}
          >
            <Tooltip title="Delete">
              <Button
                type="text"
                danger
                icon={<DeleteOutlined />}
                aria-label={`Delete ${r.title}`}
                loading={remove.isPending && remove.variables?.id === r.id}
              />
            </Tooltip>
          </Popconfirm>
        </div>
      ),
    },
  ];

  return (
    <>
      <div className="mb-4 flex justify-end">
        <LinkButton href="/recipes/new" type="primary" icon={<PlusOutlined />}>
          Submit a recipe
        </LinkButton>
      </div>
      <Table<RecipeSummary>
        rowKey="id"
        columns={columns}
        dataSource={recipes}
        pagination={{ pageSize: 10, hideOnSinglePage: true }}
        scroll={{ x: "max-content" }}
        locale={{
          emptyText: (
            <Empty description="You haven't submitted any recipes yet.">
              <LinkButton href="/recipes/new" type="primary" icon={<PlusOutlined />}>
                Submit your first recipe
              </LinkButton>
            </Empty>
          ),
        }}
      />
    </>
  );
}
