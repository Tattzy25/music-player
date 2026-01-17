"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Play, Pause, Volume2, VolumeX, Radio, Search, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface RadioStation {
  stationuuid: string
  name: string
  url: string
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
      const response = await fetch("https://de1.api.radio-browser.info/json/stations/topvote/50")
      const data = await response.json()
      setStations(data)
    } catch (error) {
      console.error("[v0] Error fetching stations:", error)
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
      const response = await fetch(
        `https://de1.api.radio-browser.info/json/stations/search?name=${encodeURIComponent(searchQuery)}&limit=50`,
      )
      const data = await response.json()
      setStations(data)
    } catch (error) {
      console.error("[v0] Error searching stations:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const playStation = (station: RadioStation) => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.src = station.url
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

  return (
    <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8 flex items-center justify-center min-h-screen relative z-10">
      {/* Hidden audio element */}
      <audio ref={audioRef} />

      {/* Main Player Card */}
      <div className="glassmorphism rounded-xl sm:rounded-2xl lg:rounded-4xl p-4 sm:p-6 lg:p-8 max-w-5xl w-full shadow-2xl relative overflow-hidden">
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
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-clip-text text-transparent bg-linear-to-r from-primary via-secondary to-accent text-balance">
                Musarty
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground">Streaming the world's vibes on Musarty.com</p>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative mb-4 sm:mb-6">
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search for stations..."
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
                className="h-12 sm:h-14 px-6 sm:px-8 rounded-xl sm:rounded-2xl bg-linear-to-r from-primary to-secondary hover:opacity-90 transition-all duration-300 shadow-lg w-full sm:w-auto"
              >
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Search"}
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[1fr,380px] xl:grid-cols-[1fr,400px] gap-4 sm:gap-6">
            {/* Station List */}
            <div className="glassmorphism rounded-xl sm:rounded-2xl p-3 sm:p-4 min-h-75 sm:min-h-100 order-2 lg:order-1">
              <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 flex items-center gap-2">
                <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                {searchQuery ? "Search Results" : "Popular Stations"}
              </h2>
              <ScrollArea className="h-87.5 sm:h-112.5 pr-2 sm:pr-4">
                {isLoading ? (
                  <div className="flex items-center justify-center h-full">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  </div>
                ) : stations.length === 0 ? (
                  <div className="flex items-center justify-center h-full text-muted-foreground">No stations found</div>
                ) : (
                  <div className="space-y-2">
                    {stations.map((station) => (
                      <button
                        key={station.stationuuid}
                        onClick={() => playStation(station)}
                        className={cn(
                          "w-full p-3 sm:p-4 rounded-lg sm:rounded-xl text-left transition-all duration-300",
                          "glassmorphism border border-border/30 hover:border-primary/50 active:scale-[0.98] touch-manipulation",
                          currentStation?.stationuuid === station.stationuuid &&
                            "bg-primary/10 border-primary shadow-lg shadow-primary/20",
                        )}
                      >
                        <div className="flex items-center gap-2 sm:gap-3">
                          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-linear-to-br from-primary/20 to-accent/20 flex items-center justify-center overflow-hidden shrink-0">
                            {station.favicon ? (
                              <img
                                src={station.favicon || "/placeholder.svg"}
                                alt=""
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.currentTarget.style.display = "none"
                                }}
                              />
                            ) : (
                              <Radio className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold truncate text-balance text-sm sm:text-base">{station.name}</div>
                            <div className="text-xs sm:text-sm text-muted-foreground flex items-center gap-1.5 sm:gap-2">
                              <span className="truncate">{station.country}</span>
                              {station.tags && (
                                <>
                                  <span>•</span>
                                  <span className="truncate">{station.tags.split(",")[0]}</span>
                                </>
                              )}
                            </div>
                          </div>
                          {currentStation?.stationuuid === station.stationuuid && isPlaying && (
                            <div className="flex gap-0.5 sm:gap-1 shrink-0">
                              <div className="w-0.5 sm:w-1 h-3 sm:h-4 bg-primary rounded-full animate-pulse" />
                              <div
                                className="w-0.5 sm:w-1 h-3 sm:h-4 bg-primary rounded-full animate-pulse"
                                style={{ animationDelay: "0.2s" }}
                              />
                              <div
                                className="w-0.5 sm:w-1 h-3 sm:h-4 bg-primary rounded-full animate-pulse"
                                style={{ animationDelay: "0.4s" }}
                              />
                            </div>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </div>

            {/* Now Playing Card */}
            <div className="glassmorphism rounded-xl sm:rounded-2xl p-4 sm:p-6 flex flex-col justify-between relative overflow-hidden order-1 lg:order-2">
              <div className="absolute inset-0 shimmer-effect opacity-50" />

              <div className="relative z-10">
                <div className="text-xs sm:text-sm text-muted-foreground mb-2 uppercase tracking-wider">Now Playing</div>

                {currentStation ? (
                  <>
                    <div className="mb-4 sm:mb-6">
                      <div className="w-full aspect-square rounded-xl sm:rounded-2xl bg-linear-to-br from-primary via-secondary to-accent mb-3 sm:mb-4 relative overflow-hidden shadow-2xl">
                        {currentStation.favicon ? (
                          <img
                            src={currentStation.favicon || "/placeholder.svg"}
                            alt={currentStation.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.src = "/placeholder.svg?height=300&width=300"
                            }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Radio className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 text-white/50" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-linear-to-t from-black/50 to-transparent" />
                      </div>

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
                          className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-linear-to-br from-primary to-secondary hover:scale-110 active:scale-95 transition-transform duration-300 shadow-2xl shadow-primary/50 touch-manipulation"
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
                        <Button size="icon" variant="ghost" onClick={toggleMute} className="shrink-0 touch-manipulation active:scale-95 transition-transform">
                          {isMuted ? <VolumeX className="w-4 h-4 sm:w-5 sm:h-5" /> : <Volume2 className="w-4 h-4 sm:w-5 sm:h-5" />}
                        </Button>
                        <input
                          type="range"
                          min="0"
                          max="1"
                          step="0.01"
                          value={isMuted ? 0 : volume}
                          onChange={handleVolumeChange}
                          className="flex-1 h-2 bg-muted rounded-full appearance-none cursor-pointer touch-manipulation [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:shadow-primary/50 [&::-webkit-slider-thumb]:active:scale-110 [&::-webkit-slider-thumb]:transition-transform"
                        />
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-center py-8 sm:py-12">
                    <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-linear-to-br from-primary/20 to-accent/20 flex items-center justify-center mb-4 sm:mb-6">
                      <Radio className="w-12 h-12 sm:w-16 sm:h-16 text-primary" />
                    </div>
                    <p className="text-sm sm:text-base text-muted-foreground text-balance">Select a station to start streaming</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
