/**
 * Notification service implementation
 * Provides methods to show different types of notifications
 */

import { useNotificationStore } from "./notification.store";
import { useNotificationPanelStore } from "@/infra/theme/components/notifications/panel/notification-panel.store";
import type {
    INotificationService,
    NotificationOptions,
    NotificationType,
    Notification,
} from "./notification.types";

class NotificationService implements INotificationService {
    private readonly DEFAULT_DURATION = 15000; // 15 seconds

    /**
     * Generate a unique ID for a notification
     */
    private generateId(): string {
        return `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Internal method to show a notification
     */
    private show(
        type: NotificationType,
        title: string,
        message?: string,
        options?: NotificationOptions,
    ): string {
        const id = options?.id || this.generateId();
        const duration = options?.duration ?? this.DEFAULT_DURATION;
        const autoClose = options?.autoClose ?? true;

        const notification: Notification = {
            id,
            type,
            title,
            message,
            duration,
            autoClose,
            loading: options?.loading,
            icon: options?.icon,
            color: options?.color,
            withCloseButton: options?.withCloseButton ?? true,
        };

        // Add notification to store
        useNotificationStore.getState().addNotification(notification);

        if (type !== "loading") {
            useNotificationPanelStore.getState().addEntry({
                id,
                type,
                title,
                message,
                at: Date.now(),
            });
        }

        // Auto-remove toast from overlay list after duration if autoClose is true
        // (panel history keeps the entry until the user dismisses it there)
        if (autoClose && duration > 0) {
            setTimeout(() => {
                useNotificationStore.getState().removeNotification(id);
            }, duration);
        }

        return id;
    }

    showSuccess(
        title: string,
        message?: string,
        options?: NotificationOptions,
    ): string {
        return this.show("success", title, message, options);
    }

    showError(
        title: string,
        message?: string,
        options?: NotificationOptions,
    ): string {
        return this.show("error", title, message, options);
    }

    showWarning(
        title: string,
        message?: string,
        options?: NotificationOptions,
    ): string {
        return this.show("warning", title, message, options);
    }

    showLoading(
        title: string,
        message?: string,
        options?: NotificationOptions,
    ): string {
        return this.show("loading", title, message, {
            ...options,
            loading: true,
            autoClose: false, // Loading notifications should not auto-close by default
        });
    }

    showInfo(
        title: string,
        message?: string,
        options?: NotificationOptions,
    ): string {
        return this.show("info", title, message, options);
    }

    remove(id: string): void {
        useNotificationStore.getState().removeNotification(id);
        useNotificationPanelStore.getState().removeEntry(id);
    }

    clear(): void {
        useNotificationStore.getState().clearNotifications();
        useNotificationPanelStore.getState().clearEntries();
    }
}

/**
 * Singleton notification service instance
 */
export const notificationService = new NotificationService();
