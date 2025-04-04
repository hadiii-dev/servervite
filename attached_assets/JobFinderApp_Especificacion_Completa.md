# Especificación Completa - Job Finder App para iOS y Android

**Fecha:** 26 de marzo de 2025  
**Versión:** 2.0

## Índice

1. [Descripción General del Proyecto](#1-descripción-general-del-proyecto)
2. [Funcionalidades Principales](#2-funcionalidades-principales)
3. [Flujo de Usuario](#3-flujo-de-usuario)
4. [Especificaciones de Pantallas](#4-especificaciones-de-pantallas)
5. [Especificaciones Técnicas](#5-especificaciones-técnicas)
6. [Modelo de Datos](#6-modelo-de-datos)
7. [API y Endpoints](#7-api-y-endpoints)
8. [Internacionalización](#8-internacionalización)
9. [Especificaciones de Diseño](#9-especificaciones-de-diseño)
10. [Plan de Implementación](#10-plan-de-implementación)

---

## 1. Descripción General del Proyecto

La aplicación Job Finder es una plataforma móvil innovadora diseñada para transformar la búsqueda de empleo mediante una interfaz moderna de coincidencia tipo "Tinder" y un proceso de creación de perfil progresivo. La aplicación permite a los usuarios descubrir ofertas de trabajo deslizando tarjetas a la derecha (me gusta) o izquierda (no me interesa), mientras aprende de sus preferencias para mejorar las recomendaciones con el tiempo.

### Objetivos Principales

1. Crear una experiencia de búsqueda de empleo intuitiva y atractiva
2. Permitir exploración anónima antes de requerir registro
3. Implementar un sistema de creación de perfil gradual que no sobrecargue al usuario
4. Proporcionar recomendaciones de trabajo inteligentes basadas en interacciones previas
5. Ofrecer una aplicación completamente funcional en inglés y español con detección automática de idioma

### Público Objetivo

- Profesionales en búsqueda activa de empleo
- Usuarios que exploran oportunidades laborales de manera pasiva
- Personas en transición de carrera
- Recién graduados

---

## 2. Funcionalidades Principales

### 1. Interfaz de Descubrimiento de Empleos

- **Mecanismo de Deslizamiento Tipo Tinder**: Los usuarios pueden deslizar hacia la derecha para expresar interés en un trabajo o hacia la izquierda para descartarlo
- **Interfaz Basada en Tarjetas**: Cada trabajo se muestra como una tarjeta con información clave (título, empresa, ubicación, salario)
- **Detalles del Trabajo**: Al tocar una tarjeta de trabajo se revela información detallada, incluyendo descripción completa, requisitos y detalles de la empresa
- **Reacciones con Emojis**: Los usuarios pueden expresar su sentimiento sobre un trabajo utilizando emojis (entusiasmado, interesado, neutral, dudoso, negativo)

### 2. Creación de Perfil Progresiva

La aplicación implementa un proceso de creación de perfil paso a paso:

- **Navegación Anónima**: Los usuarios pueden comenzar a explorar trabajos inmediatamente sin crear una cuenta
- **Modales Progresivos**: Después de varias interacciones, la aplicación solicita a los usuarios completar su perfil a través de una serie de pantallas modales enfocadas
- **Pasos del Perfil**:
  1. Perfil Básico: Título profesional, años de experiencia
  2. Preferencias Laborales: Tipo de horario, modalidad de trabajo, salario mínimo, disponibilidad para viajar
  3. Educación: Nivel educativo, campo de estudio, certificaciones
  4. Idiomas: Idioma principal y competencia, idiomas adicionales
  5. Subida de CV: Carga de documento de currículum
  6. Registro: Crear cuenta con nombre de usuario/contraseña para guardar progreso

### 3. Funciones de Cuenta de Usuario

- **Gestión de Perfil**: Ver y editar información personal y preferencias
- **Trabajos Guardados**: Acceder a la lista de trabajos en los que el usuario ha expresado interés
- **Trabajos Aplicados**: Seguimiento de trabajos a los que el usuario ha aplicado formalmente
- **Preferencias de Ocupación**: Explorar y seleccionar ocupaciones preferidas para mejorar las recomendaciones

### 4. Soporte de Ubicación e Idioma

- **Geolocalización**: Utiliza la ubicación del dispositivo (con permiso) para recomendar trabajos cercanos
- **Soporte Multilingüe**: Detección automática de idioma entre inglés y español basada en la ubicación del usuario
- **Filtrado Remoto/Híbrido/Presencial**: Filtrar trabajos por modalidad con indicadores visuales

### 5. Recomendaciones Inteligentes

- **Algoritmo de Aprendizaje**: El sistema aprende de las interacciones del usuario para mejorar las recomendaciones de trabajo con el tiempo
- **Coincidencia por Similitud**: Sugiere trabajos similares a aquellos que al usuario le han gustado previamente
- **Conciencia de Ubicación**: Prioriza trabajos basados en proximidad y preferencias de trabajo remoto

---

## 3. Flujo de Usuario

### Flujo de Usuario Nuevo

```
┌─────────────────┐
│ Lanzamiento de  │
│ Aplicación      │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Navegación      │
│ Anónima         │◄───────────┐
└────────┬────────┘            │
         │                      │
         │ Después de 4+ interacciones
         ▼                      │
┌─────────────────┐            │
│ Modal de Perfil │            │
│ Básico          │────────────┘
└────────┬────────┘   Continuar navegando
         │
         │ Después de 10+ interacciones
         ▼
┌─────────────────┐
│ Modal de        │
│ Preferencias    │────────────┐
└────────┬────────┘            │
         │                      │
         │ Después de más interacciones
         ▼                      │
┌─────────────────┐            │
│ Modal de        │            │
│ Educación       │────────────┘
└────────┬────────┘   Continuar navegando
         │
         │ Después de más interacciones
         ▼
┌─────────────────┐
│ Modal de        │
│ Idiomas         │────────────┐
└────────┬────────┘            │
         │                      │
         │ Después de más interacciones
         ▼                      │
┌─────────────────┐            │
│ Modal de        │            │
│ Subida de CV    │────────────┘
└────────┬────────┘   Continuar navegando
         │
         │ Inmediatamente después de subir CV
         ▼
┌─────────────────┐
│ Modal de        │
│ Registro        │
└────────┬────────┘
         │
         │ Cuenta creada
         ▼
┌─────────────────┐
│ Inicio Usuario  │
│ (Descubrimiento)│
└─────────────────┘
```

### Flujo de Usuario que Regresa

```
┌─────────────────┐
│ Lanzamiento de  │
│ Aplicación      │
└────────┬────────┘
         │
         │ Previamente conectado
         ▼                      
┌─────────────────┐            ┌─────────────────┐
│ Inicio Usuario  │            │ Pantalla de     │
│ (Descubrimiento)│◄───────────┤ Login (si sesión│
└────────┬────────┘  Éxito     │ expirada)       │
         │                      └─────────────────┘
         │
         ▼
┌───────────────────────────────────────────────────┐
│                                                   │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────┐│
│  │ Inicio      │    │ Guardados   │    │ Perfil  ││
│  └─────────────┘    └─────────────┘    └─────────┘│
│                                                   │
└───────────────────────────────────────────────────┘
```

## 4. Especificaciones de Pantallas

### 1. Descubrimiento de Empleo Inicial (Anónimo)

**Punto de Entrada:** Lanzamiento de la aplicación para el usuario por primera vez

**Elementos de la Pantalla:**
- Encabezado con logo de la app e icono de menú
- Pila de tarjetas de empleo (interfaz principal)
- Botones de acción debajo de las tarjetas (X, info, ✓)
- Indicador de progreso mostrando las tarjetas en el lote actual

**Interacciones del Usuario:**
1. El usuario ve la tarjeta de trabajo mostrando título, empresa, ubicación y detalles clave
2. El usuario puede:
   - Deslizar a la derecha para dar like a un trabajo
   - Deslizar a la izquierda para descartar un trabajo
   - Tocar el botón de info para ver detalles completos
   - Usar los botones de acción como alternativas al deslizamiento

**Puntos de Transición:**
- Después de 4+ interacciones con trabajos: Aparece el Modal de Perfil Básico
- Al tocar el botón de info: Se abre el Modal de Detalles del Trabajo

**Estados:**
- Estado vacío: "Buscando trabajos cerca de ti..." con animación
- Estado de error: "No se pueden cargar trabajos" con botón de reintentar
- Estado de carga: Tarjeta esqueleto con efecto shimmer

### 2. Modal de Perfil Básico

**Punto de Entrada:** Automáticamente después de 4+ interacciones con trabajos

**Elementos de la Pantalla:**
- Título del modal: "Cuéntanos sobre ti"
- Indicador de progreso (1 de 5)
- Campos del formulario:
  - Título Profesional (entrada de texto)
  - Años de Experiencia (entrada numérica o slider)
- Botón de Continuar
- Opción "Omitir por ahora" (texto pequeño debajo del botón)

**Interacciones del Usuario:**
1. El usuario completa los campos del formulario
2. El usuario toca Continuar para guardar la información
3. Alternativamente, el usuario puede omitir este paso

**Puntos de Transición:**
- Continuar/Omitir: Volver a Descubrimiento de Empleo
- Después de 10+ interacciones más: Aparece el Modal de Preferencias Laborales

**Almacenamiento de Datos:**
- Datos guardados en la sesión anónima

### 3. Modal de Preferencias Laborales

**Punto de Entrada:** Automáticamente después de 10+ interacciones con trabajos desde el último modal

**Elementos de la Pantalla:**
- Título del modal: "Tus Preferencias Laborales"
- Indicador de progreso (2 de 5)
- Campos del formulario:
  - Tipo de Horario (tiempo completo, medio tiempo, flexible) [botones de selección]
  - Modalidad de Trabajo (remoto, híbrido, presencial) [botones de selección]
  - Salario Mínimo (slider o entrada)
  - Disponible para Viajar (interruptor)
- Botón de Continuar
- Opción "Omitir por ahora"

**Interacciones del Usuario:**
1. El usuario selecciona sus preferencias
2. El usuario toca Continuar para guardar la información

**Puntos de Transición:**
- Continuar/Omitir: Volver a Descubrimiento de Empleo
- Después de más interacciones: Aparece el Modal de Educación

**Almacenamiento de Datos:**
- Datos guardados en la sesión anónima bajo preferences.workPreferences

### 4. Modal de Educación

**Punto de Entrada:** Automáticamente después de más interacciones con trabajos

**Elementos de la Pantalla:**
- Título del modal: "Tu Educación"
- Indicador de progreso (3 de 5)
- Campos del formulario:
  - Nivel de Educación (desplegable)
  - Campo de Estudio (entrada de texto)
  - Certificaciones (campo de entrada múltiple)
- Botón de Continuar
- Opción "Omitir por ahora"

**Interacciones del Usuario:**
1. El usuario completa los campos del formulario
2. El usuario toca Continuar para guardar la información

**Puntos de Transición:**
- Continuar/Omitir: Volver a Descubrimiento de Empleo
- Después de más interacciones: Aparece el Modal de Idiomas

**Almacenamiento de Datos:**
- Datos guardados en la sesión anónima bajo preferences.education

### 5. Modal de Idiomas

**Punto de Entrada:** Automáticamente después de más interacciones con trabajos

**Elementos de la Pantalla:**
- Título del modal: "Idiomas que Hablas"
- Indicador de progreso (4 de 5)
- Campos del formulario:
  - Idioma Principal (desplegable)
  - Nivel de Competencia (desplegable)
  - Idiomas Adicionales (sección repetible)
    - Idioma (desplegable)
    - Nivel de Competencia (desplegable)
  - Botón "Añadir Otro Idioma"
- Botón de Continuar
- Opción "Omitir por ahora"

**Interacciones del Usuario:**
1. El usuario completa los campos del formulario
2. El usuario puede añadir múltiples idiomas
3. El usuario toca Continuar para guardar la información

**Puntos de Transición:**
- Continuar/Omitir: Volver a Descubrimiento de Empleo
- Después de más interacciones: Aparece el Modal de Subida de CV

**Almacenamiento de Datos:**
- Datos guardados en la sesión anónima bajo preferences.languages

### 6. Modal de Subida de CV

**Punto de Entrada:** Automáticamente después de más interacciones con trabajos

**Elementos de la Pantalla:**
- Título del modal: "Sube tu Currículum"
- Indicador de progreso (5 de 5)
- Área de subida de archivo (tocar o arrastrar)
- Información de formato de archivo
- Botón de Subir (deshabilitado hasta que se seleccione un archivo)
- Opción "Omitir por ahora"

**Interacciones del Usuario:**
1. El usuario toca el área de subida para seleccionar archivo CV
2. El sistema muestra vista previa del archivo seleccionado
3. El usuario toca Subir para enviar el archivo

**Puntos de Transición:**
- Después de subida exitosa: Aparece el Modal de Registro inmediatamente
- Omitir: Volver a Descubrimiento de Empleo (el Modal de Registro seguirá apareciendo después de algunas interacciones más)

**Almacenamiento de Datos:**
- Archivo CV guardado en el servidor
- Ruta del archivo almacenada en la sesión anónima

### 7. Modal de Registro

**Punto de Entrada:** Inmediatamente después de la subida del CV o después de varias interacciones más si se omitió la subida del CV

**Elementos de la Pantalla:**
- Título del modal: "Crea tu Cuenta"
- Campos del formulario:
  - Nombre de Usuario (entrada de texto)
  - Email (entrada de texto)
  - Contraseña (entrada de contraseña)
  - Número de Teléfono (entrada de texto opcional)
- Botón "Crear Cuenta"
- Enlace "¿Ya tienes una cuenta? Inicia sesión"

**Interacciones del Usuario:**
1. El usuario completa el formulario de registro
2. El usuario toca "Crear Cuenta" para enviar

**Puntos de Transición:**
- Registro exitoso: Inicio de Usuario (estado conectado)
- Enlace de inicio de sesión: Modal de Inicio de Sesión

**Almacenamiento de Datos:**
- Nuevo usuario creado en la base de datos
- Todos los datos de la sesión anónima transferidos a la cuenta de usuario

### 8. Modal de Detalles del Trabajo

**Punto de Entrada:** Tocar el botón de info o la tarjeta de trabajo

**Elementos de la Pantalla:**
- Logo y nombre de la empresa
- Título del trabajo
- Ubicación con indicador remoto/híbrido/presencial
- Información de salario
- Descripción completa (texto formateado)
- Sección de requisitos
- Selector de sentimiento con emojis
- Botones de acción:
  - Aplicar (botón primario)
  - Guardar (botón secundario)
  - Descartar (botón fantasma)
- Botón de Cerrar (X) en la esquina superior

**Interacciones del Usuario:**
1. El usuario lee los detalles completos del trabajo
2. El usuario puede seleccionar un emoji para expresar sentimiento
3. El usuario puede aplicar, guardar o descartar el trabajo

**Puntos de Transición:**
- Botón de cerrar: Volver a la pantalla anterior
- Botón de aplicar: 
  - Si está conectado: Confirmación de aplicación
  - Si es anónimo: Modal de Registro
- Botón de guardar: Trabajo guardado (notificación toast)
- Botón de descartar: Volver a la pila de trabajos

**Estados:**
- Estado de carga: Diseño esqueleto con efecto shimmer

### 9. Inicio de Usuario (Conectado)

**Punto de Entrada:** Después de inicio de sesión o registro

**Elementos de la Pantalla:**
- Encabezado con avatar de usuario/menú
- Pila de tarjetas de trabajo (como en modo anónimo)
- Botones de acción (como en modo anónimo)
- Barra de navegación inferior

**Interacciones del Usuario:**
1. Mismas interacciones de navegación de trabajos que el modo anónimo
2. Acceso a funciones adicionales a través de la navegación inferior

**Puntos de Transición:**
- Navegación inferior: Pantallas de Trabajos Guardados, Trabajos Aplicados, Perfil
- Menú: Configuración, Cerrar Sesión, etc.

### 10. Pantalla de Trabajos Guardados

**Punto de Entrada:** Navegación inferior - pestaña Trabajos Guardados

**Elementos de la Pantalla:**
- Título de la pantalla: "Trabajos Guardados"
- Barra de búsqueda/filtro
- Opciones de ordenación (desplegable)
- Lista de tarjetas de trabajos guardados
- Botón de Aplicar en cada tarjeta
- Funcionalidad Pull-to-refresh

**Interacciones del Usuario:**
1. El usuario navega por los trabajos guardados
2. El usuario puede buscar o filtrar la lista
3. El usuario puede tocar un trabajo para ver detalles
4. El usuario puede tocar Aplicar directamente desde la lista

**Puntos de Transición:**
- Toque en tarjeta de trabajo: Modal de Detalles del Trabajo
- Botón de Aplicar: Confirmación de aplicación

**Estados:**
- Estado vacío: "No tienes trabajos guardados aún. ¡Comienza a deslizar para encontrar trabajos que te gusten!"
- Estado de carga: Lista de tarjetas esqueleto

### 11. Pantalla de Trabajos Aplicados

**Punto de Entrada:** Navegación inferior - pestaña Trabajos Aplicados

**Elementos de la Pantalla:**
- Título de la pantalla: "Trabajos Aplicados"
- Barra de búsqueda/filtro
- Opciones de ordenación (desplegable)
- Lista de tarjetas de trabajos aplicados con indicadores de estado
- Insignias de estado (Aplicado, En Proceso, etc.)
- Funcionalidad Pull-to-refresh

**Interacciones del Usuario:**
1. El usuario navega por los trabajos aplicados
2. El usuario puede buscar o filtrar la lista
3. El usuario puede tocar un trabajo para ver detalles

**Puntos de Transición:**
- Toque en tarjeta de trabajo: Modal de Detalles del Trabajo con estado de aplicación

**Estados:**
- Estado vacío: "Aún no has aplicado a ningún empleo"
- Estado de carga: Lista de tarjetas esqueleto

### 12. Pantalla de Perfil

**Punto de Entrada:** Navegación inferior - pestaña Perfil

**Elementos de la Pantalla:**
- Encabezado de perfil con foto/nombre de usuario
- Indicador de porcentaje de completado del perfil
- Tarjetas de sección:
  - Información Personal
  - Preferencias Laborales
  - Educación
  - Idiomas
  - Habilidades
- Tarjeta de CV con miniatura de vista previa
- Botones de edición para cada sección

**Interacciones del Usuario:**
1. El usuario ve la información del perfil
2. El usuario puede tocar botones de edición para modificar secciones
3. El usuario puede tocar el CV para ver el documento subido

**Puntos de Transición:**
- Botones de edición: Modal de edición correspondiente para esa sección
- Miniatura del CV: Vista previa del CV

**Estados:**
- Estado de carga: UI esqueleto para secciones del perfil

### 13. Pantalla de Selección de Ocupación

**Punto de Entrada:** Menú de perfil o después del registro

**Elementos de la Pantalla:**
- Título de la pantalla: "Categorías de Empleo"
- Texto de instrucción: "Desliza a la derecha en las ocupaciones que te interesan"
- Pila de tarjetas de ocupación (similar a las tarjetas de trabajo)
- Botones de acción (X, info, ✓)

**Interacciones del Usuario:**
1. El usuario ve tarjetas de ocupación una por una
2. El usuario desliza a la derecha para ocupaciones de interés
3. El usuario desliza a la izquierda para ocupaciones que no son de interés
4. El usuario puede tocar info para aprender más sobre una ocupación

**Puntos de Transición:**
- Después de seleccionar ocupaciones: Volver a la pantalla anterior
- Botón de info: Modal de detalles de ocupación

**Estados:**
- Estado de carga: Tarjeta de ocupación esqueleto
- Estado de completado: "Gracias por seleccionar tus preferencias"

## 5. Especificaciones Técnicas

### Pila Tecnológica

1. **Frontend (Mobile)**
   - Framework: React Native
   - State Management: Redux o Context API
   - Navigation: React Navigation
   - Styling: Styled Components o React Native Paper
   - Formularios: Formik + Yup
   - Animations: React Native Reanimated

2. **Backend**
   - Framework: Node.js con Express
   - Base de Datos: PostgreSQL
   - ORM: Drizzle ORM
   - Autenticación: JWT (JSON Web Tokens)
   - File Storage: Sistema de archivos local o Amazon S3

3. **Integraciones**
   - Importación de datos de trabajos desde feed XML
   - Servicios de geocodificación para funciones basadas en ubicación
   - APIs de detección de idioma/traducción (opcional)

### Requisitos Técnicos Clave

1. **Rendimiento**
   - Tiempo de carga inicial < 3 segundos en conexiones 4G
   - Animaciones fluidas (60fps) para el deslizamiento de tarjetas
   - Paginación eficiente para listas largas con virtualización

2. **Offline Support**
   - Almacenamiento en caché básico para trabajos vistos recientemente
   - Cola de acciones (likes, dislikes) para sincronizar cuando esté en línea
   - Manejo de interrupciones de red con reintentos automáticos

3. **Seguridad**
   - Almacenamiento seguro de tokens (Keychain en iOS, EncryptedSharedPreferences en Android)
   - Validación de datos tanto en cliente como en servidor
   - Protección contra ataques comunes (inyección SQL, XSS)
   - Cifrado de datos sensibles

4. **Accesibilidad**
   - Compatibilidad con lectores de pantalla (VoiceOver en iOS, TalkBack en Android)
   - Alternativas a gestos de deslizamiento para usuarios con discapacidades motoras
   - Suficiente contraste de color y tamaños de texto ajustables
   - Soporte para el modo de alto contraste del sistema

## 6. Modelo de Datos

### Estructura de Base de Datos

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

### Esquemas JSON para Campos Complejos

#### workPreferences

```json
{
  "scheduleType": "full_time | part_time | flexible",
  "workMode": "remote | hybrid | on_site",
  "minSalary": 40000,
  "willingToTravel": true
}
```

#### education

```json
{
  "level": "high_school | bachelor | master | phd",
  "field": "Computer Science",
  "certifications": ["AWS Certified Developer", "PMP"]
}
```

#### languages

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

#### preferences (en anonymousSessions)

```json
{
  "completedModals": ["basic", "preferences", "education", "languages", "cv_upload"],
  "nextModalToShow": "registration",
  "workPreferences": { /* igual que workPreferences del usuario */ },
  "education": { /* igual que education del usuario */ },
  "languages": { /* igual que languages del usuario */ }
}
```

## 7. API y Endpoints

### Gestión de Sesiones

#### Crear Sesión Anónima

- **URL**: `/api/session`
- **Método**: `POST`
- **Autenticación**: Ninguna
- **Cuerpo de la Solicitud**: Vacío
- **Respuesta**:
  ```json
  {
    "sessionId": "2cc8413e-163f-4bef-9046-481eb5315add"
  }
  ```

#### Obtener Datos de Sesión

- **URL**: `/api/session/:sessionId`
- **Método**: `GET`
- **Autenticación**: Ninguna
- **Parámetros de URL**: `sessionId` - El ID de sesión anónima
- **Respuesta**: Objeto de sesión con datos de perfil anónimo

#### Actualizar Datos de Sesión

- **URL**: `/api/session/:sessionId`
- **Método**: `PATCH`
- **Autenticación**: Ninguna
- **Parámetros de URL**: `sessionId` - El ID de sesión anónima
- **Cuerpo de la Solicitud**: Campos a actualizar
- **Respuesta**: Objeto de sesión actualizado

### Gestión de Usuarios

#### Registrar Usuario

- **URL**: `/api/users`
- **Método**: `POST`
- **Autenticación**: Ninguna
- **Cuerpo de la Solicitud**: Datos de usuario completos
- **Respuesta**: ID de usuario y nombre de usuario

#### Inicio de Sesión

- **URL**: `/api/login`
- **Método**: `POST`
- **Autenticación**: Ninguna
- **Cuerpo de la Solicitud**: Credenciales (nombre de usuario, contraseña)
- **Respuesta**: Token JWT, ID de usuario y nombre de usuario

#### Obtener Perfil de Usuario

- **URL**: `/api/users/:userId/profile`
- **Método**: `GET`
- **Autenticación**: Requerida
- **Respuesta**: Datos de perfil completos

#### Actualizar Perfil de Usuario

- **URL**: `/api/users/:userId/profile`
- **Método**: `PATCH`
- **Autenticación**: Requerida
- **Cuerpo de la Solicitud**: Campos de perfil a actualizar
- **Respuesta**: Perfil actualizado

### Operaciones de Trabajo

#### Obtener Trabajos

- **URL**: `/api/jobs`
- **Método**: `GET`
- **Autenticación**: Opcional
- **Parámetros de Consulta**: Opciones de filtrado, paginación
- **Respuesta**: Array de objetos de trabajo

#### Obtener Detalles de Trabajo

- **URL**: `/api/jobs/:id`
- **Método**: `GET`
- **Autenticación**: Opcional
- **Respuesta**: Objeto de trabajo detallado

#### Registrar Acción de Trabajo de Usuario

- **URL**: `/api/user-jobs`
- **Método**: `POST`
- **Autenticación**: Requerida
- **Cuerpo de la Solicitud**: Datos de interacción (userId, jobId, action, sentiment)
- **Respuesta**: Confirmación de la acción registrada

#### Registrar Acción de Trabajo de Sesión Anónima

- **URL**: `/api/session-jobs`
- **Método**: `POST`
- **Autenticación**: Ninguna
- **Cuerpo de la Solicitud**: Datos de interacción (sessionId, jobId, action, sentiment)
- **Respuesta**: Confirmación de la acción registrada

#### Obtener Trabajos Guardados de Usuario

- **URL**: `/api/users/:userId/saved-jobs`
- **Método**: `GET`
- **Autenticación**: Requerida
- **Respuesta**: Array de trabajos guardados

#### Obtener Trabajos Aplicados de Usuario

- **URL**: `/api/users/:userId/applied-jobs`
- **Método**: `GET`
- **Autenticación**: Requerida
- **Respuesta**: Array de trabajos aplicados

### Gestión de Ocupaciones

#### Obtener Ocupaciones

- **URL**: `/api/occupations`
- **Método**: `GET`
- **Autenticación**: Opcional
- **Parámetros de Consulta**: Término de búsqueda opcional
- **Respuesta**: Array de ocupaciones

#### Guardar Preferencia de Ocupación de Usuario

- **URL**: `/api/user-occupations`
- **Método**: `POST`
- **Autenticación**: Requerida
- **Cuerpo de la Solicitud**: Datos de preferencia (userId, occupationId, liked)
- **Respuesta**: Confirmación de la preferencia guardada

### Subida de Documentos

#### Subir CV

- **URL**: `/api/cv-upload`
- **Método**: `POST`
- **Autenticación**: Opcional
- **Tipo de Contenido**: `multipart/form-data`
- **Parámetros de Formulario**: Archivo CV
- **Respuesta**: Ruta del archivo guardado

## 8. Internacionalización

### Idiomas Soportados

- **Inglés** (idioma predeterminado)
- **Español** (soporte completo)

### Flujo de Detección de Idioma

1. **Preferencia Almacenada**: 
   - Verificar si el usuario ha seleccionado previamente una preferencia de idioma
   - Si se encuentra, usar este idioma

2. **Locale del Dispositivo**:
   - Si no hay preferencia almacenada, verificar el locale actual del dispositivo
   - Analizar el locale para determinar el idioma (ej. "en-US" → Inglés, "es-ES" → Español)

3. **Geolocalización**:
   - Si se concede permiso, usar la ubicación del dispositivo
   - Determinar si la ubicación está en un país de habla hispana
   - Países/regiones de habla hispana incluyen:
     - España, México, Colombia, Argentina, Perú, Venezuela, Chile, Ecuador, Guatemala, Cuba, Bolivia, República Dominicana, Honduras, Paraguay, El Salvador, Nicaragua, Costa Rica, Panamá, Uruguay, Puerto Rico, Guinea Ecuatorial

4. **Predeterminado**:
   - Si ninguno de los métodos anteriores arroja un idioma soportado, predeterminar a Inglés

### Estructura de Archivos de Traducción

- `/locales/en/translation.json` - Traducciones en inglés
- `/locales/es/translation.json` - Traducciones en español

### Implementación de i18next

```javascript
// i18n.ts
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { NativeModules, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import { getCountryFromCoordinates } from './locationUtils';

// Importar traducciones
import enTranslation from './locales/en/translation.json';
import esTranslation from './locales/es/translation.json';

// Definir recursos
const resources = {
  en: {
    translation: enTranslation,
  },
  es: {
    translation: esTranslation,
  },
};

// Función de detección de idioma
const detectUserLanguage = async (): Promise<string> => {
  try {
    // 1. Verificar preferencia de idioma almacenada
    const storedLanguage = await AsyncStorage.getItem('userLanguage');
    if (storedLanguage) return storedLanguage;
    
    // 2. Verificar locale del dispositivo
    const deviceLanguage = 
      Platform.OS === 'ios'
        ? NativeModules.SettingsManager.settings.AppleLocale ||
          NativeModules.SettingsManager.settings.AppleLanguages[0]
        : NativeModules.I18nManager.localeIdentifier;
    
    const languageCode = deviceLanguage.substring(0, 2);
    if (['en', 'es'].includes(languageCode)) return languageCode;
    
    // 3. Intentar geolocalización
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status === 'granted') {
      const location = await Location.getCurrentPositionAsync({});
      const country = await getCountryFromCoordinates(
        location.coords.latitude,
        location.coords.longitude
      );
      
      const spanishCountries = [
        'ES', 'MX', 'CO', 'AR', 'PE', 'VE', 'CL', 'EC', 'GT', 'CU',
        'BO', 'DO', 'HN', 'PY', 'SV', 'NI', 'CR', 'PA', 'UY', 'PR', 'GQ'
      ];
      
      if (spanishCountries.includes(country)) {
        return 'es';
      }
    }
    
    // 4. Predeterminar a inglés
    return 'en';
  } catch (error) {
    console.error('Error detecting language:', error);
    return 'en'; // Predeterminar a inglés en caso de error
  }
};

// Inicializar i18next
const initializeI18n = async () => {
  const detectedLanguage = await detectUserLanguage();
  
  i18n
    .use(initReactI18next)
    .init({
      resources,
      lng: detectedLanguage,
      fallbackLng: 'en',
      interpolation: {
        escapeValue: false,
      },
      react: {
        useSuspense: false,
      },
    });
};

// Función para cambiar idioma
export const changeLanguage = async (lng: string) => {
  await AsyncStorage.setItem('userLanguage', lng);
  return i18n.changeLanguage(lng);
};

// Inicializar
initializeI18n();

export default i18n;
```

## 9. Especificaciones de Diseño

### Colores

- **Color Primario**: #4F46E5 (Índigo)
- **Color Secundario**: #10B981 (Esmeralda)
- **Fondo**: #F9FAFB (Gris Claro)
- **Texto**: #1F2937 (Gris Oscuro)
- **Éxito**: #22C55E (Verde)
- **Advertencia**: #F59E0B (Ámbar)
- **Error**: #EF4444 (Rojo)
- **Insignia Remoto**: #10B981 (Verde)
- **Insignia Híbrido**: #6366F1 (Índigo)
- **Insignia Presencial**: #F97316 (Naranja)

### Tipografía

- **Fuente Principal**: SF Pro (iOS) / Roboto (Android)
- **Encabezados**: Negrita, tamaños 24px (h1), 20px (h2), 18px (h3)
- **Texto de Cuerpo**: Regular, tamaño 16px
- **Texto Pequeño**: Regular, tamaño 14px
- **Texto de Botón**: Medio, tamaño 16px

### Animaciones e Interacciones

- **Deslizamiento de Tarjetas**: Animación suave con efecto de rotación
- **Transiciones de Modal**: Animación de deslizamiento hacia arriba
- **Retroalimentación de Botones**: Efecto sutil de escala al presionar
- **Estados de Carga**: Pantallas esqueleto en lugar de spinners donde sea posible
- **Pull to Refresh**: En listas de trabajos y secciones guardadas/aplicadas

### Componentes Clave

#### Tarjeta de Trabajo
- Altura: 320dp
- Ancho: 90% del ancho de pantalla
- Radio de borde: 12dp
- Sombra: Elevación 3dp
- Degradado de fondo sutil basado en categoría

#### Botones
- Altura: 48dp
- Radio de borde: 8dp
- Padding horizontal: 16dp
- Estados: Normal, Presionado, Deshabilitado

#### Modales
- Radio de borde superior: 16dp
- Padding: 24dp
- Altura máxima: 80% de la altura de pantalla

#### Campos de Formulario
- Altura: 56dp
- Radio de borde: 8dp
- Padding horizontal: 16dp
- Estados: Normal, Enfocado, Error, Deshabilitado

## 10. Plan de Implementación

### Fases de Desarrollo

1. **Configuración y Autenticación** (2 semanas)
   - Configuración del proyecto con React Native
   - Implementación del flujo de autenticación
   - Gestión de sesiones

2. **Componentes UI Principales** (3 semanas)
   - Componente de tarjeta de trabajo
   - Interacción de deslizamiento
   - Navegación básica

3. **Creación de Perfil** (3 semanas)
   - Secuencia de modal progresivo
   - Implementación de formularios
   - Subida de documentos

4. **Funcionalidades de Descubrimiento de Empleo** (4 semanas)
   - Integración de API para listados de trabajo
   - Integración de algoritmo de recomendación
   - Seguimiento de interacción de trabajo

5. **Perfil e Historial** (2 semanas)
   - Implementación de trabajos guardados
   - Seguimiento de trabajos aplicados
   - Gestión de perfil

6. **Refinamiento** (3 semanas)
   - Internacionalización
   - Capacidades offline
   - Optimización de rendimiento

7. **Pruebas y Despliegue** (3 semanas)
   - Pruebas en múltiples dispositivos
   - Pruebas de rendimiento
   - Preparación para envío a App Store

### Requisitos de Prueba

1. **Pruebas de Usabilidad**
   - Pruebas con usuarios reales en flujos clave
   - Optimización basada en retroalimentación de usuarios

2. **Pruebas de Compatibilidad**
   - iOS: Probar en iPhone SE, iPhone 14, iPad
   - Android: Probar en dispositivos de gama baja, media y alta

3. **Pruebas de Rendimiento**
   - Rendimiento de animaciones en dispositivos de gama baja
   - Uso de memoria y CPU durante el deslizamiento
   - Pruebas con conexiones de red lentas

4. **Pruebas de Internacionalización**
   - Verificar que todos los textos estén traducidos
   - Comprobar la detección automática de idioma
   - Validar el formato de fechas, números y monedas

### Conclusión

Esta aplicación Job Finder para iOS y Android tiene como objetivo revolucionar la experiencia de búsqueda de empleo combinando interacciones de deslizamiento intuitivas con creación de perfil progresiva y coincidencia inteligente de trabajo. La implementación de React Native garantizará una experiencia de usuario consistente en todas las plataformas manteniendo alto rendimiento y capacidad de respuesta.