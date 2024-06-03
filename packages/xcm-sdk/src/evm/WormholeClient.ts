import {
  Abi,
  AnyEvmChain,
  Precompile,
  WormholeChain,
  AnyChain,
} from '@galacticcouncil/xcm-core';

import { encoding } from '@wormhole-foundation/sdk-base';
import { keccak256 } from '@wormhole-foundation/sdk-connect';
import { deserialize } from '@wormhole-foundation/sdk-definitions';
import { XCallEvm } from 'types';

import { encodeFunctionData } from 'viem';

export class WormholeClient {
  async isTransferCompleted(
    chain: AnyChain,
    vaaBytes: string
  ): Promise<boolean> {
    const ctx = chain as AnyEvmChain;
    const ctxWh = ctx as WormholeChain;
    const provider = ctx.client.getProvider();
    const tokenBridge = ctxWh.getTokenBridge();

    const vaaArray = encoding.b64.decode(vaaBytes);
    const vaaArrayDes = deserialize('Uint8Array', vaaArray);
    const vaaDigestArray = keccak256(vaaArrayDes.hash);
    const vaaDigest = encoding.hex.encode(vaaDigestArray);

    const payload = await provider.readContract({
      address: tokenBridge as `0x${string}`,
      abi: Abi.TokenBridge,
      functionName: 'isTransferCompleted',
      args: ['0x' + vaaDigest],
    });
    return payload as boolean;
  }

  redeem(chain: AnyChain, from: string, vaaBytes: string): XCallEvm {
    const ctxWh = chain as WormholeChain;
    const vaaArray = encoding.b64.decode(vaaBytes);
    const vaaHex = encoding.hex.encode(vaaArray);

    const abi = Abi.TokenBridge;
    const data = encodeFunctionData({
      abi: abi,
      functionName: 'completeTransfer',
      args: ['0x' + vaaHex],
    });

    return {
      abi: JSON.stringify(abi),
      data: data,
      from: from,
      to: ctxWh.getTokenBridge(),
    } as XCallEvm;
  }

  redeemMrl(from: string, vaaBytes: string): XCallEvm {
    const vaaArray = encoding.b64.decode(vaaBytes);
    const vaaHex = encoding.hex.encode(vaaArray);

    const abi = Abi.Gmp;
    const data = encodeFunctionData({
      abi: abi,
      functionName: 'wormholeTransferERC20',
      args: ['0x' + vaaHex],
    });
    return {
      abi: JSON.stringify(abi),
      data: data,
      from: from,
      to: Precompile.Bridge,
    } as XCallEvm;
  }
}
