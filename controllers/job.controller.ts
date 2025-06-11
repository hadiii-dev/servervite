import { Request, Response, NextFunction } from "express";
import { jobService } from "../services/job.service";
import { NotFoundError, BadRequestError } from "../middleware/error.middleware";
import { SentimentType } from "../schemas";
import { z } from "zod";

// Schema para validar acciones sobre trabajos
const jobActionSchema = z.object({
  jobId: z.number(),
  action: z.enum(["like", "dislike", "view", "save", "apply"]),
  sentiment: z
    .enum(["excited", "interested", "neutral", "doubtful", "negative"])
    .optional(),
});

/**
 * Controlador para obtener todos los trabajos
 */
export const getJobs = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    console.log('🎯 Job controller received request with query:', req.query);

    // Extract all query parameters
    const options: any = {
      limit: req.query.limit ? parseInt(req.query.limit as string) : 20,
      offset: req.query.offset ? parseInt(req.query.offset as string) : 0,
      excludeIds: req.query.excludeIds 
        ? (req.query.excludeIds as string).split(",").map((id) => parseInt(id.trim()))
        : [],
      orderBy: (req.query.orderBy as string) || "recent"
    };

    // Add ISCO groups if provided
    if (req.query.isco_groups) {
      const iscoGroupsStr = req.query.isco_groups as string;
      console.log('📊 Controller received ISCO groups:', iscoGroupsStr);
      options.isco_groups = iscoGroupsStr.split(',').map(g => g.trim());
      console.log('🔄 Controller processed ISCO groups:', options.isco_groups);
    }

    // Add user ID if provided
    if (req.query.userId) {
      options.userId = parseInt(req.query.userId as string);
    }

    // Get jobs with all options
    const jobs = await jobService.getJobs(options);

    console.log("🚀 Controller returning jobs:", jobs.length);
    res.json(jobs);
  } catch (error) {
    next(error);
  }
};

/**
 * Controlador para obtener un trabajo por ID
 */
export const getJobById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const jobId = parseInt(req.params.id);

    if (isNaN(jobId)) {
      throw new BadRequestError("ID de trabajo inválido");
    }

    const job = await jobService.getJobById(jobId);

    if (!job) {
      throw new NotFoundError("Trabajo no encontrado");
    }

    res.json(job);
  } catch (error) {
    next(error);
  }
};

/**
 * Controlador para registrar acción de usuario sobre un trabajo
 */
export const recordUserJobAction = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Verificar que hay un usuario autenticado
    if (!req.user) {
      throw new BadRequestError("Se requiere autenticación para esta acción");
    }

    // Validar datos de entrada
    const validatedData = jobActionSchema.parse(req.body);

    // Verificar que el trabajo existe
    const job = await jobService.getJobById(validatedData.jobId);

    if (!job) {
      throw new NotFoundError("Trabajo no encontrado");
    }

    let userJob;

    // Mapear acción al formato interno
    if (validatedData.action === "like" || validatedData.action === "save") {
      userJob = await jobService.recordUserJobAction(
        //@ts-ignore
        req.user.id,
        validatedData.jobId,
        "save",
        validatedData.sentiment as SentimentType
      );
    } else if (validatedData.action === "apply") {
      userJob = await jobService.recordUserJobAction(
        //@ts-ignore
        req.user.id,
        validatedData.jobId,
        "apply",
        validatedData.sentiment as SentimentType
      );
    } else if (validatedData.action === "dislike") {
      userJob = await jobService.recordUserJobAction(
        //@ts-ignore
        req.user.id,
        validatedData.jobId,
        "reject",
        validatedData.sentiment as SentimentType
      );
    }

    res.json({ success: true, userJob });
  } catch (error) {
    next(error);
  }
};

/**
 * Controlador para obtener los trabajos guardados por un usuario
 */
export const getUserSavedJobs = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = parseInt(req.params.userId);

    if (isNaN(userId)) {
      throw new BadRequestError("ID de usuario inválido");
    }

    // Verificar si el usuario solicitante es el mismo que se quiere consultar
    //@ts-ignore
    if (req.user && req.user.id !== userId) {
      throw new BadRequestError(
        "No puedes ver los trabajos guardados de otro usuario"
      );
    }

    const savedJobs = await jobService.getUserSavedJobs(userId);

    res.json(savedJobs);
  } catch (error) {
    next(error);
  }
};

/**
 * Controlador para obtener los trabajos a los que ha aplicado un usuario
 */
export const getUserAppliedJobs = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = parseInt(req.params.userId);

    if (isNaN(userId)) {
      throw new BadRequestError("ID de usuario inválido");
    }

    // Verificar si el usuario solicitante es el mismo que se quiere consultar
    //@ts-ignore
    if (req.user && req.user.id !== userId) {
      throw new BadRequestError(
        "No puedes ver los trabajos aplicados de otro usuario"
      );
    }

    const appliedJobs = await jobService.getUserAppliedJobs(userId);

    res.json(appliedJobs);
  } catch (error) {
    next(error);
  }
};
