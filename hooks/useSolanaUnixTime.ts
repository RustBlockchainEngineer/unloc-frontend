export function useSolanaUnixTime(): number {
  // This needs to be replaced with code that fetches the blockchain time
  // SYSVAR_CLOCK_PUBKEY

  return Math.floor(Date.now() / 1000);
}
