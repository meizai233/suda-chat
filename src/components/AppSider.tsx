"use client";

import { Inbox, Plus, Sun, Moon, Settings } from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

import { useChatStore } from "@/app/providers/chat-store-provider";
import { useCallback, useState, useEffect } from "react";
import { useInitUserAndSessions } from "@/hooks/useInitUserAndSessions";
import { useConfirm } from "./chat-ui/confirm-dialog-provider";
import { RenameForm } from "@/components/rename-form";
import { useDialog } from "./chat-ui/dialog-provider";
import { SidebarButton } from "./chat-ui/siderbar-button";
import { IconButton } from "./ui/icon-buttom";
import { useTheme } from "next-themes";
import { SettingsSheet } from "@/components/settings-sheet";

export default function AppSider() {
  useInitUserAndSessions();
  const sessions = useChatStore((s) => s.sessions);
  const currentSessionId = useChatStore((s) => s.currentSessionId);
  const createSession = useChatStore((s) => s.createSession);
  const deleteSession = useChatStore((s) => s.deleteSession);
  const renameSession = useChatStore((s) => s.renameSession);
  const setCurrentSessionId = useChatStore((s) => s.setCurrentSessionId);
  const confirm = useConfirm();
  const showDialog = useDialog();

  const { setTheme, resolvedTheme } = useTheme();

  const [mounted, setMounted] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    if (!mounted) return;
    setTheme(resolvedTheme === "light" ? "dark" : "light");
  };

  const handleDelete = useCallback(
    async (id: string) => {
      const confirmed = await confirm({
        title: "确认删除",
        description: "确定要删除该会话吗？",
        confirmText: "删除",
        cancelText: "取消",
      });
      if (confirmed) {
        deleteSession(id);
      }
    },
    [confirm, deleteSession],
  );

  const handleRename = useCallback(
    async (id: string, oldTitle: string) => {
      const result = await showDialog({
        title: "重命名会话",
        component: RenameForm,
        props: {
          initialValue: oldTitle,
          onClose: () => {},
        },
      });

      if (result?.newTitle) {
        renameSession(id, result.newTitle);
      }
    },
    [showDialog, renameSession],
  );

  return (
    <>
      <Sidebar>
        <SidebarContent className="flex h-full flex-col">
          <SidebarGroup className="flex flex-1 flex-col">
            <SidebarGroupLabel className="flex items-center justify-between pr-2">
              <span className="text-base font-semibold">Suda-chat</span>
              <div className="flex items-center gap-2">
                <IconButton
                  icon={mounted && resolvedTheme === "light" ? Moon : Sun}
                  variant="ghost"
                  size="md"
                  strokeWidth={2.2}
                  onClick={toggleTheme}
                  aria-label="切换主题"
                />
                <IconButton
                  icon={Plus}
                  variant="primary"
                  size="md"
                  strokeWidth={2.2}
                  onClick={createSession}
                  aria-label="新建会话"
                />
              </div>
            </SidebarGroupLabel>

            <SidebarGroupContent className="flex flex-1 flex-col">
              <SidebarMenu className="flex-1">
                {sessions.map((item) => (
                  <SidebarMenuItem key={item.id}>
                    <SidebarButton
                      key={item.id}
                      icon={Inbox}
                      label={item.title}
                      active={item.id === currentSessionId}
                      onClick={() => setCurrentSessionId(item.id)}
                      onRename={() => handleRename(item.id, item.title)}
                      onDelete={() => handleDelete(item.id)}
                    />
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          <div className="border-border/50 flex flex-col gap-2 border-t pt-4 pb-4">
            <SidebarButton
              icon={Settings}
              label="设置"
              onClick={() => setIsSettingsOpen(true)}
              justify="center"
              hideActions={true}
            />
          </div>
        </SidebarContent>
      </Sidebar>

      <SettingsSheet open={isSettingsOpen} onOpenChange={setIsSettingsOpen} />
    </>
  );
}
