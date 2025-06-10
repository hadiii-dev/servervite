import {
  users,
  type User,
  type InsertUser,
  occupations,
  type Occupation,
  type InsertOccupation,
  userOccupations,
  type UserOccupation,
  type InsertUserOccupation,
  jobs,
  type Job,
  type InsertJob,
  userJobs,
  type UserJob,
  type InsertUserJob,
  anonymousSessions,
  type AnonymousSession,
  type InsertAnonymousSession,
  sessionJobs,
  type SessionJob,
  type InsertSessionJob,
} from "./schemas";
import { db } from "./db";
import { eq, like, and, desc, or, notInArray, sql } from "drizzle-orm";
import fs from "fs";
import { parse } from "csv-parse/sync";

// Implementación de caché para consultas aleatorias de trabajos
interface JobCache {
  jobs: Job[];
  timestamp: number;
  category?: string;
  isRemote?: boolean;
}

// Caché por categoría y estado remoto (claves: 'all', 'category', 'remote', 'category-remote')
const JOB_CACHES: Record<string, JobCache> = {
  all: { jobs: [], timestamp: 0 },
  "remote-true": { jobs: [], timestamp: 0, isRemote: true },
  "remote-false": { jobs: [], timestamp: 0, isRemote: false },
  // Las categorías se agregarán dinámicamente
};

// Tiempo de caducidad del caché (3 minutos)
const CACHE_TTL = 3 * 60 * 1000;

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByFirebaseId(firebaseId: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, userData: Partial<User>): Promise<User>;

  // Occupation methods
  getOccupation(id: number): Promise<Occupation | undefined>;
  getOccupations(searchQuery?: string): Promise<Occupation[]>;
  createOccupation(occupation: InsertOccupation): Promise<Occupation>;
  importOccupationsFromCSV(filePath: string): Promise<number>;

  // User Occupation methods
  getUserOccupation(id: number): Promise<UserOccupation | undefined>;
  getUserOccupationsByUserId(
    userId: number
  ): Promise<(UserOccupation & { occupationName?: string })[]>;
  createUserOccupation(
    userOccupation: InsertUserOccupation
  ): Promise<UserOccupation>;

  // Job methods
  getJob(id: number): Promise<Job | undefined>;
  getJobByExternalId(externalId: string): Promise<Job | undefined>;
  getJobs(options?: {
    limit?: number;
    offset?: number;
    excludeIds?: number[];
    category?: string;
    isRemote?: boolean;
    orderBy?: string;
    skills?: string[];
    location?: string; // New parameter for location-based filtering
    isco_groups?: string[];
    occupations?: string[];
  }): Promise<Job[]>;
  createJob(job: InsertJob): Promise<Job>;

  // User Job methods
  getUserJob(id: number): Promise<UserJob | undefined>;
  createUserJob(userJob: InsertUserJob): Promise<UserJob>;
  getUserSavedJobs(userId: number): Promise<Job[]>;
  getUserAppliedJobs(userId: number): Promise<Job[]>;

  // Anonymous Session methods
  getAnonymousSession(sessionId: string): Promise<AnonymousSession | undefined>;
  createAnonymousSession(
    session: InsertAnonymousSession
  ): Promise<AnonymousSession>;
  updateAnonymousSession(
    sessionId: string,
    data: Partial<InsertAnonymousSession>
  ): Promise<AnonymousSession | undefined>;

  // Session Job methods
  getSessionJob(id: number): Promise<SessionJob | undefined>;
  createSessionJob(sessionJob: InsertSessionJob): Promise<SessionJob>;
  getSessionLikedJobs(sessionId: string): Promise<Job[]>;
}

export class DatabaseStorage implements IStorage {
  // User methods
  async getUsers(): Promise<User[]> {
    try {
      //@ts-ignore
      const data = await db.select().from(users);
      return data;
    } catch (error) {
      console.error("Error al obtener usuarios:", error);
      throw error;
    }
  }

  async getUser(id: number): Promise<User | undefined> {
    try {
      const [user] = await db.select().from(users).where(eq(users.id, id));
      return user;
    } catch (error) {
      console.error("Error retrieving user by ID:", error);
      throw error;
    }
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.username, username));
    return user;
  }

  async getUserByFirebaseId(firebaseId: string): Promise<User | undefined> {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.firebaseId, firebaseId));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async updateUser(id: number, userData: Partial<User>): Promise<User> {
    const [updatedUser] = await db
      .update(users)
      .set(userData)
      .where(eq(users.id, id))
      .returning();
    return updatedUser;
  }

  // Occupation methods
  async getOccupation(id: number): Promise<Occupation | undefined> {
    const [occupation] = await db
      .select()
      .from(occupations)
      .where(eq(occupations.id, id));
    return occupation;
  }

  async getOccupations(searchQuery?: string): Promise<Occupation[]> {
    if (searchQuery) {
      return await db
        .select()
        .from(occupations)
        .where(
          or(
            like(occupations.preferredLabel, `%${searchQuery}%`),
            like(occupations.altLabels, `%${searchQuery}%`)
          )
        )
        .limit(20);
    }
    return await db.select().from(occupations).limit(20);
  }

  async createOccupation(occupation: InsertOccupation): Promise<Occupation> {
    const [newOccupation] = await db
      .insert(occupations)
      .values(occupation)
      .returning();
    return newOccupation;
  }

  async importOccupationsFromCSV(filePath: string): Promise<number> {
    // Read and parse CSV file
    const fileContent = fs.readFileSync(filePath, { encoding: "utf-8" });
    const records = parse(fileContent, {
      columns: true,
      skip_empty_lines: true,
    });

    let importedCount = 0;

    // Process records in batches
    const batchSize = 100;
    for (let i = 0; i < records.length; i += batchSize) {
      const batch = records.slice(i, i + batchSize);

      const occupationsToInsert = batch.map((record: any) => ({
        conceptType: record.conceptType || null,
        conceptUri: record.conceptUri || null,
        iscoGroup: record.iscoGroup || null,
        preferredLabel: record.preferredLabel || "",
        altLabels: record.altLabels || null,
        status: record.status || null,
        modifiedDate: record.modifiedDate
          ? new Date(record.modifiedDate)
          : null,
        regulatedProfessionNote: record.regulatedProfessionNote || null,
        scopeNote: record.scopeNote || null,
        definition: record.definition || null,
        inScheme: record.inScheme || null,
        description: record.description || null,
        code: record.code || null,
      }));

      // Insert occupations, ignore duplicates
      try {
        await db
          .insert(occupations)
          .values(occupationsToInsert)
          .onConflictDoNothing();
        importedCount += occupationsToInsert.length;
      } catch (error) {
        console.error("Error inserting batch:", error);
      }
    }

    return importedCount;
  }

  // User Occupation methods
  async getUserOccupation(id: number): Promise<UserOccupation | undefined> {
    const [userOccupation] = await db
      .select()
      .from(userOccupations)
      .where(eq(userOccupations.id, id));
    return userOccupation;
  }

  async createUserOccupation(
    userOccupation: InsertUserOccupation
  ): Promise<UserOccupation> {
    const [newUserOccupation] = await db
      .insert(userOccupations)
      .values(userOccupation)
      .returning();
    return newUserOccupation;
  }

  async getUserOccupationsByUserId(
    userId: number
  ): Promise<(UserOccupation & { occupationName?: string })[]> {
    const result = await db
      .select({
        id: userOccupations.id,
        userId: userOccupations.userId,
        occupationId: userOccupations.occupationId,
        liked: userOccupations.liked,
        createdAt: userOccupations.createdAt,
        occupationName: occupations.preferredLabel,
      })
      .from(userOccupations)
      .where(eq(userOccupations.userId, userId))
      .leftJoin(occupations, eq(userOccupations.occupationId, occupations.id))
      .orderBy(desc(userOccupations.createdAt));

    // Process results to match expected return type
    return result.map((item) => ({
      ...item,
      occupationName: item.occupationName || undefined,
    }));
  }

  // Job methods
  async getJob(id: number): Promise<Job | undefined> {
    const [job] = await db.select().from(jobs).where(eq(jobs.id, id));
    return job;
  }

  async getJobByExternalId(externalId: string): Promise<Job | undefined> {
    const [job] = await db
      .select()
      .from(jobs)
      .where(eq(jobs.externalId, externalId));
    return job;
  }

  async getJobs(options?: {
    limit?: number;
    offset?: number;
    excludeIds?: number[];
    category?: string;
    isRemote?: boolean;
    orderBy?: string;
    skills?: string[];
    location?: string;
    isco_groups?: string[];
    occupations?: string[];
  }): Promise<Job[]> {
    const limit = options?.limit ?? 20;
    const offset = options?.offset ?? 0;
    const excludeIds = options?.excludeIds ?? [];
    const category = options?.category;
    const isRemote = options?.isRemote;
    const orderBy = options?.orderBy || "recent"; // 'recent', 'random'
    const skills = options?.skills || [];
    const location = options?.location;
    const iscoGroups = options?.isco_groups || [];
    const occupations = options?.occupations || [];

    try {
      // Construimos una única consulta para evitar problemas de tipado con Drizzle
      // y optimizar el rendimiento evitando múltiples transformaciones del objeto de consulta

      // Preparamos los filtros como un array de condiciones
      const whereConditions = [];

      // Filtro de exclusión de IDs (si no hay demasiados)
      if (excludeIds.length > 0 && excludeIds.length <= 50) {
        whereConditions.push(notInArray(jobs.id, excludeIds));
      }

      // Filtro por categoría si se especifica
      if (category) {
        whereConditions.push(eq(jobs.category, category));
      }

      // Filtro por trabajo remoto si se especifica
      if (isRemote !== undefined) {
        whereConditions.push(eq(jobs.isRemote, isRemote));
      }

      // Filtro por ubicación si se especifica
      if (location) {
        if (location === "españa") {
          // Filtro específico para España - busca trabajos que contengan alguna de las palabras clave
          const spainKeywords = [
            "españa",
            "spain",
            "madrid",
            "barcelona",
            "valencia",
            "sevilla",
            "zaragoza",
            "málaga",
            "malaga",
            "bilbao",
            "alicante",
            "córdoba",
            "cordoba",
            "valladolid",
            "vigo",
            "gijón",
            "gijon",
            "hospitalet",
            "palma",
            "murcia",
            "vitoria",
            "oviedo",
            "santander",
            "jerez",
            "pamplona",
            "almería",
            "almeria",
            "donostia",
            "san sebastián",
            "san sebastian",
            "cartagena",
          ];

          // Creamos una condición OR para cualquiera de estas palabras clave
          const locationConditions = spainKeywords.map((keyword) =>
            like(jobs.location, `%${keyword.toLowerCase()}%`)
          );

          // Añadimos la condición OR a las condiciones de filtro
          whereConditions.push(or(...locationConditions));
        } else {
          // Para otras ubicaciones, usamos una búsqueda simple por texto
          whereConditions.push(
            like(jobs.location, `%${location.toLowerCase()}%`)
          );
        }
      }

      // Filtro por ISCO groups si se especifica
      // if (iscoGroups.length > 0) {
      //   whereConditions.push(sql`${jobs.isco_groups} && ${iscoGroups}`); // array overlap
      // }

      if (iscoGroups.length > 0) {
        // Convert each ISCO group to a string and create a PostgreSQL array
        const iscoGroupsArray = iscoGroups.map(g => `'${g}'`).join(',');
        console.log('Filtering by ISCO groups:', {
          iscoGroups,
          iscoGroupsArray,
          query: `EXISTS (SELECT 1 FROM unnest(isco_groups) AS job_isco WHERE job_isco = ANY(ARRAY[${iscoGroupsArray}]::text[]))`
        });
        whereConditions.push(
          sql`EXISTS (SELECT 1 FROM unnest(${jobs.isco_groups}) AS job_isco WHERE job_isco = ANY(ARRAY[${iscoGroupsArray}]::text[]))`
        );
        // whereConditions.push(
        //   sql.raw(
        //     `${jobs.isco_groups.sql} && ARRAY[${iscoGroups
        //       .map((g) => `'${g}'`)
        //       .join(",")}]::text[]`
        //   )
        // );
      }

      // Filtro por occupations si se especifica
      if (occupations.length > 0) {
        whereConditions.push(sql`${jobs.occupations} && ${occupations}`); // array overlap
      }

      // Ejecutamos la consulta con todos los filtros y ordenamientos aplicados de una vez
      let result: Job[] = [];
      if (orderBy === "recent") {
        // Orden por fecha de creación (más recientes primero)
        if (whereConditions.length > 0) {
          result = await db
            .select()
            .from(jobs)
            .where(and(...whereConditions))
            .orderBy(desc(jobs.createdAt))
            .offset(offset)
            .limit(limit);
        } else {
          result = await db
            .select()
            .from(jobs)
            .orderBy(desc(jobs.createdAt))
            .offset(offset)
            .limit(limit);
        }
      } else {
        // Para consultas aleatorias, verificamos primero si tenemos caché disponible
        // Obtenemos la clave de caché basada en los filtros
        let cacheKey = "all";
        if (category) {
          cacheKey = `category-${category}`;
        }
        if (isRemote !== undefined) {
          cacheKey = isRemote ? "remote-true" : "remote-false";
          if (category) {
            cacheKey = `${cacheKey}-category-${category}`;
          }
        }

        // Verificamos si tenemos un caché válido para esta clave
        const cache = JOB_CACHES[cacheKey] || { jobs: [], timestamp: 0 };
        const now = Date.now();

        // Si el caché es válido (no expirado) y tiene suficientes elementos, lo usamos
        if (cache.timestamp > now - CACHE_TTL && cache.jobs.length >= limit) {
          console.log(
            `Usando caché para ${cacheKey} (${cache.jobs.length} trabajos en caché)`
          );

          // Filtramos IDs excluidos si hay
          if (excludeIds.length > 0) {
            result = cache.jobs
              .filter((job) => !excludeIds.includes(job.id))
              .slice(offset, offset + limit);

            // Si después de filtrar no tenemos suficientes resultados, necesitamos consultar la BD
            if (result.length < limit) {
              // Continuar con la consulta a BD (caerá en el código debajo)
            } else {
              return result; // Retornamos los resultados del caché
            }
          } else {
            // No hay IDs excluidos, simplemente devolvemos los elementos del caché
            result = cache.jobs.slice(offset, offset + limit);
            return result; // Retornamos los resultados del caché
          }
        }

        // Si no hay caché o expiró, hacemos la consulta a la BD
        // Orden aleatorio optimizado (técnica de muestreo más eficiente)
        // Primero obtenemos una estimación del número total de filas
        const countQuery = await db.select({ count: sql`COUNT(*)` }).from(jobs);
        const totalCount = parseInt(countQuery[0].count as string, 10);

        if (totalCount > 0) {
          // Generamos un valor aleatorio entre 0 y el total de registros
          const randomOffset = Math.floor(
            Math.random() * Math.max(1, totalCount - limit)
          );

          // Usamos este offset aleatorio para evitar ordenar toda la tabla
          if (whereConditions.length > 0) {
            result = await db
              .select()
              .from(jobs)
              .where(and(...whereConditions))
              .orderBy(jobs.id)
              .offset(randomOffset)
              .limit(Math.max(limit, 100)); // Obtenemos más registros para el caché
          } else {
            result = await db
              .select()
              .from(jobs)
              .orderBy(jobs.id)
              .offset(randomOffset)
              .limit(Math.max(limit, 100)); // Obtenemos más registros para el caché
          }

          // Actualizamos el caché con los nuevos datos
          JOB_CACHES[cacheKey] = {
            jobs: result.slice(0, 100), // Guardamos hasta 100 trabajos
            timestamp: now,
            category,
            isRemote,
          };

          // Para la respuesta devolvemos solo lo solicitado
          result = result.slice(0, limit);
        } else {
          // Si no hay registros, devolvemos un array vacío
          result = [];
        }
      }

      // Si tenemos filtros de habilidades, aplicamos un filtro adicional en memoria
      // (porque las habilidades están en un array JSON y es más complejo filtrarlas en SQL directo)
      let filteredResults: Job[] = result;
      if (skills.length > 0) {
        filteredResults = result.filter((job) => {
          // Verificamos que job.skills esté definido y tenga elementos
          const jobSkills: string[] = job.skills || [];
          if (jobSkills.length === 0) return false;

          return skills.some((skill) =>
            jobSkills.some((jobSkill: string) =>
              jobSkill.toLowerCase().includes(skill.toLowerCase())
            )
          );
        });

        // Si el filtro por habilidades redujo demasiado los resultados,
        // completamos con los resultados originales
        if (
          filteredResults.length < limit * 0.5 &&
          result.length >= filteredResults.length
        ) {
          const remainingCount = limit - filteredResults.length;
          const additionalJobs: Job[] = result
            .filter(
              (job) =>
                !filteredResults.some((filtered) => filtered.id === job.id)
            )
            .slice(0, remainingCount);

          filteredResults = [...filteredResults, ...additionalJobs];
        }
      }

      // Mensaje informativo en logs para debugging
      console.log(
        `Consulta de jobs: orderBy=${orderBy}, filtros=${JSON.stringify({
          category: category || "none",
          isRemote: isRemote !== undefined ? isRemote : "any",
          location: location || "any",
          withSkills: skills.length > 0,
          excludeIds:
            excludeIds.length > 0 ? `${excludeIds.length} ids` : "none",
        })}`
      );

      // Log all where conditions for debugging
      console.log('Where conditions:', whereConditions.map(c => c.toString()));

      return filteredResults;
    } catch (error) {
      console.error("Error al obtener jobs:", error);

      // En caso de cualquier error, intentamos una consulta más simple como respaldo
      try {
        // Consulta de respaldo sin filtros complejos
        const backupJobs = await db.select().from(jobs).limit(limit);

        return backupJobs;
      } catch (backupError) {
        console.error("Error crítico al obtener jobs:", backupError);
        return [];
      }
    }
  }

  async createJob(job: InsertJob): Promise<Job> {
    const [newJob] = await db.insert(jobs).values(job).returning();
    return newJob;
  }

  // User Job methods
  async getUserJob(id: number): Promise<UserJob | undefined> {
    const [userJob] = await db
      .select()
      .from(userJobs)
      .where(eq(userJobs.id, id));
    return userJob;
  }

  async createUserJob(userJob: InsertUserJob): Promise<UserJob> {
    const [newUserJob] = await db.insert(userJobs).values(userJob).returning();
    return newUserJob;
  }

  async getUserSavedJobs(userId: number): Promise<Job[]> {
    const result = await db
      .select({
        job: jobs,
      })
      .from(userJobs)
      .where(and(eq(userJobs.userId, userId), eq(userJobs.action, "like")))
      .innerJoin(jobs, eq(userJobs.jobId, jobs.id))
      .orderBy(desc(userJobs.createdAt));

    return result.map((r) => r.job);
  }

  async getUserAppliedJobs(userId: number): Promise<Job[]> {
    const result = await db
      .select({
        job: jobs,
      })
      .from(userJobs)
      .where(and(eq(userJobs.userId, userId), eq(userJobs.action, "apply")))
      .innerJoin(jobs, eq(userJobs.jobId, jobs.id))
      .orderBy(desc(userJobs.createdAt));

    return result.map((r) => r.job);
  }

  // Anonymous Session methods
  async getAnonymousSession(
    sessionId: string
  ): Promise<AnonymousSession | undefined> {
    const [session] = await db
      .select()
      .from(anonymousSessions)
      .where(eq(anonymousSessions.sessionId, sessionId));
    return session;
  }

  async createAnonymousSession(
    session: InsertAnonymousSession
  ): Promise<AnonymousSession> {
    const [newSession] = await db
      .insert(anonymousSessions)
      .values(session)
      .returning();
    return newSession;
  }

  async updateAnonymousSession(
    sessionId: string,
    data: Partial<InsertAnonymousSession>
  ): Promise<AnonymousSession | undefined> {
    try {
      console.log("Updating session with data:", JSON.stringify(data, null, 2));

      // Hacer una copia segura de los datos
      const safeData: any = { ...data };

      // Manejar correctamente arrays y objetos JSON
      if (safeData.completedModals) {
        // Para completedModals, lo guardaremos como un campo preferences.completedModals
        // en lugar de un campo directo ya que parece haber problemas con arrays
        if (!safeData.preferences) {
          safeData.preferences = {};
        }

        // Guardar completedModals en preferences como JSON
        safeData.preferences = {
          ...safeData.preferences,
          completedModals: Array.isArray(safeData.completedModals)
            ? safeData.completedModals.map((m: string) => String(m))
            : [],
        };

        // Eliminar el campo completedModals directo
        delete safeData.completedModals;
      }

      console.log("Final data for update:", JSON.stringify(safeData, null, 2));

      // Actualizar la sesión con los datos seguros
      const [updatedSession] = await db
        .update(anonymousSessions)
        .set(safeData)
        .where(eq(anonymousSessions.sessionId, sessionId))
        .returning();

      console.log("Session updated successfully:", updatedSession.id);

      // Si tenemos completedModals en preferences, lo extraemos para el objeto de retorno
      const result = { ...updatedSession };
      const prefs = updatedSession.preferences as any;
      if (prefs && prefs.completedModals) {
        (result as any).completedModals = prefs.completedModals;
      }

      return result;
    } catch (error) {
      console.error("Error in updateAnonymousSession:", error);
      throw error; // Re-lanzamos el error para que se maneje en la ruta
    }
  }

  // Session Job methods
  async getSessionJob(id: number): Promise<SessionJob | undefined> {
    const [sessionJob] = await db
      .select()
      .from(sessionJobs)
      .where(eq(sessionJobs.id, id));
    return sessionJob;
  }

  async createSessionJob(sessionJob: InsertSessionJob): Promise<SessionJob> {
    const [newSessionJob] = await db
      .insert(sessionJobs)
      .values(sessionJob)
      .returning();
    return newSessionJob;
  }

  async getSessionLikedJobs(sessionId: string): Promise<Job[]> {
    const result = await db
      .select({
        job: jobs,
      })
      .from(sessionJobs)
      .where(
        and(
          eq(sessionJobs.sessionId, sessionId),
          eq(sessionJobs.action, "like")
        )
      )
      .innerJoin(jobs, eq(sessionJobs.jobId, jobs.id))
      .orderBy(desc(sessionJobs.createdAt));

    return result.map((r) => r.job);
  }
}

// Use DatabaseStorage instead of MemStorage
export const storage = new DatabaseStorage();
