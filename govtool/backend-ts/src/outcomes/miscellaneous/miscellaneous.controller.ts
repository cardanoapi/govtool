import { Body, Controller, Get, Post, Query } from "@nestjs/common";

import { OutcomesMiscellaneousService } from "./miscellaneous.service";
import  type { SignatureVerificationDto } from "../types/signature.types";

@Controller('outcomes/misc')
export class OutcomesMiscellaneousController {
    constructor(
        private readonly miscellaneousService: OutcomesMiscellaneousService,
    ) {}

    @Get('network/metrics')
    getNetworkMetrics(@Query('epoch') epoch?: string) {
        return this.miscellaneousService.getNetworkMetrics(
           epoch === undefined ? null : Number(epoch),
        );
    }

    @Get('epoch/params')
    getEpochParams(@Query('epoch') epoch?: string) {
        return this.miscellaneousService.getEpochParams(
            epoch === undefined ? null : Number(epoch),
        );
    }

    @Post('verify-signature')
    verifySignature(@Body() body: SignatureVerificationDto) {
        return this.miscellaneousService.verifySignature(body);
    }
}