import { Controller, Get, Param, Res } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import type { Response } from 'express';
import { CertificatesService } from './certificates.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Public } from '../common/decorators/public.decorator';
import type { SupabaseUser } from '../auth/auth.service';

@ApiTags('learn/certificates')
@ApiBearerAuth()
@Controller('learn/certificates')
export class CertificatesController {
  constructor(private readonly service: CertificatesService) {}

  @Get('my')
  findMy(@CurrentUser() user: SupabaseUser) {
    return this.service.findByUser(user.id);
  }

  @Get(':id/download')
  async download(
    @Param('id') id: string,
    @CurrentUser() user: SupabaseUser,
    @Res() res: Response,
  ) {
    const pdf = await this.service.generatePdf(id, user.id);
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="bukz-certificate-${id}.pdf"`,
      'Content-Length': pdf.length,
    });
    res.end(pdf);
  }

  @Public()
  @Get(':id/verify')
  verify(@Param('id') id: string) {
    return this.service.verify(id);
  }
}
