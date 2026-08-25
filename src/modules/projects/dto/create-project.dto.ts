import { IsNotEmpty, IsOptional, IsString, Matches } from 'class-validator';

export class CreateProjectDto {
  @IsString()
  @IsNotEmpty({ message: 'Project name is required' })
  projectName: string;

  @IsOptional()
  @IsString()
  @Matches(/^[A-Z][A-Z0-9]{1,9}$/, {
    message:
      'Project key must start with an uppercase letter and contain 2-10 uppercase letters or numbers',
  })
  key?: string;

  @IsOptional()
  @IsString()
  description?: string;
}
