import axios, { type AxiosInstance } from "axios"
import { toast } from "sonner"

const BASE_URL = "https://api.sportradar.com/soccer-extended/trial/v4/en"

class SportradarAPI {
  private client: AxiosInstance
  private apiKey: string | null = null

  constructor() {
    this.client = axios.create({
      baseURL: BASE_URL,
      timeout: 10000,
    })

    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response) {
          const status = error.response.status
          if (status === 401 || status === 403) {
            toast.error("API kulcs érvénytelen vagy lejárt")
          } else if (status === 404) {
            toast.error("Az erőforrás nem található")
          } else if (status === 429) {
            toast.error("Túl sok kérés. Kérlek várj egy kicsit.")
          } else {
            toast.error(`API hiba: ${status}`)
          }
        } else if (error.request) {
          toast.error("Hálózati hiba. Ellenőrizd az internetkapcsolatot.")
        } else {
          toast.error("Ismeretlen hiba történt")
        }
        return Promise.reject(error)
      },
    )
  }

  setApiKey(key: string) {
    this.apiKey = key
    localStorage.setItem("sportradar_api_key", key)
  }

  getApiKey(): string | null {
    if (!this.apiKey) {
      this.apiKey = localStorage.getItem("sportradar_api_key")
    }
    return this.apiKey
  }

  clearApiKey() {
    this.apiKey = null
    localStorage.removeItem("sportradar_api_key")
  }

  async getCompetitions() {
    const key = this.getApiKey()
    if (!key) throw new Error("API kulcs hiányzik")

    const response = await this.client.get(`/competitions.json?api_key=${key}`)
    return response.data
  }

  async getLiveMatches() {
    const key = this.getApiKey()
    if (!key) throw new Error("API kulcs hiányzik")

    const response = await this.client.get(`/schedules/live/summaries.json?api_key=${key}`)
    return response.data
  }

  async testConnection(): Promise<boolean> {
    try {
      await this.getCompetitions()
      toast.success("Kapcsolat létrejött a Sportradar API-val")
      return true
    } catch (error) {
      return false
    }
  }
}

export const sportradarAPI = new SportradarAPI()
