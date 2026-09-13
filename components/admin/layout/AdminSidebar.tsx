"use client";

import { getUnreadMessages } from "@/actions/messages";
import { sidebarAccountMenu, sidebarOverviewMenu } from "@/data/portfolio";
import { useProgress } from "@bprogress/next";
import {
  LayoutDashboard,
  FolderKanban,
  BriefcaseBusiness,
  MessageSquare,
  UserRound,
  Settings,
  LogOut,
  Menu,
  Code2,
} from "lucide-react";
import { signOut } from "next-auth/react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const sidebarIcons = {
  dashboard: LayoutDashboard,
  project: FolderKanban,
  experience: BriefcaseBusiness,
  skill: Code2,
  profile: UserRound,
  setting: Settings,
};

export default function AdminSidebar({
  isSidebarOpen,
  onMenuClick,
}: {
  isSidebarOpen: boolean;
  onMenuClick: () => void;
}) {
  const [unreadMessages, setUnreadMessages] = useState<number>();
  const pathname = usePathname();
  const { start } = useProgress();
  const router = useRouter();

  useEffect(() => {
    const fetchUnreadMsgs = async () => {
      const result = await getUnreadMessages();

      if (result.success) {
        setUnreadMessages(result.unreadMessagesCount ?? 0);
      }
    };

    fetchUnreadMsgs();
    window.addEventListener("message-read", fetchUnreadMsgs);

    return () => {
      window.removeEventListener("message-read", fetchUnreadMsgs);
    };
  }, []);

  const navigate = (href: string) => {
    start();
    router.push(href);
  };

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-50
    w-70 max-w-[85vw]
    bg-slate-950 border-r border-slate-800
    transform transition-transform duration-300 ease-in-out
    ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
    lg:sticky lg:top-0 lg:h-screen lg:w-64 lg:max-w-none lg:translate-x-0`}
    >
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="flex h-20 items-center border-b border-slate-800 px-6">
          <div className="flex items-center justify-between gap-3 w-full">
            <span className="hidden sm:inline">
              <span className="text-slate-300 dark:text-ink-300">{"<"}</span>
              <span className="text-slate-100">Hamza</span>
              <span className="text-brand-500">.dev</span>
              <span className="text-slate-300 dark:text-ink-300">{" />"}</span>
            </span>

            <div>
              <p className="text-sm font-semibold text-white">Portfolio</p>

              <p className="text-xs text-slate-500">Admin Panel</p>
            </div>

            <button
              type="button"
              className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-900 hover:text-white lg:hidden"
              onClick={() => onMenuClick()}
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 px-3 py-6 lg:max-h-[400px] lg:overflow-y-auto">
          <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
            Overview
          </p>

          {sidebarOverviewMenu.map((menu, i) => {
            const Icon = sidebarIcons[menu.icon];
            const isActive =
              menu.href === "/admin"
                ? pathname === "/admin"
                : pathname.startsWith(menu.href);
            return (
              <span
                key={i}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium cursor-pointer transition ${
                  isActive
                    ? "bg-brand-500/10 text-brand-400"
                    : "text-slate-400 hover:text-white hover:bg-slate-900"
                }`}
                onClick={() => {
                  navigate(menu.href);
                  onMenuClick();
                }}
              >
                <Icon className="h-5 w-5" />
                {menu.title}
              </span>
            );
          })}

          <span
            className={`flex items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-sm font-medium cursor-pointer transition ${pathname.startsWith("/admin/messages") ? "bg-brand-500/10 text-brand-400" : "text-slate-400 hover:text-white hover:bg-slate-900"}`}
            onClick={() => {
              navigate("/admin/messages");
              onMenuClick();
            }}
          >
            <span className="flex items-center gap-3">
              <MessageSquare className="h-5 w-5" />
              Messages
            </span>

            {unreadMessages && unreadMessages > 0 && (
              <span className="rounded-full bg-brand-500/10 px-2 py-0.5 text-xs text-brand-400">
                {unreadMessages}
              </span>
            )}
          </span>

          <p className="mb-3 mt-8 px-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
            Account
          </p>

          {sidebarAccountMenu.map((menu, i) => {
            const Icon = sidebarIcons[menu.icon];
            return (
              <span
                key={i}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium cursor-pointer transition ${pathname.startsWith(menu.href) ? "bg-brand-500/10 text-brand-400" : "text-slate-400 hover:text-white hover:bg-slate-900"}`}
                onClick={() => {
                  navigate(menu.href);
                  onMenuClick();
                }}
              >
                <Icon className="h-5 w-5" />
                {menu.title}
              </span>
            );
          })}
        </nav>

        {/* Sign out */}
        <div className="border-t border-slate-800 p-3">
          <button
            type="button"
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-400 transition hover:bg-red-500/10 hover:text-red-400 cursor-pointer"
            onClick={() => {
              signOut();
              start();
            }}
          >
            <LogOut className="h-5 w-5" />
            Sign out
          </button>
        </div>
      </div>
    </aside>
  );
}
