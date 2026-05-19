import { Injectable, NotImplementedException } from '@nestjs/common';

import {
  SignatureVerificationDto,
  SignatureVerificationResult,
} from '../types/signature.types';

@Injectable()
export class OutcomesMiscellaneousService {
  getNetworkMetrics(_epoch: number | null) {
    throw new NotImplementedException('');
  }

  getEpochParams(_epoch: number | null) {
    throw new NotImplementedException('');
  }

  verifySignature(
    _body: SignatureVerificationDto,
  ): SignatureVerificationResult {
    throw new NotImplementedException('');
  }
}