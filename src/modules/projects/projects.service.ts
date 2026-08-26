import { ConflictException, Injectable } from '@nestjs/common';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { MemberProjectRole, Prisma } from 'generated/prisma/client';

@Injectable()
export class ProjectsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createProjectDto: CreateProjectDto, userId: string) {
    const { projectName, key, description } = createProjectDto;

    try {
      if (key) {
        const existingProject = await this.prisma.project.findUnique({
          where: { key },
        });

        if (existingProject) {
          throw new ConflictException('Project key already exists');
        }
      }

      const newProject = await this.prisma.project.create({
        data: {
          projectName,
          key,
          description,
          members: {
            create: {
              userId,
              role: MemberProjectRole.ADMIN,
            },
          },
        },
        include: {
          members: true,
        },
      });

      return {
        message: 'Create project success',
        data: newProject,
      };
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException('Project key already exists');
      }

      throw error;
    }
  }

  findAll() {
    return `This action returns all projects`;
  }

  findOne(id: number) {
    return `This action returns a #${id} project`;
  }

  update(id: number, updateProjectDto: UpdateProjectDto) {
    return `This action updates a #${id} project`;
  }

  remove(id: number) {
    return `This action removes a #${id} project`;
  }
}
