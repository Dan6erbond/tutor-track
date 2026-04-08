"use client";

import { CalendarDays, Clock } from "lucide-react";
import { Collection, ListBoxLoadMoreItem } from "react-aria-components";
import { Label, ListBox, Select, Spinner, Tag } from "@heroui/react";

import type { Key } from "@heroui/react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useSessionsInfiniteQueryOptions } from "@/queries/sessions";

interface SessionMultiSelectProps {
  studentId?: string;
  value: Key[];
  onChange: (keys: Key[]) => void;
  isInvalid?: boolean;
}

export function SessionMultiSelect({
  studentId,
  value,
  onChange,
  isInvalid,
}: SessionMultiSelectProps) {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useInfiniteQuery(useSessionsInfiniteQueryOptions("all", studentId));

  const allSessions = data?.pages.flatMap((page) => page.rows) ?? [];

  return (
    <Select
      className="w-full"
      selectionMode="multiple"
      value={value}
      onChange={(keys) => onChange(keys as Key[])}
      isInvalid={isInvalid}
    >
      <Label className="font-bold text-xs uppercase text-accent">
        Tutoring Sessions
      </Label>

      <Select.Trigger className="min-h-14 h-auto py-2">
        <Select.Value>
          {({ isPlaceholder, state, defaultChildren }) => {
            if (isPlaceholder || state.selectedItems.length === 0) {
              return defaultChildren;
            }

            return (
              <div className="flex flex-wrap gap-1">
                {Array.from(state.selectedItems).map((item) => {
                  const session = allSessions.find((s) => s.$id === item.key);
                  return (
                    <Tag
                      key={item.key}
                      variant="surface"
                      className="font-bold bg-accent-soft text-accent"
                      size="sm"
                    >
                      {session
                        ? new Date(session.date).toLocaleDateString()
                        : "..."}
                    </Tag>
                  );
                })}
              </div>
            );
          }}
        </Select.Value>
        <Select.Indicator />
      </Select.Trigger>

      <Select.Popover>
        <ListBox
          aria-label="Sessions list"
          className="max-h-75"
          selectionMode="multiple"
        >
          <Collection items={allSessions}>
            {(session: any) => (
              <ListBox.Item
                id={session.$id}
                textValue={session.date}
                className="py-3 px-4"
              >
                <div className="flex flex-col">
                  <div className="flex items-center gap-2 font-bold">
                    <CalendarDays className="size-3 text-accent" />
                    {new Date(session.date).toLocaleDateString()}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                    <Clock className="size-3" />
                    {session.duration} min — {session.subject?.name}
                  </div>
                </div>
                <ListBox.ItemIndicator />
              </ListBox.Item>
            )}
          </Collection>

          <ListBoxLoadMoreItem
            isLoading={isLoading || isFetchingNextPage}
            onLoadMore={() => hasNextPage && fetchNextPage()}
          >
            <div className="flex flex-col items-center justify-center gap-2 py-4">
              {hasNextPage || isLoading ? (
                <>
                  <Spinner size="sm" color="accent" />
                  <span className="text-xs text-muted">
                    Loading sessions...
                  </span>
                </>
              ) : (
                <div className="h-2" />
              )}
            </div>
          </ListBoxLoadMoreItem>
        </ListBox>
      </Select.Popover>
    </Select>
  );
}
