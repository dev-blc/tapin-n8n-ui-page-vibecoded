/**
 * Model Definitions
 * JSDoc type definitions for all entities in the application
 */

/**
 * @typedef {Object} User
 * @property {string} id - User unique identifier
 * @property {string} name - User's full name
 * @property {string} email - User's email address
 * @property {string} [phone] - User's phone number
 * @property {UserTier} tier - User tier level
 * @property {string} [character] - Assigned character archetype name
 * @property {string} [characterId] - Assigned character UUID
 * @property {number} [currentDay] - Current day in journey (1-7)
 * @property {number} [quickShifts] - Number of quick shifts completed
 * @property {number} [plotTwists] - Number of plot twists completed
 * @property {number} [toolsCreated] - Number of tools created
 * @property {string} [lastActive] - Last active timestamp or relative time
 * @property {UserStatus} status - User account status
 * @property {string} [joinDate] - User registration date
 * @property {number} [engagementScore] - Engagement score (0-100)
 */

/**
 * @typedef {'1'|'1A'|'2'|'2A'|'3'} UserTier
 * User tier levels
 */

/**
 * @typedef {'Active'|'Inactive'|'Suspended'|'Pending'} UserStatus
 * User account status
 */

/**
 * @typedef {Object} UserCharacter
 * @property {string} id - Character UUID
 * @property {string} name - Character name (e.g., "The Deserving One")
 * @property {string} [description] - Character description
 * @property {string} [icon] - Character icon/emoji
 */

/**
 * @typedef {Object} UserEngagement
 * @property {number} score - Overall engagement score (0-100)
 * @property {number} quickShiftsCompleted - Total quick shifts completed
 * @property {number} plotTwistsCompleted - Total plot twists completed
 * @property {number} toolsCreated - Total tools created
 * @property {string} lastActive - Last active timestamp
 * @property {Object} [activityBreakdown] - Detailed activity breakdown
 */

/**
 * @typedef {Object} UserActivity
 * @property {string} id - Activity ID
 * @property {string} userId - User ID
 * @property {string} type - Activity type (e.g., 'quick_shift', 'plot_twist', 'tool_created')
 * @property {string} description - Activity description
 * @property {string} timestamp - Activity timestamp
 * @property {Object} [metadata] - Additional activity metadata
 */

/**
 * @typedef {Object} OnboardingQuestion
 * @property {string} id - Question UUID
 * @property {string} text - Question text
 * @property {number} displayOrder - Display order for questions
 * @property {boolean} isActive - Whether question is active
 * @property {OnboardingOption[]} [options] - Associated response options
 * @property {string} [createdAt] - Creation timestamp
 * @property {string} [updatedAt] - Last update timestamp
 */

/**
 * @typedef {Object} OnboardingOption
 * @property {string} id - Option UUID
 * @property {string} questionId - Parent question UUID
 * @property {string} optionText - Option text
 * @property {number} displayOrder - Display order for options
 * @property {UserTier} assignsTier - Tier assigned when this option is selected
 * @property {string} [assignsCharacterId] - Character UUID assigned when this option is selected
 * @property {string} [characterName] - Character name (for display)
 */

/**
 * @typedef {Object} CharacterMapping
 * @property {string} id - Character UUID
 * @property {string} name - Character name
 * @property {string} [description] - Character description
 */

/**
 * @typedef {Object} QuickShiftLoop
 * @property {string} id - Loop ID
 * @property {string} category - Loop category name
 * @property {string} [icon] - Category icon/emoji
 * @property {number} [emotionCount] - Number of emotions in this loop
 * @property {number} [protectorVariations] - Number of protector variations
 * @property {number} [reframeVariations] - Number of reframe variations
 * @property {number} [usageCount] - Usage count
 * @property {string} [lastModified] - Last modified date
 * @property {string} status - Status (Active, Locked, Draft)
 * @property {UserTier[]} [tierAvailability] - Available tiers
 * @property {QuickShiftEmotion[]} [emotions] - Associated emotions
 */

/**
 * @typedef {Object} QuickShiftEmotion
 * @property {string} emotion - Emotion name
 * @property {string} fearStatement - Associated fear statement
 * @property {UserTier[]} tier - Available tiers
 * @property {number} [usageCount] - Usage count
 */

/**
 * @typedef {Object} QuickShiftReframe
 * @property {string} id - Reframe ID
 * @property {string} category - Loop category
 * @property {string} insteadOf - "Instead of" statement
 * @property {string} truthBecomes - "Truth becomes" statement
 * @property {UserTier[]} [tierAvailability] - Available tiers
 * @property {number} [usageCount] - Usage count
 * @property {string} [tone] - Tone (Gentle, Reassuring, etc.)
 * @property {string} status - Status
 */

/**
 * @typedef {Object} QuickShiftProtector
 * @property {string} id - Protector ID
 * @property {string} name - Protector name
 * @property {string} description - Protector description
 * @property {string[]} [associatedLoops] - Associated loop categories
 * @property {number} [usageCount] - Usage count
 * @property {string} status - Status
 */

/**
 * @typedef {Object} PlotTwistQuest
 * @property {string} id - Quest ID
 * @property {string} character - Character name
 * @property {string} [characterId] - Character UUID
 * @property {UserTier} tier - User tier
 * @property {number} day - Day number (1-7)
 * @property {string} title - Quest title
 * @property {string} description - Quest description
 * @property {string} pillar - Aligned pillar name
 * @property {PlotTwistResponseOption[]} [responseOptions] - Response options
 * @property {number} [usageCount] - Usage count
 * @property {number} [completionRate] - Completion rate percentage
 * @property {string} [lastModified] - Last modified date
 * @property {string} status - Status
 */

/**
 * @typedef {Object} PlotTwistResponseOption
 * @property {string} emoji - Response emoji
 * @property {string} text - Response text
 * @property {'High'|'Medium'|'Low'} level - Engagement level
 */

/**
 * @typedef {Object} PlotTwistCharacter
 * @property {string} id - Character UUID
 * @property {string} name - Character name
 * @property {string} [icon] - Character icon/emoji
 * @property {string} [description] - Character description
 * @property {Object} [arcProgress] - 7-day arc progress
 */

/**
 * @typedef {Object} AffirmationTemplate
 * @property {string} id - Template ID
 * @property {string} name - Template name
 * @property {string} energyType - Energy type (Empowering, Calming, etc.)
 * @property {string} imageryTheme - Imagery theme
 * @property {string} openingPhrase - Opening phrase (e.g., "I am")
 * @property {string} [sampleOutput] - Sample generated output
 * @property {number} [usageCount] - Usage count
 * @property {string} status - Status
 * @property {string} [lastModified] - Last modified date
 */

/**
 * @typedef {Object} MeditationTemplate
 * @property {string} id - Template ID
 * @property {string} name - Template name
 * @property {string} feeling - Feeling to cultivate
 * @property {string} setting - Meditation setting
 * @property {string[]} [elements] - Meditation elements
 * @property {string} duration - Target duration
 * @property {string} [sampleScript] - Sample script
 * @property {number} [usageCount] - Usage count
 * @property {string} status - Status
 * @property {string} [lastModified] - Last modified date
 */

/**
 * @typedef {Object} DashboardStats
 * @property {number} activeUsers - Active users count
 * @property {string} [activeUsersChange] - Change indicator
 * @property {number} contentVariations - Content variations count
 * @property {string} [contentVariationsChange] - Change indicator
 * @property {number} dailyEngagement - Average daily engagement
 * @property {string} [dailyEngagementChange] - Change indicator
 * @property {number} contentHealth - Content health percentage
 * @property {string} [contentHealthChange] - Change indicator
 */

/**
 * @typedef {Object} RecentActivity
 * @property {string} id - Activity ID
 * @property {string} time - Relative time (e.g., "2 min ago")
 * @property {string} action - Action description
 * @property {string} category - Activity category
 * @property {string} actor - Who performed the action
 * @property {'create'|'update'|'delete'|'activity'} type - Activity type
 */

/**
 * @typedef {Object} ContentHealth
 * @property {string} name - Content type name
 * @property {number} value - Health percentage (0-100)
 * @property {'success'|'warning'|'primary'|'muted'} [color] - Display color
 */

/**
 * @typedef {Object} ApiResponse
 * @template T
 * @property {T} data - Response data
 * @property {string} [message] - Response message
 * @property {boolean} [success] - Success indicator
 */

/**
 * @typedef {Object} PaginatedResponse
 * @template T
 * @property {T[]} data - Array of items
 * @property {number} total - Total count
 * @property {number} page - Current page
 * @property {number} limit - Items per page
 * @property {number} totalPages - Total pages
 */

/**
 * @typedef {Object} ErrorResponse
 * @property {string} message - Error message
 * @property {number} [status] - HTTP status code
 * @property {string} [code] - Error code
 * @property {Object} [details] - Additional error details
 */

/**
 * @typedef {Object} ApiError
 * @property {number} status - HTTP status code
 * @property {string} message - Error message
 * @property {Object} [data] - Error data
 * @property {boolean} [isNetworkError] - Whether it's a network error
 */

export default {};

