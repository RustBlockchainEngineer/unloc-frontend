export const SkeletonGrid = () => {
  const items = new Array(4).fill(0);
  return (
    <>
      {items.map((_item, index) => (
        <div key={`grid-${index}`} className="offers-grid-item" />
      ))}
    </>
  );
};
