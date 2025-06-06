import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import multer, { FileFilterCallback } from "multer";
import fs from "fs";
import path from "path";
import { z } from "zod";
import { v4 as uuidv4 } from "uuid";
import {
  insertUserSchema,
  insertAnonymousSessionSchema,
  insertSessionJobSchema,
  insertUserJobSchema,
  insertUserOccupationSchema,
  User,
} from "./schemas";
import { getRecommendedJobs } from "./utils/jobMatcher";
import { startJobSyncScheduler } from "./utils/jobSync";
import { cleanHtmlText, decodeHtmlEntities } from "./utils/textUtils";
import * as authController from "./controllers/auth.controller";
import { db } from "./db";
import { sql } from "drizzle-orm";

// Ensure uploads directory exists
// const uploadsDir = path.join(process.cwd(), "uploads");
// if (!fs.existsSync(uploadsDir)) {
//   fs.mkdirSync(uploadsDir, { recursive: true });
// }

// Configure multer for file uploads
// const storage_config = multer.diskStorage({
//   destination: (req: Request, file: Express.Multer.File, cb: (error: Error | null, destination: string) => void) => {
//     const userDir = path.join(uploadsDir, "cvs");
//     if (!fs.existsSync(userDir)) {
//       fs.mkdirSync(userDir, { recursive: true });
//     }
//     cb(null, userDir);
//   },
//   filename: (req: Request, file: Express.Multer.File, cb: (error: Error | null, filename: string) => void) => {
//     const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
//     const ext = path.extname(file.originalname);
//     cb(null, uniqueSuffix + ext);
//   }
// });

// const upload = multer({
//   storage: storage_config,
//   limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
//   fileFilter: (req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
//     // Accept pdf, doc, docx, rtf
//     const allowedFileTypes = ['.pdf', '.doc', '.docx', '.rtf'];
//     const ext = path.extname(file.originalname).toLowerCase();
//     if (allowedFileTypes.includes(ext)) {
//       cb(null, true);
//     } else {
//       cb(new Error('Invalid file type. Only PDF, DOC, DOCX, and RTF are allowed.'));
//     }
//   }
// });

export async function registerRoutes(app: Express): Promise<Server> {

  app.get('/api/data/isco-groups', async (req, res) => {
    try {
      const groups = await db.execute(sql`
        SELECT * FROM isco_groups
        ORDER BY code
      `);
      res.json(groups.rows);
    } catch (error) {
      console.error('Error fetching ISCO groups:', error);
      res.status(500).json({ error: 'Failed to fetch ISCO groups' });
    }
  });
  
  // Get all ESCO occupations
  app.get('/api/data/esco-occupations', async (req, res) => {
    try {
      const occupations = await db.execute(sql`
        SELECT * FROM occupationsNew
      `);
      res.json(occupations.rows);
    } catch (error) {
      console.error('Error fetching ESCO occupations:', error);
      res.status(500).json({ error: 'Failed to fetch ESCO occupations' });
    }
  });
  
  // Get all skills
  app.get('/api/data/skills', async (req, res) => {
    try {
      const skills = await db.execute(sql`
        SELECT * FROM skillsnew
        
      `);
      res.json(skills.rows);
    } catch (error) {
      console.error('Error fetching skills:', error);
      res.status(500).json({ error: 'Failed to fetch skills' });
    }
  });
  
  // Get all occupation-skill relations
  app.get('/api/data/occupation-skill-relations', async (req, res) => {
    try {
      const relations = await db.execute(sql`
        SELECT * FROM occupation_skill_relations_new
        ORDER BY occupation_uri, skill_uri
      `);
      res.json(relations.rows);
    } catch (error) {
      console.error('Error fetching occupation-skill relations:', error);
      res.status(500).json({ error: 'Failed to fetch occupation-skill relations' });
    }
  });
  
  // Get occupation with its skills
  app.get('/api/data/occupations/:uri/skills', async (req, res) => {
    try {
      const { uri } = req.params;
      
      // Get occupation details
      const occupation = await db.execute(sql`
        SELECT * FROM occupations
        WHERE concept_uri = ${uri}
      `);
  
      if (!occupation.rows.length) {
        return res.status(404).json({ error: 'Occupation not found' });
      }
  
      // Get related skills
      const skills = await db.execute(sql`
        SELECT s.* 
        FROM skills s
        JOIN occupation_skill_relations_new osr ON s.uri = osr.skill_uri
        WHERE osr.occupation_uri = ${uri}
        ORDER BY s.title
      `);
  
      res.json({
        occupation: occupation.rows[0],
        skills: skills.rows
      });
    } catch (error) {
      console.error('Error fetching occupation skills:', error);
      res.status(500).json({ error: 'Failed to fetch occupation skills' });
    }
  });
  
  // Get skill with related occupations
  app.get('/api/data/skills/:uri/occupations', async (req, res) => {
    try {
      const { uri } = req.params;
      
      // Get skill details
      const skill = await db.execute(sql`
        SELECT * FROM skills
        WHERE uri = ${uri}
      `);
  
      if (!skill.rows.length) {
        return res.status(404).json({ error: 'Skill not found' });
      }
  
      // Get related occupations
      const occupations = await db.execute(sql`
        SELECT o.* 
        FROM occupations o
        JOIN occupation_skill_relations_new osr ON o.concept_uri = osr.occupation_uri
        WHERE osr.skill_uri = ${uri}
        ORDER BY o.preferred_label
      `);
  
      res.json({
        skill: skill.rows[0],
        occupations: occupations.rows
      });
    } catch (error) {
      console.error('Error fetching skill occupations:', error);
      res.status(500).json({ error: 'Failed to fetch skill occupations' });
    }
  });






  // Check server health
  app.get("/api/health", async (req: Request, res: Response) => {
    res.json({ status: "ok" });
  });

  // Get all users
  app.get("/api/users", async (req: Request, res: Response) => {
    try {
      const users = await storage.getUsers();
      
      // Format user data to exclude sensitive information
      // const formattedUsers = users.map((user: User) => ({
      //   id: user.id,
      //   username: user.username,
      //   email: user.email,
      //   fullName: user.fullName,
      //   phone: user.phone,
      //   skills: user.skills || [],
      //   createdAt: user.createdAt
      // }));
      
      res.json(users);
    } catch (error) {
      console.error("Error retrieving users:", error);
      res.status(500).json({ error: "Failed to retrieve users" });
    }
  });

  // Get user by ID
  app.get("/api/users/:userId", async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.userId);
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      
      // Format user data to exclude sensitive information
      const formattedUser = {
        id: user.id,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        phone: user.phone,
        skills: user.skills || [],
        createdAt: user.createdAt
      };
      
      res.json(formattedUser);
    } catch (error) {
      console.error("Error retrieving user:", error);
      res.status(500).json({ error: "Failed to retrieve user" });
    }
  });
  // Session management
  app.post("/api/session", async (req: Request, res: Response) => {
    try {
      const sessionId = uuidv4();
      const sessionData = insertAnonymousSessionSchema.parse({
        sessionId,
        preferences: {},
        skills: [],
        profileCompleted: false,
        locationPermission: false,
      });
      const session = await storage.createAnonymousSession(sessionData);
      res.status(201).json({ sessionId: session.sessionId });
    } catch (error) {
      console.error("Error creating session:", error);
      res.status(400).json({ error: "Failed to create session" });
    }
  });

  // Get session data
  app.get("/api/session/:sessionId", async (req: Request, res: Response) => {
    try {
      const sessionId = req.params.sessionId;
      const session = await storage.getAnonymousSession(sessionId);
      if (!session) {
        return res.status(404).json({ error: "Session not found" });
      }
      res.json(session);
    } catch (error) {
      res.status(500).json({ error: "Failed to get session data" });
    }
  });

  // Update session profile data
  app.patch("/api/session/:sessionId", async (req: Request, res: Response) => {
    try {
      const sessionId = req.params.sessionId;
      const session = await storage.getAnonymousSession(sessionId);
      if (!session) {
        return res.status(404).json({ error: "Session not found" });
      }

      // Validate and update the session
      const updateSchema = z.object({
        skills: z.array(z.string()).optional(),
        professionalTitle: z.string().optional(),
        yearsOfExperience: z.number().int().min(0).optional(),
        profileCompleted: z.boolean().optional(),
        preferences: z.record(z.unknown()).optional(),
        // Añadimos campos nuevos para el perfil anónimo
        workPreferences: z
          .object({
            scheduleType: z
              .enum(["full_time", "part_time", "flexible"])
              .optional(),
            workMode: z.enum(["remote", "hybrid", "on_site"]).optional(),
            minSalary: z.number().optional(),
            willingToTravel: z.boolean().optional(),
          })
          .optional(),
        completedModals: z.array(z.string()).optional(),
        nextModalToShow: z.string().optional(),
        education: z.record(z.unknown()).optional(),
        languages: z.record(z.unknown()).optional(),
        hasUploadedCV: z.boolean().optional(),
        cvPath: z.string().optional(),
        photoPath: z.string().optional(),
        latitude: z.number().optional(),
        longitude: z.number().optional(),
        locationPermission: z.boolean().optional(),
      });

      const updateData = updateSchema.parse(req.body);
      const updatedSession = await storage.updateAnonymousSession(
        sessionId,
        updateData
      );

      res.json(updatedSession);
    } catch (error) {
      if (error instanceof z.ZodError) {
        console.error("Validation error in session update:", error.format());
        return res
          .status(400)
          .json({ error: "Invalid data format", details: error.format() });
      }
      console.error("Error updating session:", error);
      res.status(500).json({
        error: "Failed to update session data",
        message: error instanceof Error ? error.message : String(error),
      });
    }
  });

  // User registration
  app.post("/api/users", async (req: Request, res: Response) => {
    try {
      console.log(
        "Recibiendo datos de registro:",
        JSON.stringify(req.body, null, 2)
      );
      const userData = insertUserSchema.parse(req.body);
      console.log(
        "Datos validados correctamente:",
        JSON.stringify(userData, null, 2)
      );
      const user = await storage.createUser(userData);
      
      // Return the full user data
      res.status(201).json({
        id: user.id,
        username: user.username,
        email: user.email,
        phone: user.phone,
        fullName: user.fullName,
        cvPath: user.cvPath,
        latitude: user.latitude,
        longitude: user.longitude,
        profileCompleted: Boolean(user.fullName && user.cvPath),
        firebaseId: user.firebaseId,
        firebaseToken: user.firebaseToken,
        workPreferences: user.workPreferences || {},
        education: user.education || {},
        languages: user.languages || {},
        skills: user.skills || [],
        basicData: user.basicData || {},
        savedJobs: user.savedJobs || [],
      });
    } catch (error) {
      console.error("Error al crear usuario:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          error: "Datos de usuario inválidos",
          details: error.format(),
        });
      }
      // Más detalles para errores de base de datos (como duplicados)
      const errorMessage =
        error instanceof Error ? error.message : "Error desconocido";
      res.status(400).json({
        error: "No se pudo crear el usuario",
        message: errorMessage,
      });
    }
  });

  // User login
  app.post("/api/login", async (req: Request, res: Response) => {
    try {
      const { username, password } = z
        .object({
          username: z.string(),
          password: z.string(),
        })
        .parse(req.body);

      const user = await storage.getUserByUsername(username);
      if (!user || user.password !== password) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      res.json({ id: user.id, username: user.username });
    } catch (error) {
      res.status(400).json({ error: "Invalid login data" });
    }
  });

  // CV upload
  // app.post("/api/cv-upload", upload.single('cv'), async (req: Request, res: Response) => {
  //   try {
  //     if (!req.file) {
  //       return res.status(400).json({ error: "No file uploaded" });
  //     }

  //     res.json({ filePath: req.file.path });
  //   } catch (error) {
  //     res.status(500).json({ error: "Failed to upload CV" });
  //   }
  // });

  // Get jobs
  app.get("/api/jobs", async (req: Request, res: Response) => {
    try {
      const sessionId = req.query.sessionId as string;
      const userId = req.query.userId
        ? parseInt(req.query.userId as string)
        : undefined;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;
      const offset = req.query.offset
        ? parseInt(req.query.offset as string)
        : 0;
      const excludeIdsStr = (req.query.excludeIds as string) || "";
      const excludeIds = excludeIdsStr
        ? excludeIdsStr.split(",").map((id) => parseInt(id))
        : [];
      const orderBy = (req.query.orderBy as string) || "recent";

      // Set up options for pagination, exclusion, and ordering
      const options: any = { limit, offset, excludeIds, orderBy };

      // Add ISCO group filtering if provided
      if (req.query.isco_groups) {
        options.isco_groups = (req.query.isco_groups as string).split(',');
      }

      let jobs;
      if (userId) {
        // User is logged in, get user profile for filtering
        const user = await storage.getUser(userId);
        if (user) {
          options.isco_groups = user.isco_groups || [];
          options.occupations = user.occupations || [];
        }
        jobs = await storage.getJobs(options);
      } else if (sessionId) {
        // Anonymous user with session, get recommendations based on session with pagination
        jobs = await getRecommendedJobs(undefined, sessionId, options);
      } else {
        // New user, get jobs with pagination
        jobs = await storage.getJobs(options);
      }

      // Clean HTML from job descriptions and decode HTML entities in titles for any existing jobs
      const cleanedJobs = jobs.map((job) => ({
        ...job,
        title: job.title ? decodeHtmlEntities(job.title) : job.title,
        company: job.company ? decodeHtmlEntities(job.company) : job.company,
        location: job.location
          ? decodeHtmlEntities(job.location)
          : job.location,
        description: job.description ? cleanHtmlText(job.description) : null,
      }));

      res.json(cleanedJobs);
    } catch (error) {
      res.status(500).json({ error: "Failed to get jobs" });
    }
  });

  // Get job by ID
  app.get("/api/jobs/:id", async (req: Request, res: Response) => {
    try {
      const jobId = parseInt(req.params.id);
      const job = await storage.getJob(jobId);

      if (!job) {
        return res.status(404).json({ error: "Job not found" });
      }

      // Clean HTML from job description and decode HTML entities in title, company, and location
      const cleanedJob = {
        ...job,
        title: job.title ? decodeHtmlEntities(job.title) : job.title,
        company: job.company ? decodeHtmlEntities(job.company) : job.company,
        location: job.location
          ? decodeHtmlEntities(job.location)
          : job.location,
        description: job.description ? cleanHtmlText(job.description) : null,
      };

      res.json(cleanedJob);
    } catch (error) {
      res.status(500).json({ error: "Failed to get job" });
    }
  });

  // Record job action (like/dislike/apply) for a user
  app.post("/api/user-jobs", async (req: Request, res: Response) => {
    try {
      const userJobData = insertUserJobSchema.parse(req.body);
      const userJob = await storage.createUserJob(userJobData);
      res.status(201).json(userJob);
    } catch (error) {
      res.status(400).json({ error: "Invalid job action data" });
    }
  });

  // Record job action for anonymous session
  app.post("/api/session-jobs", async (req: Request, res: Response) => {
    try {
      const sessionJobData = insertSessionJobSchema.parse(req.body);
      const sessionJob = await storage.createSessionJob(sessionJobData);
      res.status(201).json(sessionJob);
    } catch (error) {
      res.status(400).json({ error: "Invalid session job action data" });
    }
  });

  // Get user saved jobs
  app.get(
    "/api/users/:userId/saved-jobs",
    async (req: Request, res: Response) => {
      try {
        const userId = parseInt(req.params.userId);
        const savedJobs = await storage.getUserSavedJobs(userId);

        // Clean HTML from job descriptions and decode HTML entities in titles for saved jobs
        const cleanedJobs = savedJobs.map((job) => ({
          ...job,
          title: job.title ? decodeHtmlEntities(job.title) : job.title,
          company: job.company ? decodeHtmlEntities(job.company) : job.company,
          location: job.location
            ? decodeHtmlEntities(job.location)
            : job.location,
          description: job.description ? cleanHtmlText(job.description) : null,
        }));

        res.json(cleanedJobs);
      } catch (error) {
        res.status(500).json({ error: "Failed to get saved jobs" });
      }
    }
  );

  // Get user applied jobs
  app.get(
    "/api/users/:userId/applied-jobs",
    async (req: Request, res: Response) => {
      try {
        const userId = parseInt(req.params.userId);
        const appliedJobs = await storage.getUserAppliedJobs(userId);

        // Clean HTML from job descriptions and decode HTML entities in titles for applied jobs
        const cleanedJobs = appliedJobs.map((job) => ({
          ...job,
          title: job.title ? decodeHtmlEntities(job.title) : job.title,
          company: job.company ? decodeHtmlEntities(job.company) : job.company,
          location: job.location
            ? decodeHtmlEntities(job.location)
            : job.location,
          description: job.description ? cleanHtmlText(job.description) : null,
        }));

        res.json(cleanedJobs);
      } catch (error) {
        res.status(500).json({ error: "Failed to get applied jobs" });
      }
    }
  );

  // Get user profile data
  app.get("/api/users/:firebaseId/profile", async (req: Request, res: Response) => {
    try {
      const firebaseId = req.params.firebaseId;
      const user = await storage.getUserByFirebaseId(firebaseId);

      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      // Get user occupations to enrich profile data
      const userOccupations = await storage.getUserOccupationsByUserId(user.id);

      // Format user profile data
      const profile = {
        id: user.id,
        username: user.username,
        email: user.email,
        phone: user.phone,
        fullName: user.fullName,
        cvPath: user.cvPath,
        latitude: user.latitude,
        longitude: user.longitude,
        profileCompleted: Boolean(user.fullName && user.cvPath),
        occupations: userOccupations,
        // Additional profile fields from JSON fields
        workPreferences: user.workPreferences || {},
        education: user.education || {},
        languages: user.languages || {},
        skills: user.skills || [],
        basicData: user.basicData || {},
        savedJobs: user.savedJobs || [],
      };

      res.json(profile);
    } catch (error) {
      console.error("Error getting user profile:", error);
      res.status(500).json({ error: "Failed to get user profile" });
    }
  });

  // Update user profile data
  app.patch(
    "/api/users/:firebaseId/profile",
    async (req: Request, res: Response) => {
      try {
        const firebaseId = req.params.firebaseId;
        const user = await storage.getUserByFirebaseId(firebaseId);

        if (!user) {
          return res.status(404).json({ error: "User not found" });
        }

        // Validate update data
        const updateSchema = z.object({
          fullName: z.string().optional(),
          email: z.string().email().optional(),
          phone: z.string().optional(),
          cvPath: z.string().optional(),
          latitude: z.number().optional(),
          longitude: z.number().optional(),
          workPreferences: z.record(z.unknown()).optional(),
          education: z.record(z.unknown()).optional(),
          languages: z.record(z.unknown()).optional(),
          skills: z.array(z.string()).optional(),
          firebaseId: z.string(),
          firebaseToken: z.string(),
        });

        const updateData = updateSchema.parse(req.body);

        // Update user in storage
        const updatedUser = await storage.updateUser(user.id, updateData);

        res.json({
          id: updatedUser.id,
          username: updatedUser.username,
          email: updatedUser.email,
          phone: updatedUser.phone,
          fullName: updatedUser.fullName,
          cvPath: updatedUser.cvPath,
          profileCompleted: Boolean(updatedUser.fullName && updatedUser.cvPath),
          firebaseId: updatedUser.firebaseId,
          firebaseToken: updatedUser.firebaseToken,
          // Include additional updated fields
          workPreferences: updatedUser.workPreferences || {},
          education: updatedUser.education || {},
          languages: updatedUser.languages || {},
          skills: updatedUser.skills || [],
        });
      } catch (error) {
        if (error instanceof z.ZodError) {
          return res
            .status(400)
            .json({ error: "Invalid data format", details: error.format() });
        }
        console.error("Error updating user profile:", error);
        res.status(500).json({ error: "Failed to update user profile" });
      }
    }
  );

  // Synchronize jobs from XML feed
  app.post("/api/sync-jobs", async (req: Request, res: Response) => {
    try {
      // This would typically be a protected route in production
      const xmlUrl =
        req.body.xmlUrl ||
        "https://app.ktitalentindicator.com/xml/jobs_clasificados.xml";

      // Import the syncJobsFromXML function only when needed
      const { syncJobsFromXML } = await import("./utils/jobSync");

      // Execute the sync
      const result = await syncJobsFromXML(xmlUrl);
      console.log("🚀 ~ app.post ~ result:", result);

      res.json(result);
    } catch (error) {
      console.error("Error syncing jobs:", error);
      res.status(500).json({ error: "Failed to sync jobs" });
    }
  });

  // NEW: Batched sync endpoint for handling large job imports
  app.post("/api/sync-jobs-batch", async (req: Request, res: Response) => {
    try {
      console.log("🚀 Starting batched job sync...");

      // Get batch size from request (default 500 jobs per batch)
      const batchSize = req.body.batchSize || 500;
      const maxJobs = req.body.maxJobs || null; // Optional limit

      // Use the same XML URL as the regular sync
      const xmlUrl = req.body.xmlUrl || 
        "https://app.ktitalentindicator.com/xml/jobs_clasificados.xml";

      // Import required functions
      const { fetchJobsFromXML } = await import("./utils/xmlParser");
      const { storage } = await import("./storage");

      // Fetch all jobs from XML
      console.log("📡 Fetching jobs from XML...");
      const allJobs = await fetchJobsFromXML(xmlUrl);
      console.log(`✅ Found ${allJobs.length} jobs in XML`);

      // Limit jobs if maxJobs is specified
      const jobsToProcess = maxJobs ? allJobs.slice(0, maxJobs) : allJobs;

      let totalProcessed = 0;
      let newJobsAdded = 0;
      let duplicatesSkipped = 0;
      const startTime = Date.now();

      // Process jobs in batches
      for (let i = 0; i < jobsToProcess.length; i += batchSize) {
        const batch = jobsToProcess.slice(i, i + batchSize);
        const batchNumber = Math.floor(i / batchSize) + 1;
        const totalBatches = Math.ceil(jobsToProcess.length / batchSize);

        console.log(`🔄 Processing batch ${batchNumber}/${totalBatches} (${batch.length} jobs)...`);

        // Process each job in the batch
        for (const job of batch) {
          try {
            // Check if job already exists
            const existingJob = await storage.getJobByExternalId(job.externalId || '');

            if (!existingJob) {
              // Create new job
              await storage.createJob(job);
              newJobsAdded++;
            } else {
              duplicatesSkipped++;
            }

            totalProcessed++;
          } catch (error) {
            console.error(`❌ Error processing job ${job.externalId}:`, error);
          }
        }

        // Log progress
        const progress = ((i + batch.length) / jobsToProcess.length * 100).toFixed(1);
        console.log(`📊 Progress: ${progress}% - New jobs: ${newJobsAdded}, Duplicates: ${duplicatesSkipped}`);

        // Small delay between batches to prevent overwhelming the database
        if (i + batchSize < jobsToProcess.length) {
          await new Promise(resolve => setTimeout(resolve, 250));
        }
      }

      const endTime = Date.now();
      const durationSeconds = (endTime - startTime) / 1000;

      console.log("✅ Batched sync completed!");

      res.json({
        success: true,
        message: `Batched sync completed successfully`,
        summary: {
          totalJobsInXML: allJobs.length,
          jobsProcessed: totalProcessed,
          newJobsAdded: newJobsAdded,
          duplicatesSkipped: duplicatesSkipped,
          batchSize: batchSize,
          durationSeconds: Math.round(durationSeconds),
          averageJobsPerSecond: Math.round(totalProcessed / durationSeconds)
        }
      });

    } catch (error) {
      console.error("❌ Batched sync failed:", error);
      res.status(500).json({ 
        error: "Batched sync failed",
        //@ts-ignore 
        details: error.message 
      });
    }
  });

  app.post("/register", authController.register);

  app.get("/api/users/:id", authController.getProfile);

  // Import occupations from CSV
  app.post("/api/import-occupations", async (req: Request, res: Response) => {
    try {
      const language = (req.query.language as string) || "all";
      const results = { es: 0, en: 0, total: 0 };

      // Import Spanish occupations if requested or if all languages
      if (language === "es" || language === "all") {
        const esPath = path.join(
          process.cwd(),
          "attached_assets",
          "occupations_es.csv"
        );
        if (fs.existsSync(esPath)) {
          results.es = await storage.importOccupationsFromCSV(esPath);
          console.log(`Imported ${results.es} Spanish occupations`);
        } else {
          console.warn("Spanish occupations file not found");
        }
      }

      // Import English occupations if requested or if all languages
      if (language === "en" || language === "all") {
        const enPath = path.join(
          process.cwd(),
          "attached_assets",
          "occupations_en.csv"
        );
        if (fs.existsSync(enPath)) {
          results.en = await storage.importOccupationsFromCSV(enPath);
          console.log(`Imported ${results.en} English occupations`);
        } else {
          console.warn("English occupations file not found");
        }
      }

      // Calculate total
      results.total = results.es + results.en;

      res.json({
        status: "ok",
        occupationsImported: results.total,
        details: results,
      });
    } catch (error) {
      console.error("Failed to import occupations:", error);
      res.status(500).json({ error: "Failed to import occupations" });
    }
  });

  // Start the job sync scheduler to run in the background
  startJobSyncScheduler();

  const httpServer = createServer(app);
  return httpServer;
}
