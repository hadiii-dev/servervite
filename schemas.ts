import {
  pgTable,
  text,
  serial,
  integer,
  boolean,
  timestamp,
  json,
  jsonb,
  doublePrecision,
  index,
  varchar,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable(
  "users",
  {
    id: serial("id").primaryKey(),
    username: text("username").notNull(),
    password: text("password").notNull(),
    email: text("email").notNull().unique(),
    phone: text("phone"),
    fullName: text("full_name"),
    cvPath: text("cv_path"),
    latitude: doublePrecision("latitude"),
    longitude: doublePrecision("longitude"),
    workPreferences: json("work_preferences"),
    education: json("education"),
    languages: json("languages"),
    skills: text("skills").array(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    firebaseId: varchar("firebaseId", { length: 255 }),
    firebaseToken: text("firebase_token"),
    savedJobs: text("saved_jobs").array(),
    basicData: json("basic_data"),
    iscoGroups: text("isco_groups").array(),
    occupations: text("occupations").array(),
    idUserJobsUsersId: integer("id_user_jobs_users_id"),
    userOccupations: integer("user_occupations")
  },
  (table) => {
    return {
      usernameIdx: index("users_username_idx").on(table.username),
      emailIdx: index("users_email_idx").on(table.email),
      firebaseIdIdx: index("users_firebase_id_idx").on(table.firebaseId),
      geoIdx: index("users_geo_idx").on(table.latitude, table.longitude),
    };
  }
);

export const occupations = pgTable(
  "occupations",
  {
    id: serial("id").primaryKey(),
    conceptType: text("concept_type"),
    conceptUri: text("concept_uri").unique(),
    iscoGroup: text("isco_group"),
    preferredLabel: text("preferred_label").notNull(),
    altLabels: text("alt_labels"),
    status: text("status"),
    modifiedDate: timestamp("modified_date"),
    regulatedProfessionNote: text("regulated_profession_note"),
    scopeNote: text("scope_note"),
    definition: text("definition"),
    inScheme: text("in_scheme"),
    description: text("description"),
    code: text("code"),
  },
  (table) => {
    return {
      // Índice para búsquedas por etiqueta preferida (mejora el rendimiento de búsquedas textuales)
      preferredLabelIdx: index("occupations_preferred_label_idx").on(
        table.preferredLabel
      ),
      // Índice para búsquedas por etiquetas alternativas
      altLabelsIdx: index("occupations_alt_labels_idx").on(table.altLabels),
      // Índice para búsquedas por grupo ISCO
      iscoGroupIdx: index("occupations_isco_group_idx").on(table.iscoGroup),
    };
  }
);

export const userOccupations = pgTable(
  "user_occupations",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id")
      .references(() => users.id)
      .notNull(),
    occupationId: integer("occupation_id")
      .references(() => occupations.id)
      .notNull(),
    liked: boolean("liked").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => {
    return {
      // Índice para búsquedas por usuario
      userIdx: index("user_occupations_user_idx").on(table.userId),
      // Índice para búsquedas por ocupación
      occupationIdx: index("user_occupations_occupation_idx").on(
        table.occupationId
      ),
      // Índice combinado para búsquedas específicas (ocupaciones gustadas por un usuario)
      userLikedIdx: index("user_occupations_user_liked_idx").on(
        table.userId,
        table.liked
      ),
    };
  }
);

export const jobs = pgTable(
  "jobs",
  {
    id: serial("id").primaryKey(),
    externalId: text("external_id").unique(),
    title: text("title").notNull(),
    company: text("company").notNull(),
    location: text("location"),
    jobType: text("job_type"),
    salary: text("salary"),
    description: text("description"),
    category: text("category"),
    skills: text("skills").array(),
    latitude: doublePrecision("latitude"),
    longitude: doublePrecision("longitude"),
    isRemote: boolean("is_remote").default(false),
    postedDate: timestamp("posted_date"),
    xmlData: jsonb("xml_data"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => {
    return {
      // Índice para búsquedas por categoría
      categoryIdx: index("jobs_category_idx").on(table.category),
      // Índice para búsquedas por trabajo remoto
      remoteIdx: index("jobs_remote_idx").on(table.isRemote),
      // Índice para ordenamiento por fecha de creación (para optimizar el ORDER BY)
      createdAtIdx: index("jobs_created_at_idx").on(table.createdAt),
      // Índice para búsquedas por ubicación
      locationIdx: index("jobs_location_idx").on(table.location),
      // Índice espacial para búsquedas por proximidad (coordenadas)
      geoIdx: index("jobs_geo_idx").on(table.latitude, table.longitude),
      // Índice para búsquedas por compañía
      companyIdx: index("jobs_company_idx").on(table.company),
      // Índice para el ID (para optimizar muestreo aleatorio)
      idIdx: index("jobs_id_idx").on(table.id),
    };
  }
);

export const userJobs = pgTable(
  "user_jobs",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id")
      .references(() => users.id)
      .notNull(),
    jobId: integer("job_id")
      .references(() => jobs.id)
      .notNull(),
    action: text("action").notNull(), // 'like', 'dislike', 'apply'
    sentiment: text("sentiment", {
      enum: ["excited", "interested", "neutral", "doubtful", "negative"],
    }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => {
    return {
      // Índice para consultar trabajos guardados/aplicados por usuario
      userActionIdx: index("user_jobs_user_action_idx").on(
        table.userId,
        table.action
      ),
      // Índice para optimizar búsquedas de acciones por usuario y trabajo específico
      userJobIdx: index("user_jobs_user_job_idx").on(table.userId, table.jobId),
      // Índice para ordenar por fecha de creación
      createdAtIdx: index("user_jobs_created_at_idx").on(table.createdAt),
    };
  }
);

export const anonymousSessions = pgTable(
  "anonymous_sessions",
  {
    id: serial("id").primaryKey(),
    sessionId: text("session_id").notNull().unique(),
    preferences: json("preferences"),
    skills: text("skills").array(),
    professionalTitle: text("professional_title"),
    yearsOfExperience: integer("years_of_experience"),
    profileCompleted: boolean("profile_completed").default(false),
    latitude: doublePrecision("latitude"),
    longitude: doublePrecision("longitude"),
    locationPermission: boolean("location_permission").default(false),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => {
    return {
      // Índice para búsquedas por ubicación
      geoIdx: index("anonymous_sessions_geo_idx").on(
        table.latitude,
        table.longitude
      ),
      // Índice para búsquedas por estado de perfil
      profileCompletedIdx: index("anonymous_sessions_profile_completed_idx").on(
        table.profileCompleted
      ),
      // Índice para ordenar por fecha de creación
      createdAtIdx: index("anonymous_sessions_created_at_idx").on(
        table.createdAt
      ),
    };
  }
);

export const sessionJobs = pgTable(
  "session_jobs",
  {
    id: serial("id").primaryKey(),
    sessionId: text("session_id")
      .references(() => anonymousSessions.sessionId)
      .notNull(),
    jobId: integer("job_id")
      .references(() => jobs.id)
      .notNull(),
    action: text("action").notNull(), // 'like', 'dislike', 'view'
    sentiment: text("sentiment", {
      enum: ["excited", "interested", "neutral", "doubtful", "negative"],
    }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => {
    return {
      // Índice para consultar trabajos guardados/vistos por sesión
      sessionActionIdx: index("session_jobs_session_action_idx").on(
        table.sessionId,
        table.action
      ),
      // Índice para optimizar búsquedas de acciones por sesión y trabajo específico
      sessionJobIdx: index("session_jobs_session_job_idx").on(
        table.sessionId,
        table.jobId
      ),
      // Índice para ordenar por fecha de creación
      createdAtIdx: index("session_jobs_created_at_idx").on(table.createdAt),
    };
  }
);

export const skills = pgTable(
  "skills",
  {
    id: serial("id").primaryKey(),
    conceptType: text("concept_type"),
    conceptUri: text("concept_uri").unique(),
    skillType: text("skill_type"),
    reuseLevel: text("reuse_level"),
    preferredLabel: text("preferred_label").notNull(),
    altLabels: text("alt_labels"),
    status: text("status"),
    modifiedDate: timestamp("modified_date"),
    scopeNote: text("scope_note"),
    definition: text("definition"),
    inScheme: text("in_scheme"),
    description: text("description"),
  },
  (table) => {
    return {
      preferredLabelIdx: index("skills_preferred_label_idx").on(table.preferredLabel),
      skillTypeIdx: index("skills_skill_type_idx").on(table.skillType),
    };
  }
);

export const occupationSkillRelations = pgTable(
  "occupation_skill_relations",
  {
    id: serial("id").primaryKey(),
    occupationUri: text("occupation_uri")
      .references(() => occupations.conceptUri)
      .notNull(),
    skillUri: text("skill_uri")
      .references(() => skills.conceptUri)
      .notNull(),
    relationType: text("relation_type").notNull(),
    skillType: text("skill_type").notNull(),
  },
  (table) => {
    return {
      occupationSkillIdx: index("occupation_skill_idx").on(table.occupationUri, table.skillUri),
      relationTypeIdx: index("occupation_skill_relation_type_idx").on(table.relationType),
    };
  }
);

export const iscoGroups = pgTable(
  "isco_groups",
  {
    id: serial("id").primaryKey(),
    conceptType: text("concept_type"),
    conceptUri: text("concept_uri").unique(),
    preferredLabel: text("preferred_label").notNull(),
    altLabels: text("alt_labels"),
    status: text("status"),
    modifiedDate: timestamp("modified_date"),
    scopeNote: text("scope_note"),
    definition: text("definition"),
    inScheme: text("in_scheme"),
    description: text("description"),
  },
  (table) => {
    return {
      preferredLabelIdx: index("isco_groups_preferred_label_idx").on(table.preferredLabel),
    };
  }
);

// Insert schemas
export const insertUserSchema = createInsertSchema(users)
  .omit({
    id: true,
    createdAt: true,
    idUserJobsUsersId: true,
    userOccupations: true
  })
  .extend({
    firebaseId: z.string().optional(),
    firebaseToken: z.string().optional(),
    workPreferences: z.record(z.unknown()).optional(),
    education: z.record(z.unknown()).optional(),
    languages: z.record(z.unknown()).optional(),
    skills: z.array(z.string()).optional(),
    savedJobs: z.array(z.string()).optional(),
    basicData: z.record(z.unknown()).optional(),
    iscoGroups: z.array(z.string()).optional(),
    occupations: z.array(z.string()).optional(),
    latitude: z.number().nullable().optional(),
    longitude: z.number().nullable().optional(),
    cvPath: z.string().nullable().optional(),
    phone: z.string().nullable().optional()
  });

export const insertOccupationSchema = createInsertSchema(occupations).omit({
  id: true,
});

export const insertUserOccupationSchema = createInsertSchema(
  userOccupations
).omit({
  id: true,
  createdAt: true,
});

export const insertJobSchema = createInsertSchema(jobs).omit({
  id: true,
  createdAt: true,
});

export const insertUserJobSchema = createInsertSchema(userJobs).omit({
  id: true,
  createdAt: true,
});

export const insertAnonymousSessionSchema = createInsertSchema(
  anonymousSessions
).omit({
  id: true,
  createdAt: true,
});

export const insertSessionJobSchema = createInsertSchema(sessionJobs).omit({
  id: true,
  createdAt: true,
});

// Types
export type SentimentType =
  | "excited"
  | "interested"
  | "neutral"
  | "doubtful"
  | "negative";

export type InsertUser = typeof users.$inferSelect;

export type InsertOccupation = typeof occupations.$inferSelect;
export type Occupation = typeof occupations.$inferSelect;

export type InsertUserOccupation = typeof userOccupations.$inferSelect;
export type UserOccupation = typeof userOccupations.$inferSelect;

export type InsertJob = typeof jobs.$inferSelect;
export type Job = typeof jobs.$inferSelect;

export type InsertUserJob = typeof userJobs.$inferSelect;
export type UserJob = typeof userJobs.$inferSelect;

export type InsertAnonymousSession = typeof anonymousSessions.$inferSelect;
export type AnonymousSession = typeof anonymousSessions.$inferSelect;

export type InsertSessionJob = typeof sessionJobs.$inferSelect;
export type SessionJob = typeof sessionJobs.$inferSelect;
