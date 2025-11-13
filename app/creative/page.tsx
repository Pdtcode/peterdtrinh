import { Button } from "@heroui/button";
import { Card, CardBody } from "@heroui/card";
import { Chip } from "@heroui/chip";
import Image from "next/image";

import { title, subtitle } from "@/components/primitives";

export default function CreativePage() {
  const photographyProjects = [
    {
      id: 1,
      title: "Urban Landscapes",
      description: "Capturing the beauty of city architecture and street life",
      image: "/api/placeholder/400/600",
      category: "Architecture",
      tags: ["Urban", "Street", "Architecture"],
    },
    {
      id: 2,
      title: "Portrait Series",
      description: "Intimate portraits showcasing human emotion and connection",
      image: "/api/placeholder/600/400",
      category: "Portraits",
      tags: ["People", "Emotion", "Studio"],
    },
    {
      id: 3,
      title: "Nature's Details",
      description: "Macro photography revealing the intricate beauty of nature",
      image: "/api/placeholder/400/600",
      category: "Nature",
      tags: ["Macro", "Nature", "Details"],
    },
    {
      id: 4,
      title: "Event Coverage",
      description: "Professional event photography with candid moments",
      image: "/api/placeholder/600/400",
      category: "Events",
      tags: ["Events", "Candid", "Professional"],
    },
  ];

  const videographyProjects = [
    {
      id: 1,
      title: "Brand Commercial",
      description: "30-second commercial showcasing product innovation",
      thumbnail: "/api/placeholder/600/400",
      duration: "0:30",
      category: "Commercial",
      tags: ["Branding", "Product", "Commercial"],
    },
    {
      id: 2,
      title: "Wedding Highlight Reel",
      description: "Cinematic wedding film capturing the couple's special day",
      thumbnail: "/api/placeholder/600/400",
      duration: "3:45",
      category: "Wedding",
      tags: ["Wedding", "Cinematic", "Love"],
    },
    {
      id: 3,
      title: "Corporate Interview",
      description: "Professional interview setup with executive leadership",
      thumbnail: "/api/placeholder/600/400",
      duration: "12:30",
      category: "Corporate",
      tags: ["Interview", "Corporate", "Professional"],
    },
    {
      id: 4,
      title: "Music Video",
      description: "Creative music video with dynamic storytelling",
      thumbnail: "/api/placeholder/600/400",
      duration: "4:15",
      category: "Music",
      tags: ["Music", "Creative", "Storytelling"],
    },
  ];

  return (
    <div className="max-w-7xl mx-auto py-8 space-y-16">
      {/* Hero Section */}
      <div className="text-center space-y-4">
        <h1 className={title({ size: "lg", color: "foreground" })}>
          Creative Portfolio
        </h1>
        <p className={subtitle()}>
          Visual storytelling through photography and videography
        </p>
      </div>

      {/* Photography Section */}
      <section className="space-y-8">
        <div className="text-center">
          <h2 className={title({ size: "md", color: "blue" })}>Photography</h2>
          <p className="text-default-600 mt-2 max-w-2xl mx-auto">
            Capturing moments, emotions, and the beauty in everyday life through
            the lens
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {photographyProjects.map((project) => (
            <Card
              key={project.id}
              className="group hover:scale-105 transition-transform duration-300"
            >
              <CardBody className="p-0">
                <div className="relative aspect-[4/3] overflow-hidden rounded-t-lg">
                  <Image
                    fill
                    alt={project.title}
                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                    sizes="(max-width: 768px) 100vw, 50vw"
                    src={project.image}
                  />
                </div>
                <div className="p-6 space-y-3">
                  <div className="flex justify-between items-start">
                    <h3 className="text-xl font-semibold">{project.title}</h3>
                    <Chip color="primary" size="sm" variant="flat">
                      {project.category}
                    </Chip>
                  </div>
                  <p className="text-default-600">{project.description}</p>
                  <div className="flex flex-wrap gap-2">
                    {project.tags.map((tag) => (
                      <Chip key={tag} size="sm" variant="bordered">
                        {tag}
                      </Chip>
                    ))}
                  </div>
                  <Button
                    className="w-full mt-4"
                    color="primary"
                    variant="light"
                  >
                    View Gallery
                  </Button>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      </section>

      {/* Videography Section */}
      <section className="space-y-8">
        <div className="text-center">
          <h2 className={title({ size: "md", color: "cyan" })}>Videography</h2>
          <p className="text-default-600 mt-2 max-w-2xl mx-auto">
            Bringing stories to life through motion, sound, and cinematic vision
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {videographyProjects.map((project) => (
            <Card
              key={project.id}
              className="group hover:scale-105 transition-transform duration-300"
            >
              <CardBody className="p-0">
                <div className="relative aspect-video overflow-hidden rounded-t-lg">
                  <Image
                    fill
                    alt={project.title}
                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                    sizes="(max-width: 768px) 100vw, 50vw"
                    src={project.thumbnail}
                  />
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors duration-300 flex items-center justify-center">
                    <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <svg
                        className="w-6 h-6 text-black ml-1"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>
                  </div>
                  <div className="absolute bottom-4 right-4 bg-black/70 text-white px-2 py-1 rounded text-sm">
                    {project.duration}
                  </div>
                </div>
                <div className="p-6 space-y-3">
                  <div className="flex justify-between items-start">
                    <h3 className="text-xl font-semibold">{project.title}</h3>
                    <Chip color="secondary" size="sm" variant="flat">
                      {project.category}
                    </Chip>
                  </div>
                  <p className="text-default-600">{project.description}</p>
                  <div className="flex flex-wrap gap-2">
                    {project.tags.map((tag) => (
                      <Chip key={tag} size="sm" variant="bordered">
                        {tag}
                      </Chip>
                    ))}
                  </div>
                  <Button
                    className="w-full mt-4"
                    color="secondary"
                    variant="light"
                  >
                    Watch Video
                  </Button>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      </section>

      {/* Contact Section */}
      <section className="text-center space-y-6 py-12 px-6 bg-default-50 rounded-2xl">
        <h2 className={title({ size: "md", color: "green" })}>
          Let&apos;s Create Together
        </h2>
        <p className="text-default-600 max-w-2xl mx-auto">
          Ready to bring your vision to life? Get in touch to discuss your
          photography or videography project.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button color="primary" size="lg">
            Start a Project
          </Button>
          <Button size="lg" variant="bordered">
            View Full Portfolio
          </Button>
        </div>
      </section>
    </div>
  );
}
