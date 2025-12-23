import Home from "./components/Homemenu";
import Navbar from "./components/Navegation";
import niveles from "@/data/nivel";

const nivel1 = niveles.find((nivel) => nivel.id === 1);

export default function HomePage() {
  if (!nivel1) {
    return null;
  }

  return (
    <main
      className="min-h-screen flex p-5"
      style={{
        backgroundColor: "#131f24",
        backgroundImage:
          "radial-gradient(circle, #000000 1px, transparent 1px)",
        backgroundSize: "20px 20px",
      }}
    >
      <Navbar />
      <Home nivel={nivel1} />
      <div className="ml-5">
        <div className="flex gap-3 items-center">
          <Robopuntos />
          <span
            className="text-white text-2xl block text-center mt-2"
            style={{ fontFamily: "var(--font-custom)" }}
          >
            540
          </span>
        </div>
      </div>
    </main>
  );
}

function Robopuntos() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      className="w-10"
      viewBox="0 0 602 553"
    >
      <g filter="url(#filter0_d_2016_2482)">
        <ellipse cx="300" cy="250" fill="#cc0202" rx="300" ry="250" />
      </g>
      <ellipse cx="300" cy="250" fill="#a30202" rx="250" ry="200" />
      <defs>
        <filter
          id="filter0_d_2016_2482"
          width="602"
          height="553"
          x="0"
          y="0"
          colorInterpolationFilters="sRGB"
          filterUnits="userSpaceOnUse"
        >
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feColorMatrix
            in="SourceAlpha"
            result="hardAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
          />
          <feOffset dx="2" dy="53" />
          <feComposite in2="hardAlpha" operator="out" />
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 0.639216 0 0 0 0 0.00784314 0 0 0 0 0.00784314 0 0 0 1 0"
          />
          <feBlend
            in2="BackgroundImageFix"
            mode="normal"
            result="effect1_dropShadow_2016_2482"
          />
          <feBlend
            in="SourceGraphic"
            in2="effect1_dropShadow_2016_2482"
            mode="normal"
            result="shape"
          />
        </filter>
      </defs>
    </svg>
  );
}
