import { IsString } from "class-validator";

export class UpdateInactividadDTO{
    @IsString()
    id: string

    @IsString()
    fecha: string

    @IsString()
    nombre: string;
}