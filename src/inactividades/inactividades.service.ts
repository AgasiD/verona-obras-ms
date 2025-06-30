import { Injectable } from '@nestjs/common';
import { CreateInactividadeDto } from './dto/create-inactividade.dto';
import { UpdateInactividadeDto } from './dto/update-inactividade.dto';
import { HttpService } from '../common/services/http/http.service';
import { getDataFromJSON, handlerError } from '../common/helpers/helper';
import { Inactividad } from './entities/inactividade.entity';
import { MyResponse } from '../common/entities/httpResponse.entity';

@Injectable()
export class InactividadesService {
  uri: string;
  constructor(private readonly http: HttpService) {
    this.uri = process.env.GOOGLE_URI + '/inactividad'
  }

  cargarInactividades = async () => {
    let inactividades: Inactividad[] = [];
    let response = await this.http.get(`${this.uri}.json`);//?auth=${token} FORDEPLOY
    let datos = response.data;
    if (datos != null) {
      inactividades = getDataFromJSON(datos).map(data => {
        return new Inactividad(
          data.id,
          data.attributes.nombre,
          data.attributes.diasInactivos,
        );
        ;
      });
    }
    return inactividades;
  }

  obtenerInactividades = async () => {
    let data = await this.cargarInactividades();
    return new MyResponse(data);

  }


  obtenerInactividad = async (id: string) => {

    return (await this.cargarInactividades()).find(ina => ina.id === id);

  }


  grabarInactividad = async (inactividad: CreateInactividadeDto) => {
    try {
      let response = await this.http.post(`${this.uri}.json`, {}, inactividad);
      return response;
    } catch (err) {
      handlerError(err);
    }
  }


  modificarInactividad = async (inactividad: UpdateInactividadeDto) => {
    try {
      let response = await this.http.put(`${this.uri}.json`, {}, inactividad);
      return response;
    } catch (err) {
      handlerError(err);
    }
  }


  borrarInactividad = async (id) => {
    try {

      let response = await this.http.delete(`${this.uri}/${id}.json`);
      return response;
    } catch (err) {
      handlerError(err);

    }
  }
}
