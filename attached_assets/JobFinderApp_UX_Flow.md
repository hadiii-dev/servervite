# Job Finder App - User Experience Flow

## Overview

This document details the complete user experience flow for the Job Finder application, including screen-by-screen interactions, decision points, and UI elements. This information is designed to guide developers implementing the app in React Native for iOS and Android platforms.

## User Journeys

### 1. First-Time User Flow

```
┌─────────────────┐
│ Application     │
│ Launch          │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Anonymous       │
│ Job Browsing    │◄───────────┐
└────────┬────────┘            │
         │                      │
         │ After 4+ interactions│
         ▼                      │
┌─────────────────┐            │
│ Basic Profile   │            │
│ Modal           │────────────┘
└────────┬────────┘   Continue browsing
         │
         │ After 10+ more interactions
         ▼
┌─────────────────┐
│ Work Preferences│
│ Modal           │────────────┐
└────────┬────────┘            │
         │                      │
         │ After more interactions
         ▼                      │
┌─────────────────┐            │
│ Education       │            │
│ Modal           │────────────┘
└────────┬────────┘   Continue browsing
         │
         │ After more interactions
         ▼
┌─────────────────┐
│ Languages       │
│ Modal           │────────────┐
└────────┬────────┘            │
         │                      │
         │ After more interactions
         ▼                      │
┌─────────────────┐            │
│ CV Upload       │            │
│ Modal           │────────────┘
└────────┬────────┘   Continue browsing
         │
         │ Immediately after CV upload
         ▼
┌─────────────────┐
│ Registration    │
│ Modal           │
└────────┬────────┘
         │
         │ Account created
         ▼
┌─────────────────┐
│ User Home       │
│ (Job Discovery) │
└─────────────────┘
```

### 2. Returning User Flow

```
┌─────────────────┐
│ Application     │
│ Launch          │
└────────┬────────┘
         │
         │ Previously logged in
         ▼                      
┌─────────────────┐            ┌─────────────────┐
│ User Home       │            │ Login Screen    │
│ (Job Discovery) │◄───────────┤ (if session     │
└────────┬────────┘  Success   │ expired)        │
         │                      └─────────────────┘
         │
         ▼
┌───────────────────────────────────────────────────┐
│                                                   │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────┐│
│  │ Home        │    │ Saved Jobs  │    │ Profile ││
│  └─────────────┘    └─────────────┘    └─────────┘│
│                                                   │
└───────────────────────────────────────────────────┘
```

## Detailed Screen Flows

### 1. Initial Job Discovery (Anonymous)

**Entry Point:** Application launch for first-time user

**Screen Elements:**
- Header with app logo and menu icon
- Job card stack (primary interface)
- Action buttons below cards (X, info, ✓)
- Progress indicator showing cards in current batch

**User Interactions:**
1. User views job card showing title, company, location, and key details
2. User can:
   - Swipe right to like a job
   - Swipe left to discard a job
   - Tap info button to view full details
   - Use the action buttons as alternatives to swiping

**Transition Points:**
- After 4+ job interactions: Basic Profile Modal appears
- Tapping info button: Job Details Modal opens

**States:**
- Empty state: "Looking for jobs near you..." with animation
- Error state: "Cannot load jobs" with retry button
- Loading state: Skeleton card with shimmer effect

### 2. Basic Profile Modal

**Entry Point:** Automatically after 4+ job interactions

**Screen Elements:**
- Modal title: "Tell us about yourself"
- Progress indicator (1 of 5)
- Form fields:
  - Professional Title (text input)
  - Years of Experience (numeric input or slider)
- Continue button
- "Skip for now" option (small text below button)

**User Interactions:**
1. User completes form fields
2. User taps Continue to save information
3. Alternatively, user can skip this step

**Transition Points:**
- Continue/Skip: Return to Job Discovery
- After 10+ more interactions: Work Preferences Modal appears

**Data Storage:**
- Data saved to anonymous session

### 3. Work Preferences Modal

**Entry Point:** Automatically after 10+ more job interactions since last modal

**Screen Elements:**
- Modal title: "Your Work Preferences"
- Progress indicator (2 of 5)
- Form fields:
  - Schedule Type (full-time, part-time, flexible) [selection buttons]
  - Work Mode (remote, hybrid, on-site) [selection buttons]
  - Minimum Salary (slider or input)
  - Willing to Travel (toggle switch)
- Continue button
- "Skip for now" option

**User Interactions:**
1. User selects preferences
2. User taps Continue to save information

**Transition Points:**
- Continue/Skip: Return to Job Discovery
- After more interactions: Education Modal appears

**Data Storage:**
- Data saved to anonymous session under preferences.workPreferences

### 4. Education Modal

**Entry Point:** Automatically after more job interactions

**Screen Elements:**
- Modal title: "Your Education"
- Progress indicator (3 of 5)
- Form fields:
  - Education Level (dropdown)
  - Field of Study (text input)
  - Certifications (multi-input field)
- Continue button
- "Skip for now" option

**User Interactions:**
1. User completes form fields
2. User taps Continue to save information

**Transition Points:**
- Continue/Skip: Return to Job Discovery
- After more interactions: Languages Modal appears

**Data Storage:**
- Data saved to anonymous session under preferences.education

### 5. Languages Modal

**Entry Point:** Automatically after more job interactions

**Screen Elements:**
- Modal title: "Languages You Speak"
- Progress indicator (4 of 5)
- Form fields:
  - Primary Language (dropdown)
  - Proficiency Level (dropdown)
  - Additional Languages (repeatable section)
    - Language (dropdown)
    - Proficiency Level (dropdown)
  - "Add Another Language" button
- Continue button
- "Skip for now" option

**User Interactions:**
1. User completes form fields
2. User can add multiple languages
3. User taps Continue to save information

**Transition Points:**
- Continue/Skip: Return to Job Discovery
- After more interactions: CV Upload Modal appears

**Data Storage:**
- Data saved to anonymous session under preferences.languages

### 6. CV Upload Modal

**Entry Point:** Automatically after more job interactions

**Screen Elements:**
- Modal title: "Upload Your Resume"
- Progress indicator (5 of 5)
- File upload area (tap or drag)
- File format information
- Upload button (disabled until file selected)
- "Skip for now" option

**User Interactions:**
1. User taps upload area to select CV file
2. System shows selected file preview
3. User taps Upload to submit file

**Transition Points:**
- After successful upload: Registration Modal appears immediately
- Skip: Return to Job Discovery (Registration Modal still appears after a few more interactions)

**Data Storage:**
- CV file saved to server
- File path stored in anonymous session

### 7. Registration Modal

**Entry Point:** Immediately after CV upload or after several more interactions if CV upload was skipped

**Screen Elements:**
- Modal title: "Create Your Account"
- Form fields:
  - Username (text input)
  - Email (text input)
  - Password (password input)
  - Phone Number (optional text input)
- "Create Account" button
- "Already have an account? Log in" link

**User Interactions:**
1. User completes registration form
2. User taps "Create Account" to submit

**Transition Points:**
- Successful registration: User Home (logged in state)
- Login link: Login Modal

**Data Storage:**
- New user created in database
- All anonymous session data transferred to user account

### 8. Job Details Modal

**Entry Point:** Tapping info button or job card

**Screen Elements:**
- Company logo and name
- Job title
- Location with remote/hybrid/on-site indicator
- Salary information
- Full description (formatted text)
- Requirements section
- Emoji sentiment selector
- Action buttons:
  - Apply (primary button)
  - Save (secondary button)
  - Discard (ghost button)
- Close (X) button in top corner

**User Interactions:**
1. User reads full job details
2. User can select an emoji to express sentiment
3. User can apply, save, or discard the job

**Transition Points:**
- Close button: Return to previous screen
- Apply button: 
  - If logged in: Apply confirmation
  - If anonymous: Registration Modal
- Save button: Job saved (toast notification)
- Discard button: Return to job stack

**States:**
- Loading state: Skeleton layout with shimmer effect

### 9. User Home (Logged In)

**Entry Point:** After login or registration

**Screen Elements:**
- Header with user avatar/menu
- Job card stack (as in anonymous mode)
- Action buttons (as in anonymous mode)
- Bottom navigation bar

**User Interactions:**
1. Same job browsing interactions as anonymous mode
2. Access to additional features via bottom navigation

**Transition Points:**
- Bottom navigation: Saved Jobs, Applied Jobs, Profile screens
- Menu: Settings, Logout, etc.

### 10. Saved Jobs Screen

**Entry Point:** Bottom navigation - Saved Jobs tab

**Screen Elements:**
- Screen title: "Saved Jobs"
- Search/filter bar
- Sort options (dropdown)
- List of saved job cards
- Apply button on each card
- Pull-to-refresh functionality

**User Interactions:**
1. User browses saved jobs
2. User can search or filter the list
3. User can tap a job to view details
4. User can tap Apply directly from the list

**Transition Points:**
- Job card tap: Job Details Modal
- Apply button: Apply confirmation

**States:**
- Empty state: "No saved jobs yet. Start swiping to find jobs you like!"
- Loading state: Skeleton card list

### 11. Applied Jobs Screen

**Entry Point:** Bottom navigation - Applied Jobs tab

**Screen Elements:**
- Screen title: "Applied Jobs"
- Search/filter bar
- Sort options (dropdown)
- List of applied job cards with status indicators
- Status badges (Applied, In Progress, etc.)
- Pull-to-refresh functionality

**User Interactions:**
1. User browses applied jobs
2. User can search or filter the list
3. User can tap a job to view details

**Transition Points:**
- Job card tap: Job Details Modal with application status

**States:**
- Empty state: "You haven't applied to any jobs yet"
- Loading state: Skeleton card list

### 12. Profile Screen

**Entry Point:** Bottom navigation - Profile tab

**Screen Elements:**
- Profile header with user photo/name
- Profile completion percentage indicator
- Section cards:
  - Personal Information
  - Work Preferences
  - Education
  - Languages
  - Skills
- CV card with preview thumbnail
- Edit buttons for each section

**User Interactions:**
1. User views profile information
2. User can tap edit buttons to modify sections
3. User can tap CV to view uploaded document

**Transition Points:**
- Edit buttons: Corresponding edit modal for that section
- CV thumbnail: CV preview

**States:**
- Loading state: Skeleton UI for profile sections

### 13. Occupation Selection Screen

**Entry Point:** Profile menu or after registration

**Screen Elements:**
- Screen title: "Job Categories"
- Instruction text: "Swipe right on occupations that interest you"
- Occupation card stack (similar to job cards)
- Action buttons (X, info, ✓)

**User Interactions:**
1. User views occupation cards one by one
2. User swipes right for occupations of interest
3. User swipes left for occupations not of interest
4. User can tap info to learn more about an occupation

**Transition Points:**
- After selecting occupations: Return to previous screen
- Info button: Occupation details modal

**States:**
- Loading state: Skeleton occupation card
- Completion state: "Thanks for selecting your preferences"

## Modal Progression Logic

The progressive modal system follows these rules:

1. First modal (Basic Profile) appears after 4+ job interactions
2. Subsequent modals follow after approximately 10 more interactions each
3. After completing all profile steps, the Registration modal appears
4. If a user skips a modal, it may reappear after several more interactions
5. The system tracks completed modals in the anonymous session data
6. Once registered, the modal progression stops

The specific interaction counters are:
- Basic Profile: 4 interactions
- Work Preferences: 14 interactions
- Education: 24 interactions
- Languages: 34 interactions
- CV Upload: 44 interactions
- Registration: Immediately after CV upload or at 54 interactions

## Animation Specifications

### Card Swiping

- **Initial Position**: Centered in card stack
- **Drag Behavior**: 
  - Horizontal movement with slight rotation (±15°)
  - Opacity change on potential discard areas
- **Release Behavior**:
  - If past threshold (40% of screen width): Complete animation in swipe direction
  - If under threshold: Spring back to center position
- **Successful Swipe**:
  - Card animates off-screen in swipe direction
  - Next card animates up from the stack below

### Modal Transitions

- **Entry**: 
  - Modal slides up from bottom of screen
  - Background dims with fade effect
  - Content fades in slightly delayed
- **Exit**:
  - Modal slides down
  - Background un-dims
  - Quick transition (150ms)

### UI Feedback

- **Buttons**:
  - Slight scale down on press (transform: scale(0.98))
  - Quick bounce back on release
- **Form Fields**:
  - Highlight animation on focus
  - Gentle shake animation on validation error
- **Success Actions**:
  - Green checkmark with circular reveal animation
  - Micro-bounce for success indicators

## Accessibility Considerations

1. **Screen Reader Support**:
   - All interactive elements have appropriate accessibility labels
   - Job cards announce title, company, and key details
   - Custom actions for swipe gestures

2. **Navigation Alternatives**:
   - Button alternatives for all swipe actions
   - Keyboard navigation support for web version
   - Focus management for modal dialogs

3. **Text Sizing**:
   - All text scales with system settings
   - Minimum touch targets of 44×44 points
   - Adequate contrast ratios (4.5:1 minimum)

4. **Motion Sensitivity**:
   - Respects reduced motion settings
   - Alternative transitions for users with motion sensitivity
   - Static alternatives to animations

## Internationalization Features

1. **Language Detection**:
   - Automatic detection based on device locale
   - Secondary detection based on location (if permission granted)
   - Manual language selection in settings

2. **Supported Languages**:
   - English (default)
   - Spanish (full support)
   - Designed for easy addition of more languages

3. **Localization Elements**:
   - All text content using translation keys
   - Date/time formatting based on locale
   - Currency display based on location
   - Direction support (LTR/RTL)

## Conclusion

This detailed UX flow document provides a comprehensive guide for implementing the Job Finder application in React Native. By following these specifications, developers can create a cohesive, intuitive experience that guides users from anonymous job browsing through profile creation and ultimately to job application.