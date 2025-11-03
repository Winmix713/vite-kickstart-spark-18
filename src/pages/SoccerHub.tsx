import { useEffect, useState } from "react"
import { ApiSetup } from "@/components/dashboard/api-setup"
import { SoccerDashboard } from "@/components/dashboard/soccer-dashboard"

export default function SoccerHub() {
  const [apiKey, setApiKey] = useState<string | null>(null)

  useEffect(() => {
    setApiKey(localStorage.getItem("sportradar_api_key"))
  }, [])

  if (!apiKey) {
    return <ApiSetup onApiKeySet={setApiKey} />
  }

  return <SoccerDashboard onLogout={() => setApiKey(null)} />
}
