import 'dotenv/config';

export const CONFIG = {
  PORT: parseInt(process.env.PORT || '5001', 10),
  MONGODB_URI:
    process.env.MONGODB_URI ||
    process.env.MONGO_URI ||
    'mongodb://localhost:27017/shivneri_mobility',
  OSRM_BASE_URL: process.env.OSRM_BASE_URL || 'https://router.project-osrm.org',
  ROUTING_PROVIDER: process.env.ROUTING_PROVIDER || 'osrm',
  
  // Reassignment threshold configuration (Section 8)
  REASSIGNMENT_CONFIG: {
    minimumEtaImprovementMinutes: 5, // Must improve ETA by at least 5 minutes
    maximumDriverDistanceKm: 10,     // Only consider candidates within 10 km
    maximumLocationAgeSeconds: 30,   // Candidate location must be under 30 seconds old
    maximumReassignments: 2,         // Max 2 reassignments per ride to prevent flapping
    cooldownPeriodSeconds: 60,       // Minimum cooldown between reassignment attempts
  },

  // Geolocation throttling & debounce settings
  GEOLOCATION: {
    minDistanceThresholdMeters: 15,  // Min movement required to persist update
    maxHeartbeatSeconds: 30,         // Max time between telemetry pings
    staleLocationThresholdSeconds: 60 // Threshold after which a driver location is considered stale
  }
};
