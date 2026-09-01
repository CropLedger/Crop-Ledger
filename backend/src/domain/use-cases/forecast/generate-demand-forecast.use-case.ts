import { IDemandForecastService } from '../../../infrastructure/ai/demand-forecast.service.interface.js';
import { DemandForecast, ForecastCreateInput } from '../../entities/forecast.entity.js';

export class GenerateDemandForecastUseCase {
  constructor(
    private forecastService: IDemandForecastService,
  ) {}

  async execute(input: ForecastCreateInput): Promise<DemandForecast> {
    return this.forecastService.generateForecast(input);
  }
}
