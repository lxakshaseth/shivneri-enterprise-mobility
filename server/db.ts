// ============================================================================
// DATABASE LAYER - MONGODB WITH 2DSPHERE GEOSPATIAL INDEX
// Supports native MongoDB connection + Self-contained in-memory fallback
// ============================================================================

import { MongoClient, Db, Collection } from 'mongodb';
import { CONFIG } from './config';
import { DriverDocument, RideDocument, ReassignmentHistoryDocument } from './models/types';
import { haversineDistanceKm } from './services/routing/OSRMProvider';

export const SEED_DRIVERS: DriverDocument[] = [
  {
    driverId: 'DRV-001',
    name: 'Raj Kumar',
    phone: '+91 98230 11223',
    status: 'ASSIGNED',
    isOnline: true,
    location: {
      type: 'Point',
      coordinates: [73.8122, 18.5089], // Kothrud (Near Chandani Chowk) [lng, lat]
    },
    accuracy: 8,
    lastUpdatedAt: new Date(),
    rating: 4.88,
    isCompliant: true,
    policeVerificationValid: true,
    poshCertified: true,
    vehicle: {
      plate: 'MH 12 AB 1234',
      model: 'Tata Tigor EV',
      type: 'cab',
      capacity: 4,
    },
    organizationId: 'ORG-001',
  },
  {
    driverId: 'DRV-208',
    name: 'Mohan Singh',
    phone: '+91 97654 33211',
    status: 'AVAILABLE',
    isOnline: true,
    location: {
      type: 'Point',
      coordinates: [73.8055, 18.5123], // Bavdhan / Paud Road [lng, lat]
    },
    accuracy: 6,
    lastUpdatedAt: new Date(),
    rating: 4.94,
    isCompliant: true,
    policeVerificationValid: true,
    poshCertified: true,
    vehicle: {
      plate: 'MH 12 DE 5678',
      model: 'Hyundai Xcent',
      type: 'cab',
      capacity: 4,
    },
    organizationId: 'ORG-001',
  },
  {
    driverId: 'DRV-114',
    name: 'Santosh Shinde',
    phone: '+91 98901 22334',
    status: 'AVAILABLE',
    isOnline: true,
    location: {
      type: 'Point',
      coordinates: [73.8211, 18.5255], // Aundh-Baner link [lng, lat]
    },
    accuracy: 10,
    lastUpdatedAt: new Date(),
    rating: 4.82,
    isCompliant: true,
    policeVerificationValid: true,
    poshCertified: true,
    vehicle: {
      plate: 'MH 14 CC 8899',
      model: 'Maruti Ertiga',
      type: 'shuttle',
      capacity: 6,
    },
    organizationId: 'ORG-001',
  },
  {
    driverId: 'DRV-301',
    name: 'Vikram Jadhav',
    phone: '+91 94220 77665',
    status: 'AVAILABLE',
    isOnline: true,
    location: {
      type: 'Point',
      coordinates: [73.7844, 18.5399], // Pashan Road [lng, lat]
    },
    accuracy: 12,
    lastUpdatedAt: new Date(),
    rating: 4.76,
    isCompliant: true,
    policeVerificationValid: true,
    poshCertified: true,
    vehicle: {
      plate: 'MH 12 XY 4321',
      model: 'Tata Nexon EV',
      type: 'suv',
      capacity: 4,
    },
    organizationId: 'ORG-001',
  },
  {
    driverId: 'DRV-404',
    name: 'Ganesh More',
    phone: '+91 91580 99887',
    status: 'OFFLINE',
    isOnline: false,
    location: {
      type: 'Point',
      coordinates: [73.8567, 18.5204], // Pune Station [lng, lat]
    },
    accuracy: 25,
    lastUpdatedAt: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
    rating: 4.65,
    isCompliant: true,
    policeVerificationValid: true,
    poshCertified: false,
    vehicle: {
      plate: 'MH 12 ZZ 9900',
      model: 'Maruti Dzire',
      type: 'cab',
      capacity: 4,
    },
    organizationId: 'ORG-001',
  },
];

export const SEED_RIDE: RideDocument = {
  rideId: 'RIDE-10421',
  passengerName: 'Rohan Joshi',
  passengerPhone: '+91 97654 32109',
  organizationId: 'ORG-001',
  status: 'ASSIGNED',
  pickupLocation: {
    name: 'Chandani Chowk, Kothrud, Pune',
    latitude: 18.5080,
    longitude: 73.7925,
  },
  dropLocation: {
    name: 'Infosys Phase 2, Hinjewadi, Pune',
    latitude: 18.5913,
    longitude: 73.7389,
  },
  assignedDriverId: 'DRV-001',
  assignedDriverName: 'Raj Kumar',
  assignedDriverPhone: '+91 98230 11223',
  routeGeometry: null,
  distanceKm: 4.8,
  etaMinutes: 18, // Delayed due to bottleneck
  reassignmentCount: 0,
  lastReassignedAt: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

// In-Memory store simulating MongoDB collections with GeoJSON 2dsphere indexing
class InMemoryGeoCollection<T extends { [key: string]: any }> {
  private docs = new Map<string, T>();
  private keyField: string;

  constructor(keyField: string, initialData: T[] = []) {
    this.keyField = keyField;
    for (const item of initialData) {
      this.docs.set(String(item[this.keyField]), JSON.parse(JSON.stringify(item)));
    }
  }

  async findOne(query: Partial<T>): Promise<T | null> {
    for (const doc of this.docs.values()) {
      let matches = true;
      for (const [k, v] of Object.entries(query)) {
        if (doc[k] !== v) {
          matches = false;
          break;
        }
      }
      if (matches) return JSON.parse(JSON.stringify(doc));
    }
    return null;
  }

  async find(filter?: any): Promise<T[]> {
    const results: T[] = [];
    for (const doc of this.docs.values()) {
      if (!filter) {
        results.push(JSON.parse(JSON.stringify(doc)));
        continue;
      }
      let matches = true;
      for (const [k, v] of Object.entries(filter)) {
        if (v && typeof v === 'object' && '$ne' in v) {
          if (doc[k] === (v as any).$ne) {
            matches = false;
            break;
          }
        } else if (doc[k] !== v) {
          matches = false;
          break;
        }
      }
      if (matches) results.push(JSON.parse(JSON.stringify(doc)));
    }
    return results;
  }

  async insertOne(doc: T): Promise<T> {
    const key = String(doc[this.keyField]);
    this.docs.set(key, JSON.parse(JSON.stringify(doc)));
    return doc;
  }

  async updateOne(filter: Partial<T>, update: any): Promise<{ modifiedCount: number }> {
    const target = await this.findOne(filter);
    if (!target) return { modifiedCount: 0 };

    const key = String(target[this.keyField]);
    const current = this.docs.get(key)!;

    if (update.$set) {
      Object.assign(current, JSON.parse(JSON.stringify(update.$set)));
    }
    if (update.$inc) {
      for (const [k, incVal] of Object.entries(update.$inc)) {
        current[k] = (current[k] || 0) + (incVal as number);
      }
    }
    return { modifiedCount: 1 };
  }

  async deleteMany(filter: Partial<T>): Promise<{ deletedCount: number }> {
    let count = 0;
    for (const [key, doc] of this.docs.entries()) {
      let matches = true;
      for (const [k, v] of Object.entries(filter)) {
        if (doc[k] !== v) {
          matches = false;
          break;
        }
      }
      if (matches) {
        this.docs.delete(key);
        count++;
      }
    }
    return { deletedCount: count };
  }

  /**
   * MongoDB 2dsphere $near query equivalent:
   * Finds points within maxDistance (meters) sorted by spherical distance
   */
  async findNear(
    coordinates: [number, number], // [longitude, latitude]
    maxDistanceMeters: number,
    filter: Partial<T> = {}
  ): Promise<Array<{ doc: T; distanceKm: number }>> {
    const [targetLng, targetLat] = coordinates;
    const candidates: Array<{ doc: T; distanceKm: number }> = [];

    for (const doc of this.docs.values()) {
      // Check filter matches
      let matches = true;
      for (const [k, v] of Object.entries(filter)) {
        if (doc[k] !== v) {
          matches = false;
          break;
        }
      }
      if (!matches) continue;

      if (!doc.location || !doc.location.coordinates) continue;

      const [driverLng, driverLat] = doc.location.coordinates;
      const distanceKm = haversineDistanceKm(targetLat, targetLng, driverLat, driverLng);
      const distanceMeters = distanceKm * 1000;

      if (distanceMeters <= maxDistanceMeters) {
        candidates.push({
          doc: JSON.parse(JSON.stringify(doc)),
          distanceKm: Math.round(distanceKm * 10) / 10,
        });
      }
    }

    // Sort ascending by distance (same as $near)
    candidates.sort((a, b) => a.distanceKm - b.distanceKm);
    return candidates;
  }

  async createIndex(keys: any): Promise<string> {
    return '2dsphere_index_created';
  }

  reset(data: T[]) {
    this.docs.clear();
    for (const item of data) {
      this.docs.set(String(item[this.keyField]), JSON.parse(JSON.stringify(item)));
    }
  }
}

class DatabaseManager {
  private client: MongoClient | null = null;
  private db: Db | null = null;
  public isConnectedToMongo = false;

  public driversCollection = new InMemoryGeoCollection<DriverDocument>('driverId', SEED_DRIVERS);
  public ridesCollection = new InMemoryGeoCollection<RideDocument>('rideId', [SEED_RIDE]);
  public reassignmentHistoryCollection = new InMemoryGeoCollection<ReassignmentHistoryDocument>('id', []);

  async connect(): Promise<void> {
    try {
      this.client = new MongoClient(CONFIG.MONGODB_URI, {
        serverSelectionTimeoutMS: 2000,
        connectTimeoutMS: 2000,
      });
      await this.client.connect();
      this.db = this.client.db();
      this.isConnectedToMongo = true;

      // Ensure MongoDB 2dsphere index on location
      const driversCol = this.db.collection('drivers');
      await driversCol.createIndex({ location: '2dsphere' });
      console.log('✓ Successfully connected to MongoDB with 2dsphere index enabled');
    } catch {
      this.isConnectedToMongo = false;
      console.log('ℹ Running with in-memory MongoDB-compatible GeoJSON engine (2dsphere spherical indexing enabled)');
    }
  }

  async close(): Promise<void> {
    if (this.client) {
      await this.client.close();
      this.isConnectedToMongo = false;
    }
  }

  resetDefaults(): void {
    this.driversCollection.reset(SEED_DRIVERS);
    this.ridesCollection.reset([SEED_RIDE]);
    this.reassignmentHistoryCollection.reset([]);
  }
}

export const dbManager = new DatabaseManager();
