"use client";

import { useState } from "react";
import { FileSearch, Plus, Search } from "lucide-react";
import { useJds, useDeleteJd } from "@/hooks/use-jds";
import { useJdListView } from "@/hooks/use-jd-list-view";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorMessage } from "@/components/content/error-message";
import { JdCard, JdCardSkeleton } from "@/components/jds/jd-card";
import { JdCreateSheet } from "@/components/jds/jd-create-sheet";
import { JdListToolbar } from "@/components/jds/jd-list-toolbar";

const GRID_CLASS =
  "grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5";

export default function JdsListPage() {
  const { data: jds, isLoading, error } = useJds();
  const deleteJd = useDeleteJd();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const view = useJdListView(jds);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Targets"
        title="Job descriptions"
        description="Save the roles you're applying for, then score any profile against them."
        action={<JdCreateSheet open={showCreateForm} onOpenChange={setShowCreateForm} />}
      />

      <ErrorMessage error={error} />

      {jds && jds.length > 0 ? (
        <JdListToolbar
          query={view.query}
          jds={jds}
          sourceTypes={view.sourceTypes}
          visibleCount={view.visible.length}
          onSearchChange={view.setSearch}
          onSortChange={view.setSort}
          onSourceChange={view.setSource}
        />
      ) : null}

      {isLoading ? (
        <div className={GRID_CLASS}>
          <JdCardSkeleton />
          <JdCardSkeleton />
          <JdCardSkeleton />
          <JdCardSkeleton />
        </div>
      ) : jds?.length === 0 ? (
        <EmptyState
          icon={FileSearch}
          title="No job descriptions yet"
          description="Add a posting by pasting its text, pasting its URL, or uploading a file — then evaluate a profile against it."
          action={
            <Button variant="cta" onClick={() => setShowCreateForm(true)}>
              <Plus aria-hidden="true" />
              New job description
            </Button>
          }
        />
      ) : view.visible.length === 0 ? (
        <EmptyState
          icon={Search}
          title="No job descriptions match those filters"
          description="Try a different search term or switch back to all sources."
          action={
            <Button variant="outline" onClick={view.clearFilters}>
              Clear filters
            </Button>
          }
        />
      ) : (
        <div className={GRID_CLASS}>
          {view.visible.map((jd) => (
            <JdCard key={jd.id} jd={jd} onDelete={() => deleteJd.mutate(jd.id)} />
          ))}
        </div>
      )}

      <ErrorMessage error={deleteJd.error} />
    </div>
  );
}
