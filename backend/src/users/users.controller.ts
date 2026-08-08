import { Controller, Get, Put, Post, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('User')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('api/user')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get('profile')
  @ApiOperation({ summary: 'Obter perfil do utilizador autenticado' })
  async getProfile(@Request() req) {
    return this.usersService.getProfile(req.user.userId);
  }

  @Put('profile')
  @ApiOperation({ summary: 'Atualizar perfil do utilizador' })
  async updateProfile(@Request() req, @Body() body: any) {
    return this.usersService.updateProfile(req.user.userId, body);
  }

  @Get('addresses')
  @ApiOperation({ summary: 'Listar moradas do utilizador' })
  async listAddresses(@Request() req) {
    return this.usersService.listAddresses(req.user.userId);
  }

  @Post('addresses')
  @ApiOperation({ summary: 'Adicionar nova morada' })
  async addAddress(@Request() req, @Body() body: any) {
    return this.usersService.addAddress(req.user.userId, body);
  }

  @Put('addresses/:id')
  @ApiOperation({ summary: 'Editar morada existente' })
  async updateAddress(@Request() req, @Param('id') id: string, @Body() body: any) {
    return this.usersService.updateAddress(req.user.userId, id, body);
  }

  @Delete('addresses/:id')
  @ApiOperation({ summary: 'Remover morada' })
  async deleteAddress(@Request() req, @Param('id') id: string) {
    return this.usersService.deleteAddress(req.user.userId, id);
  }
}
