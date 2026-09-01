import { FastifyRequest, FastifyReply } from 'fastify';
import { GenerateDemandForecastUseCase } from '../../domain/use-cases/forecast/generate-demand-forecast.use-case.js';
import { DemandForecastService } from '../../infrastructure/ai/demand-forecast.service.js';
import { z } from 'zod';

const forecastSchema = z.object({
  cropType: z.string(),
  region: z.string(),
  timeHorizon: z.number().min(1).max(365),
});

export class ForecastController {
  private generateForecastUseCase: GenerateDemandForecastUseCase;

  constructor() {
    const forecastService = new DemandForecastService();
    this.generateForecastUseCase = new GenerateDemandForecastUseCase(forecastService);
  }

  async generate(request: FastifyRequest, reply: FastifyReply) {
    try {
      const data = forecastSchema.parse(request.body);
      const forecast = await this.generateForecastUseCase.execute(data);
      
      reply.send(forecast);
    } catch (error: any) {
      reply.status(400).send({
        error: error.message || 'Forecast generation failed',
      });
    }
  }

  async getHistorical(request: FastifyRequest, reply: FastifyReply) {
    const { cropType, region } = request.query as { cropType?: string; region?: string };
    
    // Simulated historical data
    const historicalData = Array.from({ length: 12 }, (_, i) => ({
      month: i + 1,
      demand: Math.random() * 10000 + 5000,
      actual: Math.random() * 10000 + 5000,
    }));
    
    reply.send({
      cropType: cropType || 'All',
      region: region || 'All',
      data: historicalData,
    });
  }
}
