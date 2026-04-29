import { Paper, Text, Badge, Button, Group, Stack, Divider } from "@mantine/core";
import styles from "./constraint-proposal-card.module.css";

interface ProposalItem {
    key: string;
    value: string;
}

interface ConstraintProposalCardProps {
    readonly hardConstraints: ProposalItem[];
    readonly softPreferences: ProposalItem[];
    readonly onApprove: () => void;
    readonly onRevise: () => void;
    readonly loading?: boolean;
    readonly labels: {
        title: string;
        hardConstraints: string;
        softPreferences: string;
        approve: string;
        makeChanges: string;
    };
}

function ProposalSection({
    title,
    items,
    color,
}: {
    readonly title: string;
    readonly items: ProposalItem[];
    readonly color: string;
}) {
    if (items.length === 0) return null;

    return (
        <div>
            <Text fw={600} size="sm" mb="xs">
                {title}
            </Text>
            <Stack gap="xs">
                {items.map((item, index) => (
                    <Group key={index} gap="sm" wrap="wrap">
                        <Badge variant="light" color={color} size="lg">
                            {item.key}
                        </Badge>
                        <Text size="sm">{item.value}</Text>
                    </Group>
                ))}
            </Stack>
        </div>
    );
}

export function ConstraintProposalCard({
    hardConstraints,
    softPreferences,
    onApprove,
    onRevise,
    loading = false,
    labels,
}: ConstraintProposalCardProps) {
    return (
        <Paper
            className={styles.card}
            p="md"
            radius="md"
            withBorder
        >
            <Stack gap="md">
                <Text fw={700} size="lg">
                    {labels.title}
                </Text>

                <Divider />

                <ProposalSection
                    title={labels.hardConstraints}
                    items={hardConstraints}
                    color="red"
                />

                <ProposalSection
                    title={labels.softPreferences}
                    items={softPreferences}
                    color="blue"
                />

                <Divider />

                <Group justify="flex-end" gap="sm">
                    <Button
                        variant="outline"
                        onClick={onRevise}
                        disabled={loading}
                    >
                        {labels.makeChanges}
                    </Button>
                    <Button
                        onClick={onApprove}
                        loading={loading}
                    >
                        {labels.approve}
                    </Button>
                </Group>
            </Stack>
        </Paper>
    );
}
