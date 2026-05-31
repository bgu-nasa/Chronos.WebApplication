/**
 * Constraint type definitions
 * Defines types for user constraints, preferences, and activity constraints
 */

// ============================================================================
// User Constraint (Hard Constraints)
// ============================================================================

export interface UserConstraintResponse {
    id: string;
    userId: string;
    organizationId: string;
    schedulingPeriodId: string;
    weekNum?: number | null;
    key: string;
    value: string;
}

export interface CreateUserConstraintRequest {
    userId: string;
    schedulingPeriodId: string;
    weekNum?: number | null;
    key: string;
    value: string;
}

export interface UpdateUserConstraintRequest {
    userId: string;
    schedulingPeriodId: string;
    weekNum?: number | null;
    key: string;
    value: string;
}

// ============================================================================
// User Preference (Soft Constraints)
// ============================================================================

export interface UserPreferenceResponse {
    id: string;
    userId: string;
    organizationId: string;
    schedulingPeriodId: string;
    key: string;
    value: string;
}

export interface CreateUserPreferenceRequest {
    userId: string;
    schedulingPeriodId: string;
    key: string;
    value: string;
}

export interface UpdateUserPreferenceRequest {
    userId: string;
    schedulingPeriodId: string;
    key: string;
    value: string;
}

// ============================================================================
// Activity Constraint
// ============================================================================

export interface ActivityConstraintResponse {
    id: string;
    activityId: string;
    organizationId: string;
    weekNum?: number | null;
    key: string;
    value: string;
}

export interface CreateActivityConstraintRequest {
    activityId: string;
    weekNum?: number | null;
    key: string;
    value: string;
}

export interface UpdateActivityConstraintRequest {
    weekNum?: number | null;
    key: string;
    value: string;
}

