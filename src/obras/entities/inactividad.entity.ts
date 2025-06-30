export class Inactividad {

    id: string
    nombre: string
    fecha: string
    fileName: string
    privado: boolean
    usuario: string
    diasInactivos?: number

    constructor({ id, nombre, fecha, fileName, privado = false, usuario, diasInactivos = 1  }) {
        this.id = id;
        this.nombre = nombre;
        this.fecha = fecha;
        this.fileName = fileName;
        this.privado = privado;
        this.usuario = usuario;
        this.diasInactivos = diasInactivos
    }

}