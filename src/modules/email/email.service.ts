import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;
  private templatesDir: string;

  constructor(private configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get<string>('email.host'),
      port: this.configService.get<number>('email.port'),
      secure: false,
      auth: {
        user: this.configService.get<string>('email.user'),
        pass: this.configService.get<string>('email.password'),
      },
    });

    this.templatesDir = path.join(
      process.cwd(),
      'src',
      'modules',
      'email',
      'templates',
    );

    if (!fs.existsSync(this.templatesDir)) {
      this.templatesDir = path.join(
        process.cwd(),
        'dist',
        'modules',
        'email',
        'templates',
      );
    }
  }

  private loadTemplate(templateName: string): string {
    const templatePath = path.join(this.templatesDir, `${templateName}.html`);

    if (!fs.existsSync(templatePath)) {
      throw new Error(`Email template not found: ${templatePath}`);
    }

    return fs.readFileSync(templatePath, 'utf-8');
  }

  private replaceVariables(
    template: string,
    variables: Record<string, any>,
  ): string {
    let result = template;
    for (const [key, value] of Object.entries(variables)) {
      const regex = new RegExp(`{{${key}}}`, 'g');
      result = result.replace(regex, value);
    }
    return result;
  }

  async sendVerificationEmail(email: string, name: string, token: string) {
    const verificationUrl = `${this.configService.get('appClient.url')}/verify-email?token=${token}`;

    const template = this.loadTemplate('verify-email');

    const html = this.replaceVariables(template, {
      name,
      verificationUrl,
      year: new Date().getFullYear(),
    });

    const mailOptions = {
      from: `"eWaiter" <${this.configService.get<string>('email.from')}>`,
      to: email,
      subject: 'Verify Your Email - eWaiter',
      html,
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      return info;
    } catch (error) {
      throw error;
    }
  }

  async sendWelcomeEmail(email: string, name: string, restaurantName: string) {
    const loginUrl = `${this.configService.get('appClient.url')}/login`;

    const template = this.loadTemplate('welcome-email');

    const html = this.replaceVariables(template, {
      name,
      restaurantName,
      loginUrl,
      year: new Date().getFullYear(),
    });

    const mailOptions = {
      from: `"eWaiter" <${this.configService.get<string>('email.from')}>`,
      to: email,
      subject: 'Welcome to eWaiter!',
      html,
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      return info;
    } catch (error) {
      throw error;
    }
  }

  async sendPasswordResetEmail(email: string, name: string, token: string) {
    const resetUrl = `${this.configService.get('appClient.url')}/admin/reset-password?token=${token}`;

    const template = this.loadTemplate('password-reset-email');

    const html = this.replaceVariables(template, {
      name,
      resetUrl,
      year: new Date().getFullYear(),
    });

    const mailOptions = {
      from: `"eWaiter" <${this.configService.get<string>('email.from')}>`,
      to: email,
      subject: 'Password Reset Request - eWaiter',
      html,
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      return info;
    } catch (error) {
      throw error;
    }
  }
}
