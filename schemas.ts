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
    // Firebase related fields
    firebaseId: text("firebaseId").unique(),
    firebaseToken: text("firebase_token"),
    // Campos adicionales para el perfil
    workPreferences: json("work_preferences"),
    education: json("education"),
    languages: json("languages"),
    skills: text("skills").array(),
    savedJobs: json("saved_jobs").array(),
    basicData: json("basic_data"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => {
    return {
      // Índice para búsquedas por usuario o correo
      usernameIdx: index("users_username_idx").on(table.username),
      emailIdx: index("users_email_idx").on(table.email),
      // Índice para búsquedas por Firebase ID
      firebaseIdIdx: index("users_firebase_id_idx").on(table.firebaseId),
      // Índice espacial para búsquedas por proximidad
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

// Insert schemas
export const insertUserSchema = createInsertSchema(users)
  .omit({
    id: true,
    createdAt: true,
  })
  .extend({
    firebaseId: z.string().optional(),
    firebaseToken: z.string().optional(),
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

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertOccupation = z.infer<typeof insertOccupationSchema>;
export type Occupation = typeof occupations.$inferSelect;

export type InsertUserOccupation = z.infer<typeof insertUserOccupationSchema>;
export type UserOccupation = typeof userOccupations.$inferSelect;

export type InsertJob = z.infer<typeof insertJobSchema>;
export type Job = typeof jobs.$inferSelect;

export type InsertUserJob = z.infer<typeof insertUserJobSchema>;
export type UserJob = typeof userJobs.$inferSelect;

export type InsertAnonymousSession = z.infer<
  typeof insertAnonymousSessionSchema
>;
export type AnonymousSession = typeof anonymousSessions.$inferSelect;

export type InsertSessionJob = z.infer<typeof insertSessionJobSchema>;
export type SessionJob = typeof sessionJobs.$inferSelect;
