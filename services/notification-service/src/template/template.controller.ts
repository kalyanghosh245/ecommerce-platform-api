import { Controller, Get, Post, Body, Param, Headers } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { TemplateService } from './template.service';

@ApiTags('Notification Templates')
@Controller('notifications/templates')
export class TemplateController {
  constructor(private readonly templateService: TemplateService) {}

  @Get()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List all templates' })
  async listTemplates() {
    return this.templateService.listTemplates();
  }

  @Get(':name')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get template by name' })
  async getTemplate(@Param('name') name: string) {
    return this.templateService.getTemplate(name);
  }

  @Post()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create custom template' })
  async createTemplate(
    @Body() body: { name: string; template: any },
  ) {
    this.templateService.createCustomTemplate(body.name, body.template);
    return { message: 'Template created' };
  }

  @Post('render')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Render template with variables' })
  async renderTemplate(
    @Body() body: { template: string; variables: Record<string, any> },
  ) {
    return {
      rendered: this.templateService.renderTemplate(body.template, body.variables),
    };
  }
}