import { Module } from '@nestjs/common';

import { DbService } from 'src/db/db.service';
import { SqlService } from 'src/sql/sq.service';
import { OutcomesGovernanceActionsController } from './governance-actions/governance-actions.controller';
import { OutcomesGovernanceActionService } from './governance-actions/governance-actions.service';
import { OutcomesMiscellaneousController } from './miscellaneous/miscellaneous.controller';
import { OutcomesMiscellaneousService } from './miscellaneous/miscellaneous.service';
import { ConfigService } from 'src/config/config.service';
import { MetadataModule } from 'src/metadata/metadata.module';
@Module({
  imports: [MetadataModule],
  controllers: [
    OutcomesGovernanceActionsController,
    OutcomesMiscellaneousController,
  ],
  providers: [
    OutcomesGovernanceActionService,
    OutcomesMiscellaneousService,
    DbService,
    SqlService,
    ConfigService
  ],
})
export class OutcomesModule {}