import { InsertJob } from "../schemas";
import { XMLParser } from "fast-xml-parser";
import axios from "axios";
import { cleanHtmlText, decodeHtmlEntities } from "./textUtils";

export async function fetchJobsFromXML(xmlUrl: string): Promise<InsertJob[]> {
  try {
    // Fetch XML content
    const response = await axios.get(xmlUrl);
    const xmlContent = response.data;
    
    // Parse XML
    const parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: "",
    });
    
    const jsonObj = parser.parse(xmlContent);
    
    // Extract job listings
    const jobListings = jsonObj?.source?.job || [];
    
    // Transform into our job model
    const jobs: InsertJob[] = jobListings.map((job: any) => {
      const skills = extractSkills(job.skills || job.description || "");
      
      // Clean the description by removing HTML tags and decoding HTML entities
      const rawDescription = job.description || job.summary || null;
      const cleanedDescription = cleanHtmlText(rawDescription);
      
      // Clean the title by decoding HTML entities
      const rawTitle = job.title || "Untitled Position";
      const cleanedTitle = decodeHtmlEntities(rawTitle);
      
      // Clean the company name by decoding HTML entities
      const rawCompany = job.company?.name || job.company || "Unknown Company";
      const cleanedCompany = decodeHtmlEntities(rawCompany);
      
      // Clean the location by decoding HTML entities
      const rawLocation = job.location?.name || job.location || null;
      const cleanedLocation = rawLocation ? decodeHtmlEntities(rawLocation) : null;
      
      // Check if job is remote - look for keywords in title, description, and location
      const isRemoteKeywords = ["remote", "work from home", "home-based", "telecommute", "virtual", "anywhere"];
      const isRemote = isRemoteKeywords.some(keyword => {
        const lowerTitle = cleanedTitle.toLowerCase();
        const lowerDesc = cleanedDescription ? cleanedDescription.toLowerCase() : '';
        const lowerLocation = cleanedLocation ? cleanedLocation.toLowerCase() : '';
        
        return lowerTitle.includes(keyword) || 
               lowerDesc.includes(keyword) || 
               lowerLocation.includes(keyword);
      });
      
      // Try to extract coordinates if available
      let latitude: number | null = null;
      let longitude: number | null = null;
      
      // Check if there are coordinates in the job data
      if (job.location?.coordinates || job.coordinates) {
        const coords = job.location?.coordinates || job.coordinates;
        if (typeof coords === 'string') {
          // Try to parse from string format "lat,lng" or similar
          const parts = coords.split(',');
          if (parts.length === 2) {
            const lat = parseFloat(parts[0].trim());
            const lng = parseFloat(parts[1].trim());
            if (!isNaN(lat) && !isNaN(lng)) {
              latitude = lat;
              longitude = lng;
            }
          }
        } else if (typeof coords === 'object') {
          // Try to parse from object format {lat, lng} or {latitude, longitude}
          if (coords.lat && coords.lng) {
            latitude = parseFloat(coords.lat);
            longitude = parseFloat(coords.lng);
          } else if (coords.latitude && coords.longitude) {
            latitude = parseFloat(coords.latitude);
            longitude = parseFloat(coords.longitude);
          }
        }
      }
      
      return {
        externalId: job.id || job.reference || `ext-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        title: cleanedTitle,
        company: cleanedCompany,
        location: cleanedLocation,
        jobType: job.type || job.contract_type || null,
        salary: job.salary_range || job.salary || null,
        description: cleanedDescription,
        category: job.category || job.industry || null,
        skills: skills,
        latitude: latitude,
        longitude: longitude,
        isRemote: isRemote,
        postedDate: job.date ? new Date(job.date) : new Date(),
        xmlData: job // Store the original XML data
      };
    });
    
    return jobs;
  } catch (error) {
    console.error("Error fetching or parsing XML:", error);
    throw new Error("Failed to fetch or parse job listings from XML");
  }
}

function extractSkills(text: string): string[] {
  // Common skills to look for in job descriptions
  const commonSkills = [
    "JavaScript", "TypeScript", "React", "Angular", "Vue", "Node.js", 
    "Python", "Java", "C#", "C++", "PHP", "Ruby", "Swift", "Kotlin",
    "SQL", "MongoDB", "PostgreSQL", "MySQL", "Oracle", "NoSQL",
    "AWS", "Azure", "GCP", "Docker", "Kubernetes", "DevOps",
    "Git", "HTML", "CSS", "Sass", "REST API", "GraphQL",
    "Agile", "Scrum", "Kanban", "TDD", "CI/CD", "Machine Learning",
    "Data Analysis", "Data Science", "AI", "Blockchain", "IoT"
  ];
  
  const foundSkills: string[] = [];
  
  // Check if any of the common skills are mentioned in the text
  for (const skill of commonSkills) {
    // Escape special regex characters in the skill name
    const escapedSkill = skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`\\b${escapedSkill}\\b`, 'i');
    if (regex.test(text)) {
      foundSkills.push(skill);
    }
  }
  
  return foundSkills;
}
