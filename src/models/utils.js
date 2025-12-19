/**
 * Model Utilities
 * Helper functions for model validation, transformation, and default values
 */

/**
 * Validates if a value is a valid UserTier
 * @param {string} tier - Tier value to validate
 * @returns {boolean}
 */
export const isValidUserTier = (tier) => {
  return ['1', '1A', '2', '2A', '3'].includes(tier);
};

/**
 * Validates if a value is a valid UserStatus
 * @param {string} status - Status value to validate
 * @returns {boolean}
 */
export const isValidUserStatus = (status) => {
  return ['Active', 'Inactive', 'Suspended', 'Pending'].includes(status);
};

/**
 * Creates a default User object
 * @returns {import('./index').User}
 */
export const createDefaultUser = () => ({
  id: '',
  name: '',
  email: '',
  tier: '1',
  status: 'Pending',
  engagementScore: 0,
});

/**
 * Creates a default OnboardingQuestion object
 * @returns {import('./index').OnboardingQuestion}
 */
export const createDefaultQuestion = () => ({
  id: '',
  text: '',
  displayOrder: 1,
  isActive: true,
  options: [],
});

/**
 * Creates a default OnboardingOption object
 * @param {string} questionId - Parent question ID
 * @param {number} displayOrder - Display order
 * @returns {import('./index').OnboardingOption}
 */
export const createDefaultOption = (questionId = '', displayOrder = 1) => ({
  id: '',
  questionId,
  optionText: '',
  displayOrder,
  assignsTier: '',
  assignsCharacterId: '',
});

/**
 * Validates an OnboardingQuestion
 * @param {import('./index').OnboardingQuestion} question - Question to validate
 * @returns {{ valid: boolean; errors: string[] }}
 */
export const validateQuestion = (question) => {
  const errors = [];

  if (!question.text || question.text.trim().length === 0) {
    errors.push('Question text is required');
  }

  if (!question.options || question.options.length < 2) {
    errors.push('At least 2 options are required');
  } else {
    question.options.forEach((option, index) => {
      if (!option.optionText || option.optionText.trim().length === 0) {
        errors.push(`Option ${index + 1} text is required`);
      }
      if (!option.assignsTier) {
        errors.push(`Option ${index + 1} must have a tier assignment`);
      }
    });
  }

  return {
    valid: errors.length === 0,
    errors,
  };
};

/**
 * Formats a date string to a relative time string
 * @param {string|Date} date - Date to format
 * @returns {string}
 */
export const formatRelativeTime = (date) => {
  if (!date) return 'Unknown';

  const now = new Date();
  const then = new Date(date);
  const diffMs = now - then;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} min ago`;
  if (diffHours < 24) return `${diffHours} hr ago`;
  if (diffDays < 7) return `${diffDays} days ago`;
  
  return then.toLocaleDateString();
};

/**
 * Formats an engagement score with appropriate styling
 * @param {number} score - Engagement score (0-100)
 * @returns {{ value: string; color: string }}
 */
export const formatEngagementScore = (score) => {
  if (score >= 80) return { value: `${score}%`, color: 'success' };
  if (score >= 60) return { value: `${score}%`, color: 'warning' };
  return { value: `${score}%`, color: 'destructive' };
};

/**
 * Normalizes a date string to ISO format
 * @param {string|Date} date - Date to normalize
 * @returns {string}
 */
export const normalizeDate = (date) => {
  if (!date) return '';
  return new Date(date).toISOString();
};

export default {};

