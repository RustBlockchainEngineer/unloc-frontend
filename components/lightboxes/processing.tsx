import React from "react";

import { BlobLoader } from "@components/layout/blobLoader";

export const Processing = (): JSX.Element => {
  return (
    <div className="lightbox-processing">
      <BlobLoader />
      <span>Processing Transaction</span>
    </div>
  );
};
