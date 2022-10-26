import { Skeleton } from "react-skeleton-generator";

export const SkeletonMyProfile = (): JSX.Element => {
  return (
    <Skeleton.SkeletonThemeProvider color="#482688">
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <Skeleton width="26%" height="155px" borderRadius="6px" spaceBetween="0px" />

        <Skeleton width="39%" height="155px" borderRadius="6px" spaceBetween="0px" />

        <Skeleton width="33%" height="155px" borderRadius="6px" spaceBetween="0px" />
      </div>
      <div style={{ marginTop: "50px" }}>
        <Skeleton height="120px" borderRadius="6px" />
      </div>
    </Skeleton.SkeletonThemeProvider>
  );
};
