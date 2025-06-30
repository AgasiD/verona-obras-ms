export class Inactividad {

    id: string;
    nombre: string;
    diasInactivos: number;

    constructor( id , descripcion ,diasInactivos) {
        this.id = id
        this.nombre = descripcion;
        this.diasInactivos = diasInactivos;
    }
}
