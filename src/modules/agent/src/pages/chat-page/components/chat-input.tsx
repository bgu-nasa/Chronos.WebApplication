import { useState, type KeyboardEvent } from "react";
import { Textarea, ActionIcon, Button, Group } from "@mantine/core";
import { HiOutlinePaperAirplane } from "react-icons/hi";

interface ChatInputProps {
    readonly onSend: (content: string) => void;
    readonly onRequestSubmit: () => void;
    readonly disabled?: boolean;
    readonly submitEnabled?: boolean;
    readonly submitLoading?: boolean;
    readonly placeholder: string;
    readonly submitLabel: string;
}

export function ChatInput({
    onSend,
    onRequestSubmit,
    disabled = false,
    submitEnabled = false,
    submitLoading = false,
    placeholder,
    submitLabel,
}: ChatInputProps) {
    const [value, setValue] = useState("");

    const handleSend = () => {
        const trimmed = value.trim();
        if (!trimmed) return;
        onSend(trimmed);
        setValue("");
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <Group gap="xs" align="flex-end">
            <Textarea
                style={{ flex: 1 }}
                placeholder={placeholder}
                value={value}
                onChange={(e) => setValue(e.currentTarget.value)}
                onKeyDown={handleKeyDown}
                disabled={disabled}
                autosize
                minRows={1}
                maxRows={4}
            />
            <ActionIcon
                size="lg"
                variant="filled"
                onClick={handleSend}
                disabled={disabled || !value.trim()}
            >
                <HiOutlinePaperAirplane size={18} />
            </ActionIcon>
            <Button
                variant="light"
                onClick={onRequestSubmit}
                disabled={!submitEnabled}
                loading={submitLoading}
            >
                {submitLabel}
            </Button>
        </Group>
    );
}
