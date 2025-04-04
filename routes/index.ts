import { Express, Request, Response, NextFunction } from 'express';
import { Server } from 'http';
import authRoutes from './auth.routes';
import jobRoutes from './job.routes';
import sessionRoutes from './session.routes';
import occupationRoutes from './occupation.routes';
import syncRoutes from './sync.routes';
import userRoutes from './user.routes';
import { errorHandler, notFoundHandler } from '../middleware/error.middleware';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { startJobSyncScheduler } from '../utils/jobSync';

// Configuración para subida de archivos
const uploadsDir = path.join(process.cwd(), 'uploads');

// Asegurar que la carpeta de uploads exista
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

const upload = multer({ storage: storage });

// Función para registrar todas las rutas
export async function registerRoutes(app: Express): Promise<Server> {
  // Endpoint de salud para verificar que el servidor está funcionando
  app.get('/api/health', (req: Request, res: Response) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Registrar rutas modulares
  app.use('/api', authRoutes);
  app.use('/api', jobRoutes);
  app.use('/api', sessionRoutes);
  app.use('/api', occupationRoutes);
  app.use('/api', syncRoutes);
  app.use('/api', userRoutes);
  
  // Iniciar el programador de sincronización de trabajos
  startJobSyncScheduler();

  // Ruta para subir CV, mantenida aquí por la configuración de multer
  app.post('/api/cv-upload', upload.single('cv'), async (req: Request, res: Response) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No se proporcionó ningún archivo' });
      }

      const filePath = req.file.path;
      res.status(201).json({ success: true, filePath });
    } catch (error) {
      console.error('Error al subir el CV:', error);
      res.status(500).json({ error: 'Error al procesar la subida del archivo' });
    }
  });

  // Middlewares para manejo de errores
  app.use(notFoundHandler);
  app.use(errorHandler);

  const port = process.env.PORT ? parseInt(process.env.PORT) : 5010;
  return app.listen(port, '0.0.0.0', () => {
    console.log(`Servidor iniciado en el puerto ${port}`);
  });
}