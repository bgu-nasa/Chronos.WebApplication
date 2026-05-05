import { useState, type KeyboardEvent } from "react";
import { Textarea, ActionIcon, Group } from "@mantine/core";
import { HiOutlinePaperAirplane } from "react-icons/hi";

interface ChatInputProps {
    readonly onSend: (content: string) => void;
    readonly disabled?: boolean;
    readonly placeholder: string;
}

export function ChatInput({ onSend, disabled = false, placeholder }: ChatInputProps) {
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
        </Group>
    );
}
