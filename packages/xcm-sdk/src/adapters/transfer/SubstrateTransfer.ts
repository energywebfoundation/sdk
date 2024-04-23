import { AssetAmount, ExtrinsicConfig } from '@galacticcouncil/xcm-core';

import { TransferProvider } from '../types';
import { SubstrateService, normalizeAssetAmount } from '../../substrate';
import { XCall } from '../../types';

export class SubstrateTransfer implements TransferProvider<ExtrinsicConfig> {
  readonly #substrate: SubstrateService;

  constructor(substrate: SubstrateService) {
    this.#substrate = substrate;
  }

  async calldata(account: string, config: ExtrinsicConfig): Promise<XCall> {
    const extrinsic = this.#substrate.getExtrinsic(config);
    return {
      from: account,
      data: extrinsic.toHex(),
    } as XCall;
  }

  async getFee(
    account: string,
    amount: bigint,
    feeBalance: AssetAmount,
    config: ExtrinsicConfig
  ): Promise<AssetAmount> {
    let fee: bigint;
    try {
      fee = await this.#substrate.getFee(account, config);
    } catch {
      // Can't estimate fee if transferMultiasset with no balance
      fee = 0n;
    }
    const params = normalizeAssetAmount(fee, feeBalance, this.#substrate);
    return feeBalance.copyWith(params);
  }
}
