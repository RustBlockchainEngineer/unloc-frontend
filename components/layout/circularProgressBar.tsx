import React from "react";

interface ProgressBarProps {
  value: number;
  maxValue: number;
  label: string;
}

export const CircularProgressBar = ({ value, maxValue, label }: ProgressBarProps) => {
  const percentage = (value / maxValue) * 360 + 1;

  return (
    <div className="circular-progress-bar">
      <div className={`circular-progress-bar__circle progress-${percentage}`}>
        <div className="circular-progress-bar__info">
          <div className="info--value"> {value} </div>
          <div className="info--label"> {label} </div>
        </div>
      </div>
    </div>
  );
};
