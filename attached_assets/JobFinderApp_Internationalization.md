# Job Finder App - Internationalization Implementation Guide

## Overview

The Job Finder application supports multiple languages with automatic language detection based on user location. This document provides a detailed guide on implementing internationalization (i18n) in the React Native version of the application.

## Supported Languages

The application currently supports:

1. **English** (default language)
2. **Spanish** (full support)

The system is designed to be easily expanded to support additional languages in the future.

## Language Detection Flow

```
┌─────────────────┐
│ Application     │
│ Launch          │
└────────┬────────┘
         │
         ▼
┌─────────────────┐     ┌─────────────────┐
│ Check Stored    │     │ Use Stored      │
│ Language        ├────►│ Language        │
└────────┬────────┘ Yes └─────────────────┘
         │ No
         ▼
┌─────────────────┐     ┌─────────────────┐
│ Check Device    │     │ Use Device      │
│ Locale          ├────►│ Locale Language │
└────────┬────────┘ Yes └─────────────────┘
         │ No
         ▼
┌─────────────────┐
│ Request         │
│ Location        │
└────────┬────────┘
         │
         ▼
┌─────────────────┐     ┌─────────────────┐
│ Location in     │     │ Set Language    │
│ Spanish Region? ├────►│ to Spanish      │
└────────┬────────┘ Yes └─────────────────┘
         │ No
         ▼
┌─────────────────┐
│ Default to      │
│ English         │
└─────────────────┘
```

## Language Determination Logic

1. **Stored Preference**: 
   - Check if the user has previously selected a language preference
   - If found, use this language

2. **Device Locale**:
   - If no stored preference, check the device's current locale
   - Parse the locale to determine language (e.g., "en-US" → English, "es-ES" → Spanish)

3. **Geolocation**:
   - If permission granted, use the device's location
   - Determine if the location is in a Spanish-speaking country
   - Spanish-speaking countries/regions include:
     - Spain, Mexico, Colombia, Argentina, Peru, Venezuela, Chile, Ecuador, Guatemala, Cuba, Bolivia, Dominican Republic, Honduras, Paraguay, El Salvador, Nicaragua, Costa Rica, Panama, Uruguay, Puerto Rico, Equatorial Guinea

4. **Default**:
   - If none of the above methods yield a supported language, default to English

## Implementation Details

### 1. Core Internationalization Structure

#### Setting Up i18next in React Native

```javascript
// i18n.ts
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { NativeModules, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import { getCountryFromCoordinates } from './locationUtils';

// Import translations
import enTranslation from './locales/en/translation.json';
import esTranslation from './locales/es/translation.json';

// Define resources
const resources = {
  en: {
    translation: enTranslation,
  },
  es: {
    translation: esTranslation,
  },
};

// Language detection function
const detectUserLanguage = async (): Promise<string> => {
  try {
    // 1. Check stored language preference
    const storedLanguage = await AsyncStorage.getItem('userLanguage');
    if (storedLanguage) return storedLanguage;
    
    // 2. Check device locale
    const deviceLanguage = 
      Platform.OS === 'ios'
        ? NativeModules.SettingsManager.settings.AppleLocale ||
          NativeModules.SettingsManager.settings.AppleLanguages[0]
        : NativeModules.I18nManager.localeIdentifier;
    
    const languageCode = deviceLanguage.substring(0, 2);
    if (['en', 'es'].includes(languageCode)) return languageCode;
    
    // 3. Try geolocation
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
    
    // 4. Default to English
    return 'en';
  } catch (error) {
    console.error('Error detecting language:', error);
    return 'en'; // Default to English on error
  }
};

// Initialize i18next
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

// Function to change language
export const changeLanguage = async (lng: string) => {
  await AsyncStorage.setItem('userLanguage', lng);
  return i18n.changeLanguage(lng);
};

// Initialize
initializeI18n();

export default i18n;
```

### 2. Location Utilities

```javascript
// locationUtils.ts
import axios from 'axios';

// Get country code from coordinates using reverse geocoding
export const getCountryFromCoordinates = async (
  latitude: number, 
  longitude: number
): Promise<string> => {
  try {
    // Use a reverse geocoding service
    // This is a placeholder - replace with your preferred geocoding API
    const response = await axios.get(
      `https://api.opencagedata.com/geocode/v1/json?q=${latitude}+${longitude}&key=YOUR_API_KEY`
    );
    
    if (response.data && 
        response.data.results && 
        response.data.results.length > 0) {
      return response.data.results[0].components.country_code.toUpperCase();
    }
    
    return '';
  } catch (error) {
    console.error('Error getting country from coordinates:', error);
    return '';
  }
};
```

### 3. Translations Structure

#### English Translation Example

```json
// locales/en/translation.json
{
  "app": {
    "name": "Job Finder",
    "tagline": "Swipe your way to your dream job"
  },
  "actions": {
    "like": "Like",
    "dislike": "Discard",
    "apply": "Apply",
    "save": "Save",
    "info": "Details",
    "continue": "Continue",
    "skip": "Skip for now",
    "submit": "Submit",
    "upload": "Upload",
    "register": "Create Account",
    "login": "Log In",
    "logout": "Log Out"
  },
  "navigation": {
    "home": "Home",
    "savedJobs": "Saved Jobs",
    "appliedJobs": "Applied Jobs",
    "profile": "Profile",
    "settings": "Settings"
  },
  "jobCard": {
    "salary": "Salary",
    "location": "Location",
    "remote": "Remote",
    "hybrid": "Hybrid",
    "onSite": "On-site",
    "posted": "Posted",
    "skills": "Skills"
  },
  "profile": {
    "title": "Your Profile",
    "completion": "Profile Completion",
    "basicInfo": "Basic Information",
    "workPreferences": "Work Preferences",
    "education": "Education",
    "languages": "Languages",
    "skills": "Skills",
    "cv": "Resume/CV",
    "editProfile": "Edit Profile"
  },
  "profileModals": {
    "basicProfile": {
      "title": "Tell us about yourself",
      "professionalTitle": "Professional Title",
      "professionalTitlePlaceholder": "e.g. Software Developer",
      "yearsOfExperience": "Years of Experience"
    },
    "workPreferences": {
      "title": "Your Work Preferences",
      "scheduleType": "Schedule Type",
      "fullTime": "Full-time",
      "partTime": "Part-time",
      "flexible": "Flexible",
      "workMode": "Work Mode",
      "remote": "Remote",
      "hybrid": "Hybrid",
      "onSite": "On-site",
      "minSalary": "Minimum Salary",
      "willingToTravel": "Willing to Travel"
    },
    "education": {
      "title": "Your Education",
      "level": "Education Level",
      "highSchool": "High School",
      "associate": "Associate Degree",
      "bachelor": "Bachelor's Degree",
      "master": "Master's Degree",
      "phd": "PhD",
      "field": "Field of Study",
      "fieldPlaceholder": "e.g. Computer Science",
      "certifications": "Certifications",
      "certificationsPlaceholder": "e.g. AWS Certified Developer",
      "addCertification": "Add Certification"
    },
    "languages": {
      "title": "Languages You Speak",
      "primaryLanguage": "Primary Language",
      "level": "Proficiency Level",
      "native": "Native",
      "fluent": "Fluent",
      "advanced": "Advanced",
      "intermediate": "Intermediate",
      "basic": "Basic",
      "addLanguage": "Add Another Language"
    },
    "cvUpload": {
      "title": "Upload Your Resume",
      "dragDrop": "Drag and drop your file here, or click to browse",
      "formats": "Supported formats: PDF, DOCX, DOC (max 5MB)",
      "uploadButton": "Upload Resume"
    },
    "registration": {
      "title": "Create Your Account",
      "username": "Username",
      "email": "Email",
      "password": "Password",
      "confirmPassword": "Confirm Password",
      "phone": "Phone Number (optional)",
      "alreadyHaveAccount": "Already have an account? Log in"
    }
  },
  "occupations": {
    "title": "Job Categories",
    "instruction": "Swipe right on occupations that interest you",
    "swiped": "{{count}} occupations selected"
  },
  "savedJobs": {
    "title": "Saved Jobs",
    "empty": "No saved jobs yet. Start swiping to find jobs you like!",
    "filter": "Filter",
    "sort": "Sort",
    "search": "Search saved jobs..."
  },
  "appliedJobs": {
    "title": "Applied Jobs",
    "empty": "You haven't applied to any jobs yet",
    "filter": "Filter",
    "sort": "Sort",
    "search": "Search applied jobs...",
    "status": "Status",
    "applied": "Applied",
    "inProgress": "In Progress",
    "interviewed": "Interviewed",
    "offered": "Offered",
    "rejected": "Rejected"
  },
  "jobDetails": {
    "aboutCompany": "About the Company",
    "description": "Job Description",
    "requirements": "Requirements",
    "responsibilities": "Responsibilities",
    "benefits": "Benefits",
    "applyNow": "Apply Now",
    "similarJobs": "Similar Jobs",
    "howDoYouFeel": "How do you feel about this job?"
  },
  "settings": {
    "title": "Settings",
    "language": "Language",
    "notifications": "Notifications",
    "location": "Location Access",
    "darkMode": "Dark Mode",
    "accountSettings": "Account Settings",
    "about": "About",
    "help": "Help & Support",
    "privacy": "Privacy Policy",
    "terms": "Terms of Service",
    "logout": "Log Out"
  },
  "errors": {
    "connectionError": "Connection error. Please check your internet.",
    "loginFailed": "Login failed. Please check your credentials.",
    "registrationFailed": "Registration failed. Please try again.",
    "uploadFailed": "Upload failed. Please try again.",
    "locationError": "Couldn't get your location. Please check permissions."
  },
  "sentiments": {
    "excited": "Excited",
    "interested": "Interested",
    "neutral": "Neutral",
    "doubtful": "Doubtful",
    "negative": "Not for me"
  }
}
```

#### Spanish Translation Example

```json
// locales/es/translation.json
{
  "app": {
    "name": "Buscador de Empleos",
    "tagline": "Desliza para encontrar tu trabajo ideal"
  },
  "actions": {
    "like": "Me gusta",
    "dislike": "Descartar",
    "apply": "Aplicar",
    "save": "Guardar",
    "info": "Detalles",
    "continue": "Continuar",
    "skip": "Omitir por ahora",
    "submit": "Enviar",
    "upload": "Subir",
    "register": "Crear Cuenta",
    "login": "Iniciar Sesión",
    "logout": "Cerrar Sesión"
  },
  "navigation": {
    "home": "Inicio",
    "savedJobs": "Empleos Guardados",
    "appliedJobs": "Empleos Aplicados",
    "profile": "Perfil",
    "settings": "Configuración"
  },
  "jobCard": {
    "salary": "Salario",
    "location": "Ubicación",
    "remote": "Remoto",
    "hybrid": "Híbrido",
    "onSite": "Presencial",
    "posted": "Publicado",
    "skills": "Habilidades"
  },
  "profile": {
    "title": "Tu Perfil",
    "completion": "Completado del Perfil",
    "basicInfo": "Información Básica",
    "workPreferences": "Preferencias Laborales",
    "education": "Educación",
    "languages": "Idiomas",
    "skills": "Habilidades",
    "cv": "Currículum",
    "editProfile": "Editar Perfil"
  },
  "profileModals": {
    "basicProfile": {
      "title": "Cuéntanos sobre ti",
      "professionalTitle": "Título Profesional",
      "professionalTitlePlaceholder": "ej. Desarrollador de Software",
      "yearsOfExperience": "Años de Experiencia"
    },
    "workPreferences": {
      "title": "Tus Preferencias Laborales",
      "scheduleType": "Tipo de Horario",
      "fullTime": "Tiempo Completo",
      "partTime": "Medio Tiempo",
      "flexible": "Flexible",
      "workMode": "Modalidad de Trabajo",
      "remote": "Remoto",
      "hybrid": "Híbrido",
      "onSite": "Presencial",
      "minSalary": "Salario Mínimo",
      "willingToTravel": "Disponible para Viajar"
    },
    "education": {
      "title": "Tu Educación",
      "level": "Nivel Educativo",
      "highSchool": "Bachillerato",
      "associate": "Técnico Superior",
      "bachelor": "Grado Universitario",
      "master": "Máster",
      "phd": "Doctorado",
      "field": "Campo de Estudio",
      "fieldPlaceholder": "ej. Informática",
      "certifications": "Certificaciones",
      "certificationsPlaceholder": "ej. Desarrollador Certificado AWS",
      "addCertification": "Añadir Certificación"
    },
    "languages": {
      "title": "Idiomas que Hablas",
      "primaryLanguage": "Idioma Principal",
      "level": "Nivel de Competencia",
      "native": "Nativo",
      "fluent": "Fluido",
      "advanced": "Avanzado",
      "intermediate": "Intermedio",
      "basic": "Básico",
      "addLanguage": "Añadir Otro Idioma"
    },
    "cvUpload": {
      "title": "Sube tu Currículum",
      "dragDrop": "Arrastra y suelta tu archivo aquí, o haz clic para explorar",
      "formats": "Formatos compatibles: PDF, DOCX, DOC (máx 5MB)",
      "uploadButton": "Subir Currículum"
    },
    "registration": {
      "title": "Crea tu Cuenta",
      "username": "Nombre de Usuario",
      "email": "Correo Electrónico",
      "password": "Contraseña",
      "confirmPassword": "Confirmar Contraseña",
      "phone": "Número de Teléfono (opcional)",
      "alreadyHaveAccount": "¿Ya tienes una cuenta? Inicia sesión"
    }
  },
  "occupations": {
    "title": "Categorías de Empleo",
    "instruction": "Desliza a la derecha las ocupaciones que te interesan",
    "swiped": "{{count}} ocupaciones seleccionadas"
  },
  "savedJobs": {
    "title": "Empleos Guardados",
    "empty": "Aún no tienes empleos guardados. ¡Comienza a deslizar para encontrar empleos que te gusten!",
    "filter": "Filtrar",
    "sort": "Ordenar",
    "search": "Buscar empleos guardados..."
  },
  "appliedJobs": {
    "title": "Empleos Aplicados",
    "empty": "Aún no has aplicado a ningún empleo",
    "filter": "Filtrar",
    "sort": "Ordenar",
    "search": "Buscar empleos aplicados...",
    "status": "Estado",
    "applied": "Aplicado",
    "inProgress": "En Proceso",
    "interviewed": "Entrevistado",
    "offered": "Oferta Recibida",
    "rejected": "Rechazado"
  },
  "jobDetails": {
    "aboutCompany": "Sobre la Empresa",
    "description": "Descripción del Empleo",
    "requirements": "Requisitos",
    "responsibilities": "Responsabilidades",
    "benefits": "Beneficios",
    "applyNow": "Aplicar Ahora",
    "similarJobs": "Empleos Similares",
    "howDoYouFeel": "¿Qué opinas sobre este empleo?"
  },
  "settings": {
    "title": "Configuración",
    "language": "Idioma",
    "notifications": "Notificaciones",
    "location": "Acceso a Ubicación",
    "darkMode": "Modo Oscuro",
    "accountSettings": "Configuración de Cuenta",
    "about": "Acerca de",
    "help": "Ayuda y Soporte",
    "privacy": "Política de Privacidad",
    "terms": "Términos de Servicio",
    "logout": "Cerrar Sesión"
  },
  "errors": {
    "connectionError": "Error de conexión. Por favor, verifica tu internet.",
    "loginFailed": "Error al iniciar sesión. Verifica tus credenciales.",
    "registrationFailed": "Error al registrarse. Inténtalo de nuevo.",
    "uploadFailed": "Error al subir archivo. Inténtalo de nuevo.",
    "locationError": "No se pudo obtener tu ubicación. Verifica los permisos."
  },
  "sentiments": {
    "excited": "Entusiasmado",
    "interested": "Interesado",
    "neutral": "Neutral",
    "doubtful": "Dudoso",
    "negative": "No es para mí"
  }
}
```

### 4. Using Translations in Components

```javascript
// Example Component using translations
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import styles from './styles';

export function JobCard({ job, onLike, onDislike, onInfo }) {
  const { t } = useTranslation();
  
  return (
    <View style={styles.cardContainer}>
      <Text style={styles.jobTitle}>{job.title}</Text>
      <Text style={styles.companyName}>{job.company}</Text>
      
      <View style={styles.locationContainer}>
        <Text style={styles.locationLabel}>{t('jobCard.location')}:</Text>
        <Text style={styles.locationValue}>{job.location}</Text>
        
        {job.isRemote && (
          <View style={[styles.badge, styles.remoteBadge]}>
            <Text style={styles.badgeText}>{t('jobCard.remote')}</Text>
          </View>
        )}
        
        {job.jobType === 'hybrid' && (
          <View style={[styles.badge, styles.hybridBadge]}>
            <Text style={styles.badgeText}>{t('jobCard.hybrid')}</Text>
          </View>
        )}
        
        {job.jobType === 'on_site' && (
          <View style={[styles.badge, styles.onSiteBadge]}>
            <Text style={styles.badgeText}>{t('jobCard.onSite')}</Text>
          </View>
        )}
      </View>
      
      {job.salary && (
        <View style={styles.salaryContainer}>
          <Text style={styles.salaryLabel}>{t('jobCard.salary')}:</Text>
          <Text style={styles.salaryValue}>{job.salary}</Text>
        </View>
      )}
      
      <View style={styles.skillsContainer}>
        <Text style={styles.skillsLabel}>{t('jobCard.skills')}:</Text>
        <View style={styles.skillsList}>
          {job.skills.map((skill, index) => (
            <View key={index} style={styles.skillBadge}>
              <Text style={styles.skillText}>{skill}</Text>
            </View>
          ))}
        </View>
      </View>
      
      <View style={styles.actionContainer}>
        <TouchableOpacity style={styles.actionButton} onPress={onDislike}>
          <Text style={styles.actionText}>{t('actions.dislike')}</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.actionButton} onPress={onInfo}>
          <Text style={styles.actionText}>{t('actions.info')}</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.actionButton} onPress={onLike}>
          <Text style={styles.actionText}>{t('actions.like')}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
```

### 5. Language Switcher Component

```javascript
// LanguageSelector.tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { changeLanguage } from '../lib/i18n';

export function LanguageSelector() {
  const { t, i18n } = useTranslation();
  const currentLanguage = i18n.language;
  
  const handleLanguageChange = async (language: string) => {
    await changeLanguage(language);
  };
  
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('settings.language')}</Text>
      
      <View style={styles.languageOptions}>
        <TouchableOpacity
          style={[
            styles.languageButton,
            currentLanguage === 'en' && styles.activeLanguage,
          ]}
          onPress={() => handleLanguageChange('en')}
        >
          <Text 
            style={[
              styles.languageText,
              currentLanguage === 'en' && styles.activeLanguageText,
            ]}
          >
            English
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.languageButton,
            currentLanguage === 'es' && styles.activeLanguage,
          ]}
          onPress={() => handleLanguageChange('es')}
        >
          <Text 
            style={[
              styles.languageText,
              currentLanguage === 'es' && styles.activeLanguageText,
            ]}
          >
            Español
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  languageOptions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  languageButton: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    minWidth: 120,
    alignItems: 'center',
  },
  activeLanguage: {
    backgroundColor: '#4F46E5',
    borderColor: '#4F46E5',
  },
  languageText: {
    fontSize: 16,
  },
  activeLanguageText: {
    color: 'white',
    fontWeight: 'bold',
  },
});
```

## Localization Best Practices

### 1. Date and Number Formatting

Use native formatting for dates, numbers, and currencies based on locale:

```javascript
// Date formatting
import { format } from 'date-fns';
import { es, enUS } from 'date-fns/locale';

const formatDate = (date, lng = 'en') => {
  const locales = {
    en: enUS,
    es: es,
  };
  
  return format(new Date(date), 'PPP', { locale: locales[lng] });
};

// Usage example
const JobPostedDate = ({ date }) => {
  const { t, i18n } = useTranslation();
  
  return (
    <Text>
      {t('jobCard.posted')}: {formatDate(date, i18n.language)}
    </Text>
  );
};

// Currency formatting
const formatCurrency = (amount, currencyCode = 'USD', lng = 'en') => {
  return new Intl.NumberFormat(lng === 'en' ? 'en-US' : 'es-ES', {
    style: 'currency',
    currency: currencyCode,
  }).format(amount);
};
```

### 2. Handling Pluralization

i18next supports pluralization out of the box:

```json
// English translation
{
  "results": "{{count}} result",
  "results_plural": "{{count}} results"
}

// Spanish translation
{
  "results_0": "Ningún resultado",
  "results_1": "1 resultado",
  "results_plural": "{{count}} resultados"
}
```

```javascript
// Usage
<Text>{t('results', { count: jobsCount })}</Text>
```

### 3. Right-to-Left (RTL) Language Support

While not currently needed for English and Spanish, the application structure is ready for RTL language support:

```javascript
// App.tsx (root component)
import React, { useEffect } from 'react';
import { I18nManager } from 'react-native';
import { useTranslation } from 'react-i18next';

export default function App() {
  const { i18n } = useTranslation();
  
  useEffect(() => {
    // Set RTL layout direction based on language
    const isRTL = ['ar', 'he'].includes(i18n.language);
    if (I18nManager.isRTL !== isRTL) {
      I18nManager.forceRTL(isRTL);
      // This requires app restart for changes to take effect
    }
  }, [i18n.language]);
  
  return (
    // App components
  );
}
```

## Testing Internationalization

### 1. Manual Language Switching Tests

Test the language switching functionality by:
1. Changing the language in the app settings
2. Verifying that all UI elements update correctly
3. Checking that user-entered data remains intact

### 2. Device Locale Tests

Test automatic language detection by:
1. Changing the device language settings
2. Launching the app with no stored language preference
3. Verifying the app detects and applies the correct language

### 3. Geolocation Tests

Test location-based language selection by:
1. Mocking the device location to be in Spain or Latin America
2. Launching the app with no stored language or matching device locale
3. Verifying the app selects Spanish based on the location

### 4. Text Expansion/Contraction

Some languages require more space than others. Test that UI elements properly handle text expansion by:
1. Switching between languages
2. Checking for text overflow or truncation
3. Verifying that buttons and other UI elements resize appropriately

## Expanding to Additional Languages

To add support for a new language:

1. Create a new translation file in `locales/{language_code}/translation.json`
2. Add the language to the resources object in i18n.ts:
   ```javascript
   const resources = {
     en: { translation: enTranslation },
     es: { translation: esTranslation },
     fr: { translation: frTranslation }, // New language
   };
   ```
3. Update the language detection logic to include the new language code
4. Add the new language option to the LanguageSelector component

## Conclusion

This internationalization implementation provides a seamless multilingual experience in the Job Finder app. By using a combination of stored preferences, device locale, and geolocation, the app intelligently selects the most appropriate language for each user while allowing manual language selection when needed.

The structure supports easy expansion to additional languages as the app's user base grows, and follows best practices for text formatting, pluralization, and UI adaptability to different language requirements.