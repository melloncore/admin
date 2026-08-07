"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/ui/Feedback";
import { Card, CardBody } from "@/components/ui/Card";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { useCollection } from "@/hooks/useCollection";
import { blogApi } from "@/lib/api";
import { useToast } from "@/context/ToastContext";
import { formatDate } from "@/lib/utils/date";
import type { BlogPost } from "@/types";

export default function BlogPage() {
  const { items, isLoading, remove } = useCollection<BlogPost>(blogApi);
  const { showToast } = useToast();
  const [pendingDelete, setPendingDelete] = useState<BlogPost | null>(null);

  const columns: Column<BlogPost>[] = [
    {
      header: "Post",
      accessor: (row) => (
        <div className="flex items-center gap-3">
          {row.coverImageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={row.coverImageUrl} alt="" className="h-10 w-14 shrink-0 rounded-md object-cover" />
          ) : (
            <div className="h-10 w-14 shrink-0 rounded-md bg-paper" />
          )}
          <div className="min-w-0">
            <p className="truncate font-medium text-ink">{row.title}</p>
            <p className="truncate text-xs text-ink-muted">{row.category}</p>
          </div>
        </div>
      ),
    },
    { header: "Author", accessor: (row) => row.author },
    { header: "Date", accessor: (row) => formatDate(row.date) },
    {
      header: "Status",
      accessor: (row) => (
        <Badge tone={row.status === "published" ? "success" : "neutral"}>{row.status}</Badge>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Blog"
        description="Write, edit and publish articles for the blog."
        actions={
          <Link href="/blog/new">
            <Button>
              <Plus size={16} /> New post
            </Button>
          </Link>
        }
      />

      <Card>
        <CardBody className="p-0">
          <DataTable
            columns={columns}
            rows={items}
            rowKey={(row) => row.id}
            isLoading={isLoading}
            emptyTitle="No posts yet"
            emptyDescription="Write your first blog post."
            actions={(row) => (
              <>
                <Link href={`/blog/${row.id}`}>
                  <Button variant="ghost" size="sm" aria-label={`Edit ${row.title}`}>
                    <Pencil size={14} />
                  </Button>
                </Link>
                <Button variant="ghost" size="sm" onClick={() => setPendingDelete(row)}>
                  <Trash2 size={14} className="text-coral-600" />
                </Button>
              </>
            )}
          />
        </CardBody>
      </Card>

      <ConfirmDialog
        isOpen={!!pendingDelete}
        onClose={() => setPendingDelete(null)}
        title={`Delete "${pendingDelete?.title}"?`}
        confirmLabel="Delete post"
        onConfirm={async () => {
          if (!pendingDelete) return;
          await remove(pendingDelete.id);
          showToast("Post deleted.", "info");
        }}
      />
    </div>
  );
}
