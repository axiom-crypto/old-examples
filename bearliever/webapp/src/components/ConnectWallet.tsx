"use client";

import { shortenAddress } from '@/shared/utils';
import {
  useAccount,
  useConnect,
  useDisconnect,
  useEnsName,
} from 'wagmi'
 
export default function ConnectWallet() {
  const { address, isConnected } = useAccount()
  const { data: ensName } = useEnsName({ address })
  const { connect, connectors, error } = useConnect()
  const { disconnect } = useDisconnect()
 
  if (isConnected) {
    return (
      <button 
        onClick={() => disconnect()}
        className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 duration-100 cursor-pointer"
      >
        { ensName ? ensName : shortenAddress(address as string) }
      </button>
    )
  }
 
  return (
    <div>
      {connectors.map((connector) => (
        <button
          disabled={!connector.ready}
          key={connector.id}
          onClick={() => connect({ connector })}
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 duration-100 cursor-pointer"
        >
          {"Connect Wallet"}
        </button>
      ))}
 
      {error && <div>{error.message}</div>}
    </div>
  )
}