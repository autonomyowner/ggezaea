import { Controller, Get } from '@nestjs/common';
import { PLANS } from './plans.constants';

@Controller('plans')
export class PlansController {
  @Get()
  getPlans() {
    return {
      plans: PLANS,
      currency: 'USD',
      vatRate: 0.20, // 20% VAT
    };
  }
}
