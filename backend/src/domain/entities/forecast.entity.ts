export interface DemandForecast {
  id: string;
  cropType: string;
  region: string;
  predictedDemand: number;
  confidence: number;
  forecastDate: Date;
  timeHorizon: number; // days
  factors: {
    weather: number;
    market: number;
    seasonal: number;
    historical: number;
  };
  createdAt: Date;
}

export interface ForecastCreateInput {
  cropType: string;
  region: string;
  timeHorizon: number;
}
