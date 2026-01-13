export default function Switch2Pins({
  width,
  position,
}: {
  width: number;
  position: "left" | "right";
}) {
  return (
    <>
      {position === "left" ? (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width={width}
          viewBox="0 0 468 563"
          fill="none"
        >
          <rect
            x="136"
            y="415"
            width="29"
            height="148"
            rx="14.5"
            fill="#D9D9D9"
          />
          <rect
            x="303"
            y="415"
            width="29"
            height="148"
            rx="14.5"
            fill="#D9D9D9"
          />
          <rect y="215" width="468" height="223" rx="22" fill="#808080" />
          <rect
            x="155"
            y="20.2012"
            width="46"
            height="177"
            rx="23"
            transform="rotate(-26.05 155 20.2012)"
            fill="#7E7E7E"
          />
          <rect x="165" y="145" width="138" height="97" rx="8" fill="#565656" />
        </svg>
      ) : (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width={width}
          viewBox="0 0 468 566"
          fill="none"
        >
          <rect
            x="136"
            y="418"
            width="29"
            height="148"
            rx="14.5"
            fill="#D9D9D9"
          />
          <rect
            x="303"
            y="418"
            width="29"
            height="148"
            rx="14.5"
            fill="#D9D9D9"
          />
          <rect y="218" width="468" height="223" rx="22" fill="#808080" />
          <rect
            x="282.734"
            width="46"
            height="177"
            rx="23"
            transform="rotate(26.0511 282.734 0)"
            fill="#7E7E7E"
          />
          <rect x="165" y="148" width="138" height="97" rx="8" fill="#565656" />
        </svg>
      )}
    </>
  );
}
