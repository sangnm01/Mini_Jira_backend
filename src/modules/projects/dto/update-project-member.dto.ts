import { PartialType } from '@nestjs/mapped-types';
import { AddProjectMemberDto } from './add-project-member.dto';
import { IsEnum } from 'class-validator';
import { MemberProjectRole } from 'generated/prisma/client';

export class UpdateProjectMemberDto extends PartialType(AddProjectMemberDto) {
    @IsEnum(MemberProjectRole, {
        message: 'Invalid role. Must be ADMIN, or MEMBER.'
    })
    role: MemberProjectRole;
}
