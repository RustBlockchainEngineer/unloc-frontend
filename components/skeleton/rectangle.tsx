interface SkeletonRectangle {
  offerType: string;
}

export const SkeletonRectangle = ({ offerType }: SkeletonRectangle) => {
  let count!: number;
  let type: string;

  if (offerType === "grid") {
    count = 4;
    type = "offers-grid-item";
  } else if (offerType === "wallet") {
    count = 9;
    type = "collateral-list-item";
  } else if (offerType === "my-offers") {
    count = 2;
    type = "offer";
  }

  const items = new Array(count).fill(0);

  return (
    <>
      {items.map((_item, index) => (
        <div key={`${type}-${index}`} className={`${type} skeleton`} />
      ))}
    </>
  );
};
