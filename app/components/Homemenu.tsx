export default function Home() {
  return (
    <div className="ml-10 w-1/3">
      <div
        className="bg-green-700 rounded-2xl w-full flex justify-between items-center h-25 p-3"
        style={{ fontFamily: "var(--font-custom)" }}
      >
        <div className="flex flex-col h-full justify-center">
          <span className="text-white/80 text-xl">NIVEL 1 MODULO 1</span>
          <span className="text-white text-2xl">Tipos de Circuitos</span>
        </div>
        <div className="border-2 gap-4 border-green-600 cursor-pointer flex items-center h-15 px-4 rounded-xl">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            fill="none"
            viewBox="0 0 24 24"
          >
            <path
              fill="#fff"
              d="M.019 4.833c0-.728.59-1.318 1.318-1.318h1.758a1.318 1.318 0 0 1 0 2.636H1.337A1.32 1.32 0 0 1 .02 4.833m-.001 7.03c0-.728.59-1.318 1.318-1.318h1.758a1.318 1.318 0 1 1 0 2.636H1.337A1.32 1.32 0 0 1 .02 11.863m-.001 7.029c0-.728.59-1.318 1.318-1.318h1.758a1.318 1.318 0 1 1 0 2.636H1.337C.61 20.21.02 19.62.02 18.892"
            />
            <path
              fill="#fff"
              fillRule="evenodd"
              d="M2.655 3.515V6.15h.44a1.318 1.318 0 1 0 0-2.636zm.44-1.758h-.002a3.44 3.44 0 0 1 3-1.757h14.32c1.9 0 3.439 1.54 3.439 3.439v16.848a3.44 3.44 0 0 1-3.439 3.438H6.093a3.44 3.44 0 0 1-3-1.757h.002a3.076 3.076 0 0 0 0-6.151h-.44v-.879h.44a3.075 3.075 0 1 0 0-6.15h-.44v-.88h.44a3.076 3.076 0 1 0 0-6.15m0 18.454h-.44v-2.637h.44a1.318 1.318 0 1 1 0 2.636m0-7.03h-.44v-2.636h.44a1.318 1.318 0 1 1 0 2.636m6.81-9.227a1.098 1.098 0 1 0 0 2.197h9.226a1.098 1.098 0 0 0 0-2.197zm-1.099 6.37c0-.606.492-1.097 1.099-1.097h9.226a1.098 1.098 0 0 1 0 2.196H9.905a1.1 1.1 0 0 1-1.099-1.098M9.905 14.5a1.098 1.098 0 1 0 0 2.197h6.59a1.098 1.098 0 0 0 0-2.197z"
              clipRule="evenodd"
            />
          </svg>
          <span
            className="text-white "
            style={{ fontFamily: "var(--font-custom)" }}
          >
            GUIA
          </span>
        </div>
      </div>
      <div className="flex items-center gap-4 mt-6">
        <div className="flex-1 h-1 rounded-full bg-white/50"></div>
        <span
          className="text-white text-xl"
          style={{ fontFamily: "var(--font-custom)" }}
        >
          Tipos de Circuitos
        </span>
        <div className="flex-1 h-1 rounded-full bg-white/50"></div>
      </div>
      <div className="mt-10">
        <div className="ml-[60%] cursor-pointer border-5 hover:border-[#58cc02] transition-colors  border-white/50 rounded-full w-25 flex items-center p-2 justify-center">
          <TodoCircle />
        </div>
      </div>
    </div>
  );
}

function TodoCircle() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="w-20"
      fill="none"
      viewBox="0 0 602 553"
    >
      <g filter="url(#filter0_d_2016_2482)">
        <ellipse cx="300" cy="250" fill="#58cc02" rx="300" ry="250" />
      </g>
      <ellipse cx="300" cy="250" fill="#46a302" rx="250" ry="200" />
      <mask
        id="mask0_2016_2482"
        width="202"
        height="189"
        x="199"
        y="156"
        style={{ maskType: "luminance" }}
        maskUnits="userSpaceOnUse"
      >
        <path fill="#fff" d="M400.714 156.206H199.285v188.588h201.429z" />
      </mask>
      <g mask="url(#mask0_2016_2482)">
        <path
          fill="#fff"
          d="M284.906 165.713c6.095-12.676 24.092-12.676 30.187 0l17.497 36.395a16.76 16.76 0 0 0 13.151 9.394l40.138 4.699c14.344 1.679 19.994 19.558 9.234 29.22l-28.746 25.814a16.84 16.84 0 0 0-5.244 15.876l7.676 37.834c2.831 13.949-11.824 24.892-24.332 18.169l-36.554-19.645a16.72 16.72 0 0 0-15.827 0l-36.554 19.645c-12.508 6.723-27.163-4.22-24.332-18.169l7.676-37.834a16.84 16.84 0 0 0-5.244-15.876l-28.746-25.814c-10.76-9.662-5.11-27.541 9.234-29.22l40.138-4.699a16.76 16.76 0 0 0 13.151-9.394z"
        />
      </g>
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
            values="0 0 0 0 0.27451 0 0 0 0 0.639216 0 0 0 0 0.00784314 0 0 0 1 0"
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
