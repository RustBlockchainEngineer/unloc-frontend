import { Skeleton } from "react-skeleton-generator";

export const SkeletonTable = (): JSX.Element => {
  const brows = new Array(8).fill(0);
  const cols = new Array(5).fill(0);

  const styles = {
    head: {
      width: "7%",
      height: "33px",
      borderRadius: "4px",
    },
    body: {
      width: "7%",
      height: "25px",
      borderRadius: "4px",
      spaceBetween: "0px",
    },
  };

  return (
    <Skeleton.SkeletonThemeProvider color="#3e1f78" style={{ width: "100%" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          height: "34px",
          width: "100%",
        }}>
        <Skeleton width="29%" height="33px" borderRadius="4px" />
        <Skeleton width="15%" height="33px" borderRadius="4px" />
        <Skeleton width="15%" height="33px" borderRadius="4px" />
        {cols.map((_item, index) => (
          <Skeleton key={`hcol-${index}`} {...styles.head} />
        ))}
      </div>

      {brows.map((_item, index) => (
        <div
          key={`brow-${index}`}
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            height: "50px",
            width: "100%",
          }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              height: "40px",
              width: "29%",
            }}>
            <Skeleton width="36px" height="36px" borderRadius="36px" spaceBetween="0px" />
            <div style={{ display: "flex", width: "100%", maxWidth: "320px" }}>
              <Skeleton height="25px" borderRadius="25px" />
            </div>
          </div>
          <Skeleton width="15%" height="25px" borderRadius="4px" spaceBetween="0px" />
          <Skeleton width="15%" height="25px" borderRadius="4px" spaceBetween="0px" />
          {cols.map((_item, index) => (
            <Skeleton key={`bcol-${index}`} {...styles.body} />
          ))}
        </div>
      ))}
    </Skeleton.SkeletonThemeProvider>
  );
};
