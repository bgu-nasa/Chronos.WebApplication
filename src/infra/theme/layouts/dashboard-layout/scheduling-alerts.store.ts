import { create } from "zustand";

export interface SchedulingAlertItem {
    id: string;
    message: string;
    success: boolean;
    at: number;
}

interface SchedulingAlertsState {
    items: SchedulingAlertItem[];
    add: (item: { message: string; success: boolean }) => void;
    remove: (id: string) => void;
    clear: () => void;
}

export const useSchedulingAlertsStore = create<SchedulingAlertsState>((set) => ({
    items: [],
    add: (item) =>
        set((s) => ({
            items: [
                {
                    id: crypto.randomUUID(),
                    message: item.message,
                    success: item.success,
                    at: Date.now(),
                },
                ...s.items,
            ].slice(0, 50),
        })),
    remove: (id) =>
        set((s) => ({ items: s.items.filter((i) => i.id !== id) })),
    clear: () => set({ items: [] }),
}));
