import { DemandForecast, ForecastCreateInput } from '../../domain/entities/forecast.entity.js';

export interface IDemandForecastService {
  generateForecast(input: ForecastCreateInput): Promise<DemandForecast>;
}
