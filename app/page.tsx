import { MusicPlayer } from "@/components/music-player"

export default function Home() {
  return (
    <main className="min-h-screen relative overflow-hidden bg-linear-to-br from-background via-muted/30 to-background">
      {/* Ambient Pearl Background Elements */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-40 h-40 sm:w-56 sm:h-56 lg:w-64 lg:h-64 bg-primary/20 rounded-full blur-3xl animate-float" />
        <div className="absolute top-1/3 right-1/4 w-48 h-48 sm:w-64 sm:h-64 lg:w-80 lg:h-80 bg-secondary/20 rounded-full blur-3xl animate-float-delayed" />
        <div className="absolute bottom-1/4 left-1/3 w-44 h-44 sm:w-60 sm:h-60 lg:w-72 lg:h-72 bg-accent/20 rounded-full blur-3xl animate-float-slow" />
      </div>

      <MusicPlayer />
    </main>
  )
}
