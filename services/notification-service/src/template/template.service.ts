import { Injectable } from '@nestjs/common';

@Injectable()
export class TemplateService {
  private templates: Map<string, any> = new Map();

  constructor() {
    this.loadDefaultTemplates();
  }

  private loadDefaultTemplates() {
    this.templates.set('order-confirmation', {
      subject: 'Order Confirmation',
      emailTemplate: 'order-confirmation',
      smsTemplate: 'Your order {{orderNumber}} for ${{total}} is confirmed!',
    });

    this.templates.set('shipping-update', {
      subject: 'Shipping Update',
      emailTemplate: 'shipping-update',
      smsTemplate: 'Order {{orderNumber}} is {{status}}.',
    });

    this.templates.set('password-reset', {
      subject: 'Password Reset',
      emailTemplate: 'password-reset',
      smsTemplate: null,
    });

    this.templates.set('welcome', {
      subject: 'Welcome!',
      emailTemplate: 'welcome',
      smsTemplate: 'Welcome {{firstName}}! Start shopping now.',
    });
  }

  getTemplate(name: string): any {
    return this.templates.get(name);
  }

  renderTemplate(template: string, variables: Record<string, any>): string {
    let rendered = template;
    for (const [key, value] of Object.entries(variables)) {
      rendered = rendered.replace(new RegExp(`{{${key}}}`, 'g'), value);
    }
    return rendered;
  }

  createCustomTemplate(name: string, template: any): void {
    this.templates.set(name, template);
  }

  listTemplates(): string[] {
    return Array.from(this.templates.keys());
  }
}