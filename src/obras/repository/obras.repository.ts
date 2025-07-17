import { HttpStatus, Injectable } from "@nestjs/common";
import { HttpService } from "src/common/services/http/http.service";
import { Obra } from "../entities/obra.entity";
import { envs } from "src/config/envs";
import { getDataFromJSON, handlerError } from "src/common/helpers/helper";
import { RpcException } from "@nestjs/microservices";

@Injectable()

export class ObrasRepository {
    obras: Obra[] = [];
    uri: string;

    constructor(private readonly http: HttpService) {
        this.uri = envs.googleURI + '/obra'

    }

    async obtenerObras() {
        try {

            // if (this.obras.length == 0) {
                await this.cargarObras();
            // }

            return this.obras
        } catch (err) {
            handlerError(err);
        }
    }

    async obtenerObra(obraId: string) {
        try {

            let obra = await this.cargarObra(obraId);
            if (obra == undefined) throw new RpcException({ message: `Obra ${obraId} no encontrada`, status: 404 })
            return obra
        } catch (err) {
            handlerError(err);
        }
    }

    private async cargarObra(obraId) {

        let data = (await this.http.get(`${this.uri}/${obraId}.json`)).data;
        let obra: Obra;
        if (data === undefined) throw new RpcException({ status: HttpStatus.NOT_FOUND, message: `Obra id ${obraId} no encontrada` })

        obra = new Obra(obraId, data);
        return obra!
    }



    async grabarObra(obra: Obra) {
        await this.obtenerObras();
        let response = await this.http.post(`${this.uri}.json`, {}, obra);
        let data = response.data;
        obra.id = data.name;
        this.obras.push(obra);
        return obra;
    }

    async modificarObra(obra: Obra, actualizaDrive = false) {
        let obras = await this.obtenerObras();
        if (obra.id == '') throw new RpcException({ status: HttpStatus.BAD_REQUEST, message: 'ID is empty' });
        const response = await this.http.patch(`${this.uri}/${obra.id}.json`, {}, obra);
        if (response.status >= 300) throw new RpcException({ status: response.status, message: response.statusText })
        let i = this.obras.findIndex(o => o.id == obra.id);
        const obra_updated = response.data
        let obraToUpdate = this.obras[i];
        const dataUpdate = {
            ...obraToUpdate,
            ...obra_updated
        }
        this.obras[i] = new Obra(dataUpdate.id, dataUpdate);
        if (actualizaDrive) { }
        // await DriveService.updateFile(obra.driveFolderId, { name: obra.nombre });

        return dataUpdate;

    }

    private async cargarObras() {

        let data = (await this.http.get(`${this.uri}.json`)).data;
        if (data && data != null) {
            this.obras = getDataFromJSON(data).map(data => {
                let obra = new Obra(data.id, data.attributes);
                this.ordenarEtapasObra(obra)
                return obra;
            }).filter(obra => obra.activo);
        }
        console.log('-- OBRAS CARGADAS --');
    }



    private ordenarEtapasObra(obra: Obra) {
        obra.etapas = obra.etapas.sort((a, b) => {
            if (a.orden > b.orden) {
                return 1;
            } else if (a.orden < b.orden) {
                return -1
            } else {
                return 0;
            }

        });
    }
}