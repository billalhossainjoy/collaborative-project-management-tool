import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class CreateProjectDto {
  @ApiProperty({ example: 'New Website', description: 'Name of the project' })
  @IsString()
  name: string;

  @ApiProperty({
    example: 'Website redesign project',
    description: 'Project description',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;
}
