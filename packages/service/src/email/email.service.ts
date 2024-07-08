import {Injectable} from '@nestjs/common';

import {createTransport, Transporter} from "nodemailer";
import {ConfigService} from "@nestjs/config";

@Injectable()
export class EmailService {

    transporter: Transporter

    constructor(private configService: ConfigService) {
        this.transporter = createTransport({
            host: this.configService.get('NODE_MAILER_HOST'),
            port: this.configService.get('NODE_MAILER_PORT'),
            secure: false,
            auth: {
                user: this.configService.get('NODE_MAILER_AUTH_USER'),
                pass: this.configService.get('NODE_MAILER_AUTH_PASS'),
            }
        })
    }

    async sendEmail({to, subject, html}) {
        await this.transporter.sendMail({
            from: {
                name: '小林会议室预定系统',
                address: this.configService.get('NODE_MAILER_AUTH_USER')
            },
            to,
            subject,
            html,
        })
    }
}
