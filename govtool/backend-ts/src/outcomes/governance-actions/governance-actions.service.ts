import { Injectable, NotFoundException, HttpException,InternalServerErrorException } from "@nestjs/common";
import { DbService } from "src/db/db.service";
import { SqlService } from "src/sql/sq.service";
import { MetadataService } from "src/metadata/metadata.service";
type GovernanceActionListParams = {
  search?: string;
  filters: string[];
  sort?: string;
  page: number;
  limit: number;
};

@Injectable()
export class OutcomesGovernanceActionService {
    constructor (
        private readonly dbService: DbService,
        private readonly sqlService: SqlService,
        private readonly metadataService: MetadataService,
    ) {}
    async findAll(params: GovernanceActionListParams) {
        const searchTerm = params.search?.trim() ?? '';
        const filterArray = params.filters.length > 0 ? params.filters : [];
        const sortOption = params.sort || 'newestFirst';
        const page = Number.isFinite(params.page) && params.page > 0 ? params.page : 1;
        const limit = Number.isFinite(params.limit) && params.limit > 0 ? params.limit : 12;
        const offset = (page - 1) * limit;

        const sql = this.sqlService.load('list-governance-actions.sql');

        return this.dbService.query(sql, [
        searchTerm,
        filterArray,
        sortOption,
        offset,
        limit,
        ]).then((result) => result.rows);
  }

    async getMetadata(url:string, hash: string) {
     const result = await this.metadataService.validateMetadata({
            url,
            hash
        });
        return {
            metadataStatus: result.status ?? null,
            metadataValid: result.valid,
            data: result.metadata,
        }
    }
      async findProposal(hash: string): Promise<unknown> {
        const apiUrl = process.env.PDF_API_URL?.replace(/\/+$/, '');
        if(!apiUrl){
            throw new InternalServerErrorException('PDF_API_URL is not configgured');
        }

        const response = await fetch(`${apiUrl}/proposals/${hash}`,{
            headers: {
                'User-Agent': 'GovTool/Proposal-Fetch-Tool',
                'Content-Type': 'application/json',
            },
        });
         if (!response.ok) {
        throw new HttpException(
        await response.text(),
        response.status,
        );
  }
        return response.json();
    }

      async findOne(_govActionId: string) {
        const sql = this.sqlService.load('get-governance-action.sql');
        const result = await this.dbService.query(sql, [_govActionId]);

        if (result.rows.length === 0) {
            throw new NotFoundException(
                `Governance action with ID '${_govActionId} not found`,
            );
        }
        return result.rows[0];
    }
}