import { Module } from '@nestjs/common';
import { MailService } from 'src/services';
import { MailerModule } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [
    MailerModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        transport: {
          host: configService.get<string>('EMAIL_PROVIDER_HOST'),
          secure: true,
          port: configService.get<number>('EMAIL_PROVIDER_PORT'),
          auth: {
            user: configService.get<string>('EMAIL_PROVIDER_USER'),
            pass: configService.get<string>('EMAIL_PROVIDER_PASSWORD'),
          },
        },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [MailService],
})
export class MailModule {}
