# Job Finder App - API Endpoints Reference

## Overview

This document provides a comprehensive reference for all API endpoints in the Job Finder application. It includes request/response formats, authentication requirements, and example usage for implementing the React Native mobile version.

## Base URL

For development: `https://api.jobfinder.com/v1`

## Authentication

Most endpoints require authentication via JSON Web Tokens (JWT).

**Headers for authenticated requests:**
```
Authorization: Bearer {token}
```

Anonymous sessions use a session ID passed in request parameters instead of JWT authentication.

## API Endpoints

### Session Management

#### Create Anonymous Session

Creates a new anonymous session for users who haven't registered yet.

- **URL**: `/api/session`
- **Method**: `POST`
- **Authentication**: None
- **Request Body**: Empty
- **Response**:
  ```json
  {
    "sessionId": "2cc8413e-163f-4bef-9046-481eb5315add"
  }
  ```

#### Get Session Data

Retrieves data associated with an anonymous session.

- **URL**: `/api/session/:sessionId`
- **Method**: `GET`
- **Authentication**: None
- **URL Parameters**: `sessionId` - The anonymous session ID
- **Response**:
  ```json
  {
    "id": 96,
    "sessionId": "2cc8413e-163f-4bef-9046-481eb5315add",
    "preferences": {
      "completedModals": [
        "basic",
        "preferences",
        "education",
        "languages",
        "cv_upload"
      ],
      "workPreferences": {
        "scheduleType": "full_time",
        "workMode": "hybrid",
        "minSalary": 40000,
        "willingToTravel": true
      },
      "education": {
        "level": "master",
        "field": "Computer Science",
        "certifications": ["AWS Certified Developer"]
      },
      "languages": {
        "primary": {
          "language": "English",
          "level": "native"
        },
        "others": [
          {
            "language": "Spanish",
            "level": "intermediate"
          }
        ]
      }
    },
    "skills": ["JavaScript", "React", "Mobile Development"],
    "professionalTitle": "Software Engineer",
    "yearsOfExperience": 5,
    "profileCompleted": true,
    "latitude": 40.4167,
    "longitude": -3.7033,
    "locationPermission": true,
    "createdAt": "2025-03-25T12:34:56.789Z"
  }
  ```

#### Update Session Data

Updates information in an anonymous session.

- **URL**: `/api/session/:sessionId`
- **Method**: `PATCH`
- **Authentication**: None
- **URL Parameters**: `sessionId` - The anonymous session ID
- **Request Body**:
  ```json
  {
    "preferences": {
      "completedModals": ["basic", "preferences"],
      "workPreferences": {
        "scheduleType": "full_time",
        "workMode": "remote"
      }
    },
    "skills": ["React Native", "TypeScript"],
    "professionalTitle": "Mobile Developer",
    "latitude": 40.4167,
    "longitude": -3.7033
  }
  ```
- **Response**: Updated session object (similar to GET response)

### User Management

#### Register User

Creates a new user account, optionally transferring data from an anonymous session.

- **URL**: `/api/users`
- **Method**: `POST`
- **Authentication**: None
- **Request Body**:
  ```json
  {
    "username": "johndoe",
    "password": "securePassword123",
    "email": "john.doe@example.com",
    "phone": "+1234567890",
    "fullName": "John Doe",
    "cvPath": "/uploads/cvs/1742975323030-586367894.pdf",
    "skills": ["JavaScript", "React Native", "TypeScript"],
    "latitude": 40.4167,
    "longitude": -3.7033,
    "workPreferences": {
      "scheduleType": "full_time",
      "workMode": "hybrid",
      "minSalary": 50000,
      "willingToTravel": true
    },
    "education": {
      "level": "master",
      "field": "Computer Science",
      "certifications": ["AWS Certified Developer"]
    },
    "languages": {
      "primary": {
        "language": "English",
        "level": "native"
      },
      "others": [
        {
          "language": "Spanish",
          "level": "intermediate"
        }
      ]
    }
  }
  ```
- **Response**:
  ```json
  {
    "id": 123,
    "username": "johndoe"
  }
  ```

#### Login

Authenticates a user and returns a token.

- **URL**: `/api/login`
- **Method**: `POST`
- **Authentication**: None
- **Request Body**:
  ```json
  {
    "username": "johndoe",
    "password": "securePassword123"
  }
  ```
- **Response**:
  ```json
  {
    "id": 123,
    "username": "johndoe",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
  ```

#### Get User Profile

Retrieves detailed profile information for a user.

- **URL**: `/api/users/:userId/profile`
- **Method**: `GET`
- **Authentication**: Required
- **URL Parameters**: `userId` - The user's ID
- **Response**:
  ```json
  {
    "id": 123,
    "username": "johndoe",
    "email": "john.doe@example.com",
    "phone": "+1234567890",
    "fullName": "John Doe",
    "cvPath": "/uploads/cvs/1742975323030-586367894.pdf",
    "latitude": 40.4167,
    "longitude": -3.7033,
    "profileCompleted": true,
    "occupations": [
      {
        "id": 45,
        "userId": 123,
        "occupationId": 78,
        "liked": true,
        "occupationName": "Software Developer"
      }
    ],
    "workPreferences": {
      "scheduleType": "full_time",
      "workMode": "hybrid",
      "minSalary": 50000,
      "willingToTravel": true
    },
    "education": {
      "level": "master",
      "field": "Computer Science",
      "certifications": ["AWS Certified Developer"]
    },
    "languages": {
      "primary": {
        "language": "English",
        "level": "native"
      },
      "others": [
        {
          "language": "Spanish",
          "level": "intermediate"
        }
      ]
    },
    "skills": ["JavaScript", "React Native", "TypeScript"]
  }
  ```

#### Update User Profile

Updates profile information for a user.

- **URL**: `/api/users/:userId/profile`
- **Method**: `PATCH`
- **Authentication**: Required
- **URL Parameters**: `userId` - The user's ID
- **Request Body**: Any profile fields to update (partial updates supported)
  ```json
  {
    "fullName": "John Smith",
    "phone": "+1987654321",
    "workPreferences": {
      "minSalary": 60000
    },
    "skills": ["JavaScript", "React Native", "TypeScript", "Node.js"]
  }
  ```
- **Response**: Updated profile object (similar to GET response)

### Job Operations

#### Get Jobs

Retrieves a list of job listings with optional filtering.

- **URL**: `/api/jobs`
- **Method**: `GET`
- **Authentication**: Optional
- **Query Parameters**:
  - `userId` - For personalized recommendations (authenticated)
  - `sessionId` - For anonymous recommendations
  - `limit` - Maximum number of jobs to return (default 20)
  - `offset` - Pagination offset (default 0)
  - `excludeIds` - Comma-separated list of job IDs to exclude
- **Response**:
  ```json
  [
    {
      "id": 12345,
      "externalId": "ext-job-123",
      "title": "Senior React Native Developer",
      "company": "Tech Innovations Inc",
      "location": "Madrid, Spain",
      "jobType": "Full-time",
      "salary": "€50,000 - €70,000",
      "description": "We're looking for an experienced React Native developer...",
      "category": "Software Development",
      "skills": ["React Native", "JavaScript", "TypeScript", "Redux"],
      "latitude": 40.4168,
      "longitude": -3.7038,
      "isRemote": true,
      "postedDate": "2025-03-15T10:30:00.000Z"
    },
    {
      "id": 12346,
      "externalId": "ext-job-124",
      "title": "Mobile App Designer",
      "company": "Creative Solutions",
      "location": "Barcelona, Spain",
      "jobType": "Contract",
      "salary": "€40 - €55 per hour",
      "description": "Join our team as a mobile app designer...",
      "category": "Design",
      "skills": ["UI/UX", "Figma", "Adobe XD", "Mobile Design"],
      "latitude": 41.3874,
      "longitude": 2.1686,
      "isRemote": false,
      "postedDate": "2025-03-18T14:45:00.000Z"
    }
  ]
  ```

#### Get Job Details

Retrieves detailed information for a specific job.

- **URL**: `/api/jobs/:id`
- **Method**: `GET`
- **Authentication**: Optional
- **URL Parameters**: `id` - The job ID
- **Response**: Detailed job object (similar to list item, but with full description)

#### Record User Job Action

Records a user's interaction with a job (like, dislike, apply).

- **URL**: `/api/user-jobs`
- **Method**: `POST`
- **Authentication**: Required
- **Request Body**:
  ```json
  {
    "userId": 123,
    "jobId": 12345,
    "action": "like",
    "sentiment": "excited"
  }
  ```
- **Response**:
  ```json
  {
    "id": 789,
    "userId": 123,
    "jobId": 12345,
    "action": "like",
    "sentiment": "excited",
    "createdAt": "2025-03-26T09:41:23.456Z"
  }
  ```

#### Record Anonymous Session Job Action

Records a job interaction for an anonymous user.

- **URL**: `/api/session-jobs`
- **Method**: `POST`
- **Authentication**: None
- **Request Body**:
  ```json
  {
    "sessionId": "2cc8413e-163f-4bef-9046-481eb5315add",
    "jobId": 12346,
    "action": "dislike",
    "sentiment": "neutral"
  }
  ```
- **Response**:
  ```json
  {
    "id": 790,
    "sessionId": "2cc8413e-163f-4bef-9046-481eb5315add",
    "jobId": 12346,
    "action": "dislike",
    "sentiment": "neutral",
    "createdAt": "2025-03-26T09:42:05.789Z"
  }
  ```

#### Get User Saved Jobs

Retrieves jobs that a user has liked/saved.

- **URL**: `/api/users/:userId/saved-jobs`
- **Method**: `GET`
- **Authentication**: Required
- **URL Parameters**: `userId` - The user's ID
- **Response**: Array of job objects with a "status" field set to "saved"

#### Get User Applied Jobs

Retrieves jobs that a user has applied to.

- **URL**: `/api/users/:userId/applied-jobs`
- **Method**: `GET`
- **Authentication**: Required
- **URL Parameters**: `userId` - The user's ID
- **Response**: Array of job objects with a "status" field set to "applied"

### Occupation Management

#### Get Occupations

Retrieves a list of occupations with optional search.

- **URL**: `/api/occupations`
- **Method**: `GET`
- **Authentication**: Optional
- **Query Parameters**:
  - `search` - Optional search term to filter occupations
- **Response**:
  ```json
  [
    {
      "id": 78,
      "conceptType": "esco",
      "conceptUri": "http://data.europa.eu/esco/occupation/c40a2919-48a9-40ea-b506-b9f3d0e4aef5",
      "iscoGroup": "25",
      "preferredLabel": "Software Developer",
      "altLabels": "programmer, software engineer",
      "status": "active",
      "definition": "A professional who designs and builds computer programs..."
    },
    {
      "id": 79,
      "conceptType": "esco",
      "conceptUri": "http://data.europa.eu/esco/occupation/47942959-10ae-4b78-8c83-36995d18a511",
      "iscoGroup": "25",
      "preferredLabel": "Mobile Application Developer",
      "altLabels": "mobile app programmer, mobile software engineer",
      "status": "active",
      "definition": "Develops applications for mobile devices..."
    }
  ]
  ```

#### Save User Occupation Preference

Records a user's preference for an occupation.

- **URL**: `/api/user-occupations`
- **Method**: `POST`
- **Authentication**: Required
- **Request Body**:
  ```json
  {
    "userId": 123,
    "occupationId": 79,
    "liked": true
  }
  ```
- **Response**:
  ```json
  {
    "id": 45,
    "userId": 123,
    "occupationId": 79,
    "liked": true,
    "createdAt": "2025-03-26T09:45:30.123Z"
  }
  ```

### Document Upload

#### Upload CV

Uploads a CV/resume document.

- **URL**: `/api/cv-upload`
- **Method**: `POST`
- **Authentication**: Optional
- **Content-Type**: `multipart/form-data`
- **Form Parameters**:
  - `cv` - The CV file to upload
- **Response**:
  ```json
  {
    "filePath": "/uploads/cvs/1742975323030-586367894.pdf"
  }
  ```

### System Operations

#### Sync Jobs from XML

Manually triggers a job synchronization from the XML feed.

- **URL**: `/api/sync-jobs`
- **Method**: `POST`
- **Authentication**: Admin-only
- **Request Body**:
  ```json
  {
    "xmlUrl": "https://example.com/jobs-feed.xml"
  }
  ```
- **Response**:
  ```json
  {
    "status": "ok",
    "jobsProcessed": 1250,
    "newJobs": 78
  }
  ```

#### Import Occupations

Imports occupation data from CSV files.

- **URL**: `/api/import-occupations`
- **Method**: `POST`
- **Authentication**: Admin-only
- **Query Parameters**:
  - `language` - Language of occupations to import ("en", "es", or "all")
- **Response**:
  ```json
  {
    "status": "ok",
    "occupationsImported": 2500,
    "details": {
      "es": 1250,
      "en": 1250,
      "total": 2500
    }
  }
  ```

## Error Handling

All endpoints follow a standard error response format:

```json
{
  "error": "Short error description",
  "message": "More detailed error explanation",
  "details": {} // Optional detailed error information
}
```

Common HTTP status codes:
- `200 OK`: Request succeeded
- `201 Created`: Resource created successfully
- `400 Bad Request`: Invalid input or validation failed
- `401 Unauthorized`: Authentication required
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: Resource not found
- `500 Internal Server Error`: Server error

## API Implementation Recommendations

1. **Mobile Token Storage**: Store authentication tokens securely using encrypted storage:
   - iOS: Keychain
   - Android: EncryptedSharedPreferences

2. **Session Persistence**: Store the anonymous session ID between app launches:
   - Use AsyncStorage or similar persistent storage
   - Implement session recovery if the stored session is invalid

3. **Offline Support**:
   - Cache job listings for offline viewing
   - Queue job interactions (likes, dislikes) to sync when online

4. **Error Handling**:
   - Implement retry logic for network failures
   - Show user-friendly error messages
   - Log detailed errors for debugging

5. **Optimizing Network Usage**:
   - Use pagination for job listings
   - Implement pull-to-refresh for updating content
   - Cache images and non-changing resources

6. **Real-time Updates**:
   - Consider implementing push notifications for new matching jobs
   - Refresh data on app resume

## Testing Endpoints

For development and testing purposes, you can use these tools:

1. **Postman Collections**: A complete collection of API endpoints is available for import.
2. **API Documentation**: Interactive Swagger documentation available at `/api-docs`.
3. **Test Accounts**: Use test accounts with predefined data for development.

## Conclusion

This API reference provides the complete set of endpoints needed to implement the Job Finder mobile application in React Native. When implementing the frontend, ensure proper error handling, secure storage of credentials, and efficient data caching to create the best user experience.