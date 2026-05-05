import { useEffect, useRef, type ReactNode } from "react";
import { ScrollArea, Text } from "@mantine/core";
import { MessageBubble } from "./message-bubble";
import { TypingIndicator } from "./typing-indicator";

interface ChatMessage {
    role: "user" | "agent";
    content: string;
    timestamp: string;
}

interface MessageListProps {
    readonly messages: ChatMessage[];
    readonly emptyStateMessage: string;
    readonly isTyping?: boolean;
    readonly children?: ReactNode;
}

export function MessageList({ messages, emptyStateMessage, isTyping = false, children }: MessageListProps) {
    const bottomRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, isTyping, children]);

    if (messages.length === 0) {
        return (
            <ScrollArea h="100%">
                <Text c="dimmed" ta="center" pt="xl">
                    {emptyStateMessage}
                </Text>
            </ScrollArea>
        );
    }

    return (
        <ScrollArea h="100%">
            {messages.map((msg, index) => (
                <MessageBubble
                    key={index}
                    role={msg.role}
                    content={msg.content}
                    timestamp={msg.timestamp}
                />
            ))}
            {isTyping && <TypingIndicator />}
            {children}
            <div ref={bottomRef} />
        </ScrollArea>
    );
}
