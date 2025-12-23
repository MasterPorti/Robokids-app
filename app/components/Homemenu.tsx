"use client";

import DinoDraw from "../ui/DinoDraw";
import ShipDraw from "../ui/ShipDraw";
import Link from "next/link";
import { Nivel } from "@/data/types";

const drawComponents = {
  DinoDraw: DinoDraw,
  ShipDraw: ShipDraw,
};

const mapping: { link: string; status: "completed" | "next" | "locked" }[] = [
  { link: "/nivel-1", status: "completed" },
  { link: "/nivel-2", status: "next" },
  { link: "/nivel-3", status: "locked" },
  { link: "/nivel-4", status: "locked" },
  { link: "/nivel-5", status: "locked" },
  { link: "/nivel-6", status: "locked" },
];

export default function Home({ nivel }: { nivel: Nivel }) {
  return (
    <div className="ml-10 w-1/3">
      <div
        className="rounded-2xl w-full flex justify-between items-center h-25 p-3"
        style={{
          fontFamily: "var(--font-custom)",
          backgroundColor: nivel.colors.secondary,
        }}
      >
        <div className="flex flex-col h-full justify-center">
          <span className="text-white/80 text-xl">{nivel.module}</span>
          <span className="text-white text-2xl">{nivel.title}</span>
        </div>
        <div
          className="border-2 gap-4 cursor-pointer flex items-center h-15 px-4 rounded-xl"
          style={{ borderColor: nivel.colors.primary }}
        >
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
          {nivel.title}
        </span>
        <div className="flex-1 h-1 rounded-full bg-white/50"></div>
      </div>
      <div className="mt-10 relative">
        <div
          className="relative flex-col max-h-[calc(100vh-250px)] overflow-y-scroll overflow-x-hidden"
          style={{
            scrollbarWidth: "none",
            msOverflowStyle: "none",
            WebkitOverflowScrolling: "touch",
            maskImage:
              "linear-gradient(to bottom, transparent 0%, black 5%, black 95%, transparent 100%)",
            WebkitMaskImage:
              "linear-gradient(to bottom, transparent 0%, black 5%, black 95%, transparent 100%)",
          }}
        >
          <style jsx>{`
            div::-webkit-scrollbar {
              display: none;
            }
          `}</style>
          {mapping.map((module, index) => (
            <ModuleCircle
              key={index}
              status={module.status}
              link={module.link}
              index={index}
              colors={nivel.colors}
            />
          ))}

          <div className="absolute top-0 left-[10%]">
            {(() => {
              const DrawComponent =
                drawComponents[nivel.draw as keyof typeof drawComponents];
              return DrawComponent ? <DrawComponent /> : null;
            })()}
          </div>
        </div>
      </div>
    </div>
  );
}

function ModuleCircle({
  status,
  link,
  index,
  colors,
}: {
  status: "completed" | "next" | "locked";
  link: string;
  index: number;
  colors: { primary: string; secondary: string };
}) {
  const marginPattern = [70, 80, 70, 60, 50, 60];
  const marginLeft = marginPattern[index % marginPattern.length];

  return (
    <Link
      href={link || "#"}
      className={`${
        status === "completed" || status === "next"
          ? "cursor-pointer hover:scale-105 transition-transform"
          : "cursor-not-allowed"
      } relative rounded-full w-25 flex items-center p-2 justify-center`}
      style={{ marginLeft: `${marginLeft}%` }}
    >
      <CompleteCircle status={status} colors={colors} />
    </Link>
  );
}

function CompleteCircle({
  status,
  colors,
}: {
  status: "completed" | "next" | "locked";
  colors: { primary: string; secondary: string };
}) {
  const isActive = status === "completed" || status === "next";
  const isLocked = status === "locked";

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className={`w-20 ${isLocked ? "opacity-80" : ""}`}
      fill="none"
      viewBox="0 0 514 530"
    >
      {/* HEXÁGONO EXTERIOR */}
      <path
        fill={isActive ? colors.primary : "#37464f"}
        d="m250 0 216.506 125v250L250 500 33.494 375V125z"
      />

      {/* HEXÁGONO INTERIOR */}
      <path
        fill={isActive ? colors.secondary : "#2c383f"}
        d="m250 50 173.205 100v200L250 450 76.795 350V150z"
      />

      {/* ÍCONO CENTRAL */}
      <path
        fill={isLocked ? "#9aa5ab" : "#ffffff"}
        d="M232.679 180c7.698-13.333 26.944-13.333 34.642 0l51.961 90c7.698 13.333-1.924 30-17.32 30H198.038c-15.396 0-25.018-16.667-17.32-30z"
      />
    </svg>
  );
}
