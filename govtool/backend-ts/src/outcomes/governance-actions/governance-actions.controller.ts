import { Controller, Get, Param, Query } from "@nestjs/common";

import { OutcomesGovernanceActionService } from "./governance-actions.service";

@Controller('outcomes/governance-actions')
export class OutcomesGovernanceActionsController {
    constructor (
        private readonly governanceActionService: OutcomesGovernanceActionService,
    ) {}

    @Get()
    findAll(
        @Query('search') search?: string,
        @Query('filters') filters?: string,
        @Query('sort') sort?: string,
        @Query('page') page?: string,
        @Query('limit') limit?: string,
    ) {
        const filterArray = filters ? filters.split(','):[];

        return this.governanceActionService.findAll({
            search,
            filters: filterArray,
            sort,
            page: page === undefined ? 1: Number(page),
            limit: limit === undefined ? 12 : Number(limit),
        });
    }

    @Get('metadata')
    findMetadata(
        @Query('url') url: string,
        @Query('hash') hash : string,
    ) {
        return this.governanceActionService.getMetadata(url,hash);
    }

    @Get('proposal/:hash')
    findProposal(@Param('hash') hash: string) {
        return this.governanceActionService.findProposal(hash);
    }

    @Get(':id')
    findOne(
        @Param('id') id:string,
        @Query('index') index?: string,
    ) {
        const govActionId = `${id}#${index}`;
        return this.governanceActionService.findOne(govActionId);
    }
}