"use client";

import { useState, useRef } from "react";
import Battery from "@/app/ui/elements/Battery";
import Led from "@/app/ui/elements/Led";
import Switch2Pins from "@/app/ui/elements/Switch2pin";
import type {
  CircuitElement,
  Wire,
  StateChange,
  TextElement,
} from "../types";

// Tipos para el formulario
type ElementFormData = Partial<CircuitElement>;
type WireFormData = Partial<Wire> & { currentPoint?: { x: number; y: number } };

export default function ConfiguradorPage() {
  const [activeTab, setActiveTab] = useState<"elementos" | "cables" | "textos" | "acciones" | "exportar">("elementos");
  const svgRef = useRef<SVGSVGElement>(null);

  // Estados para almacenar la configuración
  const [titulo, setTitulo] = useState<string>("CIRCUITO");
  const [elementos, setElementos] = useState<CircuitElement[]>([]);
  const [cables, setCables] = useState<Wire[]>([]);
  const [textos, setTextos] = useState<TextElement[]>([]);

  // Estados para el preview
  const [mouseCoords, setMouseCoords] = useState<{ x: number; y: number } | null>(null);

  // Función para obtener coordenadas del mouse en el SVG
  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!svgRef.current) return;

    const svg = svgRef.current;
    const pt = svg.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;

    const svgP = pt.matrixTransform(svg.getScreenCTM()?.inverse());
    setMouseCoords({ x: Math.round(svgP.x), y: Math.round(svgP.y) });
  };

  const handleMouseLeave = () => {
    setMouseCoords(null);
  };

  // Función para hacer click en el SVG y usar esas coordenadas
  const handleSvgClick = () => {
    if (!mouseCoords) return;

    if (activeTab === "elementos") {
      // En modo elementos, actualiza las coordenadas del formulario
      setElementForm({ ...elementForm, x: mouseCoords.x, y: mouseCoords.y });
    } else if (activeTab === "cables") {
      // En modo cables, agrega el punto automáticamente
      setWireForm({
        ...wireForm,
        points: [...(wireForm.points || []), { x: mouseCoords.x, y: mouseCoords.y }],
      });
    } else if (activeTab === "textos") {
      // En modo textos, actualiza las coordenadas del formulario
      setTextForm({ ...textForm, x: mouseCoords.x, y: mouseCoords.y });
    }
  };

  // Función para crear path SVG con curvas suaves
  const createSmoothPath = (points: { x: number; y: number }[], smoothness: number = 0.3): string => {
    if (points.length < 2) return "";
    if (points.length === 2) {
      return `M ${points[0].x} ${points[0].y} L ${points[1].x} ${points[1].y}`;
    }

    let path = `M ${points[0].x} ${points[0].y}`;

    for (let i = 1; i < points.length; i++) {
      const current = points[i];

      if (i === points.length - 1) {
        path += ` L ${current.x} ${current.y}`;
      } else {
        const next = points[i + 1];
        const midX = current.x + (next.x - current.x) * smoothness;
        const midY = current.y + (next.y - current.y) * smoothness;
        path += ` Q ${current.x} ${current.y}, ${midX} ${midY}`;
      }
    }

    return path;
  };

  // Estados para formularios
  const [elementForm, setElementForm] = useState<ElementFormData>({ type: "battery" });
  const [editingElementId, setEditingElementId] = useState<string | null>(null);
  const [wireForm, setWireForm] = useState<WireFormData>({
    points: [],
    color: "#802020",
    strokeWidth: 5,
    smoothness: 0.1,
    showParticles: true,
    particleColor: "#60a5fa",
    particleLaunchInterval: 0.3,
    particleSpeed: 80,
  });
  const [currentWireIndex, setCurrentWireIndex] = useState<number | null>(null);
  const [textForm, setTextForm] = useState<Partial<TextElement>>({
    fontSize: 16,
    color: "#ffffff",
    fontWeight: "normal",
    textAnchor: "start",
  });

  // Agregar o actualizar elemento
  const handleAddElement = () => {
    if (!elementForm.type) return;

    if (editingElementId) {
      // Actualizar elemento existente
      setElementos(elementos.map(el =>
        el.id === editingElementId
          ? {
              ...el,
              x: elementForm.x || el.x,
              y: elementForm.y || el.y,
              width: elementForm.width || el.width,
              rotation: elementForm.rotation || el.rotation,
              ...(el.type === "led" && elementForm.isOn !== undefined && { isOn: elementForm.isOn }),
              ...(el.type === "switch" && elementForm.position && { position: elementForm.position }),
            } as CircuitElement
          : el
      ));
      setEditingElementId(null);
      setElementForm({ type: elementForm.type });
    } else {
      // Agregar nuevo elemento
      const newElement: CircuitElement = {
        id: `${elementForm.type}-${Date.now()}`,
        type: elementForm.type,
        x: elementForm.x || 100,
        y: elementForm.y || 100,
        width: elementForm.width || 50,
        rotation: elementForm.rotation || 0,
        ...(elementForm.type === "led" && { isOn: elementForm.isOn ?? false }),
        ...(elementForm.type === "switch" && { position: (elementForm.position || "left") as const }),
      } as CircuitElement;

      setElementos([...elementos, newElement]);
      setElementForm({ type: elementForm.type }); // Reset form but keep type
    }
  };

  // Editar elemento
  const handleEditElement = (element: CircuitElement) => {
    setEditingElementId(element.id);
    setElementForm({
      type: element.type,
      x: element.x,
      y: element.y,
      width: element.width,
      rotation: element.rotation,
      ...(element.type === "led" && { isOn: element.isOn }),
      ...(element.type === "switch" && { position: element.position }),
    });
  };

  // Cancelar edición
  const handleCancelEdit = () => {
    setEditingElementId(null);
    setElementForm({ type: "battery" });
  };

  // Eliminar elemento
  const handleDeleteElement = (id: string) => {
    setElementos(elementos.filter(el => el.id !== id));
  };

  // Agregar punto al cable actual
  const handleAddPointToWire = () => {
    if (!wireForm.currentPoint) return;

    setWireForm({
      ...wireForm,
      points: [...(wireForm.points || []), wireForm.currentPoint],
      currentPoint: undefined,
    });
  };

  // Finalizar cable y agregarlo a la lista
  const handleFinishWire = () => {
    if (!wireForm.points || wireForm.points.length < 2) {
      alert("El cable necesita al menos 2 puntos");
      return;
    }

    const newWire: Wire = {
      points: wireForm.points,
      color: wireForm.color || "#802020",
      strokeWidth: wireForm.strokeWidth || 5,
      duration: wireForm.duration || 2,
      delay: wireForm.delay || 0,
      smoothness: wireForm.smoothness || 0.1,
      showParticles: wireForm.showParticles ?? true,
      particleColor: wireForm.particleColor || "#60a5fa",
      particleLaunchInterval: wireForm.particleLaunchInterval || 0.3,
      particleSpeed: wireForm.particleSpeed || 80,
      onComplete: wireForm.onComplete,
    };

    setCables([...cables, newWire]);

    // Reset form
    setWireForm({
      points: [],
      color: "#802020",
      strokeWidth: 5,
      smoothness: 0.1,
      showParticles: true,
      particleColor: "#60a5fa",
      particleLaunchInterval: 0.3,
      particleSpeed: 80,
    });
  };

  // Agregar acción onComplete a un cable
  const handleAddAction = (wireIndex: number, action: StateChange) => {
    const updatedCables = [...cables];
    if (!updatedCables[wireIndex].onComplete) {
      updatedCables[wireIndex].onComplete = [];
    }
    updatedCables[wireIndex].onComplete!.push(action);
    setCables(updatedCables);
  };

  // Agregar texto
  const handleAddText = () => {
    if (!textForm.text || !textForm.x || !textForm.y) return;

    const newText: TextElement = {
      id: `texto-${Date.now()}`,
      x: textForm.x,
      y: textForm.y,
      text: textForm.text,
      fontSize: textForm.fontSize || 16,
      color: textForm.color || "#ffffff",
      fontWeight: textForm.fontWeight || "normal",
      textAnchor: textForm.textAnchor || "start",
    };

    setTextos([...textos, newText]);
    setTextForm({
      fontSize: 16,
      color: "#ffffff",
      fontWeight: "normal",
      textAnchor: "start",
    });
  };

  // Eliminar texto
  const handleDeleteText = (id: string) => {
    setTextos(textos.filter(t => t.id !== id));
  };

  // Generar código del archivo de configuración
  const generateConfigFile = () => {
    const code = `// ===================================================================
// CONFIGURACIÓN DEL CIRCUITO
// ===================================================================
// Generado automáticamente por el Configurador Visual
// Edita este archivo para modificar tu circuito

import type { CircuitElement, Wire, BallAnimation, TextElement } from "@/app/game/nivel/types";

// ===================================================================
// TÍTULO DEL CIRCUITO
// ===================================================================

export const title = "${titulo}";

// ===================================================================
// ELEMENTOS DEL CIRCUITO
// ===================================================================

export const circuitElements: CircuitElement[] = ${JSON.stringify(elementos, null, 2)};

// ===================================================================
// CABLES
// ===================================================================

export const wires: Wire[] = ${JSON.stringify(cables, null, 2)};

// ===================================================================
// ANIMACIONES DE BOLITAS
// ===================================================================

export const ballAnimations: BallAnimation[] = [];

// ===================================================================
// TEXTOS ESTÁTICOS
// ===================================================================

export const textElements: TextElement[] = ${JSON.stringify(textos, null, 2)};

// Re-exportar tipos para compatibilidad
export type { CircuitElement, Wire, BallAnimation, StateChange, TextElement } from "@/app/game/nivel/types";
`;

    return code;
  };

  // Descargar archivo
  const handleDownloadConfig = () => {
    const code = generateConfigFile();
    const blob = new Blob([code], { type: "text/typescript" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "circuitConfig.ts";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-center text-orange-500">
          ⚙️ CONFIGURADOR DE CIRCUITOS
        </h1>

        {/* Tabs */}
        <div className="flex gap-4 mb-8 border-b border-gray-700">
          {[
            { id: "elementos", label: "📦 Elementos" },
            { id: "cables", label: "🔌 Cables" },
            { id: "textos", label: "📝 Textos" },
            { id: "acciones", label: "⚡ Acciones" },
            { id: "exportar", label: "💾 Exportar" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-6 py-3 font-semibold transition-colors ${
                activeTab === tab.id
                  ? "border-b-4 border-orange-500 text-orange-500"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Contenido de tabs */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Formulario */}
          <div className="bg-gray-800 rounded-lg p-6">
            {activeTab === "elementos" && (
              <div>
                <h2 className="text-2xl font-bold mb-4">Agregar Elemento</h2>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Tipo</label>
                    <select
                      className="w-full bg-gray-700 rounded px-3 py-2"
                      value={elementForm.type || "battery"}
                      onChange={(e) => setElementForm({ ...elementForm, type: e.target.value as any })}
                    >
                      <option value="battery">🔋 Batería</option>
                      <option value="led">💡 LED</option>
                      <option value="switch">🔘 Switch</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Posición X {elementForm.x && "✓"}
                      </label>
                      <input
                        type="number"
                        className="w-full bg-gray-700 rounded px-3 py-2"
                        value={elementForm.x || ""}
                        onChange={(e) => setElementForm({ ...elementForm, x: Number(e.target.value) })}
                        placeholder="Haz click en el canvas"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Posición Y {elementForm.y && "✓"}
                      </label>
                      <input
                        type="number"
                        className="w-full bg-gray-700 rounded px-3 py-2"
                        value={elementForm.y || ""}
                        onChange={(e) => setElementForm({ ...elementForm, y: Number(e.target.value) })}
                        placeholder="Haz click en el canvas"
                      />
                    </div>
                  </div>

                  <div className="bg-blue-900/30 border border-blue-500/50 rounded p-3 text-sm">
                    <p className="text-blue-300">
                      💡 <strong>Tip:</strong> Haz click en el canvas de la derecha para elegir la posición exacta
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <label className="block text-sm font-medium">Ancho</label>
                        <span className="text-sm text-gray-400">{elementForm.width || 50}px</span>
                      </div>
                      <input
                        type="range"
                        min="20"
                        max="150"
                        step="5"
                        className="w-full"
                        value={elementForm.width || 50}
                        onChange={(e) => setElementForm({ ...elementForm, width: Number(e.target.value) })}
                      />
                    </div>
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <label className="block text-sm font-medium">Rotación</label>
                        <span className="text-sm text-gray-400">{elementForm.rotation || 0}°</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="360"
                        step="15"
                        className="w-full"
                        value={elementForm.rotation || 0}
                        onChange={(e) => setElementForm({ ...elementForm, rotation: Number(e.target.value) })}
                      />
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>0°</span>
                        <span>90°</span>
                        <span>180°</span>
                        <span>270°</span>
                        <span>360°</span>
                      </div>
                    </div>
                  </div>

                  {/* Estado inicial - Solo para LED y Switch */}
                  {elementForm.type === "led" && (
                    <div className="bg-yellow-900/30 border border-yellow-500/50 rounded p-3">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={elementForm.isOn || false}
                          onChange={(e) => setElementForm({ ...elementForm, isOn: e.target.checked })}
                          className="w-4 h-4"
                        />
                        <span className="text-sm font-medium">💡 Iniciar encendido</span>
                      </label>
                    </div>
                  )}

                  {elementForm.type === "switch" && (
                    <div className="bg-blue-900/30 border border-blue-500/50 rounded p-3">
                      <label className="block text-sm font-medium mb-2">Posición inicial</label>
                      <select
                        className="w-full bg-gray-700 rounded px-3 py-2"
                        value={elementForm.position || "left"}
                        onChange={(e) => setElementForm({ ...elementForm, position: e.target.value as "left" | "right" })}
                      >
                        <option value="left">⬅️ Izquierda</option>
                        <option value="right">➡️ Derecha</option>
                      </select>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <button
                      onClick={handleAddElement}
                      className="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-lg transition-colors"
                    >
                      {editingElementId ? "✏️ Actualizar Elemento" : "➕ Agregar Elemento"}
                    </button>
                    {editingElementId && (
                      <button
                        onClick={handleCancelEdit}
                        className="px-4 bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 rounded-lg transition-colors"
                      >
                        ✖️
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === "cables" && (
              <div>
                <h2 className="text-2xl font-bold mb-4">Crear Cable</h2>

                <div className="space-y-4">
                  <div className="bg-blue-900/30 border border-blue-500/50 rounded p-3 text-sm mb-4">
                    <p className="text-blue-300">
                      💡 <strong>Cómo crear un cable:</strong><br/>
                      1. Haz click en el canvas para agregar puntos<br/>
                      2. Mínimo 2 puntos para crear el cable<br/>
                      3. Click en "Finalizar Cable" cuando termines
                    </p>
                  </div>

                  <div className="bg-gray-700 p-4 rounded">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="font-semibold">Puntos del cable ({wireForm.points?.length || 0})</h3>
                      {wireForm.points && wireForm.points.length > 0 && (
                        <button
                          onClick={() => setWireForm({
                            ...wireForm,
                            points: wireForm.points!.slice(0, -1)
                          })}
                          className="bg-red-500 hover:bg-red-600 px-3 py-1 rounded text-sm"
                        >
                          ↶ Deshacer
                        </button>
                      )}
                    </div>
                    <div className="flex gap-2 mb-2">
                      <input
                        type="number"
                        className="flex-1 bg-gray-600 rounded px-3 py-2"
                        placeholder="X (o click en canvas)"
                        value={wireForm.currentPoint?.x || ""}
                        onChange={(e) => setWireForm({
                          ...wireForm,
                          currentPoint: { ...wireForm.currentPoint, x: Number(e.target.value), y: wireForm.currentPoint?.y || 0 }
                        })}
                      />
                      <input
                        type="number"
                        className="flex-1 bg-gray-600 rounded px-3 py-2"
                        placeholder="Y (o click en canvas)"
                        value={wireForm.currentPoint?.y || ""}
                        onChange={(e) => setWireForm({
                          ...wireForm,
                          currentPoint: { x: wireForm.currentPoint?.x || 0, y: Number(e.target.value) }
                        })}
                      />
                      <button
                        onClick={handleAddPointToWire}
                        className="bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={!wireForm.currentPoint?.x || !wireForm.currentPoint?.y}
                      >
                        + Punto
                      </button>
                    </div>
                    <div className="text-sm text-gray-400 max-h-32 overflow-auto">
                      {wireForm.points && wireForm.points.length > 0 ? (
                        wireForm.points.map((p, i) => (
                          <div key={i} className="flex justify-between items-center py-1">
                            <span>Punto {i + 1}: ({p.x}, {p.y})</span>
                          </div>
                        ))
                      ) : (
                        <p className="text-center py-2">Haz click en el canvas para agregar puntos</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Color</label>
                    <input
                      type="color"
                      className="w-full h-10 bg-gray-700 rounded"
                      value={wireForm.color}
                      onChange={(e) => setWireForm({ ...wireForm, color: e.target.value })}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Grosor</label>
                      <input
                        type="number"
                        className="w-full bg-gray-700 rounded px-3 py-2"
                        value={wireForm.strokeWidth}
                        onChange={(e) => setWireForm({ ...wireForm, strokeWidth: Number(e.target.value) })}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Duración (seg)</label>
                      <input
                        type="number"
                        step="0.1"
                        className="w-full bg-gray-700 rounded px-3 py-2"
                        value={wireForm.duration || 2}
                        onChange={(e) => setWireForm({ ...wireForm, duration: Number(e.target.value) })}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Delay / Retraso (segundos)
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      min="0"
                      className="w-full bg-gray-700 rounded px-3 py-2"
                      value={wireForm.delay || 0}
                      onChange={(e) => setWireForm({ ...wireForm, delay: Number(e.target.value) })}
                      placeholder="0"
                    />
                    <p className="text-xs text-gray-400 mt-1">
                      Tiempo antes de que el cable empiece a dibujarse
                    </p>
                  </div>

                  <div>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={wireForm.showParticles}
                        onChange={(e) => setWireForm({ ...wireForm, showParticles: e.target.checked })}
                      />
                      <span>Mostrar partículas</span>
                    </label>
                  </div>

                  <button
                    onClick={handleFinishWire}
                    className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 rounded-lg transition-colors"
                    disabled={!wireForm.points || wireForm.points.length < 2}
                  >
                    ✅ Finalizar Cable
                  </button>
                </div>
              </div>
            )}

            {activeTab === "textos" && (
              <div>
                <h2 className="text-2xl font-bold mb-4">Agregar Texto</h2>

                <div className="space-y-4">
                  <div className="bg-blue-900/30 border border-blue-500/50 rounded p-3 text-sm">
                    <p className="text-blue-300">
                      💡 <strong>Tip:</strong> Haz click en el canvas para posicionar el texto
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Texto</label>
                    <input
                      type="text"
                      className="w-full bg-gray-700 rounded px-3 py-2"
                      value={textForm.text || ""}
                      onChange={(e) => setTextForm({ ...textForm, text: e.target.value })}
                      placeholder="Escribe el mensaje..."
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Posición X {textForm.x && "✓"}
                      </label>
                      <input
                        type="number"
                        className="w-full bg-gray-700 rounded px-3 py-2"
                        value={textForm.x || ""}
                        onChange={(e) => setTextForm({ ...textForm, x: Number(e.target.value) })}
                        placeholder="Haz click en canvas"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Posición Y {textForm.y && "✓"}
                      </label>
                      <input
                        type="number"
                        className="w-full bg-gray-700 rounded px-3 py-2"
                        value={textForm.y || ""}
                        onChange={(e) => setTextForm({ ...textForm, y: Number(e.target.value) })}
                        placeholder="Haz click en canvas"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="block text-sm font-medium">Tamaño de fuente</label>
                      <span className="text-sm text-gray-400">{textForm.fontSize || 16}px</span>
                    </div>
                    <input
                      type="range"
                      min="12"
                      max="48"
                      step="2"
                      className="w-full"
                      value={textForm.fontSize || 16}
                      onChange={(e) => setTextForm({ ...textForm, fontSize: Number(e.target.value) })}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Color</label>
                    <input
                      type="color"
                      className="w-full h-10 bg-gray-700 rounded"
                      value={textForm.color || "#ffffff"}
                      onChange={(e) => setTextForm({ ...textForm, color: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Peso de fuente</label>
                    <select
                      className="w-full bg-gray-700 rounded px-3 py-2"
                      value={textForm.fontWeight || "normal"}
                      onChange={(e) => setTextForm({ ...textForm, fontWeight: e.target.value as "normal" | "bold" })}
                    >
                      <option value="normal">Normal</option>
                      <option value="bold">Negrita</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Alineación</label>
                    <select
                      className="w-full bg-gray-700 rounded px-3 py-2"
                      value={textForm.textAnchor || "start"}
                      onChange={(e) => setTextForm({ ...textForm, textAnchor: e.target.value as "start" | "middle" | "end" })}
                    >
                      <option value="start">⬅️ Izquierda</option>
                      <option value="middle">↔️ Centro</option>
                      <option value="end">➡️ Derecha</option>
                    </select>
                  </div>

                  <button
                    onClick={handleAddText}
                    className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 rounded-lg transition-colors"
                    disabled={!textForm.text || !textForm.x || !textForm.y}
                  >
                    ➕ Agregar Texto
                  </button>
                </div>
              </div>
            )}

            {activeTab === "acciones" && (
              <div>
                <h2 className="text-2xl font-bold mb-4">Configurar Acciones</h2>

                {cables.length === 0 ? (
                  <p className="text-gray-400">Primero crea cables para agregar acciones</p>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Cable</label>
                      <select
                        className="w-full bg-gray-700 rounded px-3 py-2"
                        value={currentWireIndex ?? ""}
                        onChange={(e) => setCurrentWireIndex(Number(e.target.value))}
                      >
                        <option value="">Selecciona un cable...</option>
                        {cables.map((_, idx) => (
                          <option key={idx} value={idx}>Cable {idx + 1}</option>
                        ))}
                      </select>
                    </div>

                    {currentWireIndex !== null && (
                      <div className="bg-gray-700 p-4 rounded">
                        <h3 className="font-semibold mb-2">Acciones para Cable {currentWireIndex + 1}</h3>
                        <p className="text-sm text-gray-400 mb-4">
                          Selecciona qué elementos cambiar cuando este cable termine de dibujarse
                        </p>

                        {elementos.map((el) => (
                          <div key={el.id} className="mb-2 flex items-center gap-2">
                            <span className="flex-1">{el.id}</span>
                            {el.type === "led" && (
                              <button
                                onClick={() => handleAddAction(currentWireIndex, {
                                  elementId: el.id,
                                  changes: { isOn: true }
                                })}
                                className="bg-yellow-500 hover:bg-yellow-600 px-3 py-1 rounded text-sm"
                              >
                                💡 Encender
                              </button>
                            )}
                            {el.type === "switch" && (
                              <button
                                onClick={() => handleAddAction(currentWireIndex, {
                                  elementId: el.id,
                                  changes: { position: "right" }
                                })}
                                className="bg-blue-500 hover:bg-blue-600 px-3 py-1 rounded text-sm"
                              >
                                ➡️ Mover
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {activeTab === "exportar" && (
              <div>
                <h2 className="text-2xl font-bold mb-4">Exportar Configuración</h2>

                <div className="space-y-4">
                  <div className="bg-gray-700 p-4 rounded">
                    <h3 className="font-semibold mb-2">📝 Título del Circuito</h3>
                    <input
                      type="text"
                      value={titulo}
                      onChange={(e) => setTitulo(e.target.value)}
                      placeholder="Ej: CIRCUITO EN SERIE"
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded text-white"
                    />
                  </div>

                  <div className="bg-gray-700 p-4 rounded">
                    <h3 className="font-semibold mb-2">📊 Resumen</h3>
                    <ul className="text-sm space-y-1">
                      <li>📦 Elementos: {elementos.length}</li>
                      <li>🔌 Cables: {cables.length}</li>
                      <li>📝 Textos: {textos.length}</li>
                      <li>⚡ Acciones: {cables.reduce((acc, c) => acc + (c.onComplete?.length || 0), 0)}</li>
                    </ul>
                  </div>

                  <button
                    onClick={handleDownloadConfig}
                    className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-4 rounded-lg transition-colors text-lg"
                  >
                    💾 Descargar circuitConfig.ts
                  </button>

                  <div className="text-sm text-gray-400 bg-gray-800 p-4 rounded">
                    <p className="font-semibold mb-2 text-orange-400">📝 Instrucciones para usar tu nivel:</p>
                    <ol className="list-decimal list-inside space-y-2">
                      <li>Descarga el archivo con el botón de arriba</li>
                      <li>Guárdalo en: <code className="bg-gray-700 px-2 py-1 rounded text-xs">app/game/nivel/niveles/[carpeta]/[nombre].ts</code></li>
                      <li>Abre: <code className="bg-gray-700 px-2 py-1 rounded text-xs">niveles-registry.ts</code></li>
                      <li>Agrega tu nivel al registro con un ID único:
                        <pre className="bg-gray-700 p-2 rounded mt-2 text-xs overflow-x-auto">
{`"mi-circuito": () =>
  import("./niveles/carpeta/nombre").then((m) => ({
    title: m.title,
    circuitElements: m.circuitElements,
    wires: m.wires,
    ballAnimations: m.ballAnimations,
    textElements: m.textElements,
  })),`}
                        </pre>
                      </li>
                      <li>Accede a tu nivel con: <code className="bg-gray-700 px-2 py-1 rounded text-xs">/game/nivel?id=mi-circuito</code></li>
                    </ol>
                    <p className="mt-3 text-blue-300">
                      💡 Ver más detalles en: <code className="bg-gray-700 px-2 py-1 rounded text-xs">COMO-AGREGAR-NIVELES.md</code>
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Preview Visual Interactivo */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-2xl font-bold mb-4">
              🎨 Preview del Circuito
            </h2>
            <p className="text-sm text-gray-400 mb-4">
              {activeTab === "elementos" && "💡 Haz click en el canvas para posicionar el elemento"}
              {activeTab === "cables" && "💡 Haz click para agregar puntos al cable"}
              {activeTab === "textos" && "💡 Haz click en el canvas para posicionar el texto"}
              {activeTab === "acciones" && "👀 Vista previa de tu circuito"}
              {activeTab === "exportar" && "👀 Vista previa final"}
            </p>

            {/* SVG Preview Interactivo */}
            <div className="bg-gray-900 rounded overflow-hidden mb-4">
              <svg
                ref={svgRef}
                className="w-full bg-gray-800 cursor-crosshair"
                viewBox="0 0 1000 500"
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
                onClick={handleSvgClick}
                style={{ aspectRatio: "2/1" }}
              >
                {/* Grid de fondo */}
                <defs>
                  <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
                    <path d="M 50 0 L 0 0 0 50" fill="none" stroke="#374151" strokeWidth="0.5"/>
                  </pattern>
                </defs>
                <rect width="1000" height="500" fill="url(#grid)" />

                {/* Cables creados */}
                {cables.map((cable, idx) => (
                  <path
                    key={`cable-${idx}`}
                    d={createSmoothPath(cable.points, cable.smoothness || 0.1)}
                    stroke={cable.color}
                    strokeWidth={cable.strokeWidth || 3}
                    strokeLinecap="round"
                    fill="none"
                    opacity="0.8"
                  />
                ))}

                {/* Cable en progreso */}
                {activeTab === "cables" && wireForm.points && wireForm.points.length > 0 && (
                  <>
                    {/* Línea del cable en progreso */}
                    <path
                      d={createSmoothPath(wireForm.points, wireForm.smoothness || 0.1)}
                      stroke={wireForm.color}
                      strokeWidth={wireForm.strokeWidth || 3}
                      strokeLinecap="round"
                      fill="none"
                      opacity="0.5"
                      strokeDasharray="5,5"
                    />
                    {/* Puntos del cable */}
                    {wireForm.points.map((point, idx) => (
                      <circle
                        key={`point-${idx}`}
                        cx={point.x}
                        cy={point.y}
                        r="5"
                        fill="#60a5fa"
                      />
                    ))}
                    {/* Línea al cursor si hay puntos */}
                    {mouseCoords && (
                      <line
                        x1={wireForm.points[wireForm.points.length - 1].x}
                        y1={wireForm.points[wireForm.points.length - 1].y}
                        x2={mouseCoords.x}
                        y2={mouseCoords.y}
                        stroke="#60a5fa"
                        strokeWidth="2"
                        strokeDasharray="3,3"
                        opacity="0.5"
                      />
                    )}
                  </>
                )}

                {/* Elementos del circuito */}
                {elementos.map((element) => {
                  const height = element.type === "battery" ? element.width : element.width * 2.5;
                  const centerX = element.x + element.width / 2;
                  const centerY = element.y + height / 2;
                  const rotation = element.rotation || 0;
                  const transform = `rotate(${rotation} ${centerX} ${centerY})`;

                  return (
                    <foreignObject
                      key={element.id}
                      x={element.x}
                      y={element.y}
                      width={element.width}
                      height={height}
                      transform={transform}
                    >
                      {element.type === "battery" && <Battery width={element.width} />}
                      {element.type === "led" && <Led width={element.width} isOn={element.isOn} />}
                      {element.type === "switch" && (
                        <Switch2Pins width={element.width} position={element.position} />
                      )}
                    </foreignObject>
                  );
                })}

                {/* Textos creados */}
                {textos.map((texto) => (
                  <text
                    key={texto.id}
                    x={texto.x}
                    y={texto.y}
                    fill={texto.color}
                    fontSize={texto.fontSize}
                    fontWeight={texto.fontWeight}
                    textAnchor={texto.textAnchor}
                    fontFamily="Arial, sans-serif"
                  >
                    {texto.text}
                  </text>
                ))}

                {/* Preview del texto que se está creando */}
                {activeTab === "textos" && mouseCoords && textForm.text && (
                  <text
                    x={mouseCoords.x}
                    y={mouseCoords.y}
                    fill={textForm.color || "#ffffff"}
                    fontSize={textForm.fontSize || 16}
                    fontWeight={textForm.fontWeight || "normal"}
                    textAnchor={textForm.textAnchor || "start"}
                    fontFamily="Arial, sans-serif"
                    opacity="0.5"
                  >
                    {textForm.text}
                  </text>
                )}

                {/* Preview del elemento que se está creando */}
                {activeTab === "elementos" && mouseCoords && elementForm.type && (
                  <>
                    {(() => {
                      const width = elementForm.width || 50;
                      const height = elementForm.type === "battery" ? width : width * 2.5;
                      const x = mouseCoords.x - width / 2;
                      const y = mouseCoords.y - height / 2;

                      // Calcular el centro para la rotación
                      const centerX = mouseCoords.x;
                      const centerY = mouseCoords.y;
                      const rotation = elementForm.rotation || 0;
                      const transform = `rotate(${rotation} ${centerX} ${centerY})`;

                      return (
                        <foreignObject
                          x={x}
                          y={y}
                          width={width}
                          height={height}
                          opacity="0.5"
                          transform={transform}
                        >
                          {elementForm.type === "battery" && <Battery width={width} />}
                          {elementForm.type === "led" && <Led width={width} isOn={false} />}
                          {elementForm.type === "switch" && <Switch2Pins width={width} position="left" />}
                        </foreignObject>
                      );
                    })()}
                  </>
                )}

                {/* Coordenadas del mouse */}
                {mouseCoords && (
                  <g>
                    {/* Crosshair */}
                    <line
                      x1={mouseCoords.x - 10}
                      y1={mouseCoords.y}
                      x2={mouseCoords.x + 10}
                      y2={mouseCoords.y}
                      stroke="#00ff00"
                      strokeWidth={1}
                    />
                    <line
                      x1={mouseCoords.x}
                      y1={mouseCoords.y - 10}
                      x2={mouseCoords.x}
                      y2={mouseCoords.y + 10}
                      stroke="#00ff00"
                      strokeWidth={1}
                    />
                    {/* Tooltip con coordenadas */}
                    <rect
                      x={mouseCoords.x + 15}
                      y={mouseCoords.y - 25}
                      width={120}
                      height={25}
                      fill="rgba(0, 0, 0, 0.8)"
                      rx={5}
                    />
                    <text
                      x={mouseCoords.x + 75}
                      y={mouseCoords.y - 8}
                      fill="#00ff00"
                      fontSize="14"
                      fontFamily="monospace"
                      textAnchor="middle"
                    >
                      {`x: ${mouseCoords.x}, y: ${mouseCoords.y}`}
                    </text>
                  </g>
                )}
              </svg>
            </div>

            {/* Lista de elementos/cables debajo del preview */}
            <div className="bg-gray-900 rounded p-4 max-h-150 overflow-auto">
              {activeTab === "elementos" && (
                <div className="space-y-2">
                  {elementos.length === 0 ? (
                    <p className="text-gray-500">No hay elementos creados</p>
                  ) : (
                    elementos.map((el) => (
                      <div key={el.id} className="bg-gray-800 p-3 rounded flex justify-between items-center">
                        <div className="flex-1">
                          <div className="font-semibold">{el.id}</div>
                          <div className="text-sm text-gray-400">
                            {el.type} - x: {el.x}, y: {el.y}, width: {el.width}
                            {el.type === "led" && ` - ${el.isOn ? "💡 ON" : "⚫ OFF"}`}
                            {el.type === "switch" && ` - ${el.position === "left" ? "⬅️" : "➡️"}`}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEditElement(el)}
                            className="bg-blue-500 hover:bg-blue-600 px-3 py-1 rounded text-sm"
                          >
                            ✏️
                          </button>
                          <button
                            onClick={() => handleDeleteElement(el.id)}
                            className="bg-red-500 hover:bg-red-600 px-3 py-1 rounded text-sm"
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {activeTab === "cables" && (
                <div className="space-y-2">
                  {cables.length === 0 ? (
                    <p className="text-gray-500">No hay cables creados</p>
                  ) : (
                    cables.map((cable, idx) => (
                      <div key={idx} className="bg-gray-800 p-3 rounded">
                        <div className="font-semibold">Cable {idx + 1}</div>
                        <div className="text-sm text-gray-400">
                          Puntos: {cable.points.length} | Color: {cable.color}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {activeTab === "textos" && (
                <div className="space-y-2">
                  {textos.length === 0 ? (
                    <p className="text-gray-500">No hay textos creados</p>
                  ) : (
                    textos.map((texto) => (
                      <div key={texto.id} className="bg-gray-800 p-3 rounded flex justify-between items-center">
                        <div className="flex-1">
                          <div className="font-semibold">{texto.text}</div>
                          <div className="text-sm text-gray-400">
                            x: {texto.x}, y: {texto.y} | {texto.fontSize}px
                          </div>
                        </div>
                        <button
                          onClick={() => handleDeleteText(texto.id)}
                          className="bg-red-500 hover:bg-red-600 px-3 py-1 rounded text-sm"
                        >
                          🗑️
                        </button>
                      </div>
                    ))
                  )}
                </div>
              )}

              {activeTab === "acciones" && (
                <div className="space-y-2">
                  {cables.every(c => !c.onComplete || c.onComplete.length === 0) ? (
                    <p className="text-gray-500">No hay acciones configuradas</p>
                  ) : (
                    cables.map((cable, idx) => (
                      cable.onComplete && cable.onComplete.length > 0 && (
                        <div key={idx} className="bg-gray-800 p-3 rounded">
                          <div className="font-semibold">Cable {idx + 1}</div>
                          <ul className="text-sm text-gray-400 mt-2 space-y-1">
                            {cable.onComplete.map((action, aidx) => (
                              <li key={aidx}>
                                • {action.elementId}: {JSON.stringify(action.changes)}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )
                    ))
                  )}
                </div>
              )}

              {activeTab === "exportar" && (
                <pre className="text-xs text-green-400 whitespace-pre-wrap">
                  {generateConfigFile()}
                </pre>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
