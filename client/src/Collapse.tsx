import React from "react";
import { useState, useRef, useEffect } from "react";

// Inspired by [https://spin.atomicobject.com/collapse-component-react]
const Collapse: React.FC<React.PropsWithChildren<{ isExpanded: boolean }>> = ({
  isExpanded,
  children,
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [contentHeight, setContentHeight] = useState(0);

  // TODO: do something about the magic constant
  useEffect(() => {
    if (ref.current) {
      setContentHeight(ref.current.clientHeight + 50);
    }
  }, [children]);

  // Thanks to [https://stackoverflow.com/a/69864970/8125485]
  return (
    <div
      className="overflow-hidden transition-all delay-150 duration-300"
      style={{
        height: isExpanded ? contentHeight : 0,
      }}
    >
      <div ref={ref}>{children}</div>
    </div>
  );
};

export default Collapse;
