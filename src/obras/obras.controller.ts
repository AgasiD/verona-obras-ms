
import { ObrasService } from './obras.service';
import { CreateInactividadDTO } from './dto/create-inactividad.dto';
import { MyResponse } from '../common/entities/httpResponse.entity';
import { MessagePattern, Payload, RpcException } from '@nestjs/microservices';
import { Controller, Logger } from '@nestjs/common';
import { Pedido } from './entities/pedido.entity';
import { Etapa } from 'src/common/entities/controles/entities/etapa.entity';
import { Usuario } from 'src/common/entities/usuarios/usuario.entity';
import { Obra } from './entities/obra.entity';

@Controller()
export class ObrasController {

  logger: Logger = new Logger('ObrasController');
  constructor(
    private readonly obraService: ObrasService,
  ) { }

  // ----------- GET -----------

  @MessagePattern('obras.obtenerObras')
  async obtenerObras() {
    this.logger.log('obtenerObras');
    const data = (await this.obraService.obtenerObras())!.map(obra => ({
      ...obra,
      porcentajeRealizado: obra.porcentajeRealizado,
      etapas: new Array<Etapa>(),
    }));
    return (data)
  }

  @MessagePattern('obras.byUser')
  async obtenerObrasByUser(@Payload('userId') userId: string) {
    const data = (await this.obraService.obtenerObrasByUser(userId))!.map(obra => ({
      ...obra,
      porcentajeRealizado: obra.porcentajeRealizado,
      etapas: new Array<Etapa>(),
    }));
    return (data)

  }

  @MessagePattern('obras.obtenerInactividadesPorObras')
  async obtenerInactividadesPorObras() {
    return (await this.obraService.obtenerInactividadesPorObras());
  }

  @MessagePattern('obras.obtenerPedidos')
  async obtenerPedidos(@Payload() payload: any) {
    const { obraId } = payload;
    return (await this.obraService.obtenerPedidos(obraId));
  }

   @MessagePattern('obras.obtenerPedidosCerrados')
  async obtenerPedidosCerrados(@Payload('obraId') obraId: string) {
    return (await this.obraService.obtenerPedidosCerrados(obraId));
  }

  

  @MessagePattern('obras.obtenerPedido')
  async obtenerPedido(@Payload('pedidoId') pedidoId: string) {
    return (await this.obraService.obtenerPedido(pedidoId));
  }

  @MessagePattern('obras.obtenerPedidosObras')
  async obtenerPedidosPorObra(@Payload('usuarioId') usuarioId: string) {
    return await this.obraService.obtenerPedidosPorObra(usuarioId);
  }

  @MessagePattern('obras.obtenerTareasExtras')
  async obtenerTareasExtras(@Payload('etapaId') etapaId: string, @Payload('subetapaId') subetapaId: string, @Payload('obraId') obraId?: string) {
    return await this.obraService.obtenerTareasExtras(etapaId, subetapaId, obraId);
  }


  @MessagePattern('obras.obtenerObra')
  async obtenerObra(@Payload('obraId') obraId: string) {
    const data: Obra = (await this.obraService.obtenerObra(obraId))!
    return data
  }

  @MessagePattern('obras.crearObra')
  async crearObra(@Payload() dto: any) {
    return (await this.obraService.crearObra(dto));
  }





  // @MessagePattern('obras.reload')
  // recargarObras(@Payload() dto: any) {
  //   return this.obraService.recargarObras(dto);
  // }

  //   @MessagePattern('obras.reloadPedidos')
  //   recargarPedidos(@Payload() dto: any) {
  //     return this.obraService.recargarPedidos(dto);
  //   }

  //   // ----------- PUT -----------

  @MessagePattern('obras.enabledFiles')
  async addEnabledFiles(@Payload() dto: any) {
    return (await this.obraService.addEnabledFiles(dto.obraId, dto));
  }


  @MessagePattern('obras.modificarObra')
  async modificarObra(@Payload() dto: any) {
    return (await this.obraService.modificarObra(dto));
  }

  @MessagePattern('obras.quitarUsuario')
  async quitarUsuario(@Payload() payload) {
    const { obraId, usuarioId } = payload;
    return (await this.obraService.quitarUsuarioObra(obraId, usuarioId));
  }

  @MessagePattern('obras.actualizaTarea')
  async actualizaTarea(@Payload() dto: any) {
    const { obraId, ...tarea } = dto
    return (await this.obraService.actualizaTarea(obraId, tarea));
  }

  @MessagePattern('obras.agregarUsuario')
  async agregarUsuario(@Payload() payload) {
    const { obraId, usuarioId } = payload;
    // agregar
    // notificar TODO
    return (await this.obraService.agregarUsuarioToObra(obraId, usuarioId));
  }

  @MessagePattern('obras.agregarTarea')
  async agregarTarea(@Payload() payload){
    return this.obraService.agregarTarea(payload);
  }

   @MessagePattern('obras.agregarEtapa')
  async agregarEtapa(@Payload() payload){
    return this.obraService.agregarEtapa(payload);
  }

  @MessagePattern('obras.asignarTarea')
  async asignarTarea(@Payload() dto: any) {
    return (await this.obraService.asignarTarea(dto));
  }

  @MessagePattern('obras.quitarTarea')
  async quitarTarea(@Payload() dto: any) {
    return (await this.obraService.quitarTarea(dto));
  }

  @MessagePattern('obras.asignarEtapa')
  async asignarEtapa(@Payload() dto: any) {
    return (await this.obraService.asignarEtapa(dto));
  }

  @MessagePattern('obras.quitarEtapa')
  async quitarEtapa(@Payload() dto: any) {
    return (await this.obraService.quitarEtapa(dto));
  }

  @MessagePattern('obras.quitarSubetapa')
  async quitarSubetapa(@Payload() dto: any) {
    return (await this.obraService.quitarSubetapa(dto));
  }

  @MessagePattern('obras.actualizarIdDrive')
  async actualizarIdDrive(@Payload() dto: any) {
    return (await this.obraService.actualizarIdDrive(dto));
  }

  @MessagePattern('obras.asignarSubetapa')
  async asignarSubetapa(@Payload() dto: any) {
    return (await this.obraService.asignarSubetapa(dto));
  }

  @MessagePattern('obras.actualizarOrdenTareas')
  async actualizarOrdenTareas(@Payload() payload: any) {
    const {obraId, dto} = payload
    return (await this.obraService.actualizarOrdenTareas(obraId, dto));
  }


  @MessagePattern('obras.controlObra')
  async obtenerControlObra(@Payload() payload: any)
  {
    const { obraId } = payload;
    const obra = await this.obraService.obtenerObra(obraId)
    return obra?.etapas;
  }


  @MessagePattern('obras.eliminarObra')
  async eliminarObra(@Payload('obraId') obraId: string) {
    //NOTIFICAR A USUARIO-MS QUE SE QUITAN  //TODO 
    return (await this.obraService.eliminarObra(obraId));
  }


  @MessagePattern('obras.actualizaUsuarioObras')
  async actualizaUsuarioObras(@Payload() payload: string) {
    //NOTIFICAR A USUARIO-MS QUE SE QUITAN  //TODO 
    return (await this.obraService.actualizaUsuarioObras(payload));
  }



  @MessagePattern('obras.obtenerObrasUsuario')
  async obtenerObrasUsuario(@Payload() usuario: any) {
    return (await this.obraService.obtenerObrasUsuario(usuario));
  }



  @MessagePattern('obras.quitarObrasFromUsuario')
  async quitarObrasFromUsuario(@Payload() usuario: any) {
    return (await this.obraService.quitarObrasfromUsuario(usuario));
  }


  @MessagePattern('obras.eliminarPedido')
  async eliminarPedido(@Payload() payload) {
    const { idObra, pedidoId } = payload;
    return await this.obraService.eliminarPedido(idObra, pedidoId)
  }

  @MessagePattern('obras.agregarPedido')
  async agregarPedido(@Payload() payload) {
    const { idObra, pedidoId } = payload;
    const data = await this.obraService.agregarPedido(idObra, pedidoId);
    return data
  }







  // ----------- INACTIVIDADES -----------


  @MessagePattern('obras.nuevaInactividad')
  async nuevaInactividad(@Payload('obraId') obraId: string, @Payload() dto: CreateInactividadDTO) {
    return (await this.obraService.nuevaInactividad(obraId, dto));
  }



  @MessagePattern('obras.inactividadMasiva')
  async nuevaInactividadMasiva(@Payload() dto: any) {
    return (await this.obraService.nuevaInactividadMasiva(dto));
  }


  @MessagePattern('obras.updateInactividad')
  async editInactividad(@Payload() dto: any) {
    return (await this.obraService.editInactividad(dto.obraId, dto));
  }


  @MessagePattern('obras.eliminarInactividad')
  async eliminarInactividad(
    @Payload('obraId') obraId: string,
    @Payload('inactividadId') inactividadId: string,
  ) {
    return (await await this.obraService.eliminarInactividad(obraId, inactividadId))
  }

}
