import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma/prisma.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';

@Injectable()
export class ProjectsService {
  constructor(private prisma: PrismaService) {}

  async create(createProjectDto: CreateProjectDto, ownerId: string) {
    return this.prisma.project.create({
      data: {
        ...createProjectDto,
        ownerId,
        members: {
          connect: { id: ownerId },
        },
      },
      include: {
        owner: true,
        members: true,
      },
    });
  }

  async findAll() {
    return this.prisma.project.findMany({
      include: { owner: true, members: true },
    });
  }

  async findOne(id: string) {
    const project = await this.prisma.project.findUnique({
      where: { id },
      include: { owner: true, members: true },
    });

    if (!project) throw new NotFoundException('Project not found');
    return project;
  }

  async update(id: string, updateProjectDto: UpdateProjectDto) {
    return this.prisma.project.update({
      where: { id },
      data: updateProjectDto,
      include: { owner: true, members: true },
    });
  }

  async remove(id: string) {
    return this.prisma.project.delete({
      where: { id },
    });
  }
}
