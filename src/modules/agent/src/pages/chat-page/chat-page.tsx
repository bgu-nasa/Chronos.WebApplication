import { Divider, Title } from "@mantine/core";
import { translatedResources } from "@/infra/i18n";
import { useAgent } from "@/modules/agent/src/hooks";
import { MessageList, ChatInput, ConstraintProposalCard } from "./components";
import resourcesJson from "./chat-page.resources.json";
import styles from "./chat-page.module.css";

const resources = translatedResources(
    "src/modules/agent/src/pages/chat-page/chat-page.resources.json",
    resourcesJson,
);

export function ChatPage() {
    const {
        messages,
        draft,
        allowedActions,
        isSending,
        isLoading,
        sendMessage,
        approveProposal,
        requestRevision,
    } = useAgent();

    const canChat = allowedActions.includes("ContinueConversation");
    const inputDisabled = !canChat || isSending || isLoading;

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
                    {draft && (
                        <ConstraintProposalCard
                            hardConstraints={draft.hardConstraints}
                            softPreferences={draft.softPreferences}
                            onApprove={approveProposal}
                            onRevise={requestRevision}
                            loading={isLoading}
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
                    onSend={sendMessage}
                    disabled={inputDisabled}
                    placeholder={resources.inputPlaceholder}
                />
            </div>
        </div>
    );
}
