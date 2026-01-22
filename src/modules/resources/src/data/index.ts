/**
 * Data layer exports
 * Provides centralized access to data repositories and types
 */

// Subject types and repository
export * from "./subject.types";
export * from "./subject-data-repository";

// Activity types and repository
export * from "./activity.types";
export * from "./activity-data-repository";

// Resource types and repository
export * from "./resource.types";
export * from "./resource-data-repository";

// ResourceType types and repository
export * from "./resource-type.types";
export * from "./resource-type-data-repository";

// Resource Attribute types and repository
export * from "./resource-attribute.types";
export * from "./resource-attribute-data-repository";

// Resource Attribute Assignment types and repository
export * from "./resource-attribute-assignment.types";
export * from "./resource-attribute-assignment-data-repository";

// External data (lightweight cross-module data access)
export * from "./external";
