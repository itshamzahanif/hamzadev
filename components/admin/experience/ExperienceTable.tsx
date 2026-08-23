"use client";

import { useEffect, useRef, useState } from "react";
import { DragDropProvider, DragEndEvent } from "@dnd-kit/react";
import { isSortable, useSortable } from "@dnd-kit/react/sortable";
import Link from "next/link";
import {
  GripVertical,
  MoreHorizontal,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useProgress } from "@bprogress/next";
import { deleteExperience, sortExperience } from "@/actions/experience";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type Experience = {
  id: number;
  jobTitle: string;
  employer: string;
  location: string;
  startDate: number;
  endDate: number | null;
  isContinued: boolean;
  stack: {
    skill: {
      id: number;
      name: string;
    };
  }[];
};

type Props = {
  experiences: Experience[];
};

export default function ExperienceTable({ experiences }: Props) {
  const [items, setItems] = useState(experiences);
  const [openMenu, setOpenMenu] = useState<number | null>(null);

  const [deletingId, setDeletingId] = useState<number | null>(null);

  const [deleteError, setDeleteError] = useState("");

  const actionRefs = useRef<Record<number, HTMLTableCellElement | null>>({});

  const router = useRouter();
  const { start } = useProgress();

  // 2. Callback for when sorting finishes
  // const handleSortEnd = (event: {
  //   active: { id: string | number };
  //   over?: { id: string | number } | null;
  // }) => {
  //   const { active, over } = event;

  //   if (over && active.id !== over.id) {
  //     setExperiences((prev) => {
  //       const oldIndex = prev.findIndex((item) => item.id === active.id);
  //       const newIndex = prev.findIndex((item) => item.id === over.id);

  //       const reorderedData = arrayMove(prev, oldIndex, newIndex);

  //       // HERE IS YOUR UPDATED SORTED ARRAY DATA
  //       console.log("Updated Sorted Experiences:", reorderedData);

  //       // Optional: Call a Server Action or API here to persist order to Database
  //       // saveNewOrderAction(reorderedData.map(item => item.id));

  //       return reorderedData;
  //     });
  //   }
  // };

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

  async function handleDelete(experience: Experience) {
    const confirmed = window.confirm(
      `Delete "${experience.jobTitle}" at ${experience.employer}?\n\nThis will also delete its responsibilities and selected stack.`,
    );
    if (!confirmed) return;
    setDeleteError("");
    setDeletingId(experience.id);
    try {
      const result = await deleteExperience(experience.id);

      if (!result.success) {
        setDeleteError(result.error);
      }

      if (result.success) {
        setItems((currentItems) =>
          currentItems.filter((item) => item.id !== experience.id),
        );

        router.refresh();
      }
    } catch (error) {
      console.error(error);
      setDeleteError("Failed to delete experience.");
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
      const sortResult = await sortExperience(sortedData);

      console.log("ExperienceTable:sortResult", sortResult);
    } catch (err) {
      console.error("ExperienceTable:sortErr", err);
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-white">Experience</h1>

          <p className="mt-1 text-sm text-slate-400">
            Manage your professional experience and career history.
          </p>
        </div>

        <button
          className="relative cursor-pointer inline-flex items-center gap-2 overflow-hidden rounded-xl bg-linear-to-r from-brand-500 to-brand-600 px-5 py-3 text-sm font-semibold text-white shadow-glow transition-transform hover:scale-[1.03] active:scale-95 disabled:cursor-not-allowed disabled:opacity-80"
          onClick={() => {
            router.push("/admin/experience/new");
            start();
          }}
        >
          <Plus className="h-4 w-4" />
          Add Experience
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
                  Position
                </TableHead>

                <TableHead className="text-center font-semibold text-slate-400">
                  Employer
                </TableHead>

                <TableHead className="text-center font-semibold text-slate-400">
                  Location
                </TableHead>

                <TableHead className="text-center font-semibold text-slate-400">
                  Period
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
                    <TableCell colSpan={7} className="px-6 py-16 text-center">
                      <p className="text-sm text-slate-400">
                        No experience entries yet.
                      </p>

                      <Link
                        href="/admin/experience/new"
                        className="mt-3 inline-block text-sm text-white hover:underline"
                      >
                        Add your first experience
                      </Link>
                    </TableCell>
                  </TableRow>
                ) : (
                  items.map((experience, i) => (
                    // <TableRow
                    //   key={experience.id}
                    //   className="border-b border-slate-700 even:bg-slate-800/30 hover:bg-slate-800 has-aria-expanded:bg-slate-800"
                    // >
                    //   {/* Future drag handle */}
                    //   <TableCell className="py-4">
                    //     <button
                    //       type="button"
                    //       disabled
                    //       title="Drag to reorder"
                    //       className="cursor-grab text-slate-700"
                    //     >
                    //       <GripVertical className="h-4 w-4" />
                    //     </button>
                    //   </TableCell>

                    //   {/* Position */}
                    //   <TableCell className="text-center whitespace-break-spaces py-4">
                    //     <span className="font-medium text-slate-200">
                    //       {experience.jobTitle}
                    //     </span>
                    //   </TableCell>

                    //   {/* Employer */}
                    //   <TableCell className="py-4 whitespace-break-spaces text-center text-sm text-slate-300">
                    //     {experience.employer}
                    //   </TableCell>

                    //   {/* Location */}
                    //   <TableCell className="py-4 text-center text-sm text-slate-400">
                    //     {experience.location}
                    //   </TableCell>

                    //   {/* Period */}
                    //   <TableCell className="whitespace-nowrap py-4 text-center text-sm text-slate-400">
                    //     {experience.startDate}
                    //     {" – "}
                    //     {experience.isContinued
                    //       ? "Present"
                    //       : (experience.endDate ?? "—")}
                    //   </TableCell>

                    //   {/* Stack */}
                    //   <TableCell className="py-4 whitespace-break-spaces">
                    //     <div className="flex justify-center max-w-70 text-center flex-wrap gap-1.5">
                    //       {experience.stack.slice(0, 4).map(({ skill }) => (
                    //         <span
                    //           key={skill.id}
                    //           className="rounded-md border border-slate-700 bg-slate-900 px-2 py-1 text-xs text-slate-300"
                    //         >
                    //           {skill.name}
                    //         </span>
                    //       ))}

                    //       {experience.stack.length > 4 && (
                    //         <span className="rounded-md px-2 py-1 text-xs text-slate-500">
                    //           +{experience.stack.length - 4}
                    //         </span>
                    //       )}
                    //     </div>
                    //   </TableCell>

                    //   {/* Actions */}
                    //   <TableCell
                    //     ref={(element) => {
                    //       actionRefs.current[experience.id] = element;
                    //     }}
                    //     className="relative py-4"
                    //   >
                    //     <button
                    //       type="button"
                    //       disabled={deletingId === experience.id}
                    //       onClick={() =>
                    //         setOpenMenu(
                    //           openMenu === experience.id ? null : experience.id,
                    //         )
                    //       }
                    //       className="rounded-md cursor-pointer p-1.5 text-slate-400 transition hover:bg-slate-800 hover:text-white disabled:opacity-50"
                    //     >
                    //       <MoreHorizontal className="h-5 w-5" />
                    //     </button>

                    //     {openMenu === experience.id && (
                    //       <div className="absolute right-4 top-12 z-30 w-36 rounded-lg border border-slate-700 bg-slate-900 p-1 shadow-xl">
                    //         <Link
                    //           href={`/admin/experience/${experience.id}/edit`}
                    //           className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-slate-300 transition hover:bg-slate-800 hover:text-white"
                    //         >
                    //           <Pencil className="h-4 w-4" />
                    //           Edit
                    //         </Link>

                    //         <button
                    //           type="button"
                    //           disabled={deletingId === experience.id}
                    //           onClick={() => handleDelete(experience)}
                    //           className="flex cursor-pointer w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-red-400 transition hover:bg-slate-800 disabled:opacity-50"
                    //         >
                    //           <Trash2 className="h-4 w-4" />
                    //           Delete
                    //         </button>
                    //       </div>
                    //     )}
                    //   </TableCell>
                    // </TableRow>
                    <SortableTableRow
                      key={experience.id}
                      experience={experience}
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
}

function SortableTableRow({
  experience,
  index,
  openMenu,
  deletingId,
  setOpenMenu,
  handleDelete,
}: {
  experience: Experience;
  index: number;
  openMenu: number | null;
  deletingId: number | null;
  setOpenMenu: (val: number | null) => void;
  handleDelete: (experience: Experience) => void;
}) {
  const { ref, handleRef } = useSortable({
    id: experience.id,
    index,
  });
  const actionRef = useRef<HTMLTableCellElement>(null);

  return (
    <TableRow
      ref={ref}
      key={experience.id}
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

      {/* Position */}
      <TableCell className="text-center whitespace-break-spaces py-4">
        <span className="font-medium text-slate-200">
          {experience.jobTitle}
        </span>
      </TableCell>

      {/* Employer */}
      <TableCell className="py-4 whitespace-break-spaces text-center text-sm text-slate-300">
        {experience.employer}
      </TableCell>

      {/* Location */}
      <TableCell className="py-4 text-center text-sm text-slate-400">
        {experience.location}
      </TableCell>

      {/* Period */}
      <TableCell className="whitespace-nowrap py-4 text-center text-sm text-slate-400">
        {experience.startDate}
        {" – "}
        {experience.isContinued ? "Present" : (experience.endDate ?? "—")}
      </TableCell>

      {/* Stack */}
      <TableCell className="py-4 whitespace-break-spaces">
        <div className="flex justify-center max-w-70 text-center flex-wrap gap-1.5">
          {experience.stack.slice(0, 4).map(({ skill }) => (
            <span
              key={skill.id}
              className="rounded-md border border-slate-700 bg-slate-900 px-2 py-1 text-xs text-slate-300"
            >
              {skill.name}
            </span>
          ))}

          {experience.stack.length > 4 && (
            <span className="rounded-md px-2 py-1 text-xs text-slate-500">
              +{experience.stack.length - 4}
            </span>
          )}
        </div>
      </TableCell>

      {/* Actions */}
      <TableCell ref={actionRef} className="relative py-4">
        <button
          type="button"
          disabled={deletingId === experience.id}
          onClick={() =>
            setOpenMenu(openMenu === experience.id ? null : experience.id)
          }
          className="rounded-md cursor-pointer p-1.5 text-slate-400 transition hover:bg-slate-800 hover:text-white disabled:opacity-50"
        >
          <MoreHorizontal className="h-5 w-5" />
        </button>

        {openMenu === experience.id && (
          <div className="absolute right-4 top-12 z-30 w-36 rounded-lg border border-slate-700 bg-slate-900 p-1 shadow-xl">
            <Link
              href={`/admin/experience/${experience.id}/edit`}
              className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-slate-300 transition hover:bg-slate-800 hover:text-white"
            >
              <Pencil className="h-4 w-4" />
              Edit
            </Link>

            <button
              type="button"
              disabled={deletingId === experience.id}
              onClick={() => handleDelete(experience)}
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
