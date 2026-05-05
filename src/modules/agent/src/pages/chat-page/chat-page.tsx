import { useState } from "react";
import { useNavigate } from "react-router";
import { ActionIcon, Button, Divider, Group, Title } from "@mantine/core";
import { HiOutlineArrowLeft } from "react-icons/hi";
import { translatedResources } from "@/infra/i18n";
import { ConfirmationDialog } from "@/common";
import { useAgent } from "@/modules/agent/src/hooks";
import { MessageList, ChatInput, ConstraintProposalCard } from "./components";
import resourcesJson from "./chat-page.resources.json";
import styles from "./chat-page.module.css";

const resources = translatedResources(
    "src/modules/agent/src/pages/chat-page/chat-page.resources.json",
    resourcesJson,
);

export function ChatPage() {
    const navigate = useNavigate();
    const [exitModalOpen, setExitModalOpen] = useState(false);

    const {
        messages,
        draft,
        allowedActions,
        state,
        isSending,
        isLoading,
        sendMessage,
        requestSubmit,
        approveProposal,
        requestRevision,
        resetSession,
    } = useAgent();

    const canChat = allowedActions.includes("ContinueConversation");
    const canSubmit = allowedActions.includes("Submit");
    const inputDisabled = !canChat || isSending || isLoading;

    const handleBackClick = () => {
        if (state === "Approved") {
            handleLeave();
        } else {
            setExitModalOpen(true);
        }
    };

    const handleLeave = () => {
        resetSession();
        navigate("/schedule/constraints");
    };

    return (
        <div className={styles.chatPageContainer}>
            <div className={styles.header}>
                <Group gap="sm" align="center">
                    <ActionIcon variant="subtle" onClick={handleBackClick}>
                        <HiOutlineArrowLeft size={18} />
                    </ActionIcon>
                    <Title order={2}>{resources.title}</Title>
                </Group>
                <Divider mt="xs" />
            </div>

            <ConfirmationDialog
                opened={exitModalOpen}
                onClose={() => setExitModalOpen(false)}
                onConfirm={handleLeave}
                title={resources.exitModalTitle}
                message={resources.exitModalBody}
                confirmText={resources.exitLeaveButton}
                cancelText={resources.exitStayButton}
                confirmColor="red"
            />

            {state === "Approved" && (
                <Group justify="center" py="sm">
                    <Button variant="light" onClick={handleLeave}>
                        {resources.backToConstraintsButton}
                    </Button>
                </Group>
            )}

            <div className={styles.messageArea}>
                <MessageList
                    messages={messages}
                    emptyStateMessage={resources.emptyStateMessage}
                    isTyping={isSending}
                >
                    {draft && state === "Submit" && (
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
                    onRequestSubmit={requestSubmit}
                    disabled={inputDisabled}
                    submitEnabled={canSubmit && !isSending && !isLoading}
                    submitLoading={isLoading}
                    placeholder={resources.inputPlaceholder}
                    submitLabel={resources.generateProposalButton}
                />
            </div>
        </div>
    );
}
