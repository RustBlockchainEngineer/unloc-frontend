import React, { useContext, useRef } from "react";
import { observer } from "mobx-react";
import { StoreContext } from "@pages/_app";

interface LightboxProps {
  children?: JSX.Element;
  classNames?: string;
}

export const Lightbox: React.FC<LightboxProps> = observer(
  ({ children, classNames }: LightboxProps) => {
    const store = useContext(StoreContext);
    const container = useRef<HTMLDivElement>(null);

    const closeWindow = (e: any, check: boolean) => {
      if (e.target !== e.currentTarget && check) {
        return;
      }
      if (store.Lightbox.canClose) {
        container.current?.classList.add("lightbox-hiding");
        setTimeout(() => store.Lightbox.setVisible(false), 300);
      }
    };

    return (
      <div
        ref={container}
        onMouseDown={(e) => {
          closeWindow(e, true);
        }}
        className={`lightbox ${classNames ? classNames : ""}`}>
        <div
          className="lightbox__container"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key == "Escape") {
              store.Lightbox.setVisible(false);
            }
          }}>
          {store.Lightbox.canClose ? (
            <i
              onClick={(e) => {
                closeWindow(e, false);
              }}
              className="icon icon--cross lightbox__close"
            />
          ) : (
            <></>
          )}
          {children}
        </div>
      </div>
    );
  },
);
