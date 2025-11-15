/**
 * Program Builder - Refactored Components & Utilities
 *
 * This module contains extracted, reusable components and utilities from the
 * program-builder.tsx component. These can be used to refactor the main
 * component or reused in other parts of the application.
 *
 * Structure:
 * - utils/: Time calculations and positioning logic
 * - components/: Reusable UI components (SessionCard, TimeGrid)
 *
 * Usage:
 * import { SessionCard, TimeGrid, getSessionPosition, snapToInterval } from './program-builder'
 */

// Utils
export * from './utils/time-calculations'

// Components
export { SessionCard } from './components/SessionCard'
export { TimeGrid } from './components/TimeGrid'
