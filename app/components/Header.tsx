import Logo from "@/app/ui/Logo"
import { Geist, Geist_Mono } from "next/font/google";


export default function Header() {
    return (
       <header className="flex items-center justify-between px-8 py-4 border-b border-gray-200 bg-white/80 backdrop-blur-sm">
        <div>
          <Logo />
        </div>
        <div className="flex items-center gap-3">
          <span className="text-lg font-medium">Hola Israel</span>
          <div className="w-12 h-12 rounded-full bg-green-500"></div>
        </div>
      </header>
    );
}