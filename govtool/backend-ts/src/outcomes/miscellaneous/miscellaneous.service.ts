import { Injectable, BadRequestException } from '@nestjs/common';
import { DbService } from 'src/db/db.service';
import { SqlService } from 'src/sql/sq.service';
import * as blake from 'blakejs';
import * as ed from '@noble/ed25519';
import * as jsonld from 'jsonld';
import {
  SignatureVerificationDto,
  SignatureVerificationResult,
} from '../types/signature.types';
import { verifyCIP8Signature } from '../utils/cardano-utils';

@Injectable()
export class OutcomesMiscellaneousService {
    constructor(
        private readonly dbService: DbService,
        private readonly sqlService: SqlService,
    ) {}
  async getNetworkMetrics(epoch: number| null) {
    const sql = this.sqlService.load('get-network-metrics.sql');
    const result = await this.dbService.query(sql,[epoch]);

    return result?.rows[0];
  }
  
  async getEpochParams(_epoch: number | null) {
    const sql = this.sqlService.load('get-epoch-params.sql');
    const result = await this.dbService.query(sql, [_epoch]);

    return result.rows[0];
  }

   async verifySignature(
      body: SignatureVerificationDto,
    ): Promise<SignatureVerificationResult> {
      const { author, metadataUrl } = body;

      try {
        if (!author?.witness?.witnessAlgorithm) {
          throw new BadRequestException('Algorithm is missing in witness');
        }

        if (!author.witness.publicKey || !author.witness.signature) {
          throw new BadRequestException('Missing publicKey or signature in witness');
        }

        const rawData = await this.fetchMetadata(metadataUrl);
        const parsedData = JSON.parse(rawData) as Record<string, unknown>;

        if (!parsedData.body) {
          throw new BadRequestException('Metadata does not contain body field');
        }

        const jsonToCanonicalize = {
          '@context': parsedData['@context'],
          body: parsedData.body,
        };

        const canonized = await jsonld.canonize(jsonToCanonicalize, {
          algorithm: 'URDNA2015',
          format: 'application/n-quads',
        });

        const canonizedBytes = new TextEncoder().encode(canonized);
        const hashedBody = blake.blake2b(canonizedBytes, undefined, 32);

        switch (author.witness.witnessAlgorithm.toLowerCase()) {
          case 'ed25519':
            return this.verifyEd25519Signature({
              signature: author.witness.signature,
              hashedBody,
              publicKey: author.witness.publicKey,
            });

          case 'cip-0008':
            return verifyCIP8Signature({
              signature: author.witness.signature,
              vkey: author.witness.publicKey,
              message: canonizedBytes,
            });

          default:
            throw new BadRequestException(
              `Unsupported witness algorithm: ${author.witness.witnessAlgorithm}`,
            );
        }
      } catch (error) {
        return {
          isValid: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        };
      }
    }
    private async fetchMetadata(url: string): Promise<string> {
      const resolvedUrl = this.resolveMetadataUrl(url);

      const response = await fetch(resolvedUrl, {
        headers : {
          'User-Agent': 'GovTool/Signature-Verification-Tool',
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) {
      throw new BadRequestException('Failed to fetch metadata');
    }

    return response.text();
  }

  private resolveMetadataUrl(url: string): string {
    if (url.startsWith('ipfs://')) {
      const gateway = process.env.IPFS_GATEWAY;

      if (!gateway) {
        throw new BadRequestException('IPFS_GATEWAY is not configured');
      }

      return `${gateway.replace(/\/$/, '')}/${url.slice(7)}`;
    }

    return url;
  }

  private async verifyEd25519Signature({
      signature,
      hashedBody,
      publicKey,
    }: {
      signature: string;
      hashedBody: Uint8Array;
      publicKey: string;
    }): Promise<SignatureVerificationResult> {
      const signatureBytes = ed.etc.hexToBytes(signature);
      const publicKeyBytes = ed.etc.hexToBytes(publicKey);

      const isValid = await ed.verifyAsync(
        signatureBytes,
        hashedBody,
        publicKeyBytes,
      );

      return {
        isValid,
        message: isValid ? 'Signature is valid' : 'Signature verification failed',
      };
    }
}