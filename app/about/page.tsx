import Image from "next/image";

interface FallingCard {
  id: number;
  left: number;
  delay: number;
  duration: number;
}

const cards: FallingCard[] = [
  { id: 0, left: 10, delay: -2, duration: 10 },
  { id: 1, left: 25, delay: -8, duration: 9 },
  { id: 2, left: 40, delay: -5, duration: 11 },
  { id: 3, left: 55, delay: -11, duration: 8 },
  { id: 4, left: 70, delay: -3, duration: 12 },
  { id: 5, left: 85, delay: -9, duration: 10 },
  { id: 6, left: 15, delay: -6, duration: 9 },
  { id: 7, left: 90, delay: -1, duration: 11 },
];

export default function AboutPage() {
  return (
    <>
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-10">
        {cards.map((card) => (
          <div
            key={card.id}
            className="absolute opacity-20"
            style={{
              left: `${card.left}%`,
              animation: `fall ${card.duration}s linear infinite ${card.delay}s`,
            }}
          >
            <Image
              alt=""
              className="rotate-12 transform"
              height={90}
              src="/transparent-card.png"
              width={60}
            />
          </div>
        ))}
      </div>

      <div className="relative z-20 w-full max-w-4xl mx-auto px-4">
        <h1 className="mb-8 text-4xl font-bold text-left">About Me</h1>
        <div className="space-y-6 text-lg leading-relaxed text-left">
          <p>
            Hi, I&apos;m <span className="font-semibold">Peter Trinh</span>! A
            self-taught developer, photographer, and all-around creative based
            in <span className="font-semibold">Oklahoma City</span>.
          </p>
          <p>
            I&apos;ve spent the past few years diving into programming in my
            free time, building projects, learning new tools, and exploring
            what&apos;s possible with code. My background is in chemical
            engineering from the University of Oklahoma, but over time, I found
            myself drawn more and more toward the creative problem-solving side
            of tech.
          </p>
          <p>
            Outside of coding, I stay busy with video and photography work,
            playing tennis, and coming up with startup ideas that keep my
            imagination sharp. I also stream occasionally, and you&apos;ll be
            able to catch those live right here on my site.
          </p>
          <p>
            This space brings together everything I&apos;m exploring — from tech
            to storytelling — fueled by curiosity and the drive to keep growing.
            I try not to limit myself to one lane. My approach is simple:{" "}
            <span className="font-medium italic">Do Everything</span>!
          </p>
        </div>
      </div>

      <style>{`
        @keyframes fall {
          0% {
            transform: translateY(-100px) rotate(0deg);
            opacity: 0;
          }
          10% {
            opacity: 0.2;
          }
          90% {
            opacity: 0.2;
          }
          100% {
            transform: translateY(calc(100vh + 100px)) rotate(360deg);
            opacity: 0;
          }
        }
      `}</style>
    </>
  );
}
