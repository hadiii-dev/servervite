# Job Finder Mobile App Specification

## Project Overview

The Job Finder app is a dynamic job discovery platform that transforms the job search experience through an innovative, multi-modal profile creation process and intelligent matching interface. Using a Tinder-like swiping mechanism, users can quickly discover and interact with job opportunities that match their preferences and skills.

## Core Features

### 1. Job Discovery Interface

- **Tinder-like Swiping**: Users can swipe right to express interest in a job or swipe left to discard it
- **Card-based UI**: Each job is displayed as a card with key information (title, company, location, salary)
- **Job Details**: Tapping on a job card reveals detailed information including full description, requirements, and company details
- **Emoji Reactions**: Users can express their sentiment about a job using emoji reactions (excited, interested, neutral, doubtful, negative)

### 2. Progressive Profile Creation

The app implements a step-by-step profile creation process:

- **Anonymous Browsing**: Users can start browsing jobs immediately without creating an account
- **Progressive Modals**: After several interactions, the app prompts users to complete their profile through a series of focused modal screens
- **Profile Steps**:
  1. Basic Profile: Professional title, years of experience
  2. Work Preferences: Schedule type, work mode, minimum salary, travel willingness
  3. Education: Highest level, field of study, certifications
  4. Languages: Primary language and proficiency, additional languages
  5. CV Upload: Upload resume/CV document
  6. Registration: Create account with username/password to save progress

### 3. User Account Features

- **Profile Management**: View and edit personal information and preferences
- **Saved Jobs**: Access list of jobs the user has expressed interest in
- **Applied Jobs**: Track jobs the user has formally applied to
- **Occupation Preferences**: Browse and select preferred occupations to improve recommendations

### 4. Location & Language Support

- **Geolocation**: Uses device location (with permission) to recommend nearby jobs
- **Multi-language Support**: Automatic language detection between English and Spanish based on user location
- **Remote/Hybrid/On-site Filtering**: Filter jobs by work arrangement with visual indicators

### 5. Smart Recommendations

- **Learning Algorithm**: System learns from user interactions to improve job recommendations over time
- **Similarity Matching**: Suggests jobs similar to those the user has liked previously
- **Location Awareness**: Prioritizes jobs based on proximity and remote work preferences

## Technical Specifications

### Backend API Endpoints

1. **Session Management**
   - `POST /api/session`: Create a new anonymous session
   - `GET /api/session/:sessionId`: Get session data
   - `PATCH /api/session/:sessionId`: Update session data

2. **User Management**
   - `POST /api/users`: Register a new user
   - `POST /api/login`: Authenticate user
   - `GET /api/users/:userId/profile`: Get user profile data
   - `PATCH /api/users/:userId/profile`: Update user profile

3. **Job Operations**
   - `GET /api/jobs`: Get job listings with filtering options
   - `GET /api/jobs/:id`: Get specific job details
   - `POST /api/user-jobs`: Record user job interaction (like/dislike/apply)
   - `POST /api/session-jobs`: Record anonymous session job interaction
   - `GET /api/users/:userId/saved-jobs`: Get jobs liked by user
   - `GET /api/users/:userId/applied-jobs`: Get jobs applied to by user

4. **Occupation Management**
   - `GET /api/occupations`: Get occupations with optional search filter
   - `POST /api/user-occupations`: Save user occupation preferences

5. **Document Upload**
   - `POST /api/cv-upload`: Upload CV/resume document

### Data Models

1. **User**
   - Basic info: username, password, email, phone, fullName
   - Profile details: workPreferences, education, languages (as JSON objects)
   - Skills array
   - Location data: latitude, longitude

2. **Job**
   - Basic info: title, company, location, salary, jobType
   - Content: description, skills array, category
   - Metadata: externalId, postedDate
   - Location data: latitude, longitude, isRemote flag

3. **Occupation**
   - Name and metadata
   - ISCO classification

4. **Session**
   - Anonymous profile data
   - Interaction history
   - Profile completion progress

## User Experience Flow

### First-Time User Journey

1. User opens the app and is immediately presented with job cards
2. After swiping on 4+ jobs, the app prompts to create a basic profile
3. User continues browsing and interacting with jobs
4. At defined intervals, the app presents progressively more detailed profile completion modals
5. After CV upload, the app prompts user to register an account
6. Post-registration, user gets access to saved jobs, applied jobs, and full profile management

### Returning User Journey

1. User logs in to their account
2. User is presented with the home screen showing job recommendations
3. User can access their profile, saved jobs, and applied jobs through the bottom navigation
4. When viewing job details, user can apply directly to jobs they're interested in

## UI/UX Specifications

### Main Navigation

- **Bottom Navigation Bar** with:
  - Home (Job Discovery)
  - Saved Jobs
  - Applied Jobs
  - Profile

### Home Screen

- **Header**: App logo, menu access, profile button
- **Job Card Stack**: Primary interface showing job cards that can be swiped
- **Action Buttons**: Alternative to swiping - Reject (X), Info (i), Like (✓)
- **Progress Indicator**: Shows number of cards remaining in current batch

### Job Card Design

- **Company Logo**: Positioned at top left
- **Job Title**: Primary text, bold
- **Company Name**: Secondary text
- **Location**: With icon indicating remote/hybrid/on-site status
- **Salary Range**: When available
- **Key Skills**: Tags showing primary required skills
- **Background Gradient**: Subtle gradient based on job category

### Job Details Modal

- **Full Description**: Formatted job description with HTML support
- **Requirements**: Bulleted list of job requirements
- **Application Method**: Instructions or direct apply button
- **Emoji Sentiment**: Option to express feeling about the job
- **Action Buttons**: Apply, Save, Back to browsing

### Profile Modals

Each profile completion step has a focused modal with:
- **Clear Title**: Indicating current step (e.g., "Work Preferences")
- **Concise Form Fields**: Only essential information requested
- **Progress Indicator**: Shows completion progress across all steps
- **Skip Option**: For optional sections
- **Continue Button**: To proceed to next step or complete

### Profile Screen

- **Profile Header**: User photo/avatar, name, professional title
- **Profile Completion**: Visual indicator of profile completion percentage
- **Section Cards**: Collapsible cards for different profile sections
  - Personal Information
  - Work Preferences
  - Education
  - Languages
  - Skills
- **CV Preview**: Thumbnail and download option for uploaded CV
- **Edit Buttons**: For each section

### Saved & Applied Jobs Screens

- **List View**: Scrollable list of job cards with status indicators
- **Search/Filter**: Options to search within saved/applied jobs
- **Sort Options**: By date, company, etc.
- **Status Badges**: Application status (for applied jobs)

## Design Guidelines

### Colors

- **Primary Color**: #4F46E5 (Indigo)
- **Secondary Color**: #10B981 (Emerald)
- **Background**: #F9FAFB (Light Gray)
- **Text**: #1F2937 (Dark Gray)
- **Success**: #22C55E (Green)
- **Warning**: #F59E0B (Amber)
- **Error**: #EF4444 (Red)
- **Remote Badge**: #10B981 (Green)
- **Hybrid Badge**: #6366F1 (Indigo)
- **On-site Badge**: #F97316 (Orange)

### Typography

- **Primary Font**: SF Pro (iOS) / Roboto (Android)
- **Headings**: Bold, sizes 24px (h1), 20px (h2), 18px (h3)
- **Body Text**: Regular, size 16px
- **Small Text**: Regular, size 14px
- **Button Text**: Medium, size 16px

### Animations & Interactions

- **Card Swiping**: Smooth animation with rotation effect
- **Modal Transitions**: Slide up animation for modals
- **Button Feedback**: Subtle scale effect on press
- **Loading States**: Skeleton screens instead of spinners where possible
- **Pull to Refresh**: On job lists and saved/applied sections

## Internationalization

The app supports automatic language switching between:

- **English**: Default for non-Spanish speaking regions
- **Spanish**: Automatic for users in Spanish-speaking countries

Translation keys should be used for all text content to support easy language switching and future language additions.

## Technical Considerations

### React Native Implementation

- **Navigation**: React Navigation with tab and stack navigators
- **State Management**: Redux or Context API for global state
- **Form Handling**: Formik with Yup validation
- **Styling**: Styled Components or React Native Paper
- **Animation**: React Native Reanimated for smooth animations
- **File Upload**: Document picker integration for CV uploads
- **Persistence**: AsyncStorage for session management
- **API Communication**: Axios or React Query

### Performance Optimization

- **Image Optimization**: Lazy loading and caching for company logos
- **Virtualized Lists**: For better performance on long lists
- **Pagination**: Implement for job listings
- **Offline Support**: Basic caching of viewed jobs
- **Background Fetch**: Optional background updates for new job matches

### Security

- **Secure Storage**: For authentication tokens
- **Input Validation**: Client-side validation for all form inputs
- **Deep Linking**: Secure handling of external links
- **Document Handling**: Secure uploading and viewing of CV documents

## Implementation Milestones

1. **Setup & Authentication**
   - Project setup with React Native
   - Authentication flow implementation
   - Session management

2. **Core UI Components**
   - Job card component
   - Swipe interaction
   - Basic navigation

3. **Profile Creation**
   - Progressive modal sequence
   - Form implementation
   - Document upload

4. **Job Discovery Features**
   - API integration for job listings
   - Recommendation algorithm integration
   - Job interaction tracking

5. **Profile & History**
   - Saved jobs implementation
   - Applied jobs tracking
   - Profile management

6. **Refinement**
   - Internationalization
   - Offline capabilities
   - Performance optimization

7. **Testing & Deployment**
   - Cross-device testing
   - Performance testing
   - App store submission preparation

## Conclusion

This Job Finder mobile app aims to revolutionize the job search experience by combining intuitive swiping interactions with progressive profile building and intelligent job matching. The React Native implementation will ensure consistent user experience across iOS and Android platforms while maintaining high performance and responsiveness.