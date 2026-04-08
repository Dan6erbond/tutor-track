import { Button, Card, Skeleton, Tooltip } from "@heroui/react";
import { ChevronRight, FileText, Plus, Settings2 } from "lucide-react";
import { Link, createFileRoute } from "@tanstack/react-router";

import { useQuery } from "@tanstack/react-query";
import { useTemplatesQueryOptions } from "@/queries/templates";

export const Route = createFileRoute("/app/templates/")({
  component: TemplatesPage,
});

function TemplatesPage() {
  // Assuming you've set up your query options similarly to sessions
  const { data: templates, isLoading } = useQuery(useTemplatesQueryOptions());

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black tracking-tighter">
            PDF <span className="text-accent">Templates</span>
          </h1>
          <p className="text-muted-foreground font-medium mt-1">
            Manage your automated document layouts for PDFMe.
          </p>
        </div>

        <Button
          variant="primary"
          className="font-bold rounded-2xl h-12 px-6 shadow-lg shadow-accent-soft-hover"
          render={(props) => (
            <Link {...(props as any)} to="/app/templates/new" />
          )}
        >
          <Plus className="size-5 mr-2" strokeWidth={3} />
          Create Template
        </Button>
      </div>

      {/* Grid Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          <LoadingGrid />
        ) : templates?.length === 0 ? (
          <EmptyState />
        ) : (
          templates?.map((template) => (
            <Link
              key={template.$id}
              to="/app/templates/$templateId"
              params={{ templateId: template.$id }}
              // BEM Classes applied directly to the Link
              className="card card--secondary group flex flex-col rounded-[32px] border-2 border-transparent hover:border-accent-soft-hover hover:shadow-xl hover:shadow-accent/5 transition-all active:scale-[0.98] outline-none"
            >
              <div className="card__header flex flex-row items-start justify-between p-6 pb-0">
                <div className="size-14 rounded-2xl bg-accent/10 flex items-center justify-center text-accent group-hover:scale-110 transition-transform duration-300">
                  <FileText className="size-7" />
                </div>

                {/* Wrap button in a div with preventDefault to isolate it from the Link navigation */}
                <div onClick={(e) => e.preventDefault()}>
                  <Tooltip delay={0}>
                    <Button
                      isIconOnly
                      variant="tertiary"
                      size="sm"
                      className="rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Settings2 className="size-4" />
                    </Button>
                    <Tooltip.Content>
                      <p className="font-bold text-xs">Quick Settings</p>
                    </Tooltip.Content>
                  </Tooltip>
                </div>
              </div>

              <div className="card__content p-6 pt-8 flex-1">
                <h3 className="card__title text-xl font-black truncate group-hover:text-accent transition-colors">
                  {template.name}
                </h3>
                <p className="card__description text-xs font-bold text-muted-foreground uppercase tracking-widest mt-1">
                  PDFMe Schema
                </p>
              </div>

              <div className="card__footer px-6 py-4 border-t border-divider flex items-center justify-between">
                <span className="text-xs text-muted-foreground font-medium">
                  Updated {new Date(template.$updatedAt).toLocaleDateString()}
                </span>
                <ChevronRight className="size-5 text-accent translate-x-0 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}

function LoadingGrid() {
  return (
    <>
      {[1, 2, 3].map((i) => (
        <Card key={i} className="rounded-[32px] border-none h-60">
          <Card.Header className="p-6">
            <Skeleton className="rounded-2xl size-14" />
          </Card.Header>
          <Card.Content className="p-6 space-y-2">
            <Skeleton className="h-6 w-3/4 rounded-lg" />
            <Skeleton className="h-4 w-1/2 rounded-lg" />
          </Card.Content>
        </Card>
      ))}
    </>
  );
}

function EmptyState() {
  return (
    <Card className="col-span-full py-16 rounded-[40px] border-dashed border-2 border-divider bg-transparent">
      <Card.Content className="flex flex-col items-center justify-center text-center space-y-4">
        <div className="size-20 rounded-full bg-muted/20 flex items-center justify-center text-muted-foreground">
          <FileText className="size-10" />
        </div>
        <Card.Title className="text-xl font-bold">No templates yet</Card.Title>
        <Card.Description>
          Start by creating your first PDF layout.
        </Card.Description>
      </Card.Content>
    </Card>
  );
}
