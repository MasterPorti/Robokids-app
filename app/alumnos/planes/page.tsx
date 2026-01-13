"use client";

import Logo from "@/app/ui/Logo";

interface ModalParaPlanesProps {
  titulo: string;
  precio: string;
  items: string[];
  color: string;
  textoBoton: string;
  onClickBoton?: () => void;
}

export default function PlanesPage() {
  return (
    <>
      <div>
        <h1
          className="text-4xl font-bold text-center mt-10"
          style={{ fontFamily: "var(--font-custom)" }}
        >
          Elige el plan que mejor se adapte a ti
        </h1>
        <p className="text-center mt-4 text-lg">
          Todos los planes incluyen acceso a materiales exclusivos y soporte
          personalizado.
        </p>
        <ModosDePago />
      </div>
      <div className="my-4 mx-5 flex gap-5 justify-center flex-wrap">
        <ModalParaPlanes
          titulo="Pago Mensual"
          precio="$1600 MXN"
          items={[
            "No incluye descuento por continuidad",
            "Riesgo de perder clases por retrasos de pago",
            "Requiere realizar el pago manual cada mes",
          ]}
          color="#ffd2d7"
          textoBoton="Pago Unico"
          onClickBoton={() => console.log("Click en pago mensual")}
        />
        <ModalParaPlanes
          titulo="Pago Recurrente Automático"
          precio="$1600 MXN/MES"
          items={[
            "Ahorra $100 MXN cada mes",
            "Cargo automático, sin preocuparte por fechas",
            "Garantiza continuidad en clases",
            "Cancela cuando tú quieras",
            "Menos trámites, más aprendizaje",
          ]}
          color="#ffc862"
          textoBoton="Suscribirme"
          onClickBoton={() =>
            console.log("Click en pago recurrente automático")
          }
        />
        <ModalParaPlanes
          titulo="Plan Completo por Niveles"
          precio="$1500 MXN/MES (6 meses)"
          items={[
            "Cobro unico de $9000 MXN por 6 meses",
            "Precio congelado durante todo el programa",
            "Sin aumentos ni cargos futuros",
            "Cancela cuando tú quieras",
            "La opción más económica a largo plazo",
          ]}
          color="#a5bbd1"
          textoBoton="Nivel completo"
          onClickBoton={() => console.log("Click en plan completo por niveles")}
        />
      </div>
    </>
  );
}

function ModosDePago() {
  return (
    <div className="flex gap-4 justify-center my-3 flex-wrap">
      <svg
        className="PaymentLogo "
        width="34"
        height="24"
        viewBox="0 0 34 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M0 4c0-2.20914 1.79086-4 4-4h26c2.2091 0 4 1.79086 4 4v16c0 2.2091-1.7909 4-4 4H4c-2.20914 0-4-1.7909-4-4V4Z"
          fill="#1434CB"
        ></path>
        <path
          d="m16.4161 7.21719-1.9594 9.41161h-2.3794l1.9595-9.41161h2.3793Zm9.8674 6.08131 1.2597-3.54741.6998 3.54741h-1.9595Zm2.6593 3.3303h2.1694l-1.8895-9.41161h-2.0294c-.4199 0-.8398.28959-.9798.72397l-3.499 8.68764h2.4493l.4899-1.3755h3.0092l.2799 1.3755Zm-6.1584-3.1131c0-2.4615-3.2891-2.6063-3.2891-3.69222.07-.50678.4899-.79636.9798-.79636.7697-.0724 1.6095.07239 2.3093.43438l.4199-2.02712C22.5045 7.14479 21.7347 7 21.0349 7c-2.3094 0-3.9889 1.30315-3.9889 3.1131 0 1.3755 1.1897 2.0995 2.0294 2.5339.9098.4343 1.2597.7239 1.1897 1.1583 0 .6516-.6998.9412-1.3996.9412-.8398 0-1.6796-.2172-2.4494-.5792l-.4198 2.0271c.8397.362 1.7495.5068 2.5893.5068 2.5893.0724 4.1988-1.2308 4.1988-3.1855ZM13.057 7.21719 9.27805 16.6288H6.75873l-1.8895-7.52929c0-.36198-.27992-.65157-.55985-.79636C3.60957 7.94116 2.83978 7.65157 2 7.50678l.06998-.28959h3.98893c.55985 0 .97974.43438 1.04972.94116l.97974 5.42975 2.51933-6.37091h2.4493Z"
          fill="#fff"
        ></path>
      </svg>

      <svg
        className="PaymentLogo "
        width="34"
        height="24"
        viewBox="0 0 34 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M30 0H4C1.79086 0 0 1.79086 0 4v16c0 2.2091 1.79086 4 4 4h26c2.2091 0 4-1.7909 4-4V4c0-2.20914-1.7909-4-4-4Z"
          fill="#000"
        ></path>
        <path
          d="M21.8342 19.4082c4.0195 0 7.278-3.2585 7.278-7.2781 0-4.01955-3.2585-7.27805-7.278-7.27805-4.0196 0-7.2781 3.2585-7.2781 7.27805 0 4.0196 3.2585 7.2781 7.2781 7.2781Z"
          fill="#F9A000"
        ></path>
        <path
          d="M12.1301 19.4082c4.0195 0 7.278-3.2585 7.278-7.2781 0-4.01955-3.2585-7.27805-7.278-7.27805-4.01957 0-7.27806 3.2585-7.27806 7.27805 0 4.0196 3.25849 7.2781 7.27806 7.2781Z"
          fill="#ED0006"
        ></path>
        <path
          fill-rule="evenodd"
          clip-rule="evenodd"
          d="M16.9833 6.7063c1.4883 1.33263 2.4248 3.26885 2.4248 5.4238 0 2.155-.9365 4.0912-2.4248 5.4238-1.4902-1.3317-2.4272-3.2683-2.4272-5.4238 0-2.0902.8811-3.97453 2.2921-5.30196l.1351-.12184Z"
          fill="#FF5D00"
        ></path>
      </svg>

      <svg
        className="PaymentLogo "
        width="34"
        height="24"
        viewBox="0 0 34 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M30 0H4C1.79086 0 0 1.79086 0 4v16c0 2.2091 1.79086 4 4 4h26c2.2091 0 4-1.7909 4-4V4c0-2.20914-1.7909-4-4-4Z"
          fill="#000"
        ></path>
        <path
          d="M21.9821 19.3061c4.0196 0 7.2781-3.2585 7.2781-7.278 0-4.01961-3.2585-7.2781-7.2781-7.2781-4.0195 0-7.278 3.25849-7.278 7.2781 0 4.0195 3.2585 7.278 7.278 7.278Z"
          fill="#00A1DF"
        ></path>
        <path
          d="M12.2781 19.3061c4.0195 0 7.278-3.2585 7.278-7.278 0-4.01961-3.2585-7.2781-7.278-7.2781C8.25849 4.75 5 8.00849 5 12.0281c0 4.0195 3.25849 7.278 7.2781 7.278Z"
          fill="#EB001B"
        ></path>
        <path
          fill-rule="evenodd"
          clip-rule="evenodd"
          d="M17.1312 6.60425c1.4883 1.33263 2.4249 3.26885 2.4249 5.42385 0 2.1549-.9366 4.0912-2.4249 5.4238-1.4901-1.3318-2.4271-3.2684-2.4271-5.4238 0-2.0902.8811-3.97458 2.2921-5.30201l.135-.12184Z"
          fill="#7673C0"
        ></path>
      </svg>

      <svg
        className="PaymentLogo "
        width="34"
        height="24"
        viewBox="0 0 34 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M30.1184 0H3.88163C1.73786 0 0 1.73786 0 3.88163V20.1184C0 22.2621 1.73786 24 3.88163 24H30.1184C32.2621 24 34 22.2621 34 20.1184V3.88163C34 1.73786 32.2621 0 30.1184 0Z"
          fill="#016FD0"
        ></path>
        <path
          d="M3.56625 8.1438 2 11.893h1.01971l.28899-.7507h1.68005l.2875.7507h1.04217L4.75367 8.1438H3.56625Zm.57948.87256.5121 1.31194h-1.0257l.5136-1.31194ZM6.42631 11.8921V8.14282l1.44906.00554.84282 2.41724.82264-2.42278h1.43747v3.74928h-.9104V9.12947l-.96504 2.76263h-.79842l-.96773-2.76263v2.76263h-.9104ZM11.6011 11.8921V8.14282h2.9708v.83865h-2.0508v.64131h2.0029v.78932h-2.0029v.666h2.0508v.814h-2.9708ZM15.099 8.14331v3.74919h.9104v-1.3319h.3834l1.0915 1.3319h1.1126l-1.1979-1.3812c.4916-.0428.9988-.4772.9988-1.15164 0-.78897-.6015-1.21635-1.2728-1.21635h-2.026Zm.9104.83864h1.0407c.2497 0 .4313.20106.4313.39466 0 .24908-.2353.39466-.4178.39466h-1.0542v-.78932ZM19.699 11.8921h-.9296V8.14282h.9296v3.74928ZM21.9031 11.8921h-.2007c-.9708 0-1.5602-.7875-1.5602-1.8592 0-1.09826.5828-1.89008 1.8088-1.89008h1.0062v.88798h-1.043c-.4977 0-.8497.39987-.8497 1.0113 0 .7261.4025 1.0311.9823 1.0311h.2396l-.3833.8189ZM23.8841 8.14331l-1.5662 3.74919h1.0197l.289-.7507h1.68l.2875.7507h1.0422l-1.5648-3.74919h-1.1874Zm.5795.87256.5121 1.31193H23.95l.5136-1.31193ZM26.7426 11.8921V8.14282H27.9l1.4779 2.35558V8.14282h.9104v3.74928h-1.12L27.653 9.47479v2.41731h-.9104ZM7.582 16.7133v-3.7492h2.9708v.8386H8.50198v.6414h2.00282v.7893H8.50198v.6659h2.05082v.814H7.582ZM22.1387 16.7133v-3.7492h2.9707v.8386h-2.0507v.6414h1.9932v.7893h-1.9932v.6659h2.0507v.814h-2.9707ZM10.668 16.7133l1.4465-1.8515-1.4809-1.8977h1.1469l.882 1.1732.8849-1.1732h1.1021l-1.4614 1.8746 1.4491 1.8746h-1.1468l-.8564-1.1547-.8355 1.1547H10.668ZM14.7452 12.9648v3.7492h.9344v-1.1839h.9583c.8109 0 1.4255-.4429 1.4255-1.3042 0-.7135-.4821-1.2611-1.3072-1.2611h-2.011Zm.9344.8479h1.0092c.262 0 .4492.1653.4492.4317 0 .2502-.1863.4316-.4522.4316h-1.0062v-.8633ZM18.4587 12.9641v3.7492h.9104v-1.3319h.3833l1.0916 1.3319h1.1125l-1.1979-1.3813c.4916-.0427.9987-.4771.9987-1.1516 0-.7889-.6014-1.2163-1.2727-1.2163h-2.0259Zm.9104.8386h1.0406c.2497 0 .4313.2011.4313.3947 0 .2491-.2353.3947-.4178.3947h-1.0541v-.7894ZM25.531 16.7133v-.814h1.822c.2695 0 .3863-.1499.3863-.3144 0-.1577-.1164-.317-.3863-.317h-.8234c-.7156 0-1.1142-.4489-1.1142-1.1229 0-.6012.365-1.1809 1.4285-1.1809h1.7728l-.3833.8436h-1.5333c-.2931 0-.3833.1583-.3833.3095 0 .1555.1115.3269.3354.3269h.8625c.7978 0 1.144.4659 1.144 1.076 0 .656-.3858 1.1932-1.1875 1.1932H25.531ZM28.8723 16.7133v-.814h1.822c.2696 0 .3863-.1499.3863-.3144 0-.1577-.1164-.317-.3863-.317h-.8234c-.7156 0-1.1142-.4489-1.1142-1.1229 0-.6012.365-1.1809 1.4285-1.1809h1.7728l-.3833.8436h-1.5333c-.2931 0-.3833.1583-.3833.3095 0 .1555.1115.3269.3354.3269h.8625c.7978 0 1.144.4659 1.144 1.076 0 .656-.3858 1.1932-1.1874 1.1932h-1.9403Z"
          fill="#fff"
        ></path>
      </svg>

      <svg
        className="PaymentLogo "
        width="34"
        height="24"
        viewBox="0 0 34 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M0 4c0-2.208 1.79273-4 4.00118-4H30.0004C32.2104 0 34 1.792 34 4v16c0 2.208-1.7912 4-3.9996 4H4.00118C1.79118 24 0 22.208 0 20V4Z"
          fill="#00D66F"
        ></path>
        <path
          d="M15.2411 4H11c.8249 3.495 3.233 6.4815 6.2457 8.361-3.0187 1.878-5.4208 4.8645-6.2457 8.3595h4.2382c1.0495-3.2325 3.9588-6.042 7.5317-6.615v-3.495c-3.5774-.57-6.4866-3.378-7.5317-6.6105h.0029Z"
          fill="#011E0F"
        ></path>
      </svg>
    </div>
  );
}

function ModalParaPlanes({
  titulo,
  precio,
  items,
  color,
  textoBoton,
  onClickBoton,
}: ModalParaPlanesProps) {
  return (
    <div className="w-80 py-3 rounded-2xl px-5 bg-[#242424]">
      <div className="w-30">
        <Logo />
      </div>
      <div
        className="mt-2 text-3xl"
        style={{ fontFamily: "var(--font-custom)", color }}
      >
        {titulo}
      </div>
      <div className="text-xl font-bold mt-2">{precio}</div>
      <div className="h-0.5 my-4" style={{ backgroundColor: color }} />
      <ul className="mt-2 space-y-2 list-disc list-inside marker:text-white">
        {items.map((item, index) => (
          <li key={index} className="text-sm">
            {item}
          </li>
        ))}
      </ul>
      <button
        className="w-full text-black mt-4 h-10 rounded-2xl"
        style={{ fontFamily: "var(--font-custom)", backgroundColor: color }}
        onClick={onClickBoton}
      >
        {textoBoton}
      </button>
    </div>
  );
}
