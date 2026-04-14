import { useEffect, useMemo, useState } from "react";
import {
    Badge,
    Button,
    Group,
    Paper,
    Select,
    Stack,
    Text,
    TextInput,
    Title,
} from "@mantine/core";
import { agentDataRepository } from "../../data";
import type { AgentDraftItemResponse, AgentTurnResponse } from "../../data";
import { schedulingPeriodDataRepository } from "@/modules/schedule/src/data";
import { useOrganization } from "@/infra/service";
import styles from "./agent-chat-page.module.css";

type UiMessage = {
    role: "user" | "assistant";
    content: string;
};

function DraftList({ title, items }: { title: string; items: AgentDraftItemResponse[] }) {
    return (
        <Paper withBorder p="md">
            <Text fw={600} mb="sm">{title}</Text>
            {items.length === 0 ? (
                <Text c="dimmed" size="sm">No items</Text>
            ) : (
                <Stack gap="xs">
                    {items.map((item, index) => (
                        <Text key={`${item.key}-${item.value}-${index}`} size="sm">
                            {item.key} = {item.value}
                        </Text>
                    ))}
                </Stack>
            )}
        </Paper>
    );
}

export function AgentChatPage() {
    const [sessionId, setSessionId] = useState<string>("");
    const [sessionSchedulingPeriodId, setSessionSchedulingPeriodId] = useState<string>("");
    const [schedulingPeriodId, setSchedulingPeriodId] = useState<string>("");
    const [schedulingPeriodOptions, setSchedulingPeriodOptions] = useState<Array<{ value: string; label: string }>>([]);
    const [input, setInput] = useState<string>("");
    const [turn, setTurn] = useState<AgentTurnResponse | null>(null);
    const [messages, setMessages] = useState<UiMessage[]>([]);
    const [loading, setLoading] = useState(false);
    const { organization } = useOrganization();

    const canApprove = useMemo(() => turn?.mode?.toLowerCase() === "submit", [turn]);

    useEffect(() => {
        const loadSchedulingPeriods = async () => {
            if (!organization) {
                return;
            }

            try {
                const periods = await schedulingPeriodDataRepository.getAllSchedulingPeriods();
                const options = periods.map((period) => ({
                    value: period.id,
                    label: period.name,
                }));

                setSchedulingPeriodOptions(options);
                if (options.length > 0) {
                    setSchedulingPeriodId((current) => current || options[0].value);
                }
            } catch (error: any) {
                $app.notifications.showError("Failed to load scheduling periods", error?.message ?? "Unexpected error");
            }
        };

        void loadSchedulingPeriods();
    }, [organization]);

    useEffect(() => {
        const startSession = async () => {
            if (!schedulingPeriodId || sessionSchedulingPeriodId === schedulingPeriodId) {
                return;
            }

            setLoading(true);
            try {
                const response = await agentDataRepository.startSession({
                    schedulingPeriodId,
                });

                setSessionId(response.sessionId);
                setSessionSchedulingPeriodId(schedulingPeriodId);
                setTurn(response);
                setMessages([{ role: "assistant", content: response.message }]);
            } catch (error: any) {
                $app.notifications.showError("Session initialization failed", error?.message ?? "Unexpected error");
            } finally {
                setLoading(false);
            }
        };

        void startSession();
    }, [schedulingPeriodId, sessionSchedulingPeriodId]);

    const pushAssistant = (content: string) => {
        setMessages((prev) => [...prev, { role: "assistant", content }]);
    };

    const handleMessage = async (isRevision: boolean) => {
        if (!sessionId) {
            $app.notifications.showWarning("Session not ready", "Please wait for the assistant session to initialize.");
            return;
        }

        if (!input.trim()) {
            if (isRevision) {
                pushAssistant("Please enter the change you would like to apply to the current draft.");
                $app.notifications.showWarning("Revision details required", "Enter a revision message before applying changes.");
            } else {
                $app.notifications.showWarning("Message required", "Enter a message before sending.");
            }

            return;
        }

        const userMessage = input.trim();
        setInput("");
        setMessages((prev) => [...prev, { role: "user", content: userMessage }]);

        setLoading(true);
        try {
            const payload = { sessionId, message: userMessage };
            const response = isRevision
                ? await agentDataRepository.revise(payload)
                : await agentDataRepository.sendMessage(payload);

            setTurn(response);
            pushAssistant(response.message);

            if (response.errors.length > 0) {
                $app.notifications.showWarning("Validation issues", response.errors.join(" | "));
            }
        } catch (error: any) {
            $app.notifications.showError("Message failed", error?.message ?? "Unexpected error");
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async () => {
        if (!sessionId) {
            return;
        }

        setLoading(true);
        try {
            const response = await agentDataRepository.approve({ sessionId });
            pushAssistant("Approved and submitted.");
            $app.notifications.showSuccess(
                "Submitted",
                `Created ${response.createdHardConstraints} hard constraints and ${response.createdSoftPreferences} soft preferences.`
            );

            const refreshed = await agentDataRepository.getSession(sessionId);
            setTurn(refreshed);
        } catch (error: any) {
            $app.notifications.showError("Approval failed", error?.message ?? "Unexpected error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Stack className={styles.container} gap="md">
            <Title order={2}>Scheduling Assistant</Title>
            <Text c="dimmed">Define your constraints and preferences. You will review the draft before it is submitted.</Text>

            <Group align="end">
                <Select
                    label="Scheduling Period"
                    placeholder="Select a scheduling period"
                    value={schedulingPeriodId}
                    onChange={(value) => setSchedulingPeriodId(value ?? "")}
                    data={schedulingPeriodOptions}
                    searchable
                    clearable={false}
                    style={{ flex: 1 }}
                />
            </Group>

            <Paper className={styles.messagePane}>
                {messages.map((message, index) => (
                    <div
                        key={`${message.role}-${index}`}
                        className={message.role === "user" ? styles.userMessage : styles.assistantMessage}
                    >
                        <Text size="sm" fw={600}>{message.role === "user" ? "You" : "Agent"}</Text>
                        <Text>{message.content}</Text>
                    </div>
                ))}
            </Paper>

            <Group align="end">
                <TextInput
                    label="Message"
                    placeholder="Example: I am unavailable on Fridays and prefer Monday morning shifts"
                    value={input}
                    onChange={(event) => setInput(event.currentTarget.value)}
                    style={{ flex: 1 }}
                />
                <Button disabled={!sessionId} loading={loading} onClick={() => handleMessage(false)}>
                    Send
                </Button>
                <Button
                    variant="default"
                    disabled={!sessionId}
                    loading={loading}
                    onClick={() => handleMessage(true)}
                >
                    Revise
                </Button>
                <Button color="green" disabled={!canApprove || loading} onClick={handleApprove}>
                    Approve
                </Button>
            </Group>

            {turn && (
                <>
                    <Group>
                        <Badge variant="light">State: {turn.state}</Badge>
                        <Badge variant="light">Mode: {turn.mode}</Badge>
                    </Group>

                    <div className={styles.draftColumns}>
                        <DraftList title="Hard Constraints" items={turn.hardConstraints} />
                        <DraftList title="Soft Preferences" items={turn.softPreferences} />
                    </div>
                </>
            )}
        </Stack>
    );
}
