// ============================================================================
// TRAFFIC ROUTING PROVIDER (Future Extension Adapter)
// Implements RoutingProvider interface with simulated or third-party live traffic
// Allows drop-in replacement without altering driver assignment or reassignment logic
// ============================================================================

import { RoutingProvider, RouteResult } from './RoutingProvider';
import { OSRMProvider } from './OSRMProvider';

export class TrafficRoutingProvider extends RoutingProvider {
  readonly name = 'TrafficRoutingProvider';
  readonly isTrafficAware = true;
  private baseProvider: OSRMProvider;
  private trafficCongestionFactor: number;

  constructor(baseProvider?: OSRMProvider, trafficCongestionFactor = 1.35) {
    super();
    this.baseProvider = baseProvider || new OSRMProvider();
    this.trafficCongestionFactor = trafficCongestionFactor;
  }

  async getRoute(
    origin: [number, number],
    destination: [number, number]
  ): Promise<RouteResult> {
    const baseRoute = await this.baseProvider.getRoute(origin, destination);
    // Apply live traffic delay factor to duration
    const trafficDurationMinutes = Math.round(
      baseRoute.durationMinutes * this.trafficCongestionFactor
    );

    return {
      ...baseRoute,
      durationMinutes: trafficDurationMinutes,
      provider: this.name,
      isTrafficAware: true,
      steps: baseRoute.steps?.map(step => ({
        ...step,
        durationMinutes: Math.round(step.durationMinutes * this.trafficCongestionFactor * 10) / 10,
      })),
    };
  }

  async getEta(
    origin: [number, number],
    destination: [number, number]
  ): Promise<number> {
    const route = await this.getRoute(origin, destination);
    return route.durationMinutes;
  }
}
