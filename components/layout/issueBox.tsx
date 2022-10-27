import React from "react";

interface IssueBoxProps {
  textContent: string;
}

export const IssueBox: React.FC<IssueBoxProps> = ({ textContent }: IssueBoxProps) => {
  return <div className="issue-box">{textContent}</div>;
};
