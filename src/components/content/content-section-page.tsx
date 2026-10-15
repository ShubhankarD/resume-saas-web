"use client";

import type { ReactNode } from "react";
import { useContent } from "@/hooks/use-content";
import type { ContentIn } from "@/lib/api/content";
import { PageHeader } from "@/components/ui/page-header";
import { ContentSkeleton, NoContentRecord } from "@/components/content/content-states";
import { ErrorMessage } from "@/components/content/error-message";

/**
 * The frame every content-library sub-page shares: a header, and the three
 * states that come from the one `useContent()` query — loading, error, and
 * no record yet. Once content exists, `children` renders it.
 *
 * `children` is a render function that must return elements (not call hooks);
 * put hook-using UI in its own component so hook order stays stable.
 */
export function ContentSectionPage({
  title,
  description,
  section,
  action,
  children,
}: {
  title: string;
  description: string;
  /** Names the section in the "no content record yet" message. */
  section: string;
  /** Header action, shown only once content has loaded. */
  action?: ReactNode;
  children: (content: ContentIn) => ReactNode;
}) {
  const { data: content, isLoading, error } = useContent();

  const header = (headerAction?: ReactNode) => (
    <PageHeader
      eyebrow="Content library"
      title={title}
      description={description}
      action={headerAction}
    />
  );

  if (isLoading) {
    return (
      <div className="space-y-6">
        {header()}
        <ContentSkeleton rows={3} />
      </div>
    );
  }
  if (error) {
    return (
      <div className="space-y-6">
        {header()}
        <ErrorMessage error={error} />
      </div>
    );
  }
  if (!content) {
    return (
      <div className="space-y-6">
        {header()}
        <NoContentRecord section={section} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {header(action)}
      {children(content)}
    </div>
  );
}
