import { useAccount } from "wagmi";
import NonceCheck from "./NonceCheck";
import NonceConnect from "./NonceConnect";

export default function Nonce() {
  
  return (
    <NonceCheck>
      <NonceConnect />
    </NonceCheck>
  )
}