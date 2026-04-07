export type ActivityData = {
    id: string;
    activityType: string;
    assignedUserId: string;
    assignedUserName: string;
    expectedStudents: number | null;
    duration: number;
};
