/**
 * Test IDs for E2E testing
 * 
 * Usage:
 * 1. In components: <div data-testid={TEST_IDS.FLASHCARD_GENERATOR.TEXT_INPUT}>
 * 2. In tests: screen.getByTestId(TEST_IDS.FLASHCARD_GENERATOR.TEXT_INPUT)
 */

export const TEST_IDS = {
  FLASHCARD_GENERATOR: {
    TEXT_INPUT: 'flashcard-generator-text-input',
    GENERATE_BUTTON: 'flashcard-generator-button',
    PROGRESS_BAR: 'flashcard-generator-progress',
    ERROR_MESSAGE: 'flashcard-generator-error',
    DEBUG_PANEL: 'flashcard-generator-debug',
  },
  FLASHCARD_LIST: {
    CONTAINER: 'flashcard-list-container',
    ITEM: 'flashcard-list-item',
    EMPTY_STATE: 'flashcard-list-empty',
  },
  AUTH: {
    LOGIN_BUTTON: 'auth-login-button',
    LOGOUT_BUTTON: 'auth-logout-button',
    USER_MENU: 'auth-user-menu',
  },
  LAYOUT: {
    HEADER: 'layout-header',
    FOOTER: 'layout-footer',
    SIDEBAR: 'layout-sidebar',
  },
} as const;

// Type for test IDs to ensure type safety
export type TestId = typeof TEST_IDS; 