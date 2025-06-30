import { IsNumber, IsPositive, IsString, Min, MinLength } from "class-validator";

export class CreateInactividadeDto {
    @IsString()
    @MinLength(5)
    nombre: string;

    @IsNumber()
    @IsPositive()
    diasInactivos: number;
}
