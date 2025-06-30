import { IsBoolean, IsNumber, IsString, MinLength } from "class-validator";

 export class UpdateTareaDTO{
    
    @IsString()
    @MinLength(1)
    etapaId: string;
    @IsString()
    @MinLength(1)
    subetapaId: string;
    @IsString()
    @MinLength(1)
    tareaId: string;
    @IsString()
    @MinLength(1)
    usuarioId: string;
    
    @IsBoolean()
    realizado: boolean;
    @IsBoolean()
    iniciado:  boolean;

    @IsNumber()
    tsRealizado: number;
    @IsNumber()
    tsIniciado: number;
 }
