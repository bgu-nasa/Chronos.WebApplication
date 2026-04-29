import { Card, Text, Badge, Button, Group, Stack, ThemeIcon } from "@mantine/core";
import { HiOutlineShieldCheck, HiOutlineStar } from "react-icons/hi";
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
    icon,
}: {
    readonly title: string;
    readonly items: ProposalItem[];
    readonly color: string;
    readonly icon: React.ReactNode;
}) {
    if (items.length === 0) return null;

    return (
        <Stack gap="sm">
            <Group gap="xs">
                <ThemeIcon variant="light" color={color} size="sm" radius="xl">
                    {icon}
                </ThemeIcon>
                <Text fw={600} size="sm">
                    {title}
                </Text>
            </Group>
            <Stack gap="xs" pl="calc(var(--mantine-spacing-sm) + 22px)">
                {items.map((item, index) => (
                    <Group key={index} gap="sm" wrap="wrap" align="center">
                        <Badge variant="dot" color={color} size="lg">
                            {item.key}
                        </Badge>
                        <Text size="sm" c="dimmed">{item.value}</Text>
                    </Group>
                ))}
            </Stack>
        </Stack>
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
        <Card
            className={styles.card}
            withBorder
            radius="md"
            padding={0}
            shadow="sm"
        >
            <Card.Section className={styles.titleSection} p="md">
                <Text fw={700} size="lg" c="white">
                    {labels.title}
                </Text>
            </Card.Section>

            {hardConstraints.length > 0 && (
                <Card.Section withBorder p="md">
                    <ProposalSection
                        title={labels.hardConstraints}
                        items={hardConstraints}
                        color="red"
                        icon={<HiOutlineShieldCheck size={14} />}
                    />
                </Card.Section>
            )}

            {softPreferences.length > 0 && (
                <Card.Section withBorder p="md">
                    <ProposalSection
                        title={labels.softPreferences}
                        items={softPreferences}
                        color="blue"
                        icon={<HiOutlineStar size={14} />}
                    />
                </Card.Section>
            )}

            <Card.Section p="md">
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
            </Card.Section>
        </Card>
    );
}
