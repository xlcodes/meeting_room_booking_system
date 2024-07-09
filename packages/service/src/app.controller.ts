import {Controller, Get} from '@nestjs/common';
import {AppService} from './app.service';
import {RequireLogin, RequirePermission, UserInfo} from "./common/decorator/require.decorator";

@Controller()
export class AppController {
    constructor(private readonly appService: AppService) {
    }

    @Get()
    getHello(): string {
        return this.appService.getHello();
    }

    @Get('aaa')
    @RequireLogin()
    @RequirePermission('aaa')
    aaa(@UserInfo('username') username: string, @UserInfo() userInfo: any) {
        console.log(username, "--- username ---")
        console.log(userInfo, '=== userInfo ===')
        return 'aaa'
    }

    @Get('bbb')
    bbb() {
        return 'bbb'
    }
}
