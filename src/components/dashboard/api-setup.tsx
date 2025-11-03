"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { sportradarAPI } from "@/services/sportradarAPI"
import { toast } from "sonner"

interface ApiSetupProps {
  onApiKeySet: (key: string) => void
}

export function ApiSetup({ onApiKeySet }: ApiSetupProps) {
  const [apiKey, setApiKey] = useState("")
  const [testing, setTesting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!apiKey.trim()) {
      toast.error("Kérlek add meg az API kulcsot")
      return
    }

    setTesting(true)
    sportradarAPI.setApiKey(apiKey)

    const success = await sportradarAPI.testConnection()
    setTesting(false)

    if (success) {
      onApiKeySet(apiKey)
    } else {
      sportradarAPI.clearApiKey()
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-50 to-indigo-100">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Sportradar API Beállítás</CardTitle>
          <CardDescription>Add meg a Sportradar API kulcsodat az élő meccsadatok eléréséhez</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="apiKey">API Kulcs</Label>
              <Input
                id="apiKey"
                type="text"
                placeholder="Sportradar API kulcs"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                disabled={testing}
              />
            </div>
            <Button type="submit" className="w-full" disabled={testing}>
              {testing ? "Kapcsolat tesztelése..." : "API Kulcs Mentése"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
