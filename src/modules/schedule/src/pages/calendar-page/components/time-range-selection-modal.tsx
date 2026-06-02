import { Modal, Button, Group, Text, Stack } from "@mantine/core";
import { getWeekdayLabelFromDate } from "@/common/weekdays";
import resourcesJson from "../calendar-page.resources.json";
import { getIntlLocale, translatedResources } from "@/infra/i18n";
import { useLocaleStore } from "@/infra/theme/state";

const resources = translatedResources(
    "src/modules/schedule/src/pages/calendar-page/calendar-page.resources.json",
    resourcesJson,
);
interface TimeRangeSelectionModalProps {
    readonly opened: boolean;
    readonly onClose: () => void;
    readonly onConfirm: () => Promise<void>;
    readonly date: Date;
    readonly startTime: string;
    readonly endTime: string;
    readonly loading?: boolean;
}

export function TimeRangeSelectionModal({
    opened,
    onClose,
    onConfirm,
    date,
    startTime,
    endTime,
    loading = false,
}: TimeRangeSelectionModalProps) {
    const language = useLocaleStore((state) => state.language);
    const locale = getIntlLocale(language);
    const weekdayName = getWeekdayLabelFromDate(date, "long");
    const dateString = date.toLocaleDateString(locale, {
        year: "numeric",
        month: "long",
        day: "numeric",
    });

    return (
        <Modal
            opened={opened}
            onClose={onClose}
            title={resources.timeRangeSelectionModal.title}
            size="md"
        >
            <Stack gap="md">
                <Text>
                    {resources.timeRangeSelectionModal.message}
                </Text>
                <Text fw={600}>
                    {weekdayName}, {dateString}
                </Text>
                <Text>
                    {startTime} - {endTime}
                </Text>
                <Group justify="flex-end" mt="xl">
                    <Button variant="subtle" onClick={onClose} disabled={loading}>
                        {resources.timeRangeSelectionModal.cancelButton}
                    </Button>
                    <Button onClick={onConfirm} loading={loading}>
                        {resources.timeRangeSelectionModal.confirmButton}
                    </Button>
                </Group>
            </Stack>
        </Modal>
    );
}
