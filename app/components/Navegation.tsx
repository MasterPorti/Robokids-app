import {
  HomeLogo,
  LeaguesLogo,
  PaymentsLogo,
  PracticeLogo,
} from "../ui/HomeLogo";
import Logo from "../ui/Logo";

export default function Navbar() {
  return (
    <div className=" w-60">
      <Logo />

      <nav className="w-full mt-10 flex flex-col gap-2">
        <Button text="Aprender" isActive={true}>
          <HomeLogo />
        </Button>
        <Button text="Practica" isActive={false}>
          <PracticeLogo />
        </Button>
        <Button text="Ligas" isActive={false}>
          <LeaguesLogo />
        </Button>
        <Button text="Pagos" isActive={false}>
          <PaymentsLogo />
        </Button>
      </nav>
    </div>
  );
}

function Button({
  text,
  isActive,
  children,
}: {
  text?: string;
  isActive?: boolean;
  children?: React.ReactNode;
}) {
  return (
    <div
      className={`flex cursor-pointer border-2 hover:bg-[#202f36]  pl-5 items-center  h-15 rounded-2xl ${
        isActive ? "border-[#49c0f8] bg-[#202f36] " : "border-transparent "
      }`}
    >
      {children}
      <span
        className={`pl-6   text-2xl leading-none pt-2 ${
          isActive ? "text-[#49c0f8]" : "text-white"
        }`}
        style={{ fontFamily: "var(--font-custom)" }}
      >
        {text || "Aprende"}
      </span>
    </div>
  );
}
