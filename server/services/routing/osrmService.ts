// ============================================================================
// CENTRALIZED BACKEND ROUTING SERVICE
// All routing, distance & duration logic centralized here.
// Dispatches to configured RoutingProvider (default: OSRMProvider)
// ============================================================================

import { RoutingProvider, RouteResult } from './RoutingProvider';
import { OSRMProvider } from './OSRMProvider';
import { TrafficRoutingProvider } from './TrafficRoutingProvider';
import { CONFIG } from '../../config';

class OsrmRoutingService {
  private provider: RoutingProvider;

  constructor() {
    this.provider = this.createProvider(CONFIG.ROUTING_PROVIDER);
  }

  /**
   * Factory method to instantiate provider
   */
  public createProvider(providerType: string): RoutingProvider {
    switch (providerType?.toLowerCase()) {
      case 'traffic':
      case 'traffic-aware':
        return new TrafficRoutingProvider();
      case 'osrm':
      default:
        return new OSRMProvider(CONFIG.OSRM_BASE_URL);
    }
  }

  /**
   * Set active provider dynamically at runtime
   */
  public setProvider(provider: RoutingProvider): void {
    this.provider = provider;
  }

  public getProvider(): RoutingProvider {
    return this.provider;
  }

  /**
   * Compute driving route between two points
   * @param origin [latitude, longitude]
   * @param destination [latitude, longitude]
   */
  public async getRoute(
    origin: [number, number],
    destination: [number, number]
  ): Promise<RouteResult> {
    return this.provider.getRoute(origin, destination);
  }

  /**
   * Fast ETA calculation between two points
   * @param origin [latitude, longitude]
   * @param destination [latitude, longitude]
   */
  public async getEta(
    origin: [number, number],
    destination: [number, number]
  ): Promise<number> {
    return this.provider.getEta(origin, destination);
  }
}

export const osrmService = new OsrmRoutingService();
export { OSRMProvider, TrafficRoutingProvider, RoutingProvider };
