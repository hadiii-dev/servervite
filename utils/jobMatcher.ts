import { storage } from "../storage";
import { Job } from "../schemas";
import { db } from "../db";
import { eq, desc, and } from "drizzle-orm";
import { userJobs, sessionJobs, jobs, userOccupations, occupations } from "../schemas";

// Haversine formula to calculate distance between two points with lat/lng
function getDistanceFromLatLonInKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2); 
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  const d = R * c; // Distance in km
  return d;
}

function deg2rad(deg: number): number {
  return deg * (Math.PI/180);
}

// Basic function to guess country from coordinates
// This is a simplified approach - a real geocoding API would be better
function getCountryFromLocation(latitude: number, longitude: number): string | null {
  // Simple mapping of coordinate ranges to countries
  // These are approximations and not accurate for all cases
  
  // Spain (roughly)
  if (latitude >= 36 && latitude <= 44 && longitude >= -10 && longitude <= 5) {
    return "españa";
  }
  
  // Mexico (roughly)
  if (latitude >= 14 && latitude <= 33 && longitude >= -120 && longitude <= -86) {
    return "méxico";
  }
  
  // Colombia (roughly)
  if (latitude >= -5 && latitude <= 13 && longitude >= -80 && longitude <= -66) {
    return "colombia";
  }
  
  // Argentina (roughly)
  if (latitude >= -55 && latitude <= -22 && longitude >= -73 && longitude <= -53) {
    return "argentina";
  }
  
  // Chile (roughly)
  if (latitude >= -56 && latitude <= -17 && longitude >= -76 && longitude <= -66) {
    return "chile";
  }
  
  // Peru (roughly)
  if (latitude >= -18 && latitude <= 0 && longitude >= -82 && longitude <= -68) {
    return "perú";
  }
  
  // United States (roughly)
  if (latitude >= 24 && latitude <= 50 && longitude >= -125 && longitude <= -66) {
    return "estados unidos";
  }
  
  // United Kingdom (roughly)
  if (latitude >= 49 && latitude <= 59 && longitude >= -8 && longitude <= 2) {
    return "reino unido";
  }
  
  // Add more countries as needed
  
  // If no match, return null
  return null;
}

// Get general region from coordinates
function getRegionFromLocation(latitude: number, longitude: number): string | null {
  // North America
  if (latitude >= 15 && latitude <= 72 && longitude >= -168 && longitude <= -52) {
    return "norteamerica";
  }
  
  // South America
  if (latitude >= -56 && latitude <= 15 && longitude >= -82 && longitude <= -34) {
    return "sudamerica";
  }
  
  // Europe
  if (latitude >= 36 && latitude <= 71 && longitude >= -10 && longitude <= 40) {
    return "europa";
  }
  
  // Asia
  if (latitude >= 0 && latitude <= 82 && longitude >= 40 && longitude <= 180) {
    return "asia";
  }
  
  // Africa
  if (latitude >= -35 && latitude <= 37 && longitude >= -18 && longitude <= 52) {
    return "africa";
  }
  
  // Oceania
  if (latitude >= -47 && latitude <= 0 && longitude >= 110 && longitude <= 180) {
    return "oceania";
  }
  
  return null;
}

// Check if a job location is in a specified region
function isLocationInRegion(locationText: string, region: string): boolean {
  const regionKeywords: Record<string, string[]> = {
    "norteamerica": ["estados unidos", "usa", "eeuu", "us", "canada", "méxico", "mexico", "norteamerica", "north america"],
    "sudamerica": ["colombia", "venezuela", "brasil", "argentina", "chile", "perú", "peru", "ecuador", "bolivia", "uruguay", "paraguay", "sudamerica", "latinoamerica", "latin america", "south america"],
    "europa": ["españa", "spain", "francia", "alemania", "italia", "reino unido", "portugal", "europa", "europe"],
    "asia": ["china", "japón", "japon", "india", "asia"],
    "africa": ["africa", "áfrica", "sudáfrica", "sudafrica", "egipto", "marruecos"],
    "oceania": ["australia", "nueva zelanda", "oceania"]
  };
  
  const keywords = regionKeywords[region.toLowerCase()] || [];
  return keywords.some(keyword => locationText.includes(keyword));
}

// Function to check if job is specifically in Spain based on its location text
function isJobInSpain(locationText: string): boolean {
  const spainKeywords = [
    "españa", "spain", "madrid", "barcelona", "valencia", "sevilla", 
    "zaragoza", "málaga", "malaga", "bilbao", "alicante", "córdoba", "cordoba", 
    "valladolid", "vigo", "gijón", "gijon", "hospitalet", "palma", "murcia", 
    "vitoria", "oviedo", "sabadell", "santander", "jerez", "pamplona", "almería", 
    "almeria", "donostia", "san sebastián", "san sebastian", "cartagena", "jaén", 
    "jaen", "canarias", "cataluña", "cataluna", "galicia", "andalucía", "andalucia", 
    "castilla", "aragón", "aragon", "asturias", "cantabria", "navarra", "extremadura"
  ];
  
  return spainKeywords.some(keyword => locationText.toLowerCase().includes(keyword));
}

// Enhanced recommendation system based on user actions and location
export async function getRecommendedJobs(
  userId?: number, 
  sessionId?: string, 
  options?: { 
    limit?: number; 
    offset?: number; 
    excludeIds?: number[];
    orderBy?: string; 
  }
): Promise<Job[]> {
  const limit = options?.limit ?? 20;
  const offset = options?.offset ?? 0;
  const excludeIds = options?.excludeIds ?? [];
  const orderBy = options?.orderBy ?? 'recent';
  
  if (!userId && !sessionId) {
    // If neither is provided, return jobs with pagination and specified order
    return await storage.getJobs({ limit, offset, excludeIds, orderBy });
  }
  
  let relevantSkills: string[] = [];
  let relevantCategories: Set<string> = new Set();
  let userLatitude: number | undefined;
  let userLongitude: number | undefined;
  
  // Get user's occupation preferences if user is logged in
  if (userId) {
    // Get user data for location info
    const user = await storage.getUser(userId);
    if (user) {
      // Extract location data if available
      userLatitude = user.latitude || undefined;
      userLongitude = user.longitude || undefined;
    }
    
    // Get user's liked occupations
    const userOccupationData = await db
      .select({
        occupation: occupations
      })
      .from(userOccupations)
      .where(and(
        eq(userOccupations.userId, userId),
        eq(userOccupations.liked, true)
      ))
      .innerJoin(occupations, eq(userOccupations.occupationId, occupations.id));
    
    // Extract relevant keywords from occupations
    for (const { occupation } of userOccupationData) {
      if (occupation.preferredLabel) {
        const words = occupation.preferredLabel.split(/\s+/);
        words.forEach(word => {
          if (word.length > 3) { // Only use meaningful words
            relevantSkills.push(word.toLowerCase());
          }
        });
      }
    }
    
    // Get user's liked jobs
    const likedJobs = await storage.getUserSavedJobs(userId);
    
    // Extract skills and categories from liked jobs
    likedJobs.forEach(job => {
      if (job.skills && job.skills.length > 0) {
        relevantSkills = [...relevantSkills, ...job.skills.map(s => s.toLowerCase())];
      }
      if (job.category) {
        relevantCategories.add(job.category.toLowerCase());
      }
    });
  } 
  // If anonymous session, use liked jobs from that session
  else if (sessionId) {
    // Get session data for location info
    const anonymousSession = await storage.getAnonymousSession(sessionId);
    if (anonymousSession) {
      // Extract location data if available
      userLatitude = anonymousSession.latitude || undefined;
      userLongitude = anonymousSession.longitude || undefined;
    }
    
    const likedSessionJobs = await storage.getSessionLikedJobs(sessionId);
    
    // Extract skills and categories from liked jobs
    likedSessionJobs.forEach(job => {
      if (job.skills && job.skills.length > 0) {
        relevantSkills = [...relevantSkills, ...job.skills.map(s => s.toLowerCase())];
      }
      if (job.category) {
        relevantCategories.add(job.category.toLowerCase());
      }
    });
  }
  
  // Check if user is in Spain for location-based filtering
  const isUserInSpain = userLatitude && userLongitude && 
                        getCountryFromLocation(userLatitude, userLongitude) === "españa";

  // Get a larger pool of jobs for recommendation calculations
  // Limit to 500 for performance reasons, but we'll filter for exclusions
  const largerLimit = Math.min(500, limit * 10);
  
  // Get jobs with modified filters based on user location
  const allJobs = await storage.getJobs({ 
    limit: largerLimit, 
    orderBy,
    // If the user is in Spain and not explicitly requesting remote jobs,
    // prioritize getting jobs in their region
    location: isUserInSpain ? "españa" : undefined
  });
  
  // Skip jobs that user has already interacted with or are explicitly excluded
  let jobsToFilter = allJobs.filter(job => !excludeIds.includes(job.id));
  
  // For users in Spain, ensure we prioritize local jobs by filtering
  if (isUserInSpain) {
    // First prioritize jobs with location in Spain that aren't remote
    const spainJobs = jobsToFilter.filter(job => 
      !job.isRemote && job.location && isJobInSpain(job.location)
    );
    
    // Then add remote jobs
    const remoteJobs = jobsToFilter.filter(job => job.isRemote);
    
    // Then add any remaining jobs (for diversity)
    const otherJobs = jobsToFilter.filter(job => 
      !((!job.isRemote && job.location && isJobInSpain(job.location)) || job.isRemote)
    );
    
    // Combine with prioritization
    if (spainJobs.length >= limit) {
      // If we have enough Spain jobs, use mostly those with a few remote ones
      jobsToFilter = [...spainJobs, ...remoteJobs];
    } else {
      // Otherwise use all Spain jobs, all remote jobs, and fill with others
      jobsToFilter = [...spainJobs, ...remoteJobs, ...otherJobs];
    }
  }
  
  // Also exclude jobs the user has already interacted with
  if (userId) {
    const userActionedJobIds = (await db
      .select({ jobId: userJobs.jobId })
      .from(userJobs)
      .where(eq(userJobs.userId, userId)))
      .map(row => row.jobId);
    
    jobsToFilter = jobsToFilter.filter(job => !userActionedJobIds.includes(job.id));
  } else if (sessionId) {
    const sessionActionedJobIds = (await db
      .select({ jobId: sessionJobs.jobId })
      .from(sessionJobs)
      .where(eq(sessionJobs.sessionId, sessionId)))
      .map(row => row.jobId);
    
    jobsToFilter = jobsToFilter.filter(job => !sessionActionedJobIds.includes(job.id));
  }
  
  // Score and sort jobs based on relevance
  const scoredJobs = jobsToFilter.map(job => {
    let score = 0;
    
    // Score based on skills match
    if (job.skills && job.skills.length > 0) {
      for (const skill of job.skills) {
        if (relevantSkills.includes(skill.toLowerCase())) {
          score += 5;
        }
      }
    }
    
    // Score based on category match
    if (job.category && relevantCategories.has(job.category.toLowerCase())) {
      score += 10;
    }
    
    // Add recency factor - newer jobs get a slight boost
    if (job.createdAt) {
      const daysSinceCreation = Math.floor((Date.now() - new Date(job.createdAt).getTime()) / (1000 * 60 * 60 * 24));
      // Newer jobs (less days) get higher score
      score += Math.max(0, 5 - daysSinceCreation / 7); // Boost for jobs less than ~5 weeks old
    }
    
    // Score based on location proximity if both user and job have coordinates
    if (userLatitude && userLongitude && job.latitude && job.longitude) {
      const distance = getDistanceFromLatLonInKm(
        userLatitude, 
        userLongitude, 
        job.latitude, 
        job.longitude
      );
      
      // Check if user is in Spain
      const userCountry = getCountryFromLocation(userLatitude, userLongitude);
      const isUserInSpain = userCountry === "españa";
      
      // Jobs within 25km get maximum boost, decreasing as distance increases
      if (job.isRemote) {
        score += 15; // High boost for remote jobs (user can work from anywhere)
      } else if (distance <= 25) {
        score += 30; // Higher maximum boost for very close jobs
      } else if (distance <= 50) {
        score += 25;
      } else if (distance <= 100) {
        score += 20;
      } else if (distance <= 200) {
        score += 15;
      }
      
      // Apply significant penalty to non-remote jobs that are far away
      if (!job.isRemote && distance > 200) {
        // Penalize jobs far away (especially for users in Spain)
        score -= isUserInSpain ? 30 : 10;
      }
    } else if (job.isRemote) {
      // Always give remote jobs a boost even if we don't have user location
      score += 15;
    } else if (userLatitude && userLongitude) {
      // If we have user coordinates but no job coordinates, try to match by location text
      if (job.location) {
        // Get the user's country based on their coordinates (simplified approach)
        const userCountry = getCountryFromLocation(userLatitude, userLongitude);
        const isUserInSpain = userCountry === "españa";
        
        // Check if job location text mentions the user's country or nearby countries
        const jobLocationLower = job.location.toLowerCase();
        
        // Spain-specific location matching with higher score
        if (isUserInSpain) {
          // Keywords specific to Spain
          const spainKeywords = ["españa", "spain", "madrid", "barcelona", "valencia", "sevilla", 
                               "zaragoza", "málaga", "malaga", "bilbao", "alicante", "córdoba", "cordoba", 
                               "valladolid", "vigo", "gijón", "gijon", "hospitalet", "palma", "murcia", 
                               "vitoria", "oviedo", "sabadell", "santander", "jerez", "pamplona", "almería", 
                               "almeria", "donostia", "san sebastián", "san sebastian", "cartagena", "jaén", 
                               "jaen", "canarias", "cataluña", "cataluna", "galicia", "andalucía", "andalucia", 
                               "castilla", "aragón", "aragon", "asturias", "cantabria", "navarra", "extremadura"];
          
          if (spainKeywords.some(keyword => jobLocationLower.includes(keyword))) {
            // Much higher boost for jobs matching Spain locations when user is in Spain
            score += 40;
          } else if (userCountry && jobLocationLower.includes(userCountry.toLowerCase())) {
            // General match for Spain
            score += 25;
          } else {
            // For users in Spain, significantly penalize non-remote jobs outside Spain
            if (!job.isRemote) {
              score -= 20;
            }
          }
        } else if (userCountry && jobLocationLower.includes(userCountry.toLowerCase())) {
          // Job is in the same country as the user (for countries other than Spain)
          score += 12;
        } else {
          // Check for regional preferences based on user location
          const userRegion = getRegionFromLocation(userLatitude, userLongitude);
          if (userRegion && isLocationInRegion(jobLocationLower, userRegion)) {
            // Job is in the same general region as the user
            score += 8;
          }
        }
      }
    }
    
    // Add a small random factor to prevent always showing same results
    score += Math.random() * 2;
    
    return { job, score };
  });
  
  // Sort by score (descending)
  scoredJobs.sort((a, b) => b.score - a.score);
  
  // Apply offset and limit to the scored and sorted jobs
  return scoredJobs
    .slice(offset, offset + limit)
    .map(item => item.job);
}
