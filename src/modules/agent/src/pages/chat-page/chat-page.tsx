import { useState } from "react";
import { Divider, Title } from "@mantine/core";
import { translatedResources } from "@/infra/i18n";
import { MessageList, ChatInput, ConstraintProposalCard } from "./components";
import { initialMockMessages, mockAgentReplies, mockProposal } from "@/modules/agent/.mock";
import resourcesJson from "./chat-page.resources.json";
import styles from "./chat-page.module.css";

const resources = translatedResources(
    "src/modules/agent/src/pages/chat-page/chat-page.resources.json",
    resourcesJson,
);

export function ChatPage() {
    const [messages, setMessages] = useState(initialMockMessages);
    const [isSending, setIsSending] = useState(false);
    const [proposal, setProposal] = useState(mockProposal);
    const [isApproving, setIsApproving] = useState(false);

    const handleSend = (content: string) => {
        const userMessage = {
            role: "user" as const,
            content,
            timestamp: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, userMessage]);
        setIsSending(true);
        setProposal(null!);

        setTimeout(() => {
            const reply = mockAgentReplies[Math.floor(Math.random() * mockAgentReplies.length)];
            const agentMessage = {
                role: "agent" as const,
                content: reply,
                timestamp: new Date().toISOString(),
            };
            setMessages((prev) => [...prev, agentMessage]);
            setIsSending(false);
        }, 3000);
    };

    const handleApprove = () => {
        setIsApproving(true);
        setTimeout(() => {
            setProposal(null!);
            setIsApproving(false);
            const agentMessage = {
                role: "agent" as const,
                content: "Your constraints and preferences have been saved. You're all set!",
                timestamp: new Date().toISOString(),
            };
            setMessages((prev) => [...prev, agentMessage]);
            $app.notifications.showSuccess("Constraints Saved", "Your constraints and preferences have been committed successfully.");
        }, 1500);
    };

    const handleRevise = () => {
        setProposal(null!);
        const agentMessage = {
            role: "agent" as const,
            content: "No problem! What would you like to change?",
            timestamp: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, agentMessage]);
    };

    return (
        <div className={styles.chatPageContainer}>
            <div className={styles.header}>
                <Title order={2}>{resources.title}</Title>
                <Divider mt="xs" />
            </div>

            <div className={styles.messageArea}>
                <MessageList
                    messages={messages}
                    emptyStateMessage={resources.emptyStateMessage}
                    isTyping={isSending}
                >
                    {proposal && (
                        <ConstraintProposalCard
                            hardConstraints={proposal.hardConstraints}
                            softPreferences={proposal.softPreferences}
                            onApprove={handleApprove}
                            onRevise={handleRevise}
                            loading={isApproving}
                            labels={{
                                title: resources.proposalTitle,
                                hardConstraints: resources.hardConstraintsLabel,
                                softPreferences: resources.softPreferencesLabel,
                                approve: resources.approveButton,
                                makeChanges: resources.makeChangesButton,
                            }}
                        />
                    )}
                </MessageList>
            </div>

            <div className={styles.inputArea}>
                <ChatInput
                    onSend={handleSend}
                    disabled={isSending || !!proposal}
                    placeholder={resources.inputPlaceholder}
                />
            </div>
        </div>
    );
}
