import { Controller, Get } from '@nestjs/common';
import { UsersService } from './users.service';
import { ApiBearerAuth } from '@nestjs/swagger';
import { ActiveUser } from '../auth/decorators/user.decorator';

@ApiBearerAuth('access-token')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}
  @Get()
  get(@ActiveUser() user: any) {
    console.log(user);
    return 'succests';
  }
}
