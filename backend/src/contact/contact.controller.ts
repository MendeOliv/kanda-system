import { Controller, Post, Body } from '@nestjs/common';
import { ContactService } from './contact.service';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Contact')
@Controller('api/contact')
export class ContactController {
  constructor(private contactService: ContactService) {}

  @Post('send')
  @ApiOperation({ summary: 'Enviar mensagem de contacto' })
  async send(@Body() body: any) {
    return this.contactService.send(body);
  }
}