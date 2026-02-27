const Spinner = () => {
  return (
    <div className="relative h-10 w-10">
      <div className="absolute inset-0 rounded-full border-2 border-primary-2"></div>
      <div className="absolute inset-0 animate-ping rounded-full border-2 border-primary"></div>
    </div>
  );
};

export default Spinner;
