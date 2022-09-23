export const SkeletonDepositNFT = () => {
  const item = new Array(9).fill(0);
  return (
    <>
      {item.map((_item, index) => (
        <div key={`collateral-list-item-${index}`} className="collateral-list-item" />
      ))}
    </>
  );
};
