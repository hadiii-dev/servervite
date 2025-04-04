import { storage } from "../storage";
import { fetchJobsFromXML } from "./xmlParser";
import { log } from "./logger";
// Default XML feed URL - can be overridden in environment variables
const DEFAULT_XML_FEED = "https://app.ktitalentindicator.com/xml/w3.xml";
console.log("🚀 ~ DEFAULT_XML_FEED:", DEFAULT_XML_FEED)

// Frequency of synchronization in milliseconds
const SYNC_INTERVAL_MS = 12 * 60 * 60 * 1000; // 12 hours

// Flag to track if a sync is currently in progress
let isSyncInProgress = false;

/**
 * Synchronizes jobs from the XML feed
 * @param xmlUrl Optional URL to override the default XML feed
 * @returns Object with status and number of jobs processed
 */
export async function syncJobsFromXML(xmlUrl?: string): Promise<{ status: string; jobsProcessed: number; newJobs: number }> {
  // If a sync is already in progress, return early
  if (isSyncInProgress) {
    return { status: "already_running", jobsProcessed: 0, newJobs: 0 };
  }

  try {
    isSyncInProgress = true;
    log(`Starting job synchronization from XML feed...`);
    
    // Use the provided URL or fall back to the default
    const feedUrl: string = xmlUrl || process.env.XML_FEED_URL || DEFAULT_XML_FEED;
    console.log("🚀 ~ syncJobsFromXML ~ feedUrl:", feedUrl)
    
    // Fetch and parse jobs from XML
    const jobs = await fetchJobsFromXML(feedUrl);
    log(`Retrieved ${jobs.length} jobs from XML feed`);
    
    // Counter for new jobs
    let newJobsCount = 0;
    
    // Save jobs to database, skipping duplicates
    for (const job of jobs) {
      const existingJob = await storage.getJobByExternalId(job.externalId || '');
      if (!existingJob) {
        await storage.createJob(job);
        newJobsCount++;
      }
    }
    
    log(`Job synchronization complete. Processed ${jobs.length} jobs, added ${newJobsCount} new jobs`);
    
    return { 
      status: "ok", 
      jobsProcessed: jobs.length,
      newJobs: newJobsCount
    };
  } catch (error) {
    log(`Error during job synchronization: ${error}`);
    throw new Error("Failed to sync jobs from XML feed");
  } finally {
    isSyncInProgress = false;
  }
}

/**
 * Starts the periodic job synchronization
 */
export function startJobSyncScheduler(): void {
  // Run initial sync
  syncJobsFromXML('https://app.ktitalentindicator.com/xml/w3.xml').catch(error => {
    log(`Initial job sync failed: ${error}`);
  });
  
  // Schedule periodic syncs
  setInterval(() => {
    syncJobsFromXML('https://app.ktitalentindicator.com/xml/w3.xml').catch(error => {
      log(`Scheduled job sync failed: ${error}`);
    });
  }, SYNC_INTERVAL_MS);
  
  log(`Job sync scheduler started. Will sync every ${SYNC_INTERVAL_MS / (60 * 60 * 1000)} hours`);
}