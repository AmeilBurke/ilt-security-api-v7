import { Test, TestingModule } from '@nestjs/testing';
import { VenueBansController } from './venue-bans.controller';
import { VenueBansService } from './venue-bans.service';

describe('VenueBansController', () => {
  let controller: VenueBansController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [VenueBansController],
      providers: [VenueBansService],
    }).compile();

    controller = module.get<VenueBansController>(VenueBansController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
