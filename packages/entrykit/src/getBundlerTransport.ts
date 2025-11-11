import { Chain, http } from "viem";
import { wiresaw } from "@latticexyz/common/internal";

export function getBundlerTransport(chain: Chain) {
  if ("wiresaw" in chain.rpcUrls) {
    return wiresaw();
  }

  // TODO: bundler websocket
  const bundlerHttpUrl = chain.rpcUrls.bundler?.http[0];
  if (bundlerHttpUrl) {
    return http(bundlerHttpUrl);
  }

  throw new Error(`Chain ${chain.id} config did not include a bundler RPC URL.`);
}
