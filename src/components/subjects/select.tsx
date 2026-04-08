import { BookOpen, GraduationCap } from "lucide-react";
import { Collection, ListBoxLoadMoreItem } from "react-aria-components";
import { Label, ListBox, Select, Spinner } from "@heroui/react";

import type { Key } from "@heroui/react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useSubjectsInfiniteQueryOptions } from "@/queries/subjects";

interface SubjectSelectProps {
  value: Key | null;
  onChange: (key: Key | null) => void;
  isInvalid?: boolean;
}

export function SubjectSelect({
  value,
  onChange,
  isInvalid,
}: SubjectSelectProps) {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useInfiniteQuery(useSubjectsInfiniteQueryOptions());

  const allSubjects = data?.pages.flatMap((page) => page.rows) ?? [];

  return (
    <Select
      className="w-full"
      value={value}
      onChange={onChange}
      isInvalid={isInvalid}
    >
      <Label className="font-bold text-xs uppercase text-accent">Subject</Label>

      <Select.Trigger className="h-14">
        <Select.Value>
          {({ isPlaceholder, state, defaultChildren }) => {
            if (isPlaceholder || state.selectedItems.length === 0) {
              return defaultChildren;
            }

            const subject = allSubjects.find(
              (s) => s.$id === state.selectedItems[0]?.key,
            );

            if (!subject) return defaultChildren;

            return (
              <div className="flex items-center gap-3">
                <BookOpen className="size-4 text-accent" />
                <span className="font-bold text-foreground">
                  {subject.name}
                </span>
              </div>
            );
          }}
        </Select.Value>
        <Select.Indicator />
      </Select.Trigger>

      <Select.Popover>
        <ListBox aria-label="Subjects list" className="max-h-75">
          {/* Initial loading state as a stable ListBox Item */}
          {isLoading && (
            <ListBox.Item
              id="loading-subjects"
              className="flex justify-center p-4"
            >
              <Spinner size="sm" color="accent" />
            </ListBox.Item>
          )}

          {/* Collection stays mounted even when empty to keep RAC happy */}
          <Collection items={allSubjects}>
            {(subject) => (
              <ListBox.Item
                id={subject.$id}
                textValue={subject.name}
                className="py-3 px-4"
              >
                <div className="flex items-center gap-4">
                  <div className="size-10 rounded-xl bg-accent/10 text-accent flex items-center justify-center shadow-sm">
                    <GraduationCap className="size-6" />
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="font-bold text-foreground">
                      {subject.name}
                    </span>
                    <span className="text-xs text-muted-foreground uppercase font-semibold tracking-tighter">
                      Teaching Category
                    </span>
                  </div>
                </div>
                <ListBox.ItemIndicator />
              </ListBox.Item>
            )}
          </Collection>

          {/* Load more logic */}
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
