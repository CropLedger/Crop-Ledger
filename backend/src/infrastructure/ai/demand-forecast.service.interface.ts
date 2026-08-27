import { DemandForecast, ForecastCreateInput } from '../../domain/entities/forecast.entity';

export interface IDemandForecastService {
  generateForecast(input: ForecastCreateInput): Promise<DemandForecast>;
}
