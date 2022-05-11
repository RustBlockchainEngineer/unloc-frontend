import React from "react";

interface IssueBoxProps {
  textContent: string;
}

const IssueBox: React.FC<IssueBoxProps> = ({ textContent }: IssueBoxProps) => {
  return <div className="issue-box">{textContent}</div>;
};

export default IssueBox;
