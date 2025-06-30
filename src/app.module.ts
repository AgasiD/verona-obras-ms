import { Module } from '@nestjs/common';
import { ObrasModule } from './obras/obras.module';
import { InactividadesModule } from './inactividades/inactividades.module';

@Module({
  imports: [ObrasModule, InactividadesModule],
})
export class AppModule {}
