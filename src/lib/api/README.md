# API Integration Documentation

This document provides comprehensive documentation for the API integration layer in the admin dashboard frontend.

## Overview

The API layer provides a centralized, type-safe, and maintainable way to interact with the admin microservice API (`https://admin-service-production-9d00.up.railway.app`).

## Architecture

```
┌─────────────────┐
│   Components    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  React Hooks    │ (useApi, useUsers, etc.)
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  API Services   │ (userService, onboardingService, etc.)
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Base Service   │ (BaseService class)
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  API Client     │ (axios instance with interceptors)
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Admin API      │ (Railway deployment)
└─────────────────┘
```

## File Structure

```
src/
├── lib/
│   └── api/
│       ├── client.js          # Axios instance & interceptors
│       ├── config.js          # API configuration & endpoints
│       └── README.md          # This file
├── models/
│   ├── index.js               # JSDoc type definitions
│   └── utils.js               # Model utilities
├── services/
│   └── api/
│       ├── baseService.js     # Base service class
│       ├── userService.js     # User operations
│       ├── onboardingService.js
│       ├── dashboardService.js
│       ├── quickShiftService.js
│       ├── plotTwistService.js
│       └── templateService.js
├── utils/
│   ├── apiHelpers.js          # Error handling utilities
│   ├── dataTransformers.js    # Data transformation
│   └── queryBuilder.js        # Query building utilities
└── hooks/
    ├── useApi.js              # Generic API hooks
    ├── useUsers.js            # User hooks
    ├── useOnboarding.js       # Onboarding hooks
    ├── useDashboard.js        # Dashboard hooks
    └── useContent.js          # Content hooks
```

## Configuration

### Environment Variables

Create a `.env` file in the `frontend` directory:

```env
REACT_APP_API_BASE_URL=https://admin-service-production-9d00.up.railway.app
```

If not set, the default production URL will be used.

### API Endpoints

All endpoints are defined in `src/lib/api/config.js`. The configuration includes:

- Base URL from environment variable
- Timeout settings (30 seconds)
- Default headers (Content-Type, Accept)
- All endpoint paths

## Usage Examples

### Using React Hooks (Recommended)

#### Fetching Data

```javascript
import { useUsers } from '@/hooks/useUsers';
import { useDashboardStats } from '@/hooks/useDashboard';

function MyComponent() {
  // Fetch users with filters
  const { data, loading, error, refetch } = useUsers({
    search: 'john',
    status: 'Active',
    page: 1,
    limit: 10
  });

  // Fetch dashboard stats
  const { data: stats, loading: statsLoading } = useDashboardStats();

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return <div>{/* Render data */}</div>;
}
```

#### Mutations (Create/Update/Delete)

```javascript
import { useQuestionMutation } from '@/hooks/useOnboarding';

function CreateQuestionForm() {
  const { createQuestion, loading } = useQuestionMutation({
    onSuccess: (data) => {
      console.log('Question created:', data);
      // Refresh list or navigate
    },
    onError: (error) => {
      console.error('Failed to create:', error);
    }
  });

  const handleSubmit = async (formData) => {
    try {
      await createQuestion(formData);
    } catch (error) {
      // Error already handled by hook
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
      <button disabled={loading}>
        {loading ? 'Creating...' : 'Create Question'}
      </button>
    </form>
  );
}
```

### Using Services Directly

```javascript
import userService from '@/services/api/userService';

// Fetch users
const users = await userService.getUsers({ search: 'john' });

// Get user by ID
const user = await userService.getUserById('user-id');

// Update user
const updatedUser = await userService.updateUser('user-id', {
  name: 'New Name'
});
```

## Error Handling

### Automatic Error Handling

The API client automatically handles errors through interceptors:

1. **Network Errors**: Detected and formatted with user-friendly messages
2. **HTTP Errors**: Status codes are checked and appropriate messages shown
3. **Validation Errors**: Extracted from response data
4. **Toast Notifications**: Automatically shown via hooks (can be disabled)

### Custom Error Handling

```javascript
import { getErrorMessage, handleApiError } from '@/utils/apiHelpers';

try {
  const data = await userService.getUsers();
} catch (error) {
  // Get user-friendly message
  const message = getErrorMessage(error);
  
  // Or handle with toast
  handleApiError(error, toast.error);
}
```

## Data Transformation

API responses are automatically transformed to match UI expectations:

```javascript
// API returns: { id: '123', fullName: 'John', userTier: '2' }
// Transformed to: { id: '123', name: 'John', tier: '2' }
```

Transformers are in `src/utils/dataTransformers.js`.

## Query Building

Build query strings and filter parameters:

```javascript
import { buildQueryString, buildFilterParams } from '@/utils/queryBuilder';

// Build query string
const query = buildQueryString({
  search: 'john',
  status: 'Active',
  page: 1
});
// Result: "search=john&status=Active&page=1"

// Build filter params
const filters = buildFilterParams({
  search: 'john',
  status: 'Active',
  tier: '2'
});
```

## Available Services

### User Service
- `getUsers(params)` - Get all users with filters
- `getUserById(id)` - Get user by ID
- `updateUser(id, data)` - Update user
- `getUserEngagement(id)` - Get engagement metrics
- `getUserActivity(id, params)` - Get activity log

### Onboarding Service
- `getQuestions()` - Get all questions
- `getQuestionById(id)` - Get question by ID
- `createQuestion(data)` - Create question
- `updateQuestion(id, data)` - Update question
- `deleteQuestion(id)` - Delete question
- `createOption(data)` - Create option
- `updateOption(id, data)` - Update option
- `deleteOption(id)` - Delete option
- `getCharacterMapping()` - Get character mappings

### Dashboard Service
- `getStats()` - Get dashboard statistics
- `getRecentActivity(params)` - Get recent activity
- `getContentHealth()` - Get content health metrics

### Quick Shift Service
- `getLoops(params)` - Get all loops
- `getLoopById(id)` - Get loop by ID
- `createLoop(data)` - Create loop
- `getReframes(params)` - Get reframes
- `getProtectors(params)` - Get protectors

### Plot Twist Service
- `getQuests(params)` - Get all quests
- `getQuestById(id)` - Get quest by ID
- `createQuest(data)` - Create quest
- `getCharacters()` - Get characters
- `getResponseOptions()` - Get response options

### Template Service
- `getAffirmationTemplates(params)` - Get affirmation templates
- `createAffirmationTemplate(data)` - Create affirmation template
- `getMeditationTemplates(params)` - Get meditation templates
- `createMeditationTemplate(data)` - Create meditation template

## Available Hooks

### Generic Hooks
- `useApi(apiCall, deps, options)` - Generic API hook
- `useMutation(mutationFn, options)` - Mutation hook

### Domain-Specific Hooks
- `useUsers(filters, options)` - Fetch users
- `useUser(id, options)` - Fetch single user
- `useUserEngagement(id, options)` - Fetch engagement
- `useUserActivity(id, params, options)` - Fetch activity
- `useOnboardingQuestions(options)` - Fetch questions
- `useCharacterMapping(options)` - Fetch character mapping
- `useDashboardStats(options)` - Fetch dashboard stats
- `useRecentActivity(params, options)` - Fetch activity feed
- `useContentHealth(options)` - Fetch content health
- `useQuickShiftLoops(params, options)` - Fetch loops
- `usePlotTwistQuests(params, options)` - Fetch quests
- `useAffirmationTemplates(params, options)` - Fetch templates

## Best Practices

1. **Use Hooks**: Prefer React hooks over direct service calls in components
2. **Error Handling**: Let hooks handle errors automatically, or customize with options
3. **Loading States**: Always check `loading` state before rendering data
4. **Data Transformation**: Trust the transformers - don't manually transform API data
5. **Query Building**: Use query builder utilities for complex filters
6. **Type Safety**: Refer to JSDoc types in `src/models/index.js` for data structures

## Troubleshooting

### API Calls Not Working

1. Check environment variable `REACT_APP_API_BASE_URL`
2. Verify API endpoint in `src/lib/api/config.js`
3. Check browser console for errors
4. Verify network tab for request/response

### Errors Not Showing

1. Check if `showErrorToast` is set to `false` in hook options
2. Verify toast provider is set up in App.js
3. Check error interceptor in `src/lib/api/client.js`

### Data Not Transforming

1. Verify transformer exists in `src/utils/dataTransformers.js`
2. Check service is using transformer
3. Verify API response structure matches expected format

## Future Enhancements

- [ ] Add request caching (React Query integration)
- [ ] Add request cancellation
- [ ] Add optimistic updates
- [ ] Add retry logic configuration
- [ ] Add request/response logging in production
- [ ] Migrate to TypeScript for better type safety

