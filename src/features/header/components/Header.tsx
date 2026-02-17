import Image from "next/image";

const Header = () => {
  return (
    <div className="pw-container pw-header | flex">
      <div className="flex items-center gap-1">
        <Image
          src={"/pw-logo.avif"}
          alt="Pay wise logo"
          width={30}
          height={30}
          className="rounded-full"
        />

        <h1 className="pw-title">Paywise</h1>
      </div>
      <span className="pw-icon-btn pw-press">🔔</span>
    </div>
  );
};

export default Header;
