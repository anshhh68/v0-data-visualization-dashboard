"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Database, Check, AlertCircle, Loader2 } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface DatabaseConfig {
  type: string
  host: string
  port: string
  database: string
  username: string
  password: string
}

export function DatabaseConnector() {
  const [config, setConfig] = useState<DatabaseConfig>({
    type: "postgresql",
    host: "",
    port: "5432",
    database: "",
    username: "",
    password: "",
  })
  const [isConnecting, setIsConnecting] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<"idle" | "success" | "error">("idle")
  const [errorMessage, setErrorMessage] = useState("")
  const [query, setQuery] = useState("SELECT * FROM your_table LIMIT 100")

  const handleConfigChange = (field: keyof DatabaseConfig, value: string) => {
    setConfig((prev) => ({ ...prev, [field]: value }))
    setConnectionStatus("idle")
  }

  const handleTestConnection = async () => {
    setIsConnecting(true)
    setConnectionStatus("idle")
    setErrorMessage("")

    try {
      // Call API to test connection
      const response = await fetch("/api/database/test-connection", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      })

      const data = await response.json()

      if (response.ok) {
        setConnectionStatus("success")
      } else {
        setConnectionStatus("error")
        setErrorMessage(data.error || "Failed to connect to database")
      }
    } catch (error) {
      setConnectionStatus("error")
      setErrorMessage("Network error. Please try again.")
    } finally {
      setIsConnecting(false)
    }
  }

  const handleQueryDatabase = async () => {
    if (connectionStatus !== "success") {
      setErrorMessage("Please test and establish a successful connection first")
      return
    }

    setIsConnecting(true)

    try {
      const response = await fetch("/api/database/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...config, query }),
      })

      const data = await response.json()

      if (response.ok) {
        // Load the data into the dashboard
        console.log("[v0] Database query successful:", data)
        // You would dispatch this to Redux store here
      } else {
        setErrorMessage(data.error || "Failed to query database")
      }
    } catch (error) {
      setErrorMessage("Failed to execute query")
    } finally {
      setIsConnecting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          <CardTitle>Connect Your Database</CardTitle>
        </div>
        <CardDescription>Connect to your database to visualize live data in real-time</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="db-type">Database Type</Label>
            <Select value={config.type} onValueChange={(value) => handleConfigChange("type", value)}>
              <SelectTrigger id="db-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="postgresql">PostgreSQL</SelectItem>
                <SelectItem value="mysql">MySQL</SelectItem>
                <SelectItem value="mongodb">MongoDB</SelectItem>
                <SelectItem value="sqlserver">SQL Server</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="db-host">Host</Label>
            <Input
              id="db-host"
              type="text"
              placeholder="localhost or db.example.com"
              value={config.host}
              onChange={(e) => handleConfigChange("host", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="db-port">Port</Label>
            <Input
              id="db-port"
              type="text"
              placeholder="5432"
              value={config.port}
              onChange={(e) => handleConfigChange("port", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="db-name">Database Name</Label>
            <Input
              id="db-name"
              type="text"
              placeholder="my_database"
              value={config.database}
              onChange={(e) => handleConfigChange("database", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="db-username">Username</Label>
            <Input
              id="db-username"
              type="text"
              placeholder="database_user"
              value={config.username}
              onChange={(e) => handleConfigChange("username", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="db-password">Password</Label>
            <Input
              id="db-password"
              type="password"
              placeholder="••••••••"
              value={config.password}
              onChange={(e) => handleConfigChange("password", e.target.value)}
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            onClick={handleTestConnection}
            disabled={isConnecting || !config.host || !config.database}
            variant={connectionStatus === "success" ? "outline" : "default"}
          >
            {isConnecting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {connectionStatus === "success" && <Check className="mr-2 h-4 w-4" />}
            {connectionStatus === "success" ? "Connected" : "Test Connection"}
          </Button>

          {connectionStatus === "success" && (
            <span className="text-sm text-green-600 dark:text-green-500">Connection successful</span>
          )}
        </div>

        {connectionStatus === "error" && errorMessage && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        )}

        {connectionStatus === "success" && (
          <div className="space-y-3 border-t pt-6">
            <div className="space-y-2">
              <Label htmlFor="db-query">SQL Query</Label>
              <textarea
                id="db-query"
                className="min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                placeholder="SELECT * FROM your_table LIMIT 100"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">Enter your SQL query to fetch data from your database</p>
            </div>

            <Button onClick={handleQueryDatabase} disabled={isConnecting || !query}>
              {isConnecting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Execute Query & Load Data
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
