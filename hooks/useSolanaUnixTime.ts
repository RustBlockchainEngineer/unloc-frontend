export function useSolanaUnixTime(): number {
  // This needs to be replaced with code that fetches the blockchain time
  // SYSVAR_CLOCK_PUBKEY
  return Math.floor(Date.now() / 1000);

  // Something like this...
  // const { connection } = useConnection();
  // const [currentTime, setCurrentTime] = useState<number | undefined>();

  // useCallback(async () => {
  //   const info = await connection.getAccountInfo(SYSVAR_CLOCK_PUBKEY);
  //   if (!info) return;

  //   const unixTime = info.data.readBigInt64LE(8 * 4);
  //   console.log("Now ", dayjs(Number(unixTime) * 1000).format("DD/MM/YYYY"));
  //   setCurrentTime(Number(unixTime));
  // }, [connection]);

  // return Number(currentTime);
}
