"use client";

import { Button, Card, Input, Rate, Tag } from "antd";
import { SearchOutlined } from "@ant-design/icons";

const categories = ["Breakfast", "Lunch", "Dinner", "Dessert", "Snack", "Drink"];

/**
 * Phase 1 placeholder: verifies antd + Tailwind render together in both themes.
 * antd / @ant-design/icons use React context, so they must live in client components.
 */
export default function SetupPreview() {
  return (
    <>
      <div className="mx-auto mt-8 flex max-w-xl gap-2">
        <Input
          size="large"
          placeholder="Try “paneer”, “pasta” or “tomato, onion”"
          prefix={<SearchOutlined />}
          aria-label="Search recipes"
        />
        <Button type="primary" size="large">
          Search
        </Button>
      </div>
      <div className="mt-6 flex flex-wrap justify-center gap-2">
        {categories.map((c) => (
          <Tag key={c} className="!m-0 cursor-pointer !px-3 !py-1 !text-sm">
            {c}
          </Tag>
        ))}
      </div>

      <section className="mt-16 grid gap-6 text-left sm:grid-cols-2 lg:grid-cols-3">
        {["Theme tokens", "Cascade layers", "Dark mode"].map((title) => (
          <Card key={title} title={title} className="shadow-sm">
            <p className="text-muted">
              antd components and Tailwind utilities share the same warm palette and radius.
            </p>
            <div className="mt-4 flex items-center justify-between">
              <Rate disabled defaultValue={4} />
              <span className="rounded-brand bg-brand-100 px-2 py-1 text-xs font-semibold text-brand-800 dark:bg-brand-900/40 dark:text-brand-200">
                Tailwind
              </span>
            </div>
          </Card>
        ))}
      </section>
    </>
  );
}
