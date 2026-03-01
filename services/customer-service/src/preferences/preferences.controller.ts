import { Controller, Get, Put, Body, Headers, Ip } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PreferencesService } from './preferences.service';

@ApiTags('Preferences')
@Controller('preferences')
export class PreferencesController {
  constructor(private readonly preferencesService: PreferencesService) {}

  @Get()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get user preferences' })
  async getPreferences(@Headers('x-user-id') userId: string) {
    return this.preferencesService.getPreferences(userId);
  }

  @Put()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update preferences' })
  async updatePreferences(
    @Headers('x-user-id') userId: string,
    @Body() preferences: any,
  ) {
    return this.preferencesService.updatePreferences(userId, preferences);
  }

  @Put('marketing-consent')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update marketing consent (GDPR)' })
  async updateMarketingConsent(
    @Headers('x-user-id') userId: string,
    @Body('consent') consent: boolean,
    @Ip() ipAddress: string,
  ) {
    return this.preferencesService.updateMarketingConsent(userId, consent, ipAddress);
  }
}