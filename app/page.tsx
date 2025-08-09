import { title } from "@/components/primitives";
import TypingAnimation from "@/components/TypingAnimation";

export default function Home() {
  const typingTexts = [
    "[ Peter Đ. Trinh ]",
    "[ Full Stack Dev ]",
    "[ Tech Enthusiast ]",
    "[ Problem Solver ]",
  ];

  return (
    <section className="flex flex-col mt-48 items-center justify-center gap-4 py-8 md:py-10">
      <div className="inline-block max-w-xs sm:max-w-xl text-center justify-center px-4">
        <TypingAnimation
          className={`${title()} font-protest-revolution text-2xl sm:text-4xl lg:text-5xl`}
          deletingSpeed={60}
          pauseDuration={2500}
          texts={typingTexts}
          typingSpeed={120}
        />
      </div>
      <div className="text-center max-w-2xl px-4">
        <p className="text-lg text-default-600 leading-relaxed">
          Welcome to my digital space where I share my journey in technology,
          development insights, and creative projects.
        </p>
      </div>
    </section>
  );
}
