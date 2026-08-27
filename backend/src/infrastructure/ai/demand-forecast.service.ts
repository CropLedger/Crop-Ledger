import { IDemandForecastService } from './demand-forecast.service.interface';
import { DemandForecast, ForecastCreateInput } from '../../domain/entities/forecast.entity';

export class DemandForecastService implements IDemandForecastService {
  async generateForecast(input: ForecastCreateInput): Promise<DemandForecast> {
    // Simulate AI-powered demand forecasting
    const baseDemand = this.getHistoricalBaseDemand(input.cropType, input.region);
    const seasonalFactor = this.calculateSeasonalFactor(input.cropType);
    const weatherFactor = this.getWeatherImpact(input.region);
    const marketFactor = this.getMarketTrend(input.cropType);
    
    const predictedDemand = baseDemand * seasonalFactor * weatherFactor * marketFactor;
    const confidence = 0.75 + (Math.random() * 0.2); // 75-95% confidence
    
    return {
      id: `forecast_${Date.now()}`,
      cropType: input.cropType,
      region: input.region,
      predictedDemand: Math.round(predictedDemand),
      confidence: Math.round(confidence * 100) / 100,
      forecastDate: new Date(),
      timeHorizon: input.timeHorizon,
      factors: {
        weather: Math.round(weatherFactor * 100) / 100,
        market: Math.round(marketFactor * 100) / 100,
        seasonal: Math.round(seasonalFactor * 100) / 100,
        historical: 1.0,
      },
      createdAt: new Date(),
    };
  }

  private getHistoricalBaseDemand(cropType: string, region: string): number {
    // Simulated historical data
    const baseValues: Record<string, number> = {
      'Wheat': 10000,
      'Corn': 15000,
      'Soybeans': 8000,
      'Rice': 12000,
    };
    return baseValues[cropType] || 5000;
  }

  private calculateSeasonalFactor(cropType: string): number {
    const month = new Date().getMonth();
    // Simulated seasonal patterns
    if (month >= 3 && month <= 5) return 1.2; // Spring planting
    if (month >= 6 && month <= 8) return 0.8; // Summer
    if (month >= 9 && month <= 11) return 1.5; // Fall harvest
    return 1.0; // Winter
  }

  private getWeatherImpact(region: string): number {
    // Simulated weather data
    const weatherFactors: Record<string, number> = {
      'North America': 1.1,
      'South America': 0.9,
      'Europe': 1.0,
      'Asia': 1.2,
      'Africa': 0.8,
    };
    return weatherFactors[region] || 1.0;
  }

  private getMarketTrend(cropType: string): number {
    // Simulated market trends
    const trends: Record<string, number> = {
      'Wheat': 1.05,
      'Corn': 1.02,
      'Soybeans': 1.08,
      'Rice': 1.03,
    };
    return trends[cropType] || 1.0;
  }
}
