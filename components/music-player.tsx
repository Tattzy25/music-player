"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { AspectRatio } from "@/components/ui/aspect-ratio"
import { Play, Pause, Volume2, VolumeX, Radio, Search, Loader2, Sparkles, Music } from "lucide-react"
import { cn } from "@/lib/utils"

interface RadioStation {
  stationuuid: string
  name: string
  url: string
  url_resolved?: string
  favicon: string
  country: string
  tags: string
  votes: number
}

export function MusicPlayer() {
  const [stations, setStations] = useState<RadioStation[]>([])
  const [currentStation, setCurrentStation] = useState<RadioStation | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [volume, setVolume] = useState(0.7)
  const [isMuted, setIsMuted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const audioRef = useRef<HTMLAudioElement | null>(null)

  // Load popular stations on mount
  useEffect(() => {
    fetchPopularStations()
  }, [])

  const fetchPopularStations = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("https://de1.api.radio-browser.info/json/stations/topvote/100")
      const data = await response.json()
      setStations(data)
    } catch (error) {
      console.error("[MusicPlayer] Error fetching stations:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const searchStations = async () => {
    if (!searchQuery.trim()) {
      fetchPopularStations()
      return
    }

    setIsLoading(true)
    try {
      const params = new URLSearchParams()
      params.set("name", searchQuery.trim())
      params.set("limit", "50")
      const url = `https://de1.api.radio-browser.info/json/stations/search?${params.toString()}`
      const response = await fetch(url)
      const data = await response.json()
      setStations(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error("[MusicPlayer] Error searching stations:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const playStation = (station: RadioStation) => {
    if (audioRef.current) {
      audioRef.current.pause()
      // Prefer resolved stream url when available for better compatibility
      audioRef.current.src = station.url_resolved || station.url
      audioRef.current.volume = isMuted ? 0 : volume
      audioRef.current.play()
      setCurrentStation(station)
      setIsPlaying(true)
    }
  }

  const togglePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause()
      } else {
        audioRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  const toggleMute = () => {
    if (audioRef.current) {
      const newMuted = !isMuted
      audioRef.current.volume = newMuted ? 0 : volume
      setIsMuted(newMuted)
    }
  }

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = Number.parseFloat(e.target.value)
    setVolume(newVolume)
    if (audioRef.current) {
      audioRef.current.volume = newVolume
      setIsMuted(newVolume === 0)
    }
  }

  const renderStations = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center py-12">
          <div className="flex flex-col items-center gap-4">
            <div className="relative w-12 h-12">
              <Loader2 className="w-12 h-12 animate-spin text-primary" />
              <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse" />
            </div>
            <p className="text-sm font-medium text-muted-foreground">Discovering stations...</p>
          </div>
        </div>
      )
    }

    if (stations.length === 0) {
      return (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
              <Radio className="w-8 h-8 text-muted-foreground/60" />
            </div>
            <p className="text-sm font-medium text-muted-foreground">No stations found</p>
            <p className="text-xs text-muted-foreground/60 mt-1">Try a different search or browse popular stations</p>
          </div>
        </div>
      )
    }

    return (
      <div className="space-y-3">
        {stations.map((station, idx) => {
          const isActive = currentStation?.stationuuid === station.stationuuid
          const codecs = {
            MP3: "from-orange-500/20 to-orange-600/10 text-orange-600",
            AAC: "from-purple-500/20 to-purple-600/10 text-purple-600",
            "AAC+": "from-blue-500/20 to-blue-600/10 text-blue-600",
            OPUS: "from-green-500/20 to-green-600/10 text-green-600",
            OGG: "from-cyan-500/20 to-cyan-600/10 text-cyan-600",
          }
          const codecColor = codecs[station.codec as keyof typeof codecs] || "from-slate-500/20 to-slate-600/10 text-slate-600"
          
          return (
            <div
              key={station.stationuuid}
              onClick={() => playStation(station)}
              role="button"
              tabIndex={0}
              aria-current={isActive ? "true" : undefined}
              aria-label={`Play ${station.name}`}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault()
                  playStation(station)
                }
              }}
              style={{ animationDelay: `${idx * 30}ms` }}
              className={cn(
                "group cursor-pointer rounded-2xl p-4 sm:p-5 transition-all duration-500 border backdrop-blur-xl",
                "hover:scale-[1.03] active:scale-95 touch-manipulation",
                "animate-in fade-in slide-in-from-bottom-4",
                isActive
                  ? "border-primary bg-gradient-to-br from-primary/25 via-secondary/15 to-accent/10 shadow-2xl shadow-primary/40 ring-2 ring-primary/50"
                  : "border-border/40 bg-gradient-to-br from-background/60 to-background/40 hover:border-primary/60 hover:from-primary/15 hover:via-secondary/10 hover:to-accent/5 hover:shadow-xl hover:shadow-primary/25 hover:ring-1 hover:ring-primary/30",
              )}
            >
              <div className="flex items-start gap-4 sm:gap-5">
                {/* Station Artwork - Premium */}
                <div className="relative shrink-0 group/image">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-gradient-to-br from-primary/40 to-accent/40 overflow-hidden flex items-center justify-center ring-2 ring-border/30 group-hover/image:ring-primary/60 transition-all duration-500 shadow-lg shadow-primary/30 group-hover/image:shadow-primary/50">
                    {station.favicon ? (
                      <img
                        src={station.favicon}
                        alt={station.name}
                        loading="lazy"
                        decoding="async"
                        className="w-full h-full object-cover group-hover/image:scale-110 transition-transform duration-500"
                        onError={(e) => {
                          e.currentTarget.style.display = "none"
                        }}
                      />
                    ) : (
                      <Radio className="w-7 h-7 sm:w-8 sm:h-8 text-primary group-hover/image:scale-125 transition-transform duration-500" />
                    )}
                  </div>
                  {isActive && isPlaying && (
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-br from-primary to-secondary rounded-full animate-pulse ring-2 ring-background shadow-lg shadow-primary/50 flex items-center justify-center">
                      <Music className="w-3 h-3 text-white" />
                    </div>
                  )}
                </div>

                {/* Station Info - Premium Typography */}
                <div className="flex-1 min-w-0 pt-1">
                  <div className="flex items-start justify-between gap-3 mb-2.5">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-base sm:text-lg truncate text-foreground group-hover:text-primary transition-colors duration-300 line-clamp-1">
                        {station.name}
                      </h3>
                    </div>
                    {station.votes > 0 && (
                      <div className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-primary/20 to-secondary/20 ring-1 ring-primary/30">
                        <span className="text-xs font-bold text-primary">
                          {station.votes > 999 ? `${(station.votes / 1000).toFixed(1)}k` : station.votes}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Metadata - Country, Bitrate, Codec */}
                  <div className="flex flex-wrap items-center gap-2 mb-3">
                    <span className="text-xs sm:text-sm font-semibold text-muted-foreground/90 px-2.5 py-1 rounded-lg bg-background/40 ring-1 ring-border/50">
                      {station.country}
                    </span>
                    {station.bitrate && (
                      <span className="text-xs font-mono font-bold text-amber-600/90 px-2.5 py-1 rounded-lg bg-gradient-to-r from-amber-500/20 to-orange-500/10 ring-1 ring-amber-600/30">
                        {station.bitrate}kbps
                      </span>
                    )}
                    {station.codec && (
                      <span className={cn(
                        "text-xs font-bold px-2.5 py-1 rounded-lg ring-1 bg-gradient-to-r",
                        codecColor.includes("text-orange") ? "from-orange-500/20 to-orange-600/10 text-orange-600 ring-orange-600/30" :
                        codecColor.includes("text-purple") ? "from-purple-500/20 to-purple-600/10 text-purple-600 ring-purple-600/30" :
                        codecColor.includes("text-blue") ? "from-blue-500/20 to-blue-600/10 text-blue-600 ring-blue-600/30" :
                        codecColor.includes("text-green") ? "from-green-500/20 to-green-600/10 text-green-600 ring-green-600/30" :
                        "from-slate-500/20 to-slate-600/10 text-slate-600 ring-slate-600/30"
                      )}>
                        {station.codec}
                      </span>
                    )}
                  </div>

                  {/* Genre Tags - Premium Pills */}
                  {station.tags && (
                    <div className="flex items-center gap-2 flex-wrap">
                      {station.tags.split(",").slice(0, 3).map((tag, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold bg-gradient-to-r from-secondary/30 to-accent/20 text-secondary-foreground/90 ring-1 ring-secondary/40 hover:from-secondary/40 hover:to-accent/30 transition-all duration-300"
                        >
                          {tag.trim()}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Playing Indicator - Animated */}
                {isActive && isPlaying && (
                  <div className="flex flex-col items-center gap-1 shrink-0">
                    <div className="flex gap-1.5">
                      <div className="w-1.5 h-4 bg-gradient-to-t from-primary to-secondary rounded-full animate-pulse" />
                      <div className="w-1.5 h-5 bg-gradient-to-t from-primary to-secondary rounded-full animate-pulse" style={{ animationDelay: "0.2s" }} />
                      <div className="w-1.5 h-4 bg-gradient-to-t from-primary to-secondary rounded-full animate-pulse" style={{ animationDelay: "0.4s" }} />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  return (
    <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8 flex items-center justify-center min-h-screen relative z-10">
      {/* Hidden audio element */}
      <audio ref={audioRef} aria-label="Musarty live audio">
        <track kind="captions" src="data:," label="No captions" default />
      </audio>

      {/* AIMD: accessibility - live region for now playing announcements */}
      <p className="sr-only" role="status" aria-live="polite">
        {isPlaying && currentStation ? `Now playing: ${currentStation.name}` : "Not playing"}
      </p>

      {/* Main Player Card */}
      <Card className="rounded-xl sm:rounded-2xl lg:rounded-4xl p-4 sm:p-6 lg:p-8 max-w-5xl w-full shadow-2xl relative overflow-hidden glassmorphism">
        {/* Decorative Pearl Elements */}
        <div className="absolute top-0 right-0 w-20 h-20 sm:w-32 sm:h-32 bg-primary/30 rounded-full blur-2xl animate-pulse-glow" />
        <div
          className="absolute bottom-0 left-0 w-24 h-24 sm:w-40 sm:h-40 bg-accent/30 rounded-full blur-2xl animate-pulse-glow"
          style={{ animationDelay: "1.5s" }}
        />

        <div className="relative z-10">
          {/* Header */}
          <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6 lg:mb-8">
            <div className="relative">
              <Radio className="w-8 h-8 sm:w-10 sm:h-10 text-primary animate-pulse" />
              <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary via-secondary to-accent text-balance">
                Musarty
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground">Streaming the world's vibes on Musarty.com</p>
            </div>
          </div>

          {/* AI Semantic Search Bar */}
          <div className="relative mb-6 sm:mb-8">
            <div className="flex items-center gap-2 sm:gap-3 mb-4 pb-4 border-b border-border/50">
              <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-primary animate-pulse" />
              <p className="text-xs sm:text-sm font-semibold text-muted-foreground tracking-widest uppercase">AI Powered Search</p>
            </div>
            <Card className="p-3 sm:p-4">
              <div className="flex gap-2 sm:gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Search any station, genre, country, or vibe..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && searchStations()}
                    className="pl-10 sm:pl-12 h-12 sm:h-14 text-base sm:text-lg glassmorphism border-border/50 focus:border-primary/50 rounded-xl sm:rounded-2xl"
                  />
                </div>
                <Button
                  onClick={searchStations}
                  disabled={isLoading}
                  size="lg"
                  className="h-12 sm:h-14 px-4 sm:px-8 rounded-xl sm:rounded-2xl bg-gradient-to-r from-primary to-secondary hover:opacity-90 active:scale-95 transition-all duration-300 shadow-lg touch-manipulation"
                  aria-label="Search stations"
                >
                  {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
                </Button>
              </div>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[1fr,380px] xl:grid-cols-[1fr,400px] gap-4 sm:gap-6">
            {/* Station List */}
            <Card className="rounded-xl sm:rounded-2xl p-3 sm:p-4 min-h-75 sm:min-h-100 order-2 lg:order-1 glassmorphism">
              <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 flex items-center gap-2">
                <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                {searchQuery ? "Search Results" : "Popular Stations"}
              </h2>
              <ScrollArea className="h-87.5 sm:h-112.5 pr-2 sm:pr-4">{renderStations()}</ScrollArea>
            </Card>

            {/* Now Playing Card */}
            <Card className="rounded-xl sm:rounded-2xl p-4 sm:p-6 flex flex-col justify-between relative overflow-hidden order-1 lg:order-2 glassmorphism">
              <div className="absolute inset-0 shimmer-effect opacity-50" />

              <div className="relative z-10">
                <div className="text-xs sm:text-sm text-muted-foreground mb-2 uppercase tracking-wider">Now Playing</div>

                {currentStation ? (
                  <>
                    <div className="mb-4 sm:mb-6">
                      <AspectRatio ratio={1} className="rounded-xl sm:rounded-2xl bg-gradient-to-br from-primary via-secondary to-accent mb-3 sm:mb-4 relative overflow-hidden shadow-2xl">
                        <Avatar className="w-full h-full">
                          <AvatarImage
                            src={currentStation.favicon || "/placeholder.svg"}
                            alt={currentStation.name}
                          />
                          <AvatarFallback className="w-full h-full flex items-center justify-center">
                            <Radio className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 text-white/50" />
                          </AvatarFallback>
                        </Avatar>
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                      </AspectRatio>

                      <h3 className="text-xl sm:text-2xl font-bold mb-1 sm:mb-2 text-balance line-clamp-2">{currentStation.name}</h3>
                      <p className="text-sm sm:text-base text-muted-foreground text-balance line-clamp-1">
                        {currentStation.country}
                        {currentStation.tags && ` • ${currentStation.tags.split(",")[0]}`}
                      </p>
                    </div>

                    {/* Controls */}
                    <div className="space-y-3 sm:space-y-4">
                      <div className="flex items-center justify-center gap-4">
                        <Button
                          size="lg"
                          onClick={togglePlayPause}
                          aria-label={isPlaying ? "Pause" : "Play"}
                          className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-primary to-secondary hocus:scale-110 active:scale-95 transition-transform duration-300 shadow-2xl shadow-primary/50 touch-manipulation"
                        >
                          {isPlaying ? (
                            <Pause className="w-6 h-6 sm:w-8 sm:h-8" fill="currentColor" />
                          ) : (
                            <Play className="w-6 h-6 sm:w-8 sm:h-8" fill="currentColor" />
                          )}
                        </Button>
                      </div>

                      {/* Volume Control */}
                      <div className="flex items-center gap-2 sm:gap-3">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={toggleMute}
                          aria-pressed={isMuted}
                          aria-label={isMuted ? "Unmute" : "Mute"}
                          className="shrink-0 touch-manipulation active:scale-95 transition-transform"
                        >
                          {isMuted ? <VolumeX className="w-4 h-4 sm:w-5 sm:h-5" /> : <Volume2 className="w-4 h-4 sm:w-5 sm:h-5" />}
                        </Button>
                        <input
                          type="range"
                          min="0"
                          max="1"
                          step="0.01"
                          value={isMuted ? 0 : volume}
                          onChange={handleVolumeChange}
                          aria-label="Volume"
                          className="flex-1 h-2 bg-muted rounded-full appearance-none cursor-pointer touch-manipulation [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:shadow-primary/50 [&::-webkit-slider-thumb]:active:scale-110 [&::-webkit-slider-thumb]:transition-transform"
                        />
                      </div>
                    </div>
                  </>
                ) : (
                  <Card className="flex flex-col items-center justify-center h-full text-center py-8 sm:py-12">
                    <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center mb-4 sm:mb-6">
                      <Radio className="w-12 h-12 sm:w-16 sm:h-16 text-primary" />
                    </div>
                    <p className="text-sm sm:text-base text-muted-foreground text-balance">Select a station to start streaming</p>
                  </Card>
                )}
              </div>
            </Card>
          </div>
        </div>
      </Card>
    </div>
  )
}
