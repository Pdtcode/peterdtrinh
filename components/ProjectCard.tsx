import Image from "next/image";
import { Link } from "@heroui/link";

import { Project, previewUrl } from "@/config/projects";
import { card, tag } from "@/components/primitives";

interface ProjectCardProps {
  project: Project;
}

export default function ProjectCard({ project }: ProjectCardProps) {
  const preview = previewUrl(project.url);

  return (
    <article className={card({ interactive: true })}>
      <Link
        isExternal
        aria-label={`${project.title}, open live site`}
        className="block"
        href={project.url}
      >
        <div className="relative aspect-[4/3] overflow-hidden border-b border-line bg-paper">
          {preview ? (
            <Image
              fill
              unoptimized
              alt={`${project.title} homepage`}
              className="object-cover object-top transition-transform duration-700 group-hover:scale-[1.04]"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              src={preview}
            />
          ) : (
            <div className="flex h-full items-center justify-center p-6">
              <span className="text-center font-display text-2xl text-muted">
                {project.title}
              </span>
            </div>
          )}
        </div>
      </Link>

      <div className="p-6">
        <div className="flex items-baseline justify-between gap-4">
          <p className="eyebrow">{project.category}</p>
          <p className="font-mono text-[0.7rem] text-muted">{project.year}</p>
        </div>

        <h3 className="mt-3 text-xl font-semibold tracking-tight text-ink">
          <Link
            isExternal
            className="text-inherit transition-colors hover:text-accent"
            href={project.url}
          >
            {project.title}
          </Link>
        </h3>

        <p className="mt-3 text-sm leading-relaxed text-muted">
          {project.description}
        </p>

        {project.note && (
          <p className="mt-4 border-l-2 border-accent/40 pl-3 text-sm leading-relaxed text-muted">
            {project.note}
          </p>
        )}

        <div className="mt-5 flex flex-wrap gap-2">
          {project.technologies.map((tech) => (
            <span key={tech} className={tag()}>
              {tech}
            </span>
          ))}
        </div>

        <Link
          isExternal
          className="mt-6 inline-flex items-center gap-1.5 font-mono text-xs uppercase tracking-label text-ink transition-colors hover:text-accent"
          href={project.url}
        >
          Visit site
          <span aria-hidden="true">→</span>
        </Link>
      </div>
    </article>
  );
}
