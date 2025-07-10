import { HttpStatus, Inject, Injectable, } from '@nestjs/common';
import { CreateObraDto } from './dto/create-obra.dto';
import { Obra } from './entities/obra.entity';
import * as uuid from 'uuid'

import {handlerError } from '../common/helpers/helper';

import { UpdateTareaDTO } from './dto/update-tarea.dto';
import { CreateInactividadDTO } from './dto/create-inactividad.dto';
import { Inactividad } from './entities/inactividad.entity';
import { UpdateInactividadDTO } from './dto/update-inactividad.dto';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { NATS_SERVICE } from 'src/config/services';
import { firstValueFrom } from 'rxjs';
import { ESTADOS, Pedido } from './entities/pedido.entity';
import { Notificacion } from 'src/common/entities/notificacion.entity';
import { UserFactory } from 'src/common/entities/usuarios/usuario.factory';
import { Usuario } from 'src/common/entities/usuarios/usuario.entity';
import { Tarea } from 'src/common/entities/controles/entities/tarea.entity';
import { Etapa } from 'src/common/entities/controles/entities/etapa.entity';
import { SubEtapa } from 'src/common/entities/controles/entities/subetapa.entity';
import { CreateSubetapaDTO } from 'src/common/entities/controles/dtos/create-subetapa.dto';
import { TareaDTO } from 'src/common/entities/controles/dtos/dto/tareaDTO.entity';
import { envs } from 'src/config/envs';
import { ObrasRepository } from './repository/obras.repository';

@Injectable()
export class ObrasService {

  fileService: any

  constructor(
    @Inject(NATS_SERVICE) private readonly client: ClientProxy,
    private readonly obrasRepository: ObrasRepository
  ) {

  }


  async agregarUsuarioToObra(obraId: string, usuarioId: string) {
    try {

      let obra = (await this.obrasRepository.obtenerObra(obraId))!;
      let user = await this.getUsuario(usuarioId)!;
      let auxUser = UserFactory.newUser({
        id: user.id,
        dni: user.dni,
        email: user.email,
        nombre: user.nombre,
        apellido: user.apellido,
        role: user.role,
        profileURL: user.profileURL!
      })
      obra.agregarUsuario(auxUser);
      await this.obrasRepository.modificarObra(obra);
      return { success: true };
    } catch (err) {
      return { success: false, message: err.message };

    }

  }

  private async getUsuario(usuarioId) {
    return await firstValueFrom(this.client.send('usuarios.obtenerUsuario', { usuarioId }))!;
  }


  private async getUsuarios() {
    return await firstValueFrom(this.client.send('usuarios.obtenerUsuarios', {}))!;
  }

  private async getPedido(pedidoId) {
    return await firstValueFrom(this.client.send('pedidos.obtenerPedido', { pedidoId }))!;
  }


  private async getPedidos() {
    return await firstValueFrom(this.client.send('pedidos.obtenerPedidos', {}))!;
  }

  async quitarUsuarioObra(obraId: string, usuarioId: string) {


    let usuario = await this.getUsuario(usuarioId);
    let obra = (await this.quitarUsuario(obraId, usuario))!;
    let notificacion_usuario = new Notificacion('obra', 'Removido de una obra', `Te han removido de: ${obra.nombre}`, '');
    // await this.usuariosService.agregarNotificacionUsuario(new Array<Usuario>(usuario), notificacion_usuario); TODO
    let notificacion_push = {
      title: `Quitado de proyecto`,
      body: `Se lo ha removido de la obra: ${obra!.nombre}`,
      data: { type: 'new-obra' },
    }
    // await this.pushNotifService.enviarNotificaciones(new Array<Usuario>(usuario), notificacion_push) TODO
    return { success: true }

  }

  async obtenerPedidosPorObra(usuarioId: string) {
    try {
      let obras = (await this.obrasRepository.obtenerObras())!;
      let pedidos: Pedido[] = await this.getPedidos()
      let obrasResponse: any[] = [];
      let usuarios = await this.getUsuarios();
      let usuario = await this.getUsuario(usuarioId);

      if (usuario.role == 2) pedidos = pedidos.filter(pedido => pedido.idUsuario == usuarioId);

      obras.forEach(obra => {
        let aux_pedidos = new Array<Pedido>();
        if (obra.pedidos.length > 0) {
          let pedidosObra = pedidos.filter(pedido => pedido.idObra.includes(obra.id!) && pedido.estado < 5)

          for (let a of pedidosObra) {
            a.usuario = usuarios.find(u => u.id == a.idUsuario);
            let pedido = new Pedido(a.id, { ...a, imagenId: a.imagenId, })
            aux_pedidos.push(pedido);
            aux_pedidos;
          }
          
        }

        let aux = {
          "nombre": obra.nombre,
          "barrio": obra.barrio,
          "obraId": obra.id,
          "pedidos": aux_pedidos
        }
        if (aux_pedidos.length > 0) obrasResponse.push(aux);
      });

      return obrasResponse;

    } catch (err) {
      handlerError(err)
    }
  }

  async obtenerPedido(pedidoId: string) {

    try {
      let pedido = await this.getPedido(pedidoId);
      if (!pedido) {
        throw new RpcException({ message: 'Pedido no encontrado', status: 404 });
      }

      let usuario = await this.getUsuario(pedido.idUsuario)!;
      pedido.nombreUsuario = `${usuario.fullName}`
      return pedido;

    } catch (err) {
      handlerError(err)
    }
  }

  async obtenerPedidos(obraId: string, cerrados = false) {
    try {

      let obra = (await this.obrasRepository.obtenerObra(obraId))!;
      let pedidos: Pedido[];
      if (obra.pedidos.length > 0) {
        pedidos = await firstValueFrom(this.client.send('pedidos.obtenerPedidosObra', { pedidos: obra.pedidos, cerrados }));
        for (let pedido of pedidos) {
          if (pedido.idUsuario == '3333333') {
            pedido.idUsuario = '-N1JMn2-R5mlliaJpG3r';
          }
          let usuario = await this.getUsuario(pedido.idUsuario)!;
          pedido.usuario = { apellido: usuario.apellido || '', nombre: usuario.nombre || '', activo: usuario.activo || false };;
        };
        pedidos = pedidos.sort( (a,b) => a.ts < b.ts ? 1 : -1 )
        return pedidos;
      } else {
        return []
      }
    } catch (err) {
      console.log(err)
      throw new RpcException({
        status: HttpStatus.BAD_REQUEST,
        message: err.message,
      });
    }
  }
  async obtenerInactividadesPorObras() {
    try {

      let obras = (await this.obrasRepository.obtenerObras())!;
      let data = obras.map(obra => ({ "nombre": obra.nombre, "id": obra.id, "barrio": obra.barrio, "inactividades": obra.diasInactivos || [] }));
      for (let i = 0; i < data.length; i++) {
        let obra = data[i];
        for (let inactividad of obra.inactividades) {
          if (inactividad.usuario) {
            let usuario: Usuario =  UserFactory.newUser(await this.getUsuario(inactividad.usuario));
            inactividad.nombreUsuario = (`${usuario.fullName}`).toUpperCase();
          } else {
            inactividad.nombreUsuario = ``;
          }
        }
      }
      return data
    } catch (err) {
      throw err
    }
  }

  async obtenerPedidosCerrados(obraId: string) {
    let pedidos = await this.obtenerPedidos(obraId, true);
    return pedidos.filter(pedido => pedido.estado === ESTADOS.CERRADO);
  }


  async obtenerObra( obraId: string){
    const obra = await this.obrasRepository.obtenerObra(obraId);
    return obra;
  }

  async modificarObra( data: any ){
    return await this.obrasRepository.modificarObra(data);
  }


  async obtenerObrasByUser(userID) {

    // NO Valida que el usuario este activo
    let user: Usuario = await this.getUsuario(userID);
    const obras = (await this.obrasRepository.obtenerObras())!;
    let copyObras = obras.map(obra => obra); // Hago esto para generar un array completamente nuevo, de otra forma copia referencias y si edito la copia afecta al original
    let datos = await this.getObrasByRole(user, copyObras);
    return datos
  }

  async obtenerObras() {

    const obras = (await this.obrasRepository.obtenerObras())!;
    let copyObras = obras.map(obra => obra); // Hago esto para generar un array completamente nuevo, de otra forma copia referencias y si edito la copia afecta al original
    return copyObras;
  }

  async eliminarInactividad(obraId: string, inactividadId: string) {
    let obra = (await this.obrasRepository.obtenerObra(obraId))!;
    obra.eliminarInactividad(inactividadId)
    await this.obrasRepository.modificarObra(obra);
    return 'OK';
  }

  async editInactividad(obraId: string, dto: UpdateInactividadDTO) {
    try {
      let obra = (await this.obrasRepository.obtenerObra(obraId))!;
      obra.modificarInactividad(dto)

      await this.obrasRepository.modificarObra(obra);
      return 'OK';
    } catch (err) {
      handlerError(err)
    }
  }
  async nuevaInactividadMasiva(dto: any) {
    try {
      for (let id of dto.ids) await this.nuevaInactividad(id, dto.inactividad);
      return 'OK';
    } catch (err) {
      handlerError(err);
    }
  }

  async nuevaInactividad(obraId: string, dto: CreateInactividadDTO) {
    try {
      let id = uuid.v4();
      let inactividad = new Inactividad({ id, usuario: dto.usuarioId, ...dto });
      let obra = (await this.obrasRepository.obtenerObra(obraId))!;
      if (obra.diaInicio < Date.now()) {
        obra.agregarInactividad(inactividad)
        await this.obrasRepository.modificarObra(obra);
      }
      return 'OK';
    } catch (err) {
      handlerError(err);
    }
  }


  async actualizarOrdenTareas(obraId: string, dto: any) {
    const { tareas, etapaId, subetapaId } = dto;

    try {
      let obra = (await this.obrasRepository.obtenerObra(obraId))!;
      obra.actualizarOrdenTareas(etapaId, subetapaId, tareas);
      await this.obrasRepository.modificarObra(obra);
      return 'OK';
    } catch (err) {
      handlerError(err)
    }
  }




  async asignarSubetapa({ obraId, etapaId, subetapaId }) {
    let obra = await this.obrasRepository.obtenerObra(obraId);
    let subetapa = await firstValueFrom(this.client.send('subetapas.obtenerSubetapaCompleta', { subetapaId }))!
    obra?.asignarSubetapa(etapaId, subetapa);
    await this.obrasRepository.modificarObra(obra!);
    return subetapa;
  }

  async actualizarIdDrive(dto: any) {
    const { obraId, idDrive } = dto;

    try {
      let obra = (await this.obrasRepository.obtenerObra(obraId))!;

      obra.driveFolderId = idDrive;
      obra.folderImages = (await this.fileService.obtenerCarpetaImagenes(obra.driveFolderId))!;
      if (!obra.folderImages || obra.folderImages == '') {
        // si no existe carpeta
        let fotosId = (await this.fileService.agregarCarpeta('12-FOTOS DE OBRA', obra.driveFolderId))!;
        await this.fileService.agregarCarpeta('01-PEDIDOS/EVIDENCIAS', fotosId);
        await this.fileService.agregarCarpeta('02-FOTOS DE OBRA', fotosId);
        obra.folderImages = fotosId;
      }

      obra.rootDriveCliente = (await this.fileService.obtenerCarpetaCliente(obra.driveFolderId))!;
      if (obra.rootDriveCliente == '') {
        // si no existe carpeta
        let clienteFolderId = (await this.fileService.agregarCarpeta('00-CLIENTE', obra.driveFolderId))!;
        obra.rootDriveCliente = clienteFolderId;
        obra.folderImagesCliente = (await this.fileService.agregarCarpeta('06-FOTOS DE OBRA', clienteFolderId))!;
      } else {
        obra.folderImagesCliente = (await this.fileService.obtenerCarpetaProp(obra.rootDriveCliente))!;
      }
      obra.folderImages = obra.folderImagesCliente;

      const articulos_folder = (await this.fileService.obtenerArticulosObraFile(obra.driveFolderId));
      if (articulos_folder) {
        obra.articulosId = articulos_folder.id;
      }

      await this.obrasRepository.modificarObra(obra);
      return {
        "driveFolderId": obra.driveFolderId,
        "folderImages": obra.folderImages,
        "rootDriveCliente": obra.rootDriveCliente,
        "folderImagesCliente": obra.folderImagesCliente,
        "articulosId": obra.articulosId,
      }

    } catch (err) {
      handlerError(err)
    }
  }

  private getObrasByRole(user: Usuario, copyObras: Obra[]) {
    let obrasAux: any[] = [];
    switch (user.role) {
      case 1:
        obrasAux = copyObras;
        break;
      case 3: //Propietarios solo los que este agregado
        copyObras.forEach(obra => {
          let team = obra.propietarios?.map(e => e.id)
          if (team.includes(user.id) || team.includes(user.dni)) {
            obrasAux.push(obra);
          }
        })
        break;
      default: // Resto del equipo obras que este asignado
        copyObras.forEach(async obra => {
          let team = obra.equipo?.map(e => e.id)
          if (team.includes(user.id) || team.includes(user.dni)) obrasAux.push(obra);
        })
        break;
    }
    return obrasAux
  }


  async quitarSubetapa(dto: any) {

    const { etapaId, subetapaId, obraId } = dto.body;
    try {

      let obra = await this.obrasRepository.obtenerObra(obraId);
      obra?.quitarSubetapa(etapaId, subetapaId);
      this.obrasRepository.modificarObra(obra!);
      return 'OK';
    } catch (err) {
      handlerError(err)
    }
  }
  async quitarEtapa(dto: any) {

    const { etapaId, obraId } = dto;
    let obra = await this.obrasRepository.obtenerObra(obraId);
    obra!.quitarEtapa(etapaId);
    await this.obrasRepository.modificarObra(obra!);
    return { success: true };

  }

  async asignarEtapa(dto: any) {
    const { etapaId, obraId } = dto;

    try {

      let obra = await this.obrasRepository.obtenerObra(obraId);

      let etapa = await firstValueFrom(this.client.send('etapas.obtenerEtapaCompleta', { etapaId }))!

      obra!.agregaEtapa(etapa);
      await this.obrasRepository.modificarObra(obra!);
      return etapa;
    } catch (err) {
      handlerError(err)
    }
  }



  async quitarTarea({ etapaId, subetapaId, tareaId, obraId }) {
    try {
      let obra = await this.obrasRepository.obtenerObra(obraId);
      obra?.quitarTarea(etapaId, subetapaId, tareaId!)
      let data = await this.obrasRepository.modificarObra(obra!);
      return data
    } catch (err) {
      handlerError(err)
    }
  }

  async asignarTarea({ etapaId, subetapaId, tareaId, obraId }) {
    try {
      let obra = await this.obrasRepository.obtenerObra(obraId);
      let tarea_asignar = await firstValueFrom(this.client.send('tareas.obtenerTarea', { tareaId }))!
      obra?.agregaTarea(etapaId, tarea_asignar!)
      let data = await this.obrasRepository.modificarObra(obra!);
      return data;
    } catch (err) {
      handlerError(err)
    }
  }


  async actualizaTarea(obraId: string, dto: UpdateTareaDTO) {
    try {
      let obra = (await this.obrasRepository.obtenerObra(obraId))!;
      obra.actualizarTarea(dto)
      let data = await this.obrasRepository.modificarObra(obra);
      return data;
    } catch (err) {
      handlerError(err)
    }
  }

  async addEnabledFiles(obraId: string, dto: any) {
    try {
      let obra = (await this.obrasRepository.obtenerObra(obraId))!;
      obra.habilitarArchivos(dto.ids)
      let data = await this.obrasRepository.modificarObra(obra);
      return data;
    }
    catch (err) {
      handlerError(err);
    }
  }

  async eliminarPedido(idObra: any, idPedido: any) {
    let obra = (await this.obrasRepository.obtenerObra(idObra))!;
    obra.eliminarPedido(idPedido);
    await this.obrasRepository.modificarObra(obra)
    return;
  }

  async agregarPedido(idObra: any, idPedido: any) {
    let obra = (await this.obrasRepository.obtenerObra(idObra))!;
    obra.agregarPedido(idPedido);

    await this.obrasRepository.modificarObra(obra)
    return obra;
  }

  async obtenerTareasExtras(etapaId: string, subetapaId: string, obraId: string | undefined) {

    try {

      let tareasExtras = await firstValueFrom(this.client.send('tareas.obtenerTareasExtras', { subetapaId }))!

      if (obraId) {
        // Busco las etapas que son default pero no estan agregadas a la obra ( Ej se crea una nueva subetapa pero no se aplica a todas)
        let obra = (await this.obrasRepository.obtenerObra(obraId))!;


        let tareas_default = await firstValueFrom(this.client.send('tareas.obtenerTareasDefault', { subetapaId }))!

        let etapaIndex = obra.etapas.findIndex(etapa => etapa.id == etapaId);
        let etapa = obra.etapas[etapaIndex];
        let subetapaIndex = etapa.subetapas!.findIndex(sub => sub.id == subetapaId);
        let subetapa = etapa.subetapas![subetapaIndex];

        // obtengo las tareas asignadas a la obra-etapa
        let tareasAsignadas = subetapa.tareas!.map(t => t.id);

        let difTareas = tareas_default.filter(t => !tareasAsignadas.includes(t.id));

        difTareas.forEach(t => tareasExtras.push(t));
      }

      return tareasExtras;
    }
    catch (err) {
      throw new RpcException({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: err.message,
      });
    }

  }
  async crearObra(obraDTO: CreateObraDto) {
    try {
      const obras = (await this.obrasRepository.obtenerObras())!;

      if (await this.existeObra(obras, obraDTO)) {
        throw new RpcException({ message: 'Obra ya existente', status: 409 });
      }
      let driveFoldersId: {
        driveFolderId?: string
        folderImages?: string
        rootDriveCliente?: string
        folderImagesCliente?: string
        folderImagesPedidos?: string
      } = {}
      if (obraDTO.crearDrive) {
        const nombreCarpeta = `${obraDTO.barrio.toUpperCase()} - ${obraDTO.lote.toUpperCase()} ${obraDTO.nombre.toUpperCase()}`
        driveFoldersId = await this.obtenerIDsCarpetas(nombreCarpeta);
      }


      let etapas: Etapa[] = await firstValueFrom(this.client.send('etapas.obtenerEtapasDefault', {}))!
      let obraReq = new Obra('',
        {
          ...obraDTO,
          ...driveFoldersId,
          etapas,

        });

      let obra = await this.obrasRepository.grabarObra(obraReq);

      this.asignarChats(obra)

      return obra;
    } catch (err) {
      handlerError(err);
    }
  }

  private asignarChats(obra: Obra) {
    //  let chatExternoId = await chatController.crearChat(obra.id, true);
    //  let chatInternoId = await chatController.crearChat(obra.id, false);
    //  obra.chatE = chatExternoId;
    //  obra.chatI = chatInternoId;
    //  await ObraService.modificarObra(obra);


    // obtengo admins para asignarle los chats grupales de obra;
    //  let pms = await obtenerPMO();
    //  for (let pm of pms) {
    //     await asignarChatToUsuario(pm.id, obra);
    //  }
  }


  private async existeObra(obras: Obra[], { nombre, barrio, lote }, obraId?: string) {

    if (obraId) {
      obras = obras
        .filter(obra => obra.id === obraId)
    } else {
      obras = obras
        .filter(obra =>
          obra.nombre.trim() == nombre.trim() &&
          obra.lote == lote &&
          obra.barrio.trim() == barrio.trim())
    }
    if (obras.length > 0) {
      return true;
    }
  }

  async agregarTarea(tareaDTO: TareaDTO) {
    let tarea = new Tarea(uuid.v4(), { ...tareaDTO, subetapa: tareaDTO.subetapaId });
    let obra = (await this.obrasRepository.obtenerObra(tareaDTO.obraId))!;

    if (tareaDTO.proximos) {
      const tarea_res = await firstValueFrom(this.client.send('tareas.grabarTarea', { tarea }))!
      tarea.id = tarea_res.name;
    }
    obra.agregaTarea(tareaDTO.etapaId!, tarea)
    await this.obrasRepository.modificarObra(obra);
    return tarea;
  }

  async agregarSubetapa(subetapaDTO: CreateSubetapaDTO) {
    let subetapa = new SubEtapa({ id: uuid.v4(), ...subetapaDTO });
    let obra = (await this.obrasRepository.obtenerObra(subetapa.obraId!))!;

    if (subetapaDTO.proximos) {
      const subetapa_res = await firstValueFrom(this.client.send('subetapas.grabarSubetapa', { subetapa }))
      subetapa.id = subetapa_res.data.name;
    }

    obra.agregaSubetapa(subetapa)
    await this.obrasRepository.modificarObra(obra);
  }


  async agregarEtapa(dto: any) {
    let etapa = new Etapa({ id: uuid.v4(), ...dto });
    let obra = (await this.obrasRepository.obtenerObra(dto.obraId!))!;

    if (dto.proximos) {
      const etapa_res = await firstValueFrom(this.client.send('etapas.grabarEtapa', etapa))
      etapa_res.id = etapa_res.name;
    }

    obra.agregaEtapa(etapa)
    await this.obrasRepository.modificarObra(obra);
    return etapa;
  }



  async quitarUsuario(obraId: string, usuario: Usuario) {
    try {

      let obra = (await this.obrasRepository.obtenerObra(obraId))!

      switch (usuario.role) {
        case 3:
          obra.quitarPropietario(usuario.id)
          break;
        default:
          obra?.quitarPersonal(usuario.id);
          break

      }
      await this.obrasRepository.modificarObra(obra);

      return obra;
    } catch (err) {
      handlerError(err)
    }
  }
 

  obtenerObrasUsuario = async (usuario: Usuario) => {
    // Valida que el usuario este activo

    const obras = await this.obrasRepository.obtenerObras();
    if (obras == undefined) throw Error('Error al obtener obras')
    let aux_obras = obras.map(obra => obra);
    if (!usuario.activo || usuario.needReLogIn == true) throw Error('Usuario inactivo');

    let obrasAux = await this.getObrasByRole(usuario, aux_obras);
    return obrasAux;
  }



  async quitarObrasfromUsuario(usuario: Usuario) {
    let obras = await this.obtenerObrasByUser(usuario.id)
    for (let i = 0; i < obras.length; i++) {
      let obra = obras[i];
      obra = await this.quitarUsuario(obra.id, usuario);
      await this.obrasRepository.modificarObra(obra);
    }
    return { success: true }
  }

  async eliminarObra(obraId: string) {

    let obras = (await this.obrasRepository.obtenerObras())!;
    if (await this.existeObra(obras, obras[0], obraId)) {
      try {
        let obra = (await this.obrasRepository.obtenerObra(obraId))!;
        obra.desactivarObra()
        await this.obrasRepository.modificarObra(obra, false);
        // await this.http.delete(`${this.uri}/${obraId}.json`);//?auth=${token} FORDEPLOY
        let i = obras.findIndex(o => o.id == obraId);
        obras.splice(i, 1);
        return { success: true }
      } catch (err) {
        handlerError(err)
      }
    }
  }


  async actualizaUsuarioObras(usuario) {
    let obras = await this.obtenerObrasByUser(usuario.id);
    for (let i in obras) {
      let obra = obras[i];
      let y = obra.equipo.findIndex(miembro => miembro.id.includes(usuario.id));
      obra.equipo[y] = {
        id: usuario.id,
        nombre: usuario.nombre,
        apellido: usuario.apellido,
        dni: usuario.dni,
        email: usuario.email,
        role: usuario.role,
        profileURL: usuario.profileURL
      }
      await this.obrasRepository.modificarObra(obra);
    }
  }




  private async obtenerIDsCarpetas(nombreCarpeta: string) {
    const driveFolderId = (await this.fileService.generarCarpetasDrive(nombreCarpeta))!;
    const folderImages = (await this.fileService.obtenerCarpetaImagenes(driveFolderId))!;
    const rootDriveCliente = (await this.fileService.obtenerCarpetaCliente(driveFolderId))!;
    const folderImagesCliente = (await this.fileService.obtenerCarpetaCliente(rootDriveCliente))!;
    const folderImagesPedidos = (await this.fileService.obtenerCarpetaImagenesPedido(driveFolderId))!;
    return {
      driveFolderId,
      folderImages,
      rootDriveCliente,
      folderImagesCliente,
      folderImagesPedidos,
    }
  }
}

