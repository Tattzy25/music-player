import { MusicPlayer } from "@/components/music-player"
import { Skiper49 } from "@/components/skiper49"

export default function Home() {
  return (
    <main className="w-full min-h-screen relative overflow-hidden bg-background">
      {/* Ambient Pearl Background Elements */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-40 h-40 sm:w-56 sm:h-56 lg:w-64 lg:h-64 bg-primary/20 rounded-full blur-3xl animate-float" />
        <div className="absolute top-1/3 right-1/4 w-48 h-48 sm:w-64 sm:h-64 lg:w-80 lg:h-80 bg-secondary/20 rounded-full blur-3xl animate-float-delayed" />
        <div className="absolute bottom-1/4 left-1/3 w-44 h-44 sm:w-60 sm:h-60 lg:w-72 lg:h-72 bg-accent/20 rounded-full blur-3xl animate-float-slow" />
      </div>

      {/* Magazine-worthy layout */}
      <div className="relative z-10 w-full">
        {/* Top Hero Carousel - Full Width Premium */}
        <div className="w-full pt-6 sm:pt-8 lg:pt-10 pb-8 sm:pb-12 lg:pb-16 border-b border-border/40">
          <div className="flex items-center justify-center">
            <Skiper49 />
          </div>
        </div>

        {/* Main Player - Magazine Layout */}
        <MusicPlayer />
      </div>
    </main>
  )
}
