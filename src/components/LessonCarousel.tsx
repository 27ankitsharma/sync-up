import { useEffect, useMemo, useRef, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";
import { LessonContent } from "@/components/LessonContent";
import { firstSlideIndexForLesson, isVisualSlide, slidesFromLessons } from "@/lib/lessonSlides";
import type { Lesson } from "@/types/courseContent";
import { cn } from "@/lib/utils";

const overlayButtonClass =
  "absolute top-1/2 z-10 h-11 w-11 -translate-y-1/2 rounded-full border-violet-100 bg-white/90 shadow-md touch-manipulation hover:bg-white disabled:hidden lg:h-10 lg:w-10";

interface LessonCarouselProps {
  lessons: Lesson[];
  activeIndex: number;
  onSelect: (index: number) => void;
}

export function LessonCarousel({ lessons, activeIndex, onSelect }: LessonCarouselProps) {
  const [api, setApi] = useState<CarouselApi>();
  const slides = useMemo(() => slidesFromLessons(lessons), [lessons]);
  const slidesRef = useRef(slides);
  const activeIndexRef = useRef(activeIndex);
  const onSelectRef = useRef(onSelect);
  slidesRef.current = slides;
  activeIndexRef.current = activeIndex;
  onSelectRef.current = onSelect;

  useEffect(() => {
    if (!api) return;
    const current = slides[api.selectedScrollSnap()];
    if (current?.lessonIndex === activeIndex) return;
    api.scrollTo(firstSlideIndexForLesson(slides, activeIndex));
  }, [api, activeIndex, slides]);

  useEffect(() => {
    if (!api) return;

    const handleSelect = () => {
      const slide = slidesRef.current[api.selectedScrollSnap()];
      if (slide && slide.lessonIndex !== activeIndexRef.current) {
        onSelectRef.current(slide.lessonIndex);
      }
    };

    api.on("select", handleSelect);
    return () => {
      api.off("select", handleSelect);
    };
  }, [api]);

  return (
    <Carousel
      setApi={setApi}
      opts={{ align: "start", loop: false, duration: 22 }}
      className="relative mx-auto w-full max-w-[1200px] outline-none"
      tabIndex={0}
      aria-label="Lesson carousel"
    >
      <CarouselContent className="-ml-0">
        {slides.map((slide, index) => {
          const visual = isVisualSlide(slide.content);
          return (
            <CarouselItem key={`${slide.lesson.id}-${index}`} className="pl-0">
              <Card
                className={cn(
                  "overflow-hidden border-violet-100 bg-white shadow-[0_10px_35px_-25px_rgba(87,63,191,0.45)]",
                  "lg:aspect-video",
                )}
              >
                <CardContent
                  className={cn(
                    "flex flex-col px-4 py-5 sm:px-6",
                    "lg:h-full lg:px-14 lg:py-6",
                    visual && "lg:min-h-0",
                  )}
                >
                  <div className="shrink-0">
                    <p className="text-xs font-semibold uppercase tracking-wider text-primary">
                      Lesson {slide.lessonIndex + 1} of {lessons.length}
                    </p>
                    <h2 className="mt-2 text-xl font-bold text-foreground lg:text-2xl">{slide.lesson.title}</h2>
                  </div>
                  <div
                    className={cn(
                      "min-h-0 flex-1",
                      visual ? "mt-3 flex flex-col" : "mt-4 overflow-y-auto lg:mt-5",
                    )}
                  >
                    <LessonContent content={slide.content} />
                  </div>
                </CardContent>
              </Card>
            </CarouselItem>
          );
        })}
      </CarouselContent>
      <CarouselPrevious className={cn(overlayButtonClass, "left-2 sm:left-3")} />
      <CarouselNext className={cn(overlayButtonClass, "right-2 sm:right-3")} />
    </Carousel>
  );
}
