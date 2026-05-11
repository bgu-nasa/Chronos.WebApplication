import { useState } from "react";
import { useNavigate } from "react-router";
import { Button } from "@mantine/core";
import { HiOutlineSparkles } from "react-icons/hi";
import { useAgent } from "@/modules/agent/src/hooks";
import { SchedulingPeriodModal } from "@/modules/agent/src/pages/chat-page/components";

interface AgentEntryButtonProps {
    readonly label: string;
    readonly modalLabels: {
        title: string;
        selectLabel: string;
        selectPlaceholder: string;
        confirm: string;
        cancel: string;
    };
}

export function AgentEntryButton({ label, modalLabels }: AgentEntryButtonProps) {
    const navigate = useNavigate();
    const [modalOpened, setModalOpened] = useState(false);
    const { createSession, isLoading } = useAgent();

    const handleConfirm = async (schedulingPeriodId: string) => {
        await createSession(schedulingPeriodId);
        setModalOpened(false);
        navigate("/agent/chat");
    };

    return (
        <>
            <Button
                variant="light"
                leftSection={<HiOutlineSparkles size={16} />}
                onClick={() => setModalOpened(true)}
            >
                {label}
            </Button>

            <SchedulingPeriodModal
                opened={modalOpened}
                onClose={() => setModalOpened(false)}
                onConfirm={handleConfirm}
                loading={isLoading}
                labels={modalLabels}
            />
        </>
    );
}
