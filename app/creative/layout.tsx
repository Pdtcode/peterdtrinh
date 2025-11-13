export default function CreativeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col items-start justify-start gap-4 py-8 md:py-10">
      <div className="w-full">{children}</div>
    </section>
  );
}
