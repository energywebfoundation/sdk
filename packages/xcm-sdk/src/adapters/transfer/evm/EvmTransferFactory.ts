import { ContractConfig } from '@moonbeam-network/xcm-builder';
import { Batch } from './Batch';
import { Bridge } from './Bridge';
import { XTokens } from './XTokens';
import { EvmTransfer } from './EvmTransfer';

import { EvmClient } from '../../../evm';

export class EvmTransferFactory {
  static get(client: EvmClient, config: ContractConfig): EvmTransfer {
    switch (config.module) {
      case 'Batch':
        return new Batch(client, config);
      case 'Bridge':
        return new Bridge(client, config);
      case 'Xtokens':
        return new XTokens(client, config);
      default: {
        throw new Error(
          'Contract type ' + config.module + ' is not supported yet'
        );
      }
    }
  }
}
