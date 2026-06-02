import { create } from "zustand";
import type { NotificationType } from "@/infra/service/notification/notification.types";

export interface NotificationPanelEntry {
    id: string;
    title: string;
    message?: string;
    type: NotificationType;
    at: number;
}

interface NotificationPanelStore {
    entries: NotificationPanelEntry[];
    addEntry: (entry: NotificationPanelEntry) => void;
    removeEntry: (id: string) => void;
    clearEntries: () => void;
}

const maxEntries = 50;

export const useNotificationPanelStore = create<NotificationPanelStore>(
    (set) => ({
        entries: [],
        addEntry: (entry) =>
            set((s) => ({
                entries: [entry, ...s.entries].slice(0, maxEntries),
            })),
        removeEntry: (id) =>
            set((s) => ({
                entries: s.entries.filter((e) => e.id !== id),
            })),
        clearEntries: () => set({ entries: [] }),
    }),
);
