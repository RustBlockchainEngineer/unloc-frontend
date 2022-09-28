export const SkeletonTable = () => {
  const item = new Array(8).fill(0);
  return (
    <>
      <div className="offers-table-heading">
        {item.map((_item, index) => (
          <div key={`hrow-${index}`} className="row-cell" />
        ))}
      </div>
      {item.map((_item, index) => (
        <div className="offers-table-row" key={`brow-${index}`}>
          <a>
            <div className="row-cell" />
            <div className="row-cell" />
            <div className="row-cell" />
            <div className="row-cell" />
            <div className="row-cell" />
            <div className="row-cell" />
            <div className="row-cell" />
            <div className="row-cell" />
          </a>
        </div>
      ))}
    </>
  );
};
