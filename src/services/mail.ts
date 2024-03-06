import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

type EmailOptions = {
  to: string;
  from: string;
  subject: string;
  text?: string;
  html: string;
};

@Injectable()
export class MailService {
  constructor(private readonly mailerService: MailerService) {}

  async sendMail(options: EmailOptions) {
    try {
      await this.mailerService.sendMail(options);
      return {
        success: true,
      };
    } catch (error) {
      return {
        success: false,
      };
    }
  }
}
