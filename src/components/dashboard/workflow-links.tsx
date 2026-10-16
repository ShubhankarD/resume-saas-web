import { ClipboardCheck, FileText, Layers, UserRound, type LucideIcon } from "lucide-react";
import { WorkflowRow } from "./workflow-row";

type CountKey = "profiles" | "jds" | "evaluations";

const WORKFLOW: {
  href: string;
  title: string;
  description: string;
  icon: LucideIcon;
  /** Which live count (if any) the row shows. */
  count?: CountKey;
}[] = [
  {
    href: "/content",
    title: "Content library",
    description: "Roles, bullets, skills, and education — the source material.",
    icon: Layers,
  },
  {
    href: "/profiles",
    title: "Resume profiles",
    description: "Curate bullets, pick a template, preview, export a PDF.",
    icon: UserRound,
    count: "profiles",
  },
  {
    href: "/jds",
    title: "Job descriptions",
    description: "Save a posting by paste, URL, or upload.",
    icon: FileText,
    count: "jds",
  },
  {
    href: "/evaluations",
    title: "Evaluations",
    description: "Fit scores and coverage gaps per profile.",
    icon: ClipboardCheck,
    count: "evaluations",
  },
];

export function WorkflowLinks({ counts }: { counts: Record<CountKey, number> }) {
  return (
    <div className="grid grid-cols-1 gap-2">
      {WORKFLOW.map(({ count, ...item }) => (
        <WorkflowRow key={item.href} {...item} meta={count ? `${counts[count]}` : undefined} />
      ))}
    </div>
  );
}
