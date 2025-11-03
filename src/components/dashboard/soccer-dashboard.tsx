"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useCompetitions, useLiveMatches } from "@/hooks/useSportradarAPI"
import { Loader2, LogOut, Trophy, Radio } from "lucide-react"
import { sportradarAPI } from "@/services/sportradarAPI"

interface SoccerDashboardProps {
  onLogout: () => void
}

export function SoccerDashboard({ onLogout }: SoccerDashboardProps) {
  const { data: competitions, isLoading: loadingCompetitions } = useCompetitions()
  const { data: liveMatches, isLoading: loadingLive } = useLiveMatches()

  useEffect(() => {
    sportradarAPI.testConnection()
  }, [])

  const handleLogout = () => {
    sportradarAPI.clearApiKey()
    onLogout()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Sportradar Élő Adatok</h1>
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            Kilépés
          </Button>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5" />
                Versenyek
              </CardTitle>
              <CardDescription>Elérhető bajnokságok és kupák</CardDescription>
            </CardHeader>
            <CardContent>
              {loadingCompetitions ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="text-2xl font-bold">{competitions?.competitions?.length || 0}</p>
                  <p className="text-sm text-muted-foreground">Aktív verseny a rendszerben</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Radio className="h-5 w-5 text-red-500" />
                Élő Meccsek
              </CardTitle>
              <CardDescription>Jelenleg zajló mérkőzések</CardDescription>
            </CardHeader>
            <CardContent>
              {loadingLive ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="text-2xl font-bold">{liveMatches?.summaries?.length || 0}</p>
                  <p className="text-sm text-muted-foreground">Élő mérkőzés most</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {liveMatches?.summaries && liveMatches.summaries.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Élő Mérkőzések Részletei</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {liveMatches.summaries.slice(0, 5).map((match: any, idx: number) => (
                  <div key={idx} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <p className="font-semibold">{match.sport_event?.competitors?.[0]?.name || "Csapat 1"}</p>
                      <p className="text-sm text-muted-foreground">vs</p>
                      <p className="font-semibold">{match.sport_event?.competitors?.[1]?.name || "Csapat 2"}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold">
                        {match.sport_event_status?.home_score || 0} - {match.sport_event_status?.away_score || 0}
                      </p>
                      <p className="text-xs text-muted-foreground">{match.sport_event_status?.match_status || "Élő"}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
