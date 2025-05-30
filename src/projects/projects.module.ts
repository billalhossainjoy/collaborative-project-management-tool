import { Module } from '@nestjs/common';
import { ProjectsController } from './projects.controller';
import { ProjectsService } from './projects.service';
import { PrismaModule } from '../database/prisma/prisma.module';
import { AppConfigModule } from '../config/config.module';

@Module({
  imports: [AppConfigModule, PrismaModule],
  controllers: [ProjectsController],
  providers: [ProjectsService],
})
export class ProjectsModule {}
