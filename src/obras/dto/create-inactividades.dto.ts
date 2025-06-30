import { IsArray, IsBoolean, IsNotEmpty, IsOptional, IsString } from "class-validator";

export class CreateInactividadesDTO{

    @IsArray()
    @IsNotEmpty()
    ids: string[]

    @IsString()
    @IsNotEmpty()
    nombre: string

    @IsString()
    fecha: string;

    @IsString()
    fileName: string;
    
    @IsString()
    usuarioId: string;

    @IsBoolean()
    @IsOptional()
    privado?: boolean = false
} 