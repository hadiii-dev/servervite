# Job Finder App - Database Schema

## Overview

The Job Finder application utilizes a PostgreSQL database with the following structure to support its features. This document provides a detailed explanation of each table, its columns, and relationships to guide developers implementing the mobile version.

## Schema Diagram

```
┌───────────────────┐     ┌────────────────────┐     ┌────────────────────┐
│    users          │     │  userOccupations   │     │    occupations     │
├───────────────────┤     ├────────────────────┤     ├────────────────────┤
│ id                │◄────┤ userId             │     │ id                 │
│ username          │     │ occupationId       │────►│ conceptType        │
│ password          │     │ liked              │     │ conceptUri         │
│ email             │     │ createdAt          │     │ iscoGroup          │
│ phone             │     └────────────────────┘     │ preferredLabel     │
│ fullName          │                                │ altLabels          │
│ cvPath            │                                │ status             │
│ latitude          │                                │ modifiedDate       │
│ longitude         │                                │ ...                │
│ workPreferences   │                                └────────────────────┘
│ education         │                                         ▲
│ languages         │                                         │
│ skills            │                                         │
│ createdAt         │                                         │
└───────────────────┘                                         │
        ▲                                                     │
        │                                                     │
        │           ┌────────────────────┐     ┌─────────────┴────────┐
        │           │     userJobs       │     │         jobs         │
        │           ├────────────────────┤     ├────────────────────┐ │
        └───────────┤ userId             │     │ id                 │ │
                    │ jobId              │────►│ externalId         │ │
                    │ action             │     │ title              │ │
                    │ sentiment          │     │ company            │ │
                    │ createdAt          │     │ location           │ │
                    └────────────────────┘     │ jobType            │ │
                                               │ salary             │ │
┌───────────────────┐     ┌────────────────────┤ description        │ │
│ anonymousSessions │     │    sessionJobs     │ category           │ │
├───────────────────┤     ├────────────────────┤ skills             │ │
│ id                │     │ id                 │ latitude           │ │
│ sessionId         │◄────┤ sessionId          │ longitude          │ │
│ preferences       │     │ jobId              │────┘ isRemote      │ │
│ skills            │     │ action             │     │ postedDate       │ │
│ professionalTitle │     │ sentiment          │     │ xmlData           │ │
│ yearsOfExperience │     │ createdAt          │     │ createdAt         │ │
│ profileCompleted  │     └────────────────────┘     └────────────────────┘
│ latitude          │
│ longitude         │
│ locationPermission│
│ createdAt         │
└───────────────────┘
```

## Table Descriptions

### users

Stores registered user accounts and their profile information.

| Column          | Type           | Description                               |
|-----------------|----------------|-------------------------------------------|
| id              | serial         | Primary key                               |
| username        | text           | Unique username                           |
| password        | text           | User password                             |
| email           | text           | User email (unique)                       |
| phone           | text           | Contact phone (optional)                  |
| fullName        | text           | User's full name                          |
| cvPath          | text           | Path to uploaded CV file                  |
| latitude        | double         | User's latitude for location-based matching |
| longitude       | double         | User's longitude for location-based matching |
| workPreferences | json           | Work preferences (schedule, mode, salary) |
| education       | json           | Education details                         |
| languages       | json           | Language proficiencies                    |
| skills          | text[]         | Array of user skills                      |
| createdAt       | timestamp      | Account creation timestamp                |

### occupations

Contains occupation categories from standard classifications.

| Column                  | Type      | Description                            |
|-------------------------|-----------|----------------------------------------|
| id                      | serial    | Primary key                            |
| conceptType             | text      | Type of occupation concept             |
| conceptUri              | text      | Unique URI identifier                  |
| iscoGroup               | text      | ISCO classification group              |
| preferredLabel          | text      | Main occupation name                   |
| altLabels               | text      | Alternative names                      |
| status                  | text      | Status in classification system        |
| modifiedDate            | timestamp | Last modification date                 |
| regulatedProfessionNote | text      | Regulatory notes                       |
| scopeNote               | text      | Scope description                      |
| definition              | text      | Detailed definition                    |
| inScheme                | text      | Classification scheme                  |
| description             | text      | General description                    |
| code                    | text      | Occupation code                        |

### userOccupations

Junction table linking users to their preferred occupations.

| Column       | Type      | Description                               |
|--------------|-----------|-------------------------------------------|
| id           | serial    | Primary key                               |
| userId       | integer   | Foreign key to users.id                   |
| occupationId | integer   | Foreign key to occupations.id             |
| liked        | boolean   | Whether user likes this occupation        |
| createdAt    | timestamp | Record creation timestamp                 |

### jobs

Stores job listings imported from external sources.

| Column      | Type       | Description                               |
|-------------|------------|-------------------------------------------|
| id          | serial     | Primary key                               |
| externalId  | text       | Unique external identifier                |
| title       | text       | Job title                                 |
| company     | text       | Company name                              |
| location    | text       | Job location (textual)                    |
| jobType     | text       | Type of employment                        |
| salary      | text       | Salary information                        |
| description | text       | Full job description                      |
| category    | text       | Job category                              |
| skills      | text[]     | Required skills                           |
| latitude    | double     | Job location latitude                     |
| longitude   | double     | Job location longitude                    |
| isRemote    | boolean    | Whether job is remote                     |
| postedDate  | timestamp  | When job was posted                       |
| xmlData     | jsonb      | Original XML data                         |
| createdAt   | timestamp  | Record creation timestamp                 |

### userJobs

Tracks registered user interactions with jobs.

| Column    | Type      | Description                               |
|-----------|-----------|-------------------------------------------|
| id        | serial    | Primary key                               |
| userId    | integer   | Foreign key to users.id                   |
| jobId     | integer   | Foreign key to jobs.id                    |
| action    | text      | Type of action ('like', 'dislike', 'apply') |
| sentiment | text      | User sentiment about job                  |
| createdAt | timestamp | Record creation timestamp                 |

### anonymousSessions

Stores information for anonymous users before registration.

| Column            | Type       | Description                               |
|-------------------|------------|-------------------------------------------|
| id                | serial     | Primary key                               |
| sessionId         | text       | Unique session identifier                 |
| preferences       | json       | User preferences and progress information |
| skills            | text[]     | User skills                               |
| professionalTitle | text       | User's professional title                 |
| yearsOfExperience | integer    | Years of professional experience          |
| profileCompleted  | boolean    | Whether profile is considered complete    |
| latitude          | double     | User's latitude                           |
| longitude         | double     | User's longitude                          |
| locationPermission| boolean    | Whether location access is granted        |
| createdAt         | timestamp  | Session creation timestamp                |

### sessionJobs

Tracks anonymous user interactions with jobs.

| Column    | Type      | Description                               |
|-----------|-----------|-------------------------------------------|
| id        | serial    | Primary key                               |
| sessionId | text      | Foreign key to anonymousSessions.sessionId |
| jobId     | integer   | Foreign key to jobs.id                    |
| action    | text      | Type of action ('like', 'dislike', 'view') |
| sentiment | text      | User sentiment about job                  |
| createdAt | timestamp | Record creation timestamp                 |

## Important Relationships

1. **Users and Jobs**:
   - One-to-many relationship through userJobs junction table
   - Tracks which jobs a user has liked, disliked, or applied to

2. **Users and Occupations**:
   - One-to-many relationship through userOccupations junction table
   - Stores occupation preferences for recommendation improvement

3. **Anonymous Sessions and Jobs**:
   - One-to-many relationship through sessionJobs junction table
   - Tracks job interactions for users who haven't registered yet

## JSON Schema for Complex Fields

### workPreferences

```json
{
  "scheduleType": "full_time | part_time | flexible",
  "workMode": "remote | hybrid | on_site",
  "minSalary": 40000,
  "willingToTravel": true
}
```

### education

```json
{
  "level": "high_school | bachelor | master | phd",
  "field": "Computer Science",
  "certifications": ["AWS Certified Developer", "PMP"]
}
```

### languages

```json
{
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
```

### preferences (in anonymousSessions)

```json
{
  "completedModals": ["basic", "preferences", "education", "languages", "cv_upload"],
  "nextModalToShow": "registration",
  "workPreferences": { /* same as user workPreferences */ },
  "education": { /* same as user education */ },
  "languages": { /* same as user languages */ }
}
```

## Progressive Profile Building

The `anonymousSessions.preferences` JSON field is particularly important as it tracks the user's progress through the app's progressive profile building process. The `completedModals` array tracks which profile sections have been completed, while `nextModalToShow` indicates the next step in the profile completion process.

When a user registers, data from their anonymous session (including preferences, uploaded CV, and job interactions) should be transferred to their new user account to ensure a seamless experience.

## Recommendations Algorithm

The job recommendation system uses:

1. User occupation preferences (from userOccupations)
2. Previous job interactions (from userJobs or sessionJobs)
3. Location data (proximity calculation between user and job coordinates)
4. Skill matching (comparing job.skills with user.skills)

This multi-factor approach ensures personalized job recommendations that improve as the user interacts with more jobs in the system.