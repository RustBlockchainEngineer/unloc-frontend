import { Skeleton } from "react-skeleton-generator";

export const SkeletonOfferId = (): JSX.Element => {
  return (
    <Skeleton.SkeletonThemeProvider color="#482688">
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "94px 0 86px 0",
        }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            height: "96px",
            width: "100%",
            maxWidth: "780px",
          }}>
          <Skeleton
            width="96px"
            height="96px"
            borderRadius="24px"
            style={{ marginRight: "11px", marginBottom: 0 }}
          />
          <div style={{ marginLeft: "25px", width: "100%", maxWidth: "650px" }}>
            <Skeleton
              borderRadius="10px"
              count={2}
              widthMultiple={["50%", "100%"]}
              heightMultiple={["20px", "65px"]}
            />
          </div>
        </div>
        <Skeleton width="370px" height="126px" borderRadius="9px" />
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: "30px" }}>
        <Skeleton width="48%" height="260px" borderRadius="10px" />

        <Skeleton width="48%" height="260px" borderRadius="10px" />
      </div>
    </Skeleton.SkeletonThemeProvider>
  );
};
