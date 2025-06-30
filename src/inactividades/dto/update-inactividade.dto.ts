import { PartialType } from '@nestjs/mapped-types';
import { CreateInactividadeDto } from './create-inactividade.dto';
import { IsNotEmpty, IsNumber, IsPositive, IsString, MinLength } from 'class-validator';

export class UpdateInactividadeDto extends PartialType(CreateInactividadeDto) {
    
    @IsNotEmpty()
    @IsString()
    id: string;

    @IsString()
    @MinLength(4)
    nombre?: string;
    
    @IsNumber()
    @IsPositive()
    diasInactivos?: number;
    
}
