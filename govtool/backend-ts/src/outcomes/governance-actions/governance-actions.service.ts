import { Injectable, NotImplementedException } from "@nestjs/common";
import { DbService } from "src/db/db.service";
import { SqlService } from "src/sql/sq.service";

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

    getMetadata(_url:string, _hash: string) {
        throw new NotImplementedException('')
    }
     findProposal(_hash: string) {
        throw new NotImplementedException('');
    }

    findOne(_govActionId: string) {
        throw new NotImplementedException('');
    }
}