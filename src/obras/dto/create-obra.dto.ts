import { IsBoolean, IsDecimal, IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString, MinLength } from "class-validator";

export class CreateObraDto {

    @IsString()
    @MinLength(5)
    nombre: string;

    @IsString()
    @MinLength(5)
    barrio: string;

    @IsString()
    @MinLength(5)
    lote: string;

    @IsNumber()
    @IsPositive()
    diasEstimados: number;

    @IsOptional()
    propietarios?: any[];


    @IsString()
    imageId?: string;

    @IsString()
    @IsOptional()
    descripcion?: string;

    @IsOptional()
    imageURL: string;

    @IsNumber()
    @IsNotEmpty()
    diaInicio: number;

    @IsBoolean()
    crearDrive: boolean;

    @IsDecimal()
    @IsNotEmpty({message: 'La latitud es obligatoria'})
    latitud: number;

    @IsDecimal()
    @IsNotEmpty({message: 'La longitud es obligatoria'})
    longitud: number;

}
