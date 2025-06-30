import { Module } from '@nestjs/common';
import { InactividadesService } from './inactividades.service';
import { InactividadesController } from './inactividades.controller';
import { HttpService } from '../common/services/http/http.service';
import { NatsModule } from 'src/nats/nats.module';

@Module({
  controllers: [InactividadesController],
  providers: [HttpService, InactividadesService],
  imports: [NatsModule],

})
export class InactividadesModule { }
