"use client";

import { Search } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/cn";
import {
  CATEGORY_FILTERS,
  GRADE_FILTERS,
  SORT_OPTIONS,
  TYPE_TABS,
  type MediaType,
} from "@/components/media-library/data";

type SortValue = (typeof SORT_OPTIONS)[number]["value"];

type Props = {
  search: string;
  onSearch: (value: string) => void;
  type: MediaType | "all";
  onType: (value: MediaType | "all") => void;
  grade: string;
  onGrade: (value: string) => void;
  category: string;
  onCategory: (value: string) => void;
  sort: SortValue;
  onSort: (value: SortValue) => void;
};

const selectClass =
  "h-11 w-full rounded-lg border border-brand-100 bg-white px-3 text-sm font-bold text-brand-700 outline-none transition focus:border-brand-400";

const labelClass = "mb-1 block text-xs font-extrabold text-slate-500";

export function MediaFilters({
  search,
  onSearch,
  type,
  onType,
  grade,
  onGrade,
  category,
  onCategory,
  sort,
  onSort,
}: Props) {
  return (
    <Card className="space-y-4">
      <div className="grid gap-3 lg:grid-cols-[1.4fr_1fr_1fr_1fr_1fr]">
        <div>
          <label className={labelClass}>ค้นหา</label>
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(e) => onSearch(e.target.value)}
              placeholder="ค้นหาชื่อสื่อ..."
              className="h-11 w-full rounded-lg border border-brand-100 bg-white pl-9 pr-3 text-sm font-bold text-brand-700 outline-none transition focus:border-brand-400"
            />
          </div>
        </div>

        <div>
          <label className={labelClass}>ประเภทสื่อ</label>
          <select className={selectClass} value={type} onChange={(e) => onType(e.target.value as MediaType | "all")}>
            {TYPE_TABS.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className={labelClass}>ระดับชั้น</label>
          <select className={selectClass} value={grade} onChange={(e) => onGrade(e.target.value)}>
            {GRADE_FILTERS.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className={labelClass}>หมวดบทเรียน</label>
          <select className={selectClass} value={category} onChange={(e) => onCategory(e.target.value)}>
            {CATEGORY_FILTERS.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className={labelClass}>เรียงตาม</label>
          <select className={selectClass} value={sort} onChange={(e) => onSort(e.target.value as SortValue)}>
            {SORT_OPTIONS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* แท็บเร็ว */}
      <div className="flex flex-wrap gap-2">
        {TYPE_TABS.map((t) => (
          <button
            key={t.value}
            onClick={() => onType(t.value)}
            className={cn(
              "rounded-lg px-4 py-2 text-sm font-extrabold transition",
              type === t.value
                ? "bg-brand-600 text-white shadow-sm"
                : "bg-white text-brand-700 ring-1 ring-brand-100 hover:bg-brand-50",
            )}
          >
            {t.label}
          </button>
        ))}
      </div>
    </Card>
  );
}
