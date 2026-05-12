import { Box, Group, Stack, Text, ActionIcon } from "@mantine/core";

export type TimeSpinnerOrientation = "vertical" | "horizontal";

export interface TimeSpinnerProps {
    readonly label: string;
    readonly totalMinutes: number;
    readonly onChange: (totalMinutes: number) => void;
    readonly error?: string;
    readonly required?: boolean;
    readonly step?: number;
    readonly min?: number;
    readonly max?: number;
    readonly wrap?: boolean;
    readonly orientation?: TimeSpinnerOrientation;
    readonly incrementAriaLabel?: string;
    readonly decrementAriaLabel?: string;
}

export function formatMinutes(totalMinutes: number): string {
    const safe = Math.max(0, Math.floor(totalMinutes));
    const hours = Math.floor(safe / 60);
    const minutes = safe % 60;
    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
}

export function TimeSpinner({
    label,
    totalMinutes,
    onChange,
    error,
    required = true,
    step = 30,
    min = 0,
    max = 1440,
    wrap = true,
    orientation = "vertical",
    incrementAriaLabel,
    decrementAriaLabel,
}: TimeSpinnerProps) {
    const displayTime = formatMinutes(totalMinutes);

    const clamp = (value: number) => {
        const range = max - min;
        if (wrap && range > 0) {
            return ((((value - min) % range) + range) % range) + min;
        }
        if (value < min) return min;
        if (value > max) return max;
        return value;
    };

    const handleIncrement = () => onChange(clamp(totalMinutes + step));
    const handleDecrement = () => onChange(clamp(totalMinutes - step));

    const incrementButton = (
        <ActionIcon
            variant="light"
            size="lg"
            onClick={handleIncrement}
            aria-label={incrementAriaLabel ?? `Add ${step} minutes`}
        >
            +
        </ActionIcon>
    );

    const decrementButton = (
        <ActionIcon
            variant="light"
            size="lg"
            onClick={handleDecrement}
            aria-label={decrementAriaLabel ?? `Subtract ${step} minutes`}
        >
            −
        </ActionIcon>
    );

    const displayBox = (
        <Box
            style={{
                padding: orientation === "horizontal" ? "6px 16px" : "8px 16px",
                border: "1px solid var(--mantine-color-default-border)",
                borderRadius: "var(--mantine-radius-sm)",
                fontWeight: 600,
                fontSize: "1.1rem",
                minWidth: "80px",
                textAlign: "center",
                backgroundColor: "var(--mantine-color-default)",
            }}
        >
            {displayTime}
        </Box>
    );

    return (
        <Box>
            <Text size="sm" fw={500} mb={4}>
                {label}
                {required && <span style={{ color: "var(--mantine-color-error)" }}> *</span>}
            </Text>
            {orientation === "horizontal" ? (
                <Group gap="xs" align="center" wrap="nowrap" style={{ width: "fit-content" }}>
                    {decrementButton}
                    {displayBox}
                    {incrementButton}
                </Group>
            ) : (
                <Stack gap={4} align="center" style={{ width: "fit-content" }}>
                    {incrementButton}
                    {displayBox}
                    {decrementButton}
                </Stack>
            )}
            {error && <Text size="xs" c="var(--mantine-color-error)" mt={4}>{error}</Text>}
        </Box>
    );
}
