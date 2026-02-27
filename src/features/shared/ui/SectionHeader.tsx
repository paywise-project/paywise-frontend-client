"use client";

import { IconType } from "react-icons";

const SectionHeader = ({ text, Emoji }: { text: string; Emoji?: IconType }) => {
  if (!Emoji)
    return (
      <div className="pw-section-header">
        <h2>{text}</h2>
      </div>
    );

  return (
    <div className="pw-section-header">
      <span className="pw-icon-btn | bg-surface text-primary">
        <Emoji className="text-2xl" />
      </span>
      <h2>{text}</h2>
    </div>
  );
};

export default SectionHeader;
