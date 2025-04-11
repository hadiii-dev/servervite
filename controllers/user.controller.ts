import { Request, Response, NextFunction } from "express";
import { userService } from "../services/user.service";
import { z } from "zod";
import { insertUserSchema } from "../schemas";

/**
 * Controlador para obtener un usuario por ID
 */
export const getUserById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = parseInt(req.params.userId);
    if (isNaN(userId)) {
      return res.status(400).json({ error: "ID de usuario inválido" });
    }

    const user = await userService.getUserById(userId);
    if (!user) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    // No enviar la contraseña al cliente
    const { password, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  } catch (error) {
    next(error);
  }
};

/**
 * Controlador para obtener el perfil de un usuario
 */
export const getUserProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = parseInt(req.params.userId);
    if (isNaN(userId)) {
      return res.status(400).json({ error: "ID de usuario inválido" });
    }

    const user = await userService.getUserById(userId);
    if (!user) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    // Obtener ocupaciones del usuario si es necesario
    const userOccupations = await userService.getUserOccupations(userId);

    // No enviar la contraseña al cliente
    const { password, ...userWithoutPassword } = user;
    res.json({
      ...userWithoutPassword,
      profileCompleted: Boolean(user.fullName && user.cvPath),
      occupations: userOccupations,
      workPreferences: user.workPreferences || {},
      education: user.education || {},
      languages: user.languages || {},
      skills: user.skills || [],
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Controlador para actualizar el perfil de un usuario
 */
export const updateUserProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = parseInt(req.params.userId);
    if (isNaN(userId)) {
      return res.status(400).json({ error: "ID de usuario inválido" });
    }

    const updateSchema = z.object({
      username: z.string().optional(),
      email: z.string().email().optional(),
      fullName: z.string().optional(),
      phone: z.string().optional(),
      cvPath: z.string().optional(),
      latitude: z.number().optional(),
      longitude: z.number().optional(),
      workPreferences: z.record(z.unknown()).optional(),
      education: z.record(z.unknown()).optional(),
      languages: z.record(z.unknown()).optional(),
      skills: z.array(z.string()).optional(),
    });

    const updateData = updateSchema.parse(req.body);

    // Update user in storage
    const updatedUser = await userService.updateUser(userId, updateData);

    // No enviar la contraseña al cliente
    const { password, ...userWithoutPassword } = updatedUser;
    res.json({
      ...userWithoutPassword,
      profileCompleted: Boolean(updatedUser.fullName && updatedUser.cvPath),
      workPreferences: updatedUser.workPreferences || {},
      education: updatedUser.education || {},
      languages: updatedUser.languages || {},
      skills: updatedUser.skills || [],
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Controlador para crear un nuevo usuario
 */
export const createUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userData = insertUserSchema
      .extend({
        password: z
          .string()
          .min(6, "La contraseña debe tener al menos 6 caracteres"),
      })
      .parse(req.body);

    // Verificar si el usuario ya existe
    const existingUser = await userService.getUserByUsername(userData.username);
    if (existingUser) {
      return res
        .status(409)
        .json({ error: "El nombre de usuario ya está en uso" });
    }

    const user = await userService.createUser(userData);

    // No enviar la contraseña al cliente
    const { password, ...userWithoutPassword } = user;
    res.status(201).json(userWithoutPassword);
  } catch (error) {
    next(error);
  }
};
