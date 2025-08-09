import { Card } from "@heroui/card";
import { Button } from "@heroui/button";
import { Link } from "@heroui/link";
import Image from "next/image";

import { title } from "@/components/primitives";

const projects = [
  {
    id: 1,
    title: "Han Jan Korean Kitchen & Pocha",
    description:
      "A modern restaurant website for an authentic Korean late-night dining experience in Oklahoma City. Features menu showcase, gallery, catering services, and emphasizes traditional Korean street food and drinks.",
    url: "https://hanjanpochaok.com",
    preview: `https://api.screenshotmachine.com?key=28874a&url=${encodeURIComponent("https://hanjanpochaok.com")}&dimension=1024x768`,
    technologies: ["Next.js", "Tailwind CSS", "Nodemailer.js"],
    category: "Restaurant & Food Service",
  },
  {
    id: 2,
    title: "The Space Ape",
    description:
      "A premium cannabis and vaping products platform focused on sustainable practices and innovative technology. Targets adults 21+ with product exploration and monthly giveaways.",
    url: "https://thespaceape.com",
    preview: `https://api.screenshotmachine.com?key=28874a&url=${encodeURIComponent("https://thespaceape.com")}&dimension=1024x768`,
    technologies: ["Next.js", "Google API"],
    category: "Product Catalog & Cannabis",
  },
  {
    id: 3,
    title: "Grail Seekers",
    description:
      "An e-commerce and lifestyle brand with a quest-driven aesthetic. Features dark-themed design with sections for drops, store, and news with the tagline 'SEEK TIL YOU FIND'.",
    url: "https://grailseekers.netlify.app/",
    preview: `https://api.screenshotmachine.com?key=28874a&url=${encodeURIComponent("https://grailseekers.netlify.app/")}&dimension=1024x768`,
    technologies: ["E-commerce", "Sanity CMS", "Postgres SQL", "Stripe"],
    category: "E-commerce & Fashion",
  },
];

export default function ProjectPage() {
  return (
    <div className="w-full max-w-none mx-auto px-8 lg:px-12">
      <h1 className={`${title()} mb-8 text-center`}>
        Web Development Projects
      </h1>
      <p className="text-lg text-center mt-8 mb-12 max-w-3xl mx-auto text-gray-600 dark:text-gray-400">
        A showcase of my recent web development work, featuring restaurants,
        e-commerce platforms, and lifestyle brands built with modern
        technologies and user-focused design.
      </p>

      <div className="grid grid-cols-1 gap-8">
        {projects.map((project) => (
          <Card key={project.id} className="overflow-hidden">
            {/* Website Preview */}
            <div className="relative">
              <div className="aspect-video relative bg-gray-100 dark:bg-gray-800">
                <Image
                  fill
                  alt={`${project.title} website preview`}
                  className={`object-cover ${project.id === 1 ? "scale-110" : ""}`}
                  sizes="100vw"
                  src={project.preview}
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-10 transition-all duration-300" />
              </div>
            </div>

            {/* Project Info */}
            <div className="p-6">
              <div className="flex flex-col gap-2 mb-4">
                <h3 className="text-2xl font-bold">{project.title}</h3>
                <span className="text-sm text-gray-500 font-medium">
                  {project.category}
                </span>
              </div>

              <p className="text-gray-700 dark:text-gray-300 mb-6 leading-relaxed">
                {project.description}
              </p>

              <div className="mb-6">
                <h4 className="text-sm font-semibold mb-2 text-gray-600 dark:text-gray-400">
                  Technologies Used
                </h4>
                <div className="flex flex-wrap gap-2">
                  {project.technologies.map((tech) => (
                    <span
                      key={tech}
                      className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-800 rounded-full"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>

              <Button
                isExternal
                as={Link}
                className="w-full"
                color="primary"
                href={project.url}
                size="lg"
                variant="solid"
              >
                View Live Site
              </Button>
            </div>
          </Card>
        ))}
      </div>

      <div className="mt-12 text-center">
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Interested in working together?
        </p>
        <Button
          as={Link}
          color="secondary"
          href="/about"
          size="lg"
          variant="bordered"
        >
          Get In Touch
        </Button>
      </div>
    </div>
  );
}
