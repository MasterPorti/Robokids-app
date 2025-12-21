import Header from "./components/Header";
import Home from "./components/Homemenu";
import Navbar from "./components/Navegation";
import Logo from "./ui/Logo";

export default function HomePage() {
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
      <Home />
      <div className="bg-red-600/10 w-16" />
    </main>
  );
}
