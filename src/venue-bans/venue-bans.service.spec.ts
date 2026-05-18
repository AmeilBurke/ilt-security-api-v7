import { Test, TestingModule } from '@nestjs/testing';
import { VenueBansService } from './venue-bans.service';

describe('VenueBansService', () => {
  let service: VenueBansService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [VenueBansService],
    }).compile();

    service = module.get<VenueBansService>(VenueBansService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
