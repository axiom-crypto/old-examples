"use client";

import { useState } from "react";

export default function FloatingInfoOverlay() {
  const [show, setShow] = useState(false);
  return (
    <>
      <div 
        className={`relative border-[1px] ${show ? "border-highlight text-highlight" : "border-text text-text"} bg-buttonbg rounded-full font-mono text-xs px-1`}
        onMouseOver={() => setShow(true)}
        onMouseOut={() => setShow(false)}
      >
        i
      </div>
      <div className={`inline-flex ${show ? "" : "hidden"} absolute z-10 top-[-2em] right-6 px-4 py-2 w-[33em] text-sm flex-wrap border-[1px] border-highlight bg-[rgba(0,0,0,0.9)]`}>
        {"Choose the deployed contract's slot number that corresponds to "} <span className="font-mono pr-2">{" mapping (address => uint256) balances "}</span> 
        {" (ERC20) or "} <span className="font-mono pr-2">{" mapping (address => uint256) balanceOf "}</span> {" (ERC721)."}
      </div>
    </>
  )
}