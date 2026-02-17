const SectionHeader = ({ text, emoji }: { text: string; emoji: string }) => {
  return (
    <div className="pw-section-header">
      <h2>{emoji}</h2>
      <h2>{text}</h2>
    </div>
  );
};

export default SectionHeader;
