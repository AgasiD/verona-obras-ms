import { Module } from '@nestjs/common';
import { ObrasService } from './obras.service';
import { ObrasController } from './obras.controller';

import { HttpService } from '../common/services/http/http.service';
import { NatsModule } from 'src/nats/nats.module';
import { ObrasRepository } from './repository/obras.repository';


@Module({
  controllers: [ObrasController],
  providers: [HttpService, ObrasService, ObrasRepository],
  imports: [ NatsModule],
})
export class ObrasModule {}
