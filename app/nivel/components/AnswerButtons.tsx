interface AnswerButtonsProps {
  answers: (string | null)[];
  onButtonClick: (value: string, element: HTMLButtonElement) => void;
}

export default function AnswerButtons({
  answers,
  onButtonClick,
}: AnswerButtonsProps) {
  const options = ["Positivo", "Negativo"];

  return (
    <div
      className="w-full flex items-center mt-4 justify-center text-white gap-4"
      style={{ fontFamily: "var(--font-custom)" }}
    >
      {options.map((option) => (
        <button
          key={option}
          onClick={(e) => onButtonClick(option, e.currentTarget)}
          disabled={answers.includes(option)}
          className={`text-xl w-30 h-12 border-2 border-[#37464f] rounded-xl border-b-6 transition-colors flex items-center justify-center ${
            answers.includes(option)
              ? "bg-[#37464f] cursor-not-allowed"
              : "cursor-pointer hover:bg-[#37464f]"
          }`}
        >
          <span className={answers.includes(option) ? "invisible" : ""}>
            {option}
          </span>
        </button>
      ))}
    </div>
  );
}
