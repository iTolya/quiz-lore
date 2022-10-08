import { UserService } from '../user/user.service';
import { Session } from '../auth/session.decorator';
import { SessionContainer } from 'supertokens-node/recipe/session';
import { AuthSupertokensGuard } from '../auth/auth-supertokens.guard';
import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { UpdateUserRequestDto } from '../user/user.dto';

@ApiTags('User')
@Controller({
  path: 'user',
  version: '1'
})
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  @UseGuards(AuthSupertokensGuard)
  async getUser(@Session() session: SessionContainer): Promise<any> {
    return await this.userService.showUser(session.getUserId());
  }

  @Patch()
  @UseGuards(AuthSupertokensGuard)
  async updateUser(@Session() session: SessionContainer, @Body() data: UpdateUserRequestDto): Promise<any> {
    return await this.userService.updateUser(data, session.getUserId());
  }
}
