"use client";

import { useEffect, useRef, useState } from "react";
import { DragDropProvider, DragEndEvent } from "@dnd-kit/react";
import { isSortable, useSortable } from "@dnd-kit/react/sortable";
import { deleteProjects, sortProjects } from "@/actions/projects";
import { Prisma } from "@/generated/prisma/client";
import {
  GripVertical,
  MoreHorizontal,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useProgress } from "@bprogress/next";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Link from "next/link";

type Project = Prisma.ProjectGetPayload<{
  include: {
    technologies: true;
    features: true;
    highlights: true;
  };
}>;

type Props = {
  projects: Project[];
};

const ProjectsTable = ({ projects }: Props) => {
  const [items, setItems] = useState(projects);
  const [openMenu, setOpenMenu] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [deleteError, setDeleteError] = useState("");

  const actionRefs = useRef<Record<number, HTMLTableCellElement | null>>({});

  const router = useRouter();
  const { start } = useProgress();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (openMenu === null) return;

      const actionCell = actionRefs.current[openMenu];

      if (actionCell && !actionCell.contains(event.target as Node)) {
        setOpenMenu(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [openMenu]);

  async function handleDelete(project: Project) {
    const confirmed = window.confirm(`Delete "${project.title}"`);
    if (!confirmed) return;
    setDeleteError("");
    setDeletingId(project.id);
    try {
      const result = await deleteProjects(project.id);

      if (!result.success) {
        setDeleteError(result.error);
      }

      if (result.success) {
        setItems((currentItems) =>
          currentItems.filter((item) => item.id !== project.id),
        );

        router.refresh();
      }
    } catch (error) {
      console.error(error);
      setDeleteError("Failed to delete project.");
    } finally {
      setDeletingId(null);
      setOpenMenu(null);
    }
  }

  async function handleDragEnd(event: DragEndEvent) {
    if (event.canceled) return;

    const { source } = event.operation;

    if (!isSortable(source)) return;

    const { initialIndex, index } = source;

    if (initialIndex === index) return;

    const newItems = [...items];

    const [movedItem] = newItems.splice(initialIndex, 1);

    newItems.splice(index, 0, movedItem);

    console.log("Moved:", movedItem);
    console.log("Old position:", initialIndex);
    console.log("New position:", index);
    console.log("New order:", newItems);

    // Update UI
    setItems(newItems);

    // Create payload from NEW order
    const sortedData = newItems.map((item, i) => ({
      id: item.id,
      sortOrder: i,
    }));

    try {
      const sortResult = await sortProjects(sortedData);

      console.log("ProjectsTable:sortResult", sortResult);
    } catch (err) {
      console.error("ProjectsTable:sortErr", err);
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-white">Projects</h1>

          <p className="mt-1 text-sm text-slate-400">Manage your projects.</p>
        </div>

        <button
          className="relative cursor-pointer inline-flex items-center gap-2 overflow-hidden rounded-xl bg-linear-to-r from-brand-500 to-brand-600 px-5 py-3 text-sm font-semibold text-white shadow-glow transition-transform hover:scale-[1.03] active:scale-95 disabled:cursor-not-allowed disabled:opacity-80"
          onClick={() => {
            router.push("/admin/projects/new");
            start();
          }}
        >
          <Plus className="h-4 w-4" />
          Add Project
        </button>
      </div>

      {/* Error */}
      {deleteError && (
        <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {deleteError}
        </div>
      )}

      {/* Table */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/70 px-0 py-5">
        <div>
          <Table className="w-full min-w-236 text-left">
            <TableHeader>
              <TableRow className="border-b border-slate-600 hover:bg-slate-900/70">
                <TableHead className="w-12 px-4 py-3" />

                <TableHead className="text-center font-semibold text-slate-400">
                  Title
                </TableHead>

                <TableHead className="text-center font-semibold text-slate-400">
                  Stack
                </TableHead>

                <TableHead className="text-center font-semibold text-slate-400">
                  Action
                </TableHead>
              </TableRow>
            </TableHeader>
            <DragDropProvider onDragEnd={handleDragEnd}>
              <TableBody>
                {items.length === 0 ? (
                  <TableRow className="border-b border-slate-700 even:bg-slate-800/30 hover:bg-slate-800 has-aria-expanded:bg-slate-800">
                    <TableCell colSpan={6} className="px-6 py-16 text-center">
                      <p className="text-sm text-slate-400">
                        No project entries yet.
                      </p>

                      <Link
                        href="/admin/projects/new"
                        className="mt-3 inline-block text-sm text-white hover:underline"
                      >
                        Add your first project
                      </Link>
                    </TableCell>
                  </TableRow>
                ) : (
                  items.map((project, i) => (
                    <SortableTableRow
                      key={project.id}
                      project={project}
                      index={i}
                      openMenu={openMenu}
                      deletingId={deletingId}
                      setOpenMenu={setOpenMenu}
                      handleDelete={handleDelete}
                    />
                  ))
                )}
              </TableBody>
            </DragDropProvider>
          </Table>
        </div>
      </div>
    </div>
  );
};

export default ProjectsTable;

function SortableTableRow({
  project,
  index,
  openMenu,
  deletingId,
  setOpenMenu,
  handleDelete,
}: {
  project: Project;
  index: number;
  openMenu: number | null;
  deletingId: number | null;
  setOpenMenu: (val: number | null) => void;
  handleDelete: (project: Project) => void;
}) {
  const { ref, handleRef } = useSortable({
    id: project.id,
    index,
  });
  const actionRef = useRef<HTMLTableCellElement>(null);

  return (
    <TableRow
      ref={ref}
      key={project.id}
      className="border-b border-slate-700 even:bg-slate-800/30 hover:bg-slate-800 has-aria-expanded:bg-slate-800"
    >
      {/* Future drag handle */}
      <TableCell className="py-4">
        <button
          ref={handleRef}
          type="button"
          disabled
          title="Drag to reorder"
          className="cursor-grab text-slate-700"
        >
          <GripVertical className="h-4 w-4" />
        </button>
      </TableCell>

      <TableCell className="text-center whitespace-break-spaces py-4">
        <span className="font-medium text-slate-200">{project.title}</span>
      </TableCell>

      {/* Stack */}
      <TableCell className="py-4 whitespace-break-spaces">
        <div className="flex justify-center max-full text-center flex-wrap gap-1.5">
          {project.technologies.slice(0, 4).map((tech) => (
            <span
              key={tech.id}
              className="rounded-md border border-slate-700 bg-slate-900 px-2 py-1 text-xs text-slate-300"
            >
              {tech.name}
            </span>
          ))}

          {project.technologies.length > 4 && (
            <span className="rounded-md px-2 py-1 text-xs text-slate-500">
              +{project.technologies.length - 4}
            </span>
          )}
        </div>
      </TableCell>

      {/* Actions */}
      <TableCell ref={actionRef} className="relative py-4">
        <button
          type="button"
          disabled={deletingId === project.id}
          onClick={() =>
            setOpenMenu(openMenu === project.id ? null : project.id)
          }
          className="rounded-md cursor-pointer p-1.5 text-slate-400 transition hover:bg-slate-800 hover:text-white disabled:opacity-50"
        >
          <MoreHorizontal className="h-5 w-5" />
        </button>

        {openMenu === project.id && (
          <div className="absolute right-4 top-12 z-30 w-36 rounded-lg border border-slate-700 bg-slate-900 p-1 shadow-xl">
            <Link
              href={`/admin/projects/${project.id}/edit`}
              className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-slate-300 transition hover:bg-slate-800 hover:text-white"
            >
              <Pencil className="h-4 w-4" />
              Edit
            </Link>

            <button
              type="button"
              disabled={deletingId === project.id}
              onClick={() => handleDelete(project)}
              className="flex cursor-pointer w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-red-400 transition hover:bg-slate-800 disabled:opacity-50"
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </button>
          </div>
        )}
      </TableCell>
    </TableRow>
  );
}
