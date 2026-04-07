/**
 * Constraint type definitions
 * Defines types for user constraints, preferences, activity constraints, and organization policies
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

// ============================================================================
// Organization Policy
// ============================================================================

export interface OrganizationPolicyResponse {
    id: string;
    organizationId: string;
    schedulingPeriodId: string;
    key: string;
    value: string;
}

export interface CreateOrganizationPolicyRequest {
    schedulingPeriodId: string;
    key: string;
    value: string;
}

export interface UpdateOrganizationPolicyRequest {
    key: string;
    value: string;
}
