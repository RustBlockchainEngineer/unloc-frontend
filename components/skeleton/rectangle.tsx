import { Skeleton } from "react-skeleton-generator";
import { useContext } from "react";
import { StoreContext } from "@pages/_app";

interface SkeletonRectangle {
  offerType: string;
}

export const SkeletonRectangle = ({ offerType }: SkeletonRectangle) => {
  const { MyOffers } = useContext(StoreContext);
  let count!: number;
  let childClass: string;
  let parentClass!: string;

  const styles = {
    grid: {
      width: "304px",
      height: "304px",
      borderRadius: "8px",
    },
    wallet: {
      width: "100%",
      height: "98px",
      borderRadius: "6px",
    },
    ["my-offers"]: {
      width: "49%",
      maxWidth: "626px",
      height: "232px",
      borderRadius: "6px",
    },
  };

  if (offerType === "grid") {
    count = 4;
    childClass = "offers-grid-item";
    parentClass = "offers-grid";
  } else if (offerType === "wallet") {
    count = 9;
    childClass = "collateral-list-item";
    parentClass = "NFT-lb-collateral-list";
  } else if (offerType === "my-offers") {
    if (MyOffers.activeCategory === "active") {
      count = 2;
    } else {
      count = 4;
    }
    parentClass = "list-row";
    childClass = "offer";
  }

  const items = new Array(count).fill(0);

  return (
    <Skeleton.SkeletonThemeProvider color="#482688" style={{ width: "100%" }}>
      <div className={parentClass}>
        {items.map((_item, index) => (
          <Skeleton key={`${childClass}-${index}`} {...styles[offerType]} />
        ))}
      </div>
    </Skeleton.SkeletonThemeProvider>
  );
};
