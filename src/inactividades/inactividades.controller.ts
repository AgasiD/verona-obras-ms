import { Controller } from "@nestjs/common";
import { InactividadesService } from "./inactividades.service";
import { MessagePattern, Payload } from "@nestjs/microservices";

@Controller('inactividades')
export class InactividadesController {
  constructor(private readonly inactividadesService: InactividadesService) { }

  @MessagePattern('inactividades.grabarInactividad')
  grabarInactividad(@Payload() payload) {
    return this.inactividadesService.grabarInactividad(payload);

  }
  @MessagePattern('inactividades.obtenerInactividades')
  obtenerInactividades(@Payload() payload) {
    return this.inactividadesService.obtenerInactividades();
  }
  @MessagePattern('inactividades.obtenerInactividad')
  obtenerInactividad(@Payload() payload) {
    return this.inactividadesService.obtenerInactividad(payload.id);

  }
  @MessagePattern('inactividades.modificarInactividad')
  modificarInactividad(@Payload() payload) {
    return this.inactividadesService.modificarInactividad(payload);

  }
  @MessagePattern('inactividades.borrarInactividad')
  borrarInactividad(@Payload() payload) {
    return this.inactividadesService.borrarInactividad(payload.id);

  }

}