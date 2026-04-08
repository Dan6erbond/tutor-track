import { Collection, ListBoxLoadMoreItem } from "react-aria-components";
import { Label, ListBox, Select, Spinner } from "@heroui/react";

import type { Key } from "@heroui/react";
import { Mail } from "lucide-react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useStudentsInfiniteQueryOptions } from "@/queries/students";

interface StudentSelectProps {
  value: Key | null;
  onChange: (key: Key | null) => void;
  isInvalid?: boolean;
}

export function StudentSelect({
  value,
  onChange,
  isInvalid,
}: StudentSelectProps) {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useInfiniteQuery(useStudentsInfiniteQueryOptions(""));

  const allStudents = data?.pages.flatMap((page) => page.rows) ?? [];

  return (
    <Select
      className="w-full"
      value={value}
      onChange={onChange}
      isInvalid={isInvalid}
    >
      <Label className="font-bold text-xs uppercase text-accent">Student</Label>

      <Select.Trigger className="h-14">
        <Select.Value>
          {({ isPlaceholder, state, defaultChildren }) => {
            if (isPlaceholder || state.selectedItems.length === 0)
              return defaultChildren;
            const student = allStudents.find(
              (s) => s.$id === state.selectedItems[0]?.key,
            );
            if (!student) return defaultChildren;

            return (
              <div className="flex items-center gap-3">
                <div className="size-6 rounded-lg bg-accent text-accent-foreground flex items-center justify-center font-black text-[10px]">
                  {student.name.charAt(0).toUpperCase()}
                </div>
                <span className="font-bold text-foreground">
                  {student.name}
                </span>
              </div>
            );
          }}
        </Select.Value>
        <Select.Indicator />
      </Select.Trigger>

      <Select.Popover>
        <ListBox aria-label="Students list" className="max-h-75">
          {/* 1. Loading state handled as a separate item BEFORE the collection */}
          {isLoading && (
            <ListBox.Item
              id="loading-spinner"
              className="flex justify-center p-4"
            >
              <Spinner size="sm" color="accent" />
            </ListBox.Item>
          )}

          {/* 2. Collection is ALWAYS rendered to keep the internal tree stable */}
          <Collection items={allStudents}>
            {(student) => (
              <ListBox.Item
                id={student.$id}
                textValue={student.name}
                className="py-3 px-4"
              >
                <div className="flex items-center gap-4">
                  <div className="size-10 rounded-xl bg-accent/10 text-accent flex items-center justify-center font-black text-lg">
                    {student.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="font-bold">{student.name}</span>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Mail className="size-3" />
                      {student.email || "No email"}
                    </div>
                  </div>
                </div>
                <ListBox.ItemIndicator />
              </ListBox.Item>
            )}
          </Collection>

          {/* 3. Load more handled by the RAC component */}
          <ListBoxLoadMoreItem
            isLoading={isFetchingNextPage}
            onLoadMore={() => {
              if (hasNextPage) fetchNextPage();
            }}
          >
            {hasNextPage ? (
              <div className="flex items-center justify-center gap-2 py-3 border-t border-divider">
                <Spinner size="sm" color="accent" />
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                  Loading More
                </span>
              </div>
            ) : (
              <div className="h-2" />
            )}
          </ListBoxLoadMoreItem>
        </ListBox>
      </Select.Popover>
    </Select>
  );
}
