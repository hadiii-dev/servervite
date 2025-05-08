import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import { pgTable, serial, text, timestamp, boolean, integer, jsonb, varchar, date, doublePrecision, json } from 'drizzle-orm/pg-core';

// Users table
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  username: text('username').notNull().unique(),
  password: text('password').notNull(),
  email: text('email').notNull().unique(),
  phone: text('phone'),
  fullName: text('full_name'),
  cvPath: text('cv_path'),
  latitude: doublePrecision('latitude'),
  longitude: doublePrecision('longitude'),
  workPreferences: json('work_preferences'),
  education: json('education'),
  languages: json('languages'),
  skills: text('skills').array(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  firebaseId: varchar('firebaseId', { length: 255 }),
  firebaseToken: text('firebase_token'),
  savedJobs: text('saved_jobs').array(),
  basicData: json('basic_data'),
  iscoGroups: text('isco_groups').array(),
  occupations: text('occupations').array(),
  idUserJobsUsersId: integer('id_user_jobs_users_id'),
  userOccupations: integer('user_occupations')
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// Occupations table
export const occupations = pgTable('occupations', {
  id: serial('id').primaryKey(),
  conceptType: varchar('concept_type', { length: 255 }),
  conceptUri: varchar('concept_uri', { length: 255 }),
  iscoGroup: varchar('isco_group', { length: 255 }),
  preferredLabel: varchar('preferred_label', { length: 255 }).notNull(),
  altLabels: jsonb('alt_labels').$type<string[]>(),
  status: varchar('status', { length: 255 }),
  modifiedDate: date('modified_date'),
  regulatedProfessionNote: text('regulated_profession_note'),
  scopeNote: text('scope_note'),
  definition: text('definition'),
  inScheme: varchar('in_scheme', { length: 255 }),
  description: text('description'),
  code: varchar('code', { length: 255 })
});

export type Occupation = typeof occupations.$inferSelect;
export type InsertOccupation = typeof occupations.$inferInsert;

// User Occupations table
export const userOccupations = pgTable('user_occupations', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id),
  occupationId: integer('occupation_id').references(() => occupations.id),
  preferenceLevel: varchar('preference_level', { length: 255 }),
  liked: boolean('liked').default(false),
  createdAt: timestamp('created_at').defaultNow()
});

export type UserOccupation = typeof userOccupations.$inferSelect;
export type InsertUserOccupation = typeof userOccupations.$inferInsert;

// Jobs table
export const jobs = pgTable('jobs', {
  id: serial('id').primaryKey(),
  externalId: varchar('external_id', { length: 255 }).unique(),
  title: varchar('title', { length: 255 }).notNull(),
  company: varchar('company', { length: 255 }),
  location: varchar('location', { length: 255 }),
  description: text('description'),
  requirements: text('requirements'),
  skills: jsonb('skills').$type<string[]>(),
  salary: varchar('salary', { length: 255 }),
  isRemote: boolean('is_remote'),
  category: varchar('category', { length: 255 }),
  url: varchar('url', { length: 255 }),
  source: varchar('source', { length: 255 }),
  postedAt: timestamp('posted_at'),
  expiresAt: timestamp('expires_at'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

export type Job = typeof jobs.$inferSelect;
export type InsertJob = typeof jobs.$inferInsert;

// User Jobs table
export const userJobs = pgTable('user_jobs', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id),
  jobId: integer('job_id').references(() => jobs.id),
  status: varchar('status', { length: 255 }).notNull(),
  action: varchar('action', { length: 255 }),
  viewedAt: timestamp('viewed_at'),
  appliedAt: timestamp('applied_at'),
  savedAt: timestamp('saved_at'),
  createdAt: timestamp('created_at').defaultNow()
});

export type UserJob = typeof userJobs.$inferSelect;
export type InsertUserJob = typeof userJobs.$inferInsert;

// Anonymous Sessions table
export const anonymousSessions = pgTable('anonymous_sessions', {
  id: serial('id').primaryKey(),
  sessionId: varchar('session_id', { length: 255 }).notNull().unique(),
  preferences: jsonb('preferences'),
  skills: jsonb('skills').$type<string[]>(),
  profileCompleted: boolean('profile_completed').default(false),
  locationPermission: boolean('location_permission').default(false),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

export type AnonymousSession = typeof anonymousSessions.$inferSelect;
export type InsertAnonymousSession = typeof anonymousSessions.$inferInsert;

// Session Jobs table
export const sessionJobs = pgTable('session_jobs', {
  id: serial('id').primaryKey(),
  sessionId: varchar('session_id', { length: 255 }).references(() => anonymousSessions.sessionId),
  jobId: integer('job_id').references(() => jobs.id),
  status: varchar('status', { length: 255 }).notNull(),
  action: varchar('action', { length: 255 }),
  viewedAt: timestamp('viewed_at'),
  appliedAt: timestamp('applied_at'),
  savedAt: timestamp('saved_at'),
  createdAt: timestamp('created_at').defaultNow()
});

export type SessionJob = typeof sessionJobs.$inferSelect;
export type InsertSessionJob = typeof sessionJobs.$inferInsert; 