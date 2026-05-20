import { Module } from "@nestjs/common";

import { MetadataController } from "./metadata.controller";
import { MetadataService } from "./metadata.service";

@Module({
    exports: [MetadataService],
    controllers: [MetadataController],
    providers: [MetadataService]
})

export class MetadataModule {}