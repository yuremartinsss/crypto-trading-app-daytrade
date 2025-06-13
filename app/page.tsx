"use client"

import { useState, useEffect, useRef } from "react"
import { BarChart2, Info, Brain, Globe, Bell, ChevronRight, AlertCircle } from "lucide-react"
import Image from "next/image"

// Lightweight charts import with error handling
let createChart: any = null
const IChartApi: any = null
const ISeriesApi: any = null

// Dynamic import for lightweight-charts to avoid SSR issues
const loadCharts = async () => {
  try {
    const chartsModule = await import("lightweight-charts")
    createChart = chartsModule.createChart
  } catch (error) {
    console.warn("Charts library not available:", error)
  }
}

// Adicionar novo tipo de tela "plans" ao tipo Screen
type Screen =
  | "splash"
  | "onboarding"
  | "dashboard"
  | "detail"
  | "login-simulation"
  | "trading"
  | "conversion"
  | "post-demo"
  | "plans"
type TimeFrame = "1s" | "5s" | "15s" | "30s" | "1m" | "5m" | "15m" | "30m" | "1h" | "4h" | "1d"
type TradePosition = "buy" | "sell"
type TradeStatus = "pending" | "open" | "closed"
type TradeTimeframe = "5s" | "10s" | "15s" | "30s" | "45s" | "60s"

interface Asset {
  symbol: string
  name: string
  price: number
  change: number
  changePercent: number
  highlighted?: boolean
  notification?: string
}

interface TradeResult {
  trend: "Alta" | "Baixa"
  rsi: number
  ema20: number
  ema50: number
  currentPrice: number
  success: boolean
  profit: number
  profitPercent: number
}

interface Trade {
  id: string
  symbol: string
  position: TradePosition
  entryPrice: number
  amount: number
  leverage: number
  timeframe: TradeTimeframe
  status: TradeStatus
  openTime: Date
  closeTime?: Date
  currentPrice?: number
  profitLoss?: number
  profitLossPercent?: number
  success?: boolean
  entryPoint?: number
  exitPoint?: number
}

interface ChartPoint {
  time: number
  value: number
}

interface CandlestickData {
  time: number
  open: number
  high: number
  low: number
  close: number
}

const CRYPTO_ASSETS: Asset[] = [
  {
    symbol: "BTCUSDT",
    name: "Bitcoin",
    price: 67842.15,
    change: 1254.32,
    changePercent: 1.89,
    highlighted: true,
    notification: "🔥 +80% de Assertividade nas últimas 24h! Momento ideal para análise.",
  },
  {
    symbol: "ETHUSDT",
    name: "Ethereum",
    price: 3521.47,
    change: -42.18,
    changePercent: -1.18,
  },
  {
    symbol: "BNBUSDT",
    name: "Binance Coin",
    price: 584.32,
    change: 12.45,
    changePercent: 2.18,
    highlighted: true,
    notification: "⚡ Sinal de compra detectado pela IA! Clique para analisar.",
  },
  {
    symbol: "SOLUSDT",
    name: "Solana",
    price: 142.87,
    change: 5.32,
    changePercent: 3.87,
    highlighted: true,
    notification: "🚀 Tendência de alta confirmada! Oportunidade detectada.",
  },
  {
    symbol: "XRPUSDT",
    name: "Ripple",
    price: 0.5423,
    change: -0.0231,
    changePercent: -4.08,
  },
  {
    symbol: "ADAUSDT",
    name: "Cardano",
    price: 0.4521,
    change: 0.0123,
    changePercent: 2.8,
  },
  {
    symbol: "DOGEUSDT",
    name: "Dogecoin",
    price: 0.1342,
    change: 0.0042,
    changePercent: 3.23,
  },
  {
    symbol: "DOTUSDT",
    name: "Polkadot",
    price: 6.87,
    change: -0.23,
    changePercent: -3.24,
  },
  {
    symbol: "MATICUSDT",
    name: "Polygon",
    price: 0.6723,
    change: 0.0213,
    changePercent: 3.27,
  },
  {
    symbol: "AVAXUSDT",
    name: "Avalanche",
    price: 34.21,
    change: 1.23,
    changePercent: 3.73,
  },
]

const TIME_FRAMES: { value: TimeFrame; label: string }[] = [
  { value: "1s", label: "1S" },
  { value: "5s", label: "5S" },
  { value: "15s", label: "15S" },
  { value: "30s", label: "30S" },
  { value: "1m", label: "1M" },
  { value: "5m", label: "5M" },
  { value: "15m", label: "15M" },
  { value: "30m", label: "30M" },
  { value: "1h", label: "1H" },
  { value: "4h", label: "4H" },
  { value: "1d", label: "1D" },
]

const TRADE_TIMEFRAMES: { value: TradeTimeframe; label: string; seconds: number }[] = [
  { value: "5s", label: "5 seg", seconds: 5 },
  { value: "10s", label: "10 seg", seconds: 10 },
  { value: "15s", label: "15 seg", seconds: 15 },
  { value: "30s", label: "30 seg", seconds: 30 },
  { value: "45s", label: "45 seg", seconds: 45 },
  { value: "60s", label: "60 seg", seconds: 60 },
]

// Simplified audio manager without Web Audio API
class AudioManager {
  private static instance: AudioManager
  private audioEnabled = false

  static getInstance(): AudioManager {
    if (!AudioManager.instance) {
      AudioManager.instance = new AudioManager()
    }
    return AudioManager.instance
  }

  async init() {
    this.audioEnabled = true
  }

  async loadSounds() {
    await this.init()
  }

  async playSound(soundName: string) {
    if (!this.audioEnabled) return
    // Simple beep sound using oscillator
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)

      oscillator.frequency.value = soundName === "win" ? 800 : soundName === "loss" ? 400 : 600
      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1)

      oscillator.start(audioContext.currentTime)
      oscillator.stop(audioContext.currentTime + 0.1)
    } catch (error) {
      console.log("Audio not available")
    }
  }
}

// FIXED: Control sequence of 4 wins and 1 loss - ALWAYS 4 WIN and 1 LOSS
const getOperationResult = (operationIndex: number): boolean => {
  // GARANTIR SEMPRE 4 WIN e 1 LOSS em 5 operações
  // Sequências fixas com exatamente 4 wins e 1 loss
  const sequences = [
    [true, true, true, false, true], // WIN, WIN, WIN, LOSS, WIN
    [true, true, false, true, true], // WIN, WIN, LOSS, WIN, WIN
    [true, false, true, true, true], // WIN, LOSS, WIN, WIN, WIN
    [false, true, true, true, true], // LOSS, WIN, WIN, WIN, WIN
    [true, true, true, true, false], // WIN, WIN, WIN, WIN, LOSS
  ]

  // Usar um seed mais estável baseado na sessão
  const sessionSeed = Math.floor(Date.now() / (1000 * 60 * 30)) // Muda a cada 30 minutos
  const sequenceIndex = sessionSeed % sequences.length
  const selectedSequence = sequences[sequenceIndex]

  // Garantir que o índice está entre 0-4
  const safeIndex = operationIndex % 5

  console.log(`Operation ${operationIndex} (safe: ${safeIndex}) -> ${selectedSequence[safeIndex] ? "WIN" : "LOSS"}`)
  console.log(`Selected sequence:`, selectedSequence)

  return selectedSequence[safeIndex]
}

// Componente FAQ Item
const FAQItem = ({ question, answer }: { question: string; answer: string }) => {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl border border-gray-800 overflow-hidden hover:border-gray-700 transition-colors">
      <button
        className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-800/30 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="font-medium text-white pr-4">{question}</span>
        <div className={`flex-shrink-0 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M7 10L12 15L17 10H7Z" fill="#9CA3AF" />
          </svg>
        </div>
      </button>

      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"}`}
      >
        <div className="px-6 pb-4 pt-0">
          <div className="text-gray-300 text-sm leading-relaxed border-t border-gray-800 pt-4">{answer}</div>
        </div>
      </div>
    </div>
  )
}

export default function CriptoEasyIA() {
  const [currentScreen, setCurrentScreen] = useState<Screen>("splash")
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null)
  const [selectedTimeFrame, setSelectedTimeFrame] = useState<TimeFrame>("5s")
  const [operationsCompleted, setOperationsCompleted] = useState(0)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [tradeResult, setTradeResult] = useState<TradeResult | null>(null)
  const [usersOnline, setUsersOnline] = useState(1248)
  const [signalsGenerated, setSignalsGenerated] = useState(8392)
  const [operationCount, setOperationCount] = useState(0)
  const [chartData, setChartData] = useState<CandlestickData[]>([])
  const [showTestPopup, setShowTestPopup] = useState(false)
  const [showNotification, setShowNotification] = useState(false)
  const [notificationIndex, setNotificationIndex] = useState(0)
  const [highlightedAssets, setHighlightedAssets] = useState<Asset[]>([])
  const [accountBalance, setAccountBalance] = useState(1000)
  const [trades, setTrades] = useState<Trade[]>([])
  const [currentTrade, setCurrentTrade] = useState<Trade | null>(null)
  const [tradeAmount, setTradeAmount] = useState(100)
  const [tradeLeverage, setTradeLeverage] = useState(1)
  const [tradePosition, setTradePosition] = useState<TradePosition>("buy")
  const [tradeTimeframe, setTradeTimeframe] = useState<TradeTimeframe>("5s")
  const [loadingProgress, setLoadingProgress] = useState(0)
  const [loadingMessage, setLoadingMessage] = useState("")
  const [showProfitPopup, setShowProfitPopup] = useState(false)
  const [signalCountdown, setSignalCountdown] = useState(0)
  const [signalExpired, setSignalExpired] = useState(false)
  const [showTradeSimulation, setShowTradeSimulation] = useState(false)
  const [tradeSimulationProgress, setTradeSimulationProgress] = useState(0)
  const [isTradeActive, setIsTradeActive] = useState(false)

  const [showAnalysis, setShowAnalysis] = useState(false)
  const [analysisResult, setAnalysisResult] = useState<{
    recommendation: "buy" | "sell"
    confidence: number
    timeframe: string
    reason: string
    entryPrice: number
    validUntil: Date
  } | null>(null)
  const [isGeneratingAnalysis, setIsGeneratingAnalysis] = useState(false)
  const [showNewAnalysisButton, setShowNewAnalysisButton] = useState(false)

  const chartContainerRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<any>(null)
  const candlestickSeriesRef = useRef<any>(null)
  const entryLineSeriesRef = useRef<any>(null)
  const notificationIntervalRef = useRef<NodeJS.Timeout | null>([])
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>([])
  const chartUpdateIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const audioManager = useRef<AudioManager>(AudioManager.getInstance())
  const [logoVisible, setLogoVisible] = useState(false)

  const [countdown, setCountdown] = useState(180) // 3 minutes
  const [showOfferPopup, setShowOfferPopup] = useState(false)
  const [newActivations, setNewActivations] = useState(14)
  const [showDemoWelcomePopup, setShowDemoWelcomePopup] = useState(false)
  const [chartLoaded, setChartLoaded] = useState(false)

  // State variables for the registration form
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  // Adicionar estado para controlar o popup da oferta especial
  const [showSpecialOfferPopup, setShowSpecialOfferPopup] = useState(false)

  // Countdown timer
  useEffect(() => {
    if (currentScreen === "conversion" && countdown > 0) {
      const timer = setInterval(() => {
        setCountdown((prev) => prev - 1)
      }, 1000)
      return () => clearInterval(timer)
    }
  }, [currentScreen, countdown])

  // Simulate new activations
  useEffect(() => {
    if (currentScreen === "conversion") {
      const activationTimer = setInterval(() => {
        setNewActivations((prev) => prev + Math.floor(Math.random() * 3) + 1)
      }, 15000) // Every 15 seconds
      return () => clearInterval(activationTimer)
    }
  }, [currentScreen])

  // Show demo welcome popup when trading screen is fully loaded
  useEffect(() => {
    // Check if the popup has been shown before
    const hasSeenWelcomePopup = localStorage.getItem("hasSeenDemoWelcomePopup") === "true"

    if (currentScreen === "trading" && chartLoaded && selectedAsset && !showDemoWelcomePopup && !hasSeenWelcomePopup) {
      // Wait a bit for everything to settle, then show the popup
      const timer = setTimeout(() => {
        setShowDemoWelcomePopup(true)
        audioManager.current.playSound("notification")
      }, 1500)
      return () => clearTimeout(timer)
    }
  }, [currentScreen, chartLoaded, selectedAsset, showDemoWelcomePopup])

  // Initialize audio
  useEffect(() => {
    const initAudio = async () => {
      await audioManager.current.loadSounds()
    }

    const handleFirstInteraction = () => {
      initAudio()
      document.removeEventListener("click", handleFirstInteraction)
      document.removeEventListener("touchstart", handleFirstInteraction)
    }

    document.addEventListener("click", handleFirstInteraction)
    document.addEventListener("touchstart", handleFirstInteraction)

    return () => {
      document.removeEventListener("click", handleFirstInteraction)
      document.removeEventListener("touchstart", handleFirstInteraction)
    }
  }, [])

  useEffect(() => {
    loadCharts()
  }, [])

  // Splash screen sequence
  useEffect(() => {
    if (currentScreen === "splash") {
      // Start logo fade-in after 500ms
      const logoTimer = setTimeout(() => {
        setLogoVisible(true)
      }, 500)

      // Navigate to onboarding after 5 seconds
      const navigationTimer = setTimeout(() => {
        setCurrentScreen("onboarding")
      }, 5000)

      return () => {
        clearTimeout(logoTimer)
        clearTimeout(navigationTimer)
      }
    }
  }, [currentScreen])

  // Generate realistic candlestick data
  const generateCandlestickData = (timeframe: TimeFrame = "5s") => {
    const data: CandlestickData[] = []
    const basePrice = selectedAsset?.price || 50000
    const volatility = basePrice * 0.002

    let currentPrice = basePrice
    const now = Date.now()

    let timeInterval = 1000
    if (timeframe.endsWith("s")) {
      timeInterval = Number.parseInt(timeframe) * 1000
    } else if (timeframe.endsWith("m")) {
      timeInterval = Number.parseInt(timeframe) * 60 * 1000
    } else if (timeframe.endsWith("h")) {
      timeInterval = Number.parseInt(timeframe) * 60 * 60 * 1000
    } else if (timeframe === "1d") {
      timeInterval = 24 * 60 * 60 * 1000
    }

    for (let i = 50; i >= 0; i--) {
      const time = Math.floor((now - i * timeInterval) / 1000)
      const open = currentPrice

      const direction = Math.random() > 0.5 ? 1 : -1
      const movement = Math.random() * volatility * direction

      const close = open + movement
      const range = Math.abs(movement) + Math.random() * volatility * 0.5
      const high = Math.max(open, close) + Math.random() * range * 0.3
      const low = Math.min(open, close) - Math.random() * range * 0.3

      if (!isNaN(open) && !isNaN(high) && !isNaN(low) && !isNaN(close) && !isNaN(time)) {
        data.push({
          time: time,
          open: open,
          high: high,
          low: low,
          close: close,
        })
      }

      currentPrice = close
    }

    return data
  }

  // Update counters dynamically
  useEffect(() => {
    const interval = setInterval(() => {
      setUsersOnline((prev) => {
        const variation = Math.floor(Math.random() * 21) - 10
        const newValue = prev + variation
        return Math.max(1200, Math.min(1300, newValue))
      })

      setSignalsGenerated((prev) => prev + Math.floor(Math.random() * 3) + 1)
    }, 2000)

    return () => clearInterval(interval)
  }, [])

  // Initialize and update chart
  useEffect(() => {
    if (
      (currentScreen !== "detail" && currentScreen !== "trading") ||
      !chartContainerRef.current ||
      !selectedAsset ||
      !createChart
    )
      return

    const data = generateCandlestickData(selectedTimeFrame)
    if (!data || data.length === 0) return

    setChartData(data)

    if (chartRef.current) {
      chartRef.current.remove()
      chartRef.current = null
      candlestickSeriesRef.current = null
      entryLineSeriesRef.current = null
    }

    // Define handleResize outside the try block so it's accessible in cleanup
    const handleResize = () => {
      if (chartRef.current && chartContainerRef.current) {
        chartRef.current.applyOptions({
          width: chartContainerRef.current.clientWidth,
          height: window.innerWidth < 768 ? 350 : 500,
        })
      }
    }

    try {
      const chart = createChart(chartContainerRef.current, {
        layout: {
          background: { color: "#000000" },
          textColor: "#FFFFFF",
        },
        grid: {
          vertLines: { color: "#1E222D" },
          horzLines: { color: "#1E222D" },
        },
        width: chartContainerRef.current.clientWidth,
        height: window.innerWidth < 768 ? 350 : 500,
        timeScale: {
          timeVisible: true,
          secondsVisible: true,
          rightOffset: 12,
          barSpacing: 12,
          fixLeftEdge: false,
          fixRightEdge: false,
        },
        rightPriceScale: {
          visible: true,
          borderVisible: false,
          scaleMargins: {
            top: 0.1,
            bottom: 0.1,
          },
        },
        crosshair: {
          mode: 1,
          vertLine: {
            color: "#758696",
            width: 1,
            style: 2,
          },
          horzLine: {
            color: "#758696",
            width: 1,
            style: 2,
          },
        },
      })

      const candlestickSeries = chart.addCandlestickSeries({
        upColor: "#00B746",
        downColor: "#FF4976",
        borderVisible: false,
        wickUpColor: "#00B746",
        wickDownColor: "#FF4976",
      })

      // Add entry line series for marking trade entry
      const entryLineSeries = chart.addLineSeries({
        color: "#FFD700",
        lineWidth: 3,
        lineStyle: 0, // Solid line
        crosshairMarkerVisible: true,
        priceLineVisible: true,
        lastValueVisible: true,
      })

      const validData = data.filter(
        (candle) =>
          candle &&
          typeof candle.open === "number" &&
          typeof candle.high === "number" &&
          typeof candle.low === "number" &&
          typeof candle.close === "number" &&
          typeof candle.time === "number" &&
          !isNaN(candle.open) &&
          !isNaN(candle.high) &&
          !isNaN(candle.low) &&
          !isNaN(candle.close) &&
          !isNaN(candle.time),
      )

      if (validData.length > 0) {
        candlestickSeries.setData(validData)
        chart.timeScale().setVisibleLogicalRange({
          from: Math.max(0, validData.length - 20),
          to: validData.length + 5,
        })
      }

      chartRef.current = chart
      candlestickSeriesRef.current = candlestickSeries
      entryLineSeriesRef.current = entryLineSeries

      // Mark chart as loaded
      setChartLoaded(true)

      window.addEventListener("resize", handleResize)

      if (!isTradeActive) {
        startRealTimeUpdates()
      }
    } catch (error) {
      console.error("Error creating chart:", error)
      return
    }

    return () => {
      window.removeEventListener("resize", handleResize)
      if (chartRef.current) {
        chartRef.current.remove()
        chartRef.current = null
        candlestickSeriesRef.current = null
        entryLineSeriesRef.current = null
      }
      if (chartUpdateIntervalRef.current) {
        clearInterval(chartUpdateIntervalRef.current)
      }
    }
  }, [currentScreen, selectedAsset, selectedTimeFrame, createChart, isTradeActive])

  // Start real-time updates
  const startRealTimeUpdates = () => {
    if (chartUpdateIntervalRef.current) {
      clearInterval(chartUpdateIntervalRef.current)
    }

    chartUpdateIntervalRef.current = setInterval(() => {
      if (!candlestickSeriesRef.current || isTradeActive) return

      setChartData((prevData) => {
        if (prevData.length === 0) return prevData

        const lastCandle = prevData[prevData.length - 1]
        const now = Math.floor(Date.now() / 1000)

        let interval = 5
        if (selectedTimeFrame.endsWith("s")) {
          interval = Number.parseInt(selectedTimeFrame)
        } else if (selectedTimeFrame.endsWith("m")) {
          interval = Number.parseInt(selectedTimeFrame) * 60
        }

        const shouldCreateNewCandle = now >= lastCandle.time + interval

        if (shouldCreateNewCandle) {
          const volatility = lastCandle.close * 0.002
          const direction = Math.random() > 0.5 ? 1 : -1
          const movement = Math.random() * volatility * direction

          const open = lastCandle.close
          const close = open + movement
          const range = Math.abs(movement) + Math.random() * volatility * 0.5
          const high = Math.max(open, close) + Math.random() * range * 0.3
          const low = Math.min(open, close) - Math.random() * range * 0.3

          const newCandle: CandlestickData = {
            time: now,
            open: open,
            high: high,
            low: low,
            close: close,
          }

          const newData = [...prevData, newCandle]

          try {
            candlestickSeriesRef.current?.setData(newData)

            // Always keep chart focused on recent candles
            if (chartRef.current) {
              chartRef.current.timeScale().setVisibleLogicalRange({
                from: Math.max(0, newData.length - 20),
                to: newData.length + 5,
              })
            }
          } catch (error) {
            console.error("Error updating chart:", error)
          }

          return newData
        } else {
          const volatility = lastCandle.close * 0.001
          const movement = (Math.random() - 0.5) * volatility
          const newClose = lastCandle.close + movement

          const updatedCandle: CandlestickData = {
            ...lastCandle,
            close: newClose,
            high: Math.max(lastCandle.high, newClose),
            low: Math.min(lastCandle.low, newClose),
          }

          const newData = [...prevData.slice(0, -1), updatedCandle]

          try {
            candlestickSeriesRef.current?.setData(newData)

            // Maintain focus on recent candles
            if (chartRef.current) {
              chartRef.current.timeScale().setVisibleLogicalRange({
                from: Math.max(0, newData.length - 20),
                to: newData.length + 5,
              })
            }
          } catch (error) {
            console.error("Error updating chart:", error)
          }

          return newData
        }
      })
    }, 1000)
  }

  // Show rotating notifications for highlighted assets
  useEffect(() => {
    if (currentScreen === "dashboard") {
      const highlighted = CRYPTO_ASSETS.filter((asset) => asset.highlighted)
      setHighlightedAssets(highlighted)

      setTimeout(() => {
        setShowNotification(true)
        audioManager.current.playSound("notification")
      }, 2000)

      notificationIntervalRef.current = setInterval(() => {
        setNotificationIndex((prev) => (prev + 1) % highlighted.length)
        audioManager.current.playSound("notification")
      }, 8000)
    } else {
      setShowNotification(false)
      if (notificationIntervalRef.current) {
        clearInterval(notificationIntervalRef.current)
      }
    }

    return () => {
      if (notificationIntervalRef.current) {
        clearInterval(notificationIntervalRef.current)
      }
    }
  }, [currentScreen])

  // Manage signal countdown
  useEffect(() => {
    if (signalCountdown > 0) {
      countdownIntervalRef.current = setInterval(() => {
        setSignalCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(countdownIntervalRef.current!)
            setSignalExpired(true)
            audioManager.current.playSound("timerEnd")
            return 0
          }

          if (prev <= 4) {
            audioManager.current.playSound("countdown")
          }

          return prev - 1
        })
      }, 1000)
    }

    return () => {
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current)
      }
    }
  }, [signalCountdown])

  // Simulate real trade on chart with realistic trading logic
  const simulateRealTrade = (trade: Trade) => {
    if (!candlestickSeriesRef.current || !chartData.length || !entryLineSeriesRef.current) return

    setIsTradeActive(true)
    setShowTradeSimulation(true)

    // Scroll to chart automatically
    const chartElement = chartContainerRef.current
    if (chartElement) {
      chartElement.scrollIntoView({
        behavior: "smooth",
        block: "start",
      })
    }

    if (chartUpdateIntervalRef.current) {
      clearInterval(chartUpdateIntervalRef.current)
    }

    const tradeTimeframeAsChartTimeframe = trade.timeframe as TimeFrame
    setSelectedTimeFrame(tradeTimeframeAsChartTimeframe)

    const lastCandle = chartData[chartData.length - 1]
    const entryPrice = lastCandle.close
    const entryTime = Math.floor(Date.now() / 1000)

    // FIXED: Usar operationsCompleted para determinar o resultado correto
    const shouldWin = getOperationResult(operationsCompleted)

    console.log(`Trade ${operationsCompleted + 1}: Should be ${shouldWin ? "WIN" : "LOSS"}`)

    // Draw entry line on chart with appropriate color
    try {
      const lineColor = trade.position === "buy" ? "#00B746" : "#FF4976" // Green for buy, red for sell
      entryLineSeriesRef.current.applyOptions({
        color: lineColor,
        lineWidth: 3,
        lineStyle: 0, // Solid line
      })

      const lineData = [
        { time: entryTime - 30, value: entryPrice },
        { time: entryTime + 120, value: entryPrice },
      ]
      entryLineSeriesRef.current.setData(lineData)
    } catch (error) {
      console.error("Error adding entry line:", error)
    }

    const timeframeSeconds = Number.parseInt(trade.timeframe)
    const expirationTime = entryTime + timeframeSeconds

    let currentTime = entryTime
    let currentPrice = entryPrice
    const updateInterval = 500

    const tradeInterval = setInterval(() => {
      currentTime += 1

      const progress = Math.min(((currentTime - entryTime) / timeframeSeconds) * 100, 100)
      setTradeSimulationProgress(progress)

      // Update chart data in real time during trade
      setChartData((prevData) => {
        if (prevData.length === 0) return prevData

        const timeRemaining = expirationTime - currentTime
        const progressRatio = 1 - timeRemaining / timeframeSeconds

        // Natural price movement with STRONG bias towards the predetermined result
        const volatility = entryPrice * 0.0015
        const randomMovement = (Math.random() - 0.5) * volatility * 0.3 // Reduced random component

        // STRONG bias towards the predetermined result
        let bias = 0
        if (progressRatio > 0.3) {
          // Start applying bias early (after 30% of time)
          const biasStrength = (progressRatio - 0.3) * 1.5 // Strong bias

          if (shouldWin) {
            // For WIN: FORCE price towards profitable direction
            if (trade.position === "buy") {
              bias = biasStrength * volatility * 3 // Strong upward bias for buy
            } else {
              bias = -biasStrength * volatility * 3 // Strong downward bias for sell
            }
          } else {
            // For LOSS: FORCE price against trade direction
            if (trade.position === "buy") {
              bias = -biasStrength * volatility * 2.5 // Strong downward bias for buy
            } else {
              bias = biasStrength * volatility * 2.5 // Strong upward bias for sell
            }
          }
        }

        currentPrice = entryPrice + randomMovement + bias

        const lastCandle = prevData[prevData.length - 1]

        // Update the current candle
        const updatedCandle = {
          ...lastCandle,
          close: currentPrice,
          high: Math.max(lastCandle.high, currentPrice),
          low: Math.min(lastCandle.low, currentPrice),
        }

        const newData = [...prevData.slice(0, -1), updatedCandle]

        try {
          candlestickSeriesRef.current?.setData(newData)

          // Keep chart focused on recent candles
          if (chartRef.current) {
            chartRef.current.timeScale().setVisibleLogicalRange({
              from: Math.max(0, newData.length - 15),
              to: newData.length + 3,
              })
            }
          } catch (error) {
            console.error("Error updating chart during trade:", error)
          }

          return newData
        })

        if (currentTime >= expirationTime) {
          clearInterval(tradeInterval)

          // FORCE the final result to match the predetermined outcome
          const finalPrice = currentPrice

          // Override the trading logic to FORCE the predetermined result
          const isSuccess = shouldWin

          console.log(`Final result: ${isSuccess ? "WIN" : "LOSS"} (forced)`)
          console.log(`Entry: ${entryPrice}, Final: ${finalPrice}, Position: ${trade.position}`)

          // Calculate profit/loss percentage based on predetermined result
          let profitPercent = 0
        if (isSuccess) {
          profitPercent = 85 // Fixed 85% profit for wins
        } else {
          profitPercent = -100 // Fixed 100% loss
        }

        const profitLoss = trade.amount * (profitPercent / 100)

        // Update final candle
        setChartData((prevData) => {
          const lastCandle = prevData[prevData.length - 1]
          const finalCandle = {
            ...lastCandle,
            close: finalPrice,
            high: Math.max(lastCandle.high, finalPrice),
            low: Math.min(lastCandle.low, finalPrice),
          }

          const newData = [...prevData.slice(0, -1), finalCandle]

          try {
            candlestickSeriesRef.current?.setData(newData)

            // Add result marker with profit/loss information
            const resultText = isSuccess
              ? `WIN +R$${Math.abs(profitLoss).toFixed(2)} (+85%)`
              : `LOSS -R$${Math.abs(profitLoss).toFixed(2)} (-100%)`

            const marker = {
              time: expirationTime,
              position: "inBar" as const,
              color: isSuccess ? "#00B746" : "#FF4976",
              shape: isSuccess ? ("circle" as const) : ("square" as const),
              text: resultText,
              size: 2,
            }

            candlestickSeriesRef.current.setMarkers([marker])

            // Keep focus on recent candles
            if (chartRef.current) {
              chartRef.current.timeScale().setVisibleLogicalRange({
                from: Math.max(0, newData.length - 15),
                to: newData.length + 3,
              })
            }
          } catch (error) {
            console.error("Error updating final chart:", error)
          }

          return newData
        })

        setTimeout(() => {
          setAccountBalance((prev) => prev + profitLoss)

          const finalTrade: Trade = {
            ...trade,
            status: "closed",
            closeTime: new Date(),
            currentPrice: finalPrice,
            profitLoss: profitLoss,
            profitLossPercent: profitPercent,
            success: isSuccess,
            entryPoint: entryPrice,
            exitPoint: finalPrice,
          }

          setCurrentTrade(finalTrade)
          setTrades((prev) => prev.map((t) => (t.id === finalTrade.id ? finalTrade : t)))

          audioManager.current.playSound(isSuccess ? "win" : "loss")

          setShowProfitPopup(true)

          setOperationCount((prev) => prev + 1)
          setOperationsCompleted((prev) => prev + 1)

          if (operationsCompleted + 1 >= 5) {
            setTimeout(() => {
              setShowProfitPopup(false)
              setCurrentScreen("post-demo")
            }, 3000)
          } else {
            setShowNewAnalysisButton(true)
          }

          setShowTradeSimulation(false)
          setIsTradeActive(false)

          setShowAnalysis(false)
          setAnalysisResult(null)
          setSignalCountdown(0)
          setSignalExpired(false)

          // Resume normal chart updates after a delay
          setTimeout(() => {
            startRealTimeUpdates()
          }, 2000)
        }, 1000)

        return
      }
    }, updateInterval)
  }

  const handleAnalyze = async () => {
    if (!selectedAsset) return

    setIsAnalyzing(true)

    await new Promise((resolve) => setTimeout(resolve, 3000))

    const isSuccess = getOperationResult(operationCount)
    const profitPercent = isSuccess ? (Math.random() * 5 + 3).toFixed(2) : (Math.random() * 2 + 1).toFixed(2)
    const profit = ((selectedAsset.price * Number(profitPercent)) / 100).toFixed(2)

    const result: TradeResult = {
      trend: Math.random() > 0.5 ? "Alta" : "Baixa",
      rsi: Math.floor(Math.random() * 40) + 30,
      ema20: selectedAsset.price * (1 + Math.random() * 0.02 - 0.01),
      ema50: selectedAsset.price * (1 + Math.random() * 0.02 - 0.01),
      currentPrice: selectedAsset.price,
      success: isSuccess,
      profit: Number(profit),
      profitPercent: Number(profitPercent),
    }

    setTradeResult(result)
    setIsAnalyzing(false)
    setOperationCount((prev) => prev + 1)

    if (operationsCompleted === 4) {
      setTimeout(() => setCurrentScreen("conversion"), 2000)
    }
  }

  const handleStartTrade = () => {
    if (!selectedAsset || signalExpired || isTradeActive) return

    audioManager.current.playSound(tradePosition === "buy" ? "buy" : "sell")

    // Scroll to chart immediately when starting trade
    const chartElement = chartContainerRef.current
    if (chartElement) {
      setTimeout(() => {
        chartElement.scrollIntoView({
          behavior: "smooth",
          block: "center",
        })
      }, 100)
    }

    const newTrade: Trade = {
      id: `trade-${Date.now()}`,
      symbol: selectedAsset.symbol,
      position: tradePosition,
      entryPrice: selectedAsset.price,
      amount: tradeAmount,
      leverage: tradeLeverage,
      timeframe: tradeTimeframe,
      status: "open",
      openTime: new Date(),
    }

    setCurrentTrade(newTrade)
    setTrades((prev) => [...prev, newTrade])

    setSignalCountdown(0)

    simulateRealTrade(newTrade)
  }

  const handleAssetClick = (asset: Asset) => {
    audioManager.current.playSound("click")
    setSelectedAsset(asset)
    setShowTestPopup(true)
  }

  const handleConfirmTest = () => {
    audioManager.current.playSound("click")
    setShowTestPopup(false)
    setCurrentScreen("login-simulation")
    simulateLogin()
  }

  const simulateLogin = () => {
    setLoadingProgress(0)
    setLoadingMessage("Conectando à API da Binance...")

    const interval = setInterval(() => {
      setLoadingProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          setTimeout(() => {
            setCurrentScreen("trading")
          }, 500)
          return 100
        }

        if (prev === 20) setLoadingMessage("Autenticando credenciais...")
        if (prev === 40) setLoadingMessage("Carregando dados de mercado...")
        if (prev === 60) setLoadingMessage("Inicializando algoritmos de IA...")
        if (prev === 80) setLoadingMessage("Preparando ambiente de trading...")

        return prev + 5
      })
    }, 120)
  }

  const handleGenerateAnalysis = async () => {
    if (!selectedAsset || operationsCompleted >= 5) return

    // Clear previous markers and entry lines when generating new analysis
    try {
      if (candlestickSeriesRef.current) {
        candlestickSeriesRef.current.setMarkers([])
      }
      if (entryLineSeriesRef.current) {
        entryLineSeriesRef.current.setData([])
      }
    } catch (error) {
      console.error("Error clearing chart markers:", error)
    }

    setIsGeneratingAnalysis(true)
    setSignalExpired(false)
    setShowNewAnalysisButton(false)

    await new Promise((resolve) => setTimeout(resolve, 3000))

    const recommendations = ["buy", "sell"] as const
    const timeframes = ["5-10 segundos", "8-12 segundos", "6-10 segundos"]
    const reasons = [
      "RSI em zona de sobrevenda, indicando reversão de alta",
      "Rompimento de resistência com volume crescente",
      "Padrão de candlestick de reversão identificado",
      "Convergência de médias móveis sinalizando entrada",
      "Divergência no MACD confirmando mudança de tendência",
      "Suporte forte testado com sucesso",
      "Breakout confirmado com volume acima da média",
      "Fibonacci 61.8% respeitado como suporte",
    ]

    const recommendation = recommendations[Math.floor(Math.random() * recommendations.length)]

    const validUntil = new Date()
    validUntil.setSeconds(validUntil.getSeconds() + 15)

    const analysis = {
      recommendation,
      confidence: Math.floor(Math.random() * 20) + 80,
      timeframe: timeframes[Math.floor(Math.random() * timeframes.length)],
      reason: reasons[Math.floor(Math.random() * reasons.length)],
      entryPrice: selectedAsset.price * (1 + (Math.random() * 0.02 - 0.01)),
      validUntil,
    }

    setAnalysisResult(analysis)
    setTradePosition(recommendation)
    setIsGeneratingAnalysis(false)
    setShowAnalysis(true)

    setSignalCountdown(15)

    audioManager.current.playSound("analysisComplete")

    setSelectedTimeFrame("5s")
  }

  const handleTimeframeChange = (timeframe: TradeTimeframe) => {
    setTradeTimeframe(timeframe)
    setSelectedTimeFrame(timeframe as TimeFrame)
  }

  // Adicione este useEffect após os outros useEffects existentes
  useEffect(() => {
    // Scroll to top whenever screen changes
    window.scrollTo(0, 0)
  }, [currentScreen])

  if (currentScreen === "splash") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-white flex flex-col items-center justify-center relative overflow-hidden">
        {/* Background subtle gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-black opacity-50"></div>

        {/* Main content */}
        <div className="relative z-10 flex flex-col items-center">
          {/* Logo with fade-in effect */}
          <div
            className={`transition-all duration-1000 ease-out ${logoVisible ? "opacity-100 scale-100" : "opacity-0 scale-95"}`}
          >
            <Image
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Design%20sem%20nome%20%2833%29-d587vvpjBTcYZM3iqmJRTRQL0SZlhY.png"
              alt="CRIPTOEASY Logo"
              width={280}
              height={84}
              className="h-24 w-auto mb-12"
              priority
            />
          </div>

          {/* Neon loading circle */}
          <div className="relative">
            {/* Outer glow ring */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-[#0A84FF] via-[#00D4FF] to-[#0A84FF] opacity-20 blur-md animate-pulse"></div>

            {/* Main loading ring */}
            <div className="relative w-16 h-16 rounded-full border-2 border-gray-800">
              {/* Animated neon arc */}
              <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-[#0A84FF] border-r-[#00D4FF] animate-spin shadow-lg shadow-[#0A84FF]/50"></div>

              {/* Inner glow */}
              <div className="absolute inset-2 rounded-full bg-gradient-to-r from-[#0A84FF]/10 to-[#00D4FF]/10 animate-pulse"></div>
            </div>

            {/* Additional rotating elements for more visual appeal */}
            <div
              className="absolute inset-0 rounded-full border border-[#0A84FF]/30 animate-spin"
              style={{ animationDuration: "3s", animationDirection: "reverse" }}
            ></div>
          </div>

          {/* Subtle pulsing dots */}
          <div className="flex gap-2 mt-8">
            <div className="w-2 h-2 rounded-full bg-[#0A84FF] animate-pulse" style={{ animationDelay: "0ms" }}></div>
            <div className="w-2 h-2 rounded-full bg-[#0A84FF] animate-pulse" style={{ animationDelay: "200ms" }}></div>
            <div className="w-2 h-2 rounded-full bg-[#0A84FF] animate-pulse" style={{ animationDelay: "400ms" }}></div>
          </div>
        </div>

        {/* Ambient light effects */}
        <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-[#0A84FF]/5 rounded-full blur-3xl animate-pulse"></div>
        <div
          className="absolute bottom-1/4 right-1/4 w-24 h-24 bg-[#00D4FF]/5 rounded-full blur-2xl animate-pulse"
          style={{ animationDelay: "1s" }}
        ></div>
      </div>
    )
  }

  if (currentScreen === "onboarding") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-white flex flex-col justify-center relative overflow-hidden">
        {/* Ambient light effects */}
        <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-[#0A84FF]/5 rounded-full blur-3xl animate-pulse"></div>
        <div
          className="absolute bottom-1/4 right-1/4 w-24 h-24 bg-[#00D4FF]/5 rounded-full blur-2xl animate-pulse"
          style={{ animationDelay: "1s" }}
        ></div>

        <div className="px-4 sm:px-6 py-4 sm:py-6 max-w-md mx-auto relative z-10">
          <div className="flex flex-col items-center">
            {/* Logo e Título juntos em um container compacto */}
            <div className="flex flex-col items-center mb-6">
              <Image
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Design%20sem%20nome%20%2836%29-eV2CzYwaXz16Jg0nhmJIn9NTHA2a7M.png"
                alt="CriptoEasy Logo"
                width={80}
                height={80}
                className="h-16 w-auto mb-4"
                priority
              />
              <h1 className="text-xl sm:text-2xl font-bold text-center">
                Scanner cirúrgico de criptomoedas com <span className="text-[#0A84FF]">IA</span>
              </h1>
              <p className="text-gray-400 text-sm text-center mt-1">
                Tecnologia avançada que te mostra onde o lucro tá escondido no daytrade - antes da manada.
              </p>
            </div>

            {/* Features */}
            <div className="w-full space-y-4 mb-6">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-[#0A84FF]/10 flex-shrink-0">
                  <BarChart2 className="w-5 h-5 text-[#0A84FF]" />
                </div>
                <div className="flex-1">
                  <h2 className="text-base font-semibold mb-0.5">Dados de Mercado em Tempo Real</h2>
                  <p className="text-gray-400 text-sm">
                    Veja cotações em tempo real, gráficos interativos e métricas avançadas de criptomoedas.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-[#0A84FF]/10 flex-shrink-0">
                  <Brain className="w-5 h-5 text-[#0A84FF]" />
                </div>
                <div className="flex-1">
                  <h2 className="text-base font-semibold mb-0.5">Análise com Inteligência Artificial</h2>
                  <p className="text-gray-400 text-sm">
                    Nosso algoritmo fareja padrões invisíveis com algoritmos avançados e cospe sinais de entrada com
                    precisão milimétrica. Você só precisa seguir e lucrar.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-[#0A84FF]/10 flex-shrink-0">
                  <Globe className="w-5 h-5 text-[#0A84FF]" />
                </div>
                <div className="flex-1">
                  <h2 className="text-base font-semibold mb-0.5">Acesso em Todos os Dispositivos</h2>
                  <p className="text-gray-400 text-sm">
                    Seu lucro te acompanha onde você for. Receba os sinais no celular, tablet ou notebook, com total
                    segurança e sincronização instantânea.
                  </p>
                </div>
              </div>
            </div>

            {/* Privacy Note */}
            <div className="text-xs text-gray-500 text-center space-y-1 px-2 mb-6">
              <div className="flex justify-center">
                <div className="w-6 h-6 flex items-center justify-center">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M12 12C14.21 12 16 10.21 16 8C16 5.79 14.21 4 12 4C9.79 4 8 5.79 8 8C8 10.21 9.79 12 12 12ZM12 14C9.33 14 4 15.34 4 18V20H20V18C20 15.34 14.67 14 12 14Z"
                      fill="#8E8E93"
                    />
                  </svg>
                </div>
              </div>
              <p className="leading-relaxed">
                O CriptoEasy usa dados do mercado pra turbinar sua experiência. Tudo seguro e protegido. Nunca vendido
                pra terceiros.
              </p>
              <p className="text-[#0A84FF]">Veja como seus dados são gerenciados...</p>
            </div>

            {/* CTA Button */}
            <button
              onClick={() => {
                audioManager.current.playSound("click")
                setCurrentScreen("dashboard")
              }}
              className="w-full py-3 bg-[#0A84FF] text-white font-medium rounded-xl hover:bg-[#0A84FF]/90 transition-colors text-base"
            >
              Ativar Scanner
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (currentScreen === "dashboard") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-white relative overflow-hidden">
        {/* Ambient light effects */}
        <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-[#0A84FF]/5 rounded-full blur-3xl animate-pulse"></div>
        <div
          className="absolute bottom-1/4 right-1/4 w-24 h-24 bg-[#00D4FF]/5 rounded-full blur-2xl animate-pulse"
          style={{ animationDelay: "1s" }}
        ></div>

        {/* Header */}
        <header className="px-4 py-3 border-b border-gray-800/30 sticky top-0 bg-transparent z-10">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <Image
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Design%20sem%20nome%20%2835%29-HgK147qMGVK4vvx4OgkveF7AFRFSBV.png"
                alt="CRIPTOEASY IA Logo"
                width={120}
                height={36}
                className="h-8 sm:h-10 w-auto"
                priority
              />
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="text-xs text-gray-400">
                <span className="text-[#0A84FF]">{usersOnline}</span> online
              </div>
              <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center">
                <Info className="w-4 h-4 text-gray-400" />
              </div>
            </div>
          </div>
        </header>

        {/* Notification */}
        {showNotification && highlightedAssets.length > 0 && (
          <div className="fixed top-16 left-0 right-0 z-20 px-4 py-2">
            <div className="bg-gray-900/90 backdrop-blur-sm border border-[#0A84FF] rounded-lg p-3 flex items-start gap-3 shadow-lg">
              <div className="mt-0.5 flex-shrink-0">
                <Bell className="w-5 h-5 text-[#0A84FF]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white leading-tight">
                  {highlightedAssets[notificationIndex].notification}
                </p>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs text-gray-400">Agora</span>
                  <button
                    className="flex items-center text-xs text-[#0A84FF] font-medium flex-shrink-0"
                    onClick={() => handleAssetClick(highlightedAssets[notificationIndex])}
                  >
                    Ver análise <ChevronRight className="w-3 h-3 ml-1" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Market Overview */}
        <div className="px-4 py-4 relative z-10">
          <h2 className="text-lg font-semibold mb-3">Mercado de Criptomoedas</h2>

          <div className="overflow-x-auto pb-2 -mx-4 px-4">
            <div className="flex gap-3 min-w-max">
              {CRYPTO_ASSETS.slice(0, 5).map((asset) => (
                <div
                  key={asset.symbol}
                  className={`min-w-[110px] sm:min-w-[120px] p-3 rounded-xl ${
                    asset.highlighted
                      ? "bg-[#0A84FF]/10 border border-[#0A84FF]/30 shadow-lg shadow-[#0A84FF]/5"
                      : "bg-gray-900/50 backdrop-blur-sm border border-gray-800"
                  } relative cursor-pointer hover:scale-105 transition-transform active:scale-95`}
                  onClick={() => handleAssetClick(asset)}
                >
                  {asset.highlighted && (
                    <div className="absolute -top-1 -right-1 w-3 h-3 sm:w-4 sm:h-4 bg-[#0A84FF] rounded-full flex items-center justify-center animate-pulse">
                      <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-white rounded-full"></div>
                    </div>
                  )}
                  <div className="text-sm font-medium truncate">{asset.symbol.replace("USDT", "")}</div>
                  <div className="text-base sm:text-lg font-semibold">
                    ${asset.price < 1 ? asset.price.toFixed(4) : asset.price.toFixed(2)}
                  </div>
                  <div className={`text-xs ${asset.changePercent >= 0 ? "text-green-500" : "text-red-500"}`}>
                    {asset.changePercent >= 0 ? "+" : ""}
                    {asset.changePercent.toFixed(2)}%
                  </div>
                  {asset.highlighted && (
                    <div className="mt-2 pt-2 border-t border-[#0A84FF]/20">
                      <button className="w-full text-xs text-[#0A84FF] font-medium flex items-center justify-center">
                        Analisar <ChevronRight className="w-3 h-3 ml-1" />
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Assets List */}
        <div className="px-4 py-2 relative z-10">
          <h2 className="text-lg font-semibold mb-3">Ativos Disponíveis</h2>

          <div className="space-y-2">
            {CRYPTO_ASSETS.map((asset) => (
              <div
                key={asset.symbol}
                className={`flex items-center justify-between p-3 rounded-xl ${
                  asset.highlighted
                    ? "bg-[#0A84FF]/10 border border-[#0A84FF]/30"
                    : "bg-gray-900/50 backdrop-blur-sm border border-gray-800"
                } relative cursor-pointer hover:scale-[1.02] transition-transform active:scale-[0.98]`}
                onClick={() => handleAssetClick(asset)}
              >
                {asset.highlighted && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 sm:w-4 sm:h-4 bg-[#0A84FF] rounded-full flex items-center justify-center animate-pulse">
                    <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-white rounded-full"></div>
                  </div>
                )}
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div
                    className={`w-10 h-10 rounded-full ${asset.highlighted ? "bg-[#0A84FF]/20" : "bg-gray-800"} flex items-center justify-center flex-shrink-0`}
                  >
                    <span className="text-sm font-medium">{asset.symbol.substring(0, 1)}</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-medium truncate">{asset.name}</div>
                    <div className="text-xs text-gray-400 truncate">{asset.symbol}</div>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="font-semibold">
                    ${asset.price < 1 ? asset.price.toFixed(4) : asset.price.toFixed(2)}
                  </div>
                  <div className={`text-xs ${asset.changePercent >= 0 ? "text-green-500" : "text-red-500"}`}>
                    {asset.changePercent >= 0 ? "+" : ""}
                    {asset.changePercent.toFixed(2)}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Test Popup - REMOVED "Agora não" button */}
        {showTestPopup && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-gray-900/90 backdrop-blur-sm rounded-xl p-6 max-w-sm w-full border border-gray-800">
              <div className="w-16 h-16 mx-auto rounded-full bg-[#0A84FF]/20 flex items-center justify-center mb-4">
                <AlertCircle className="w-8 h-8 text-[#0A84FF]" />
              </div>
              <h3 className="text-xl font-bold text-center mb-2">Acesso Liberado: Teste Grátis Ativado!</h3>
              <p className="text-gray-400 text-center mb-6 text-sm leading-relaxed">
                Você acaba de desbloquear um teste 100% grátis com dados reais da Binance e IA de análise cirúrgica.
                Teste agora os sinais que estão fazendo amador operar como profissional — sem risco, sem desculpa.
              </p>
              <div className="space-y-3">
                <button
                  onClick={handleConfirmTest}
                  className="w-full py-3 bg-[#0A84FF] text-white font-medium rounded-lg hover:bg-[#0A84FF]/90 transition-colors"
                >
                  Iniciar Operações
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  if (currentScreen === "login-simulation") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-white flex flex-col items-center justify-center p-4 relative overflow-hidden">
        {/* Ambient light effects */}
        <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-[#0A84FF]/5 rounded-full blur-3xl animate-pulse"></div>
        <div
          className="absolute bottom-1/4 right-1/4 w-24 h-24 bg-[#00D4FF]/5 rounded-full blur-2xl animate-pulse"
          style={{ animationDelay: "1s" }}
        ></div>

        <div className="w-full max-w-md relative z-10">
          <div className="text-center mb-8">
            <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto rounded-full bg-[#0A84FF]/20 flex items-center justify-center mb-4">
              <svg
                width="32"
                height="32"
                viewBox="0 0 183 183"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="sm:w-10 sm:h-10"
              >
                <path
                  d="M91.5 0L114.375 68.625L183 91.5L114.375 114.375L91.5 183L68.625 114.375L0 91.5L68.625 68.625L91.5 0Z"
                  fill="#F3BA2F"
                />
              </svg>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold mb-2">Conectando à Binance</h2>
            <p className="text-gray-400 text-sm sm:text-base">{loadingMessage}</p>
          </div>

          <div className="w-full bg-gray-800 h-2 rounded-full overflow-hidden mb-8">
            <div
              className="h-full bg-[#0A84FF] rounded-full transition-all duration-300 ease-out"
              style={{ width: `${loadingProgress}%` }}
            ></div>
          </div>

          <div className="space-y-3 sm:space-y-4">
            <div className="bg-gray-900/50 backdrop-blur-sm rounded-lg p-4 flex items-center gap-3 border border-gray-800">
              <div className="w-10 h-10 rounded-full bg-[#0A84FF]/20 flex items-center justify-center flex-shrink-0">
                <div className="w-5 h-5 text-[#0A84FF]">✓</div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm sm:text-base">Verificando credenciais</div>
                <div className="text-xs text-gray-400">Autenticação segura</div>
              </div>
            </div>

            <div className="bg-gray-900/50 backdrop-blur-sm rounded-lg p-4 flex items-center gap-3 border border-gray-800">
              <div className="w-10 h-10 rounded-full bg-[#0A84FF]/20 flex items-center justify-center flex-shrink-0">
                <div className="w-5 h-5 text-[#0A84FF]">✓</div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm sm:text-base">Carregando dados de mercado</div>
                <div className="text-xs text-gray-400">Conectando à API da Binance</div>
              </div>
            </div>

            <div className="bg-gray-900/50 backdrop-blur-sm rounded-lg p-4 flex items-center gap-3 border border-gray-800">
              <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center flex-shrink-0">
                <div className="w-5 h-5 text-gray-400">⏳</div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm sm:text-base">Inicializando algoritmos de IA</div>
                <div className="text-xs text-gray-400">Preparando modelos preditivos</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (currentScreen === "trading") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-white relative overflow-hidden">
        {/* Ambient light effects */}
        <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-[#0A84FF]/5 rounded-full blur-3xl animate-pulse"></div>
        <div
          className="absolute bottom-1/4 right-1/4 w-24 h-24 bg-[#00D4FF]/5 rounded-full blur-2xl animate-pulse"
          style={{ animationDelay: "1s" }}
        ></div>

        {/* Header */}
        <header className="px-4 py-3 border-b border-gray-800/30 sticky top-0 bg-transparent z-10">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Image
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Design%20sem%20nome%20%2835%29-HgK147qMGVK4vvx4OgkveF7AFRFSBV.png"
                alt="CRIPTOEASY IA Logo"
                width={100}
                height={30}
                className="h-7 sm:h-8 w-auto"
                priority
              />
              <span className="text-sm text-gray-400">Trading</span>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="text-xs text-gray-400">
                Demo: <span className="text-[#0A84FF]">{operationsCompleted}/5</span>
              </div>
              <div className="text-sm font-medium">R$ {accountBalance.toFixed(2)}</div>
            </div>
          </div>
        </header>

        {/* Demo Welcome Popup */}
        {showDemoWelcomePopup && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-gray-900/95 backdrop-blur-sm rounded-xl border border-gray-800 p-6 max-w-sm w-full relative overflow-hidden w-full max-w-sm p-4 sm:p-6 rounded-xl shadow-lg max-h-[70vh] overflow-y-auto scrollbar-thin scrollbar-thumb-[#0A84FF] scrollbar-track-[#0a0a1a]">
              {/* Subtle accent line */}
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#0A84FF] to-[#00D4FF]"></div>

              <div className="relative z-10">
                {/* Header with gift icon */}
                <div className="text-center mb-4">
                  <div className="w-16 h-16 mx-auto rounded-full bg-[#0A84FF]/20 flex items-center justify-center mb-3">
                    <div className="text-2xl">🎁</div>
                  </div>
                  <h2 className="text-xl font-bold text-white mb-2 leading-tight">Banca Virtual de R$1.000 Liberada</h2>
                  <p className="text-sm text-gray-400">Teste a inteligência artificial com dados reais da Binance e veja ela identificar oportunidades como um profissional.</p>
                </div>

                {/* Main content */}
                <div className="space-y-3 mb-4">
                  <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-3 border border-gray-700">
                    <p className="text-sm text-gray-300 leading-relaxed">
                      Você vai operar com sinais automáticos e acompanhar{" "}
                      <span className="text-green-400 font-medium">acertos consecutivos</span>  em tempo real.
                    </p>
                  </div>

                  <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3">
                    <p className="text-yellow-400 text-sm text-center">
                      ⚠️ Atenção: esse teste é exclusivo para novos usuários. Use com estratégia — é sua única chance de testar a IA gratuitamente.
                    </p>
                  </div>
                </div>

                {/* CTA Button */}
                <button
                  onClick={() => {
                    audioManager.current.playSound("click")
                    setShowDemoWelcomePopup(false)
                    // Save that user has seen the popup
                    localStorage.setItem("hasSeenDemoWelcomePopup", "true")
                  }}
                  className="w-full py-3 bg-[#0A84FF] text-white font-medium rounded-lg hover:bg-[#0A84FF]/90 transition-colors"
                >
                  Ativar a Banca
                </button>
              </div>
            </div>
          </div>
        )}

        {selectedAsset && (
          <>
            {/* Asset Info */}
            <div className="px-4 py-4 relative z-10">
              <div className="flex justify-between items-start">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h2 className="text-lg sm:text-xl font-bold truncate">{selectedAsset.name}</h2>
                    <span className="text-sm text-gray-400 flex-shrink-0">{selectedAsset.symbol}</span>
                  </div>
                  <div className="text-xl sm:text-2xl font-bold mt-1">
                    ${selectedAsset.price < 1 ? selectedAsset.price.toFixed(4) : selectedAsset.price.toFixed(2)}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`${selectedAsset.changePercent >= 0 ? "text-green-500" : "text-red-500"}`}>
                      {selectedAsset.changePercent >= 0 ? "+" : ""}
                      {selectedAsset.changePercent.toFixed(2)}%
                    </span>
                    <span className="text-gray-400 text-sm">24h</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Chart */}
            <div className="px-4 relative z-10">
              <div className="mb-4">
                <div className="flex overflow-x-auto gap-2 pb-2 -mx-4 px-4">
                  {TIME_FRAMES.map((tf) => (
                    <button
                      key={tf.value}
                      onClick={() => setSelectedTimeFrame(tf.value)}
                      className={`px-3 py-1.5 rounded-md text-sm flex-shrink-0 ${
                        selectedTimeFrame === tf.value ? "bg-gray-800 text-white" : "text-gray-400 hover:bg-gray-900"
                      }`}
                    >
                      {tf.label}
                    </button>
                  ))}
                </div>
              </div>

              <div
                ref={chartContainerRef}
                className="relative h-[350px] sm:h-[500px] w-full bg-gray-900/50 backdrop-blur-sm rounded-lg overflow-hidden min-h-0 border border-gray-800"
              >
                {createChart ? (
                  <div className="absolute inset-0 w-full h-full" />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                    <div className="text-center">
                      <div className="w-12 h-12 mx-auto mb-2 text-2xl">📈</div>
                      <p className="text-sm">Carregando gráfico...</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Trade Simulation */}
              {showTradeSimulation && (
                <div className="mt-3 bg-gray-900/50 backdrop-blur-sm rounded-lg p-3 border border-gray-800">
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-[#0A84FF] rounded-full animate-pulse"></div>
                      <span className="text-sm font-medium">Operação em andamento</span>
                    </div>
                    <span className="text-xs text-gray-400">{tradeTimeframe}</span>
                  </div>
                  <div className="w-full bg-gray-800 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#0A84FF] rounded-full transition-all duration-300 ease-out"
                      style={{ width: `${tradeSimulationProgress}%` }}
                    ></div>
                  </div>
                </div>
              )}
            </div>

            {/* Trading Interface */}
            <div className="px-4 py-4 relative z-10">
              {/* Analysis Section */}
              {!showAnalysis && !showNewAnalysisButton && operationsCompleted < 5 ? (
                <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl border border-gray-800 p-4 mb-4">
                  <h3 className="text-lg font-semibold mb-4">Análise Inteligente</h3>
                  <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-4 text-center mb-4 border border-gray-700">
                    <div className="w-12 h-12 text-[#0A84FF] mx-auto mb-3 text-2xl">🧠</div>
                    <p className="text-sm text-gray-400 mb-2 leading-relaxed">
                      Nossa IA analisará {selectedAsset.name} e fornecerá uma recomendação precisa de entrada
                    </p>
                    <div className="text-xs text-gray-500">Análise baseada em 15+ indicadores técnicos</div>
                  </div>

                  <button
                    className="w-full py-3 bg-[#0A84FF] text-white font-medium rounded-lg hover:bg-[#0A84FF]/90 transition-colors"
                    onClick={handleGenerateAnalysis}
                    disabled={isGeneratingAnalysis}
                  >
                    {isGeneratingAnalysis ? (
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Analisando mercado...</span>
                      </div>
                    ) : (
                      "Gerar Análise"
                    )}
                  </button>
                </div>
              ) : showNewAnalysisButton && operationsCompleted < 5 ? (
                <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl border border-gray-800 p-4 mb-4">
                  <div className="text-center mb-4">
                    <div className="w-12 h-12 text-green-500 mx-auto mb-2 text-2xl">✅</div>
                    <h3 className="text-lg font-semibold mb-2">Operação Finalizada!</h3>
                    <p className="text-sm text-gray-400">Pronto para uma nova análise?</p>
                  </div>
                  <button
                    className="w-full py-3 bg-[#0A84FF] text-white font-medium rounded-lg hover:bg-[#0A84FF]/90 transition-colors"
                    onClick={handleGenerateAnalysis}
                    disabled={isGeneratingAnalysis}
                  >
                    {isGeneratingAnalysis ? (
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Analisando mercado...</span>
                      </div>
                    ) : (
                      "Gerar Nova Análise"
                    )}
                  </button>
                </div>
              ) : operationsCompleted >= 5 ? (
                <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl border border-gray-800 p-4 mb-4">
                  <div className="text-center mb-4">
                    <div className="w-12 h-12 text-yellow-500 mx-auto mb-2 text-2xl">🎯</div>
                    <h3 className="text-lg font-semibold mb-2">Demo Concluída!</h3>
                    <p className="text-sm text-gray-400">Você utilizou todas as 5 operações disponíveis na demo.</p>
                  </div>
                  <button
                    className="w-full py-3 bg-[#0A84FF] text-white font-medium rounded-lg hover:bg-[#0A84FF]/90 transition-colors"
                    onClick={() => setCurrentScreen("post-demo")}
                  >
                    Ver Planos Premium
                  </button>
                </div>
              ) : (
                analysisResult && (
                  <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl border border-gray-800 p-4 mb-4">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-semibold">Resultado da Análise</h3>

                      {/* Countdown */}
                      {signalCountdown > 0 && (
                        <div className="flex items-center gap-1 bg-gray-800/50 backdrop-blur-sm px-2 py-1 rounded-lg border border-gray-700">
                          <div className="w-4 h-4 text-[#0A84FF]">⏱️</div>
                          <span
                            className={`text-sm font-medium ${signalCountdown <= 5 ? "text-red-500" : "text-[#0A84FF]"}`}
                          >
                            {signalCountdown}s
                          </span>
                        </div>
                      )}

                      {signalExpired && (
                        <div className="flex items-center gap-1 bg-red-500/20 px-2 py-1 rounded-lg border border-red-500/30">
                          <div className="w-4 h-4 text-red-500">⚠️</div>
                          <span className="text-sm font-medium text-red-500">Expirado</span>
                        </div>
                      )}
                    </div>

                    <div
                      className={`p-4 rounded-lg border mb-4 ${
                        analysisResult.recommendation === "buy"
                          ? "bg-green-500/10 border-green-500/30"
                          : "bg-red-500/10 border-red-500/30"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          {analysisResult.recommendation === "buy" ? (
                            <div className="w-5 h-5 text-green-500">↗</div>
                          ) : (
                            <div className="w-5 h-5 text-red-500">↘</div>
                          )}
                          <span
                            className={`font-semibold ${
                              analysisResult.recommendation === "buy" ? "text-green-500" : "text-red-500"
                            }`}
                          >
                            {analysisResult.recommendation === "buy" ? "COMPRA" : "VENDA"}
                          </span>
                        </div>
                        <div className="text-sm">
                          <span className="text-gray-400">Confiança: </span>
                          <span className="font-medium">{analysisResult.confidence}%</span>
                        </div>
                      </div>

                      <div className="space-y-2 text-sm">
                        <div>
                          <span className="text-gray-400">Janela: </span>
                          <span className="text-white">{analysisResult.timeframe}</span>
                        </div>
                        <div>
                          <span className="text-gray-400">Preço: </span>
                          <span className="text-white">${analysisResult.entryPrice.toFixed(4)}</span>
                        </div>
                        <div>
                          <span className="text-gray-400">Motivo: </span>
                          <span className="text-white text-xs leading-relaxed">{analysisResult.reason}</span>
                        </div>
                      </div>
                    </div>

                    {/* Generate new signal button if expired and operations available */}
                    {signalExpired && operationsCompleted < 5 && (
                      <button
                        className="w-full py-3 bg-[#0A84FF] text-white font-medium rounded-lg hover:bg-[#0A84FF]/90 transition-colors text-sm"
                        onClick={handleGenerateAnalysis}
                      >
                        Gerar Novo Sinal
                      </button>
                    )}
                  </div>
                )
              )}

              {/* Trading Interface - only show if analysis generated, signal not expired and no active trade */}
              {showAnalysis && analysisResult && !signalExpired && !isTradeActive && operationsCompleted < 5 && (
                <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl border border-gray-800 p-4">
                  <h3 className="text-lg font-semibold mb-4">Nova Operação</h3>

                  {/* Step 1: Timeframe */}
                  <div className="mb-6">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-6 h-6 rounded-full bg-[#0A84FF] text-white text-sm font-bold flex items-center justify-center">
                        1
                      </div>
                      <label className="text-sm font-medium text-white">Escolha o período da vela</label>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {TRADE_TIMEFRAMES.map((tf) => (
                        <button
                          key={tf.value}
                          className={`py-2 px-2 rounded-lg text-sm relative ${
                            tradeTimeframe === tf.value
                              ? "bg-[#0A84FF]/20 text-[#0A84FF] border border-[#0A84FF]/30"
                              : (tf.value === "5s" || tf.value === "10s")
                                ? "bg-yellow-500/20 text-yellow-500 border border-yellow-500/30 animate-pulse"
                                : "bg-gray-800/50 backdrop-blur-sm text-gray-400 border border-gray-700"
                          }`}
                          onClick={() => handleTimeframeChange(tf.value)}
                        >
                          {(tf.value === "5s" || tf.value === "10s") && (
                            <div className="absolute -top-1 -right-1 w-2 h-2 bg-yellow-500 rounded-full animate-ping"></div>
                          )}
                          {tf.label}
                          {(tf.value === "5s" || tf.value === "10s") && (
                            <div className="text-xs text-yellow-400 mt-1">⚡ Recomendado</div>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Step 2: Amount - only appears after selecting timeframe */}
                  {tradeTimeframe && (
                    <div className="mb-6">
                      <div className="flex items-center gap-2 mb-3">
                        <div
                          className={`w-6 h-6 rounded-full ${tradeAmount > 0 ? "bg-[#0A84FF]" : "bg-yellow-500 animate-pulse"} text-white text-sm font-bold flex items-center justify-center`}
                        >
                          2
                        </div>
                        <label className="text-sm font-medium text-white">
                          {tradeAmount > 0 ? "Valor da operação definido" : "Defina o valor da operação"}
                        </label>
                        {tradeAmount === 0 && <div className="text-yellow-500 text-sm">← Clique aqui</div>}
                      </div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm text-gray-400">Valor da Operação</span>
                        <span className="text-sm text-gray-400">Saldo: R$ {accountBalance.toFixed(2)}</span>
                      </div>
                      <div
                        className={`relative ${tradeAmount === 0 ? "ring-2 ring-yellow-500 ring-opacity-50 animate-pulse" : ""} rounded-lg`}
                      >
                        <div className="absolute left-3 top-1/2 -translate-y-1/2">
                          <span className="text-gray-400">R$</span>
                        </div>
                        <input
                          type="number"
                          value={tradeAmount}
                          onChange={(e) => setTradeAmount(Number(e.target.value))}
                          className="w-full bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg py-3 pl-10 pr-3 text-white text-base"
                          min={10}
                          max={accountBalance}
                          placeholder="Digite o valor"
                        />
                      </div>
                      <div className="grid grid-cols-4 gap-2 mt-2">
                        {[25, 50, 75, 100].map((percent) => (
                          <button
                            key={percent}
                            className="bg-gray-800/50 backdrop-blur-sm py-2 rounded text-xs text-gray-400 hover:bg-gray-700 transition-colors border border-gray-700"
                            onClick={() => setTradeAmount(Math.floor(accountBalance * (percent / 100)))}
                          >
                            {percent}%
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Step 3: Execute Button - only appears after defining amount */}
                  {tradeTimeframe && tradeAmount > 0 && (
                    <div className="mb-4">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-6 h-6 rounded-full bg-green-500 animate-pulse text-white text-sm font-bold flex items-center justify-center">
                          3
                        </div>
                        <label className="text-sm font-medium text-white">Executar operação</label>
                        <div className="text-green-500 text-sm animate-bounce">↓ Clique para operar!</div>
                      </div>
                      <button
                        className={`w-full py-4 rounded-lg font-medium text-base ${
                          tradePosition === "buy" ? "bg-green-500 text-white" : "bg-red-500 text-white"
                        } disabled:opacity-50 animate-pulse`}
                        onClick={handleStartTrade}
                        disabled={currentTrade && currentTrade.status === "open"}
                      >
                        {currentTrade && currentTrade.status === "open" ? (
                          <div className="flex items-center justify-center gap-2">
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            <span>Operação em andamento...</span>
                          </div>
                        ) : (
                          `${tradePosition === "buy" ? "Comprar" : "Vender"} ${selectedAsset.symbol.replace("USDT", "")} - ${tradeTimeframe}`
                        )}
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Trade History */}
              <div className="py-2 mb-24">
                <h3 className="text-lg font-semibold mb-3">Histórico de Operações</h3>

                {trades.length === 0 ? (
                  <div className="bg-gray-900/50 backdrop-blur-sm rounded-lg p-4 text-center border border-gray-800">
                    <p className="text-gray-400">Nenhuma operação realizada</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {trades.map((trade) => (
                      <div
                        key={trade.id}
                        className={`p-4 rounded-lg border ${
                          trade.status === "open"
                            ? "bg-gray-900/50 backdrop-blur-sm border-gray-700"
                            : trade.success
                              ? "bg-green-500/10 border-green-500/30"
                              : "bg-red-500/10 border-red-500/30"
                        }`}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex-1 min-w-0">
                            <div className="font-medium">{trade.symbol}</div>
                            <div className="text-xs text-gray-400">
                              {trade.position === "buy" ? "Compra" : "Venda"} • {trade.leverage}x • {trade.timeframe}
                            </div>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <div className="font-medium">R$ {trade.amount.toFixed(2)}</div>
                            <div className="text-xs text-gray-400">{trade.openTime.toLocaleTimeString()}</div>
                          </div>
                        </div>

                        {trade.status === "closed" && (
                          <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-700">
                            <div className="text-sm">Resultado</div>
                            <div className={`font-medium ${trade.success ? "text-green-500" : "text-red-500"}`}>
                              {trade.profitLoss && trade.profitLoss > 0 ? "+" : ""}
                              R$ {trade.profitLoss?.toFixed(2)} ({trade.profitLossPercent}%)
                            </div>
                          </div>
                        )}

                        {trade.status === "open" && (
                          <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-700">
                            <div className="w-4 h-4 border-2 border-[#0A84FF] border-t-transparent rounded-full animate-spin" />
                            <span className="text-sm text-[#0A84FF]">Operação em andamento...</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {/* Profit/Loss Popup */}
        {showProfitPopup && currentTrade && currentTrade.status === "closed" && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div
              className={`rounded-xl p-6 max-w-sm w-full border ${
                currentTrade.success ? "bg-green-500/20 border-green-500/30" : "bg-red-500/20 border-red-500/30"
              } backdrop-blur-sm`}
            >
              <div className="w-16 h-16 mx-auto rounded-full bg-black/30 flex items-center justify-center mb-4">
                {currentTrade.success ? (
                  <div className="w-8 h-8 text-green-500 text-2xl">✓</div>
                ) : (
                  <div className="w-8 h-8 text-red-500 text-2xl">✕</div>
                )}
              </div>
              <h3 className="text-xl font-bold text-center mb-2">
                {currentTrade.success ? "Operação Vencedora!" : "Stop Loss Ativado"}
              </h3>
              <div className="text-2xl font-bold text-center mb-4">
                <span className={currentTrade.success ? "text-green-500" : "text-red-500"}>
                  {currentTrade.profitLoss && currentTrade.profitLoss > 0 ? "+" : ""}
                  R$ {currentTrade.profitLoss?.toFixed(2)}
                </span>
              </div>
              <div className="bg-black/30 rounded-lg p-4 mb-6">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-gray-400">Ativo</div>
                    <div className="truncate">{currentTrade.symbol}</div>
                  </div>
                  <div>
                    <div className="text-gray-400">Posição</div>
                    <div>{currentTrade.position === "buy" ? "Compra" : "Venda"}</div>
                  </div>
                  <div>
                    <div className="text-gray-400">Valor</div>
                    <div>R$ {currentTrade.amount.toFixed(2)}</div>
                  </div>
                  <div>
                    <div className="text-gray-400">Tempo</div>
                    <div>{currentTrade.timeframe}</div>
                  </div>
                  <div>
                    <div className="text-gray-400">Retorno</div>
                    <div className={currentTrade.success ? "text-green-500" : "text-red-500"}>
                      {currentTrade.profitLossPercent}%
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-400">Alavancagem</div>
                    <div>{currentTrade.leverage}x</div>
                  </div>
                </div>
              </div>
              <button
                onClick={() => {
                  audioManager.current.playSound("click")
                  setShowProfitPopup(false)
                }}
                className="w-full py-3 bg-white/10 text-white font-medium rounded-lg hover:bg-white/20 transition-colors"
              >
                Continuar
              </button>
            </div>
          </div>
        )}

        {/* Bottom Navigation */}
        <div className="fixed bottom-0 left-0 right-0 bg-gray-900/90 backdrop-blur-sm border-t border-gray-800 p-4 z-10">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-400">Operações completadas</span>
            <span className="text-sm font-medium">{operationsCompleted}/5</span>
          </div>
          <div className="h-1 bg-gray-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#0A84FF] rounded-full transition-all duration-300"
              style={{ width: `${(operationsCompleted / 5) * 100}%` }}
            ></div>
          </div>
        </div>
      </div>
    )
  }

  if (currentScreen === "conversion") {
    const formatTime = (seconds: number) => {
      const mins = Math.floor(seconds / 60)
      const secs = seconds % 60
      return `${mins}:${secs.toString().padStart(2, "0")}`
    }

    const simulatedProfit = (accountBalance - 1000).toFixed(2)

    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-white relative overflow-hidden">
        {/* Ambient effects */}
        <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-[#0A84FF]/5 rounded-full blur-3xl animate-pulse"></div>
        <div
          className="absolute bottom-1/4 right-1/4 w-24 h-24 bg-[#00D4FF]/5 rounded-full blur-2xl animate-pulse"
          style={{ animationDelay: "1s" }}
        ></div>

        {/* Main content */}
        <div className="relative z-10 flex flex-col items-center justify-center px-4 py-8">
          {/* Offer Popup */}
          {showOfferPopup && (
            <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
              <div className="bg-gray-900/95 backdrop-blur-sm rounded-2xl border-2 border-[#0A84FF]/50 p-6 max-w-lg w-full relative overflow-hidden w-full max-w-sm p-4 sm:p-6 rounded-xl shadow-lg max-h-[70vh] overflow-y-auto scrollbar-thin scrollbar-thumb-[#0A84FF] scrollbar-track-[#0a0a1a]">
                {/* Animated background effects */}
                <div className="absolute inset-0 bg-gradient-to-r from-[#0A84FF]/10 via-[#00D4FF]/10 to-[#0A84FF]/10 animate-pulse"></div>
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#0A84FF] to-[#00D4FF] animate-pulse"></div>

                <div className="relative z-10">
                  {/* Header with gift icon */}
                  <div className="text-center mb-6">
                    <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-r from-[#0A84FF] to-[#00D4FF] flex items-center justify-center mb-4 animate-bounce">
                      <div className="text-3xl">🎁</div>
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4 leading-tight">
                      OFERTA EXCLUSIVA PARA NOVOS USUÁRIOS
                    </h2>
                  </div>

                  {/* Main content */}
                  <div className="space-y-4 mb-6">
                    <p className="text-gray-300 text-sm sm:text-base leading-relaxed">
                      Parabéns! Você acaba de ganhar um desconto especial para começar a operar com a nossa IA
                    </p>
                    <p className="text-gray-300 text-sm sm:text-base leading-relaxed">
                      Aproveite essa oportunidade única para ter acesso a sinais exclusivos e aumentar seus lucros
                    </p>

                    <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-lg p-3">
                      <p className="text-yellow-400 text-sm text-center">
                        ⚠️ Essa oferta é válida apenas por tempo limitado.
                        <br />
                        Não perca essa chance de transformar seus investimentos.
                      </p>
                    </div>
                  </div>

                  {/* Highlighted final message */}
                  <div className="bg-gradient-to-r from-[#0A84FF]/20 to-[#00D4FF]/20 border border-[#0A84FF]/30 rounded-xl p-4 mb-6">
                    <p className="text-white font-semibold text-center text-sm sm:text-base">
                      Garanta já o seu plano premium com desconto e comece a lucrar agora mesmo!
                    </p>
                  </div>

                  {/* CTA Button */}
                  <button
                    onClick={() => {
                      audioManager.current.playSound("click")
                      setShowOfferPopup(false)
                    }}
                    className="w-full py-4 bg-gradient-to-r from-[#0A84FF] to-[#00D4FF] text-white font-bold rounded-xl text-lg hover:opacity-90 transition-opacity animate-pulse"
                  >
                    🔥 APROVEITAR A OFERTA AGORA
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Main content */}
          <div className="text-center mb-8 relative z-10">
            <div className="w-24 h-24 mx-auto rounded-full bg-[#0A84FF]/20 flex items-center justify-center mb-4">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M12 17.27L18.18 21L16.54 13.97L22 9.24L14.81 8.63L12 2L9.19 8.63L2 9.24L7.46 13.97L5.82 21L12 17.27Z"
                  fill="#F3BA2F"
                />
              </svg>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold mb-2">Parabéns!</h2>
            <p className="text-gray-400 text-sm sm:text-base">
              Você simulou um lucro de <span className="text-[#0A84FF]">R$ {simulatedProfit}</span> na nossa plataforma
              demo.
            </p>
          </div>

          <div className="relative z-10">
            <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-800 mb-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#0A84FF]/20 flex items-center justify-center">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path
                        d="M5 3C3.89543 3 3 3.89543 3 5V19C3 20.1046 3.89543 21 5 21H19C20.1046 21 21 20.1046 21 19V5C21 3.89543 20.1046 3 19 3H5ZM12 5C12.5523 5 13 5.44772 13 6V8C13 8.55228 12.5523 9 12 9C11.4477 9 11 8.55228 11 8V6C11 5.44772 11.4477 5 12 5ZM7 6C7 6.55228 6.55228 7 6 7V8C6 8.55228 6.44772 9 7 9H8C8.55228 9 9 8.55228 9 8V7C9 6.44772 8.55228 6 8 6H7ZM16 6C16 6.55228 15.5523 7 15 7V8C15 8.55228 15.4477 9 16 9H17C17.5523 9 18 8.55228 18 8V7C18 6.44772 17.5523 6 17 6H16ZM5 11C4.44772 11 4 11.4477 4 12V13C4 13.5523 4.44772 14 5 14H6C6.55228 14 7 13.5523 7 13V12C7 11.4477 6.55228 11 6 11H5ZM18 11C17.4477 11 17 11.4477 17 12V13C17 13.5523 17.4477 14 18 14H19C19.5523 14 20 13.5523 20 13V12C20 11.4477 19.5523 11 19 11H18ZM12 11C11.4477 11 11 11.4477 11 12V16C11 16.5523 11.4477 17 12 17C12.5523 17 13 16.5523 13 16V12C13 11.4477 12.5523 11 12 11ZM5 16C4.44772 16 4 16.4477 4 17V19C4 19.5523 4.44772 20 5 20H6C6.55228 20 7 19.5523 7 19V17C7 16.4477 6.55228 16 6 16H5ZM18 16C17.4477 16 17 16.4477 17 17V19C17 19.5523 17.4477 20 18 20H19C19.5523 20 20 19.5523 20 19V17C20 16.4477 19.5523 16 19 16H18ZM12 16C11.4477 16 11 16.4477 11 17V19C11 19.5523 11.4477 20 12 20C12.5523 20 13 19.5523 13 19V17C13 16.4477 12.5523 16 12 16Z"
                        fill="#0A84FF"
                      />
                    </svg>
                  </div>
                  <div>
                    <div className="text-sm font-medium">Plano Simples</div>
                    <div className="text-xs text-gray-400">Ideal para iniciantes</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xl font-semibold">R$ 49,90</div>
                  <div className="text-xs text-gray-400">por mês</div>
                </div>
              </div>

              <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-800 mb-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#0A84FF]/20 flex items-center justify-center">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path
                          d="M3 9H7C7 10.1046 7.89543 11 9 11H15C16.1046 11 17 10.1046 17 9H21M7 15H3M21 15H17M12 3V21M3 3H21V7C21 7.55228 20.5523 8 20 8H4C3.44772 8 3 7.55228 3 7V3ZM3 17H21V21C21 20.4477 20.5523 20 20 20H4C3.44772 20 3 19.5523 3 19V17Z"
                          fill="#0A84FF"
                        />
                      </svg>
                    </div>
                    <div>
                      <div className="text-sm font-medium">Plano Intermediário</div>
                      <div className="text-xs text-gray-400">Mais sinais e ferramentas</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-semibold">R$ 99,90</div>
                    <div className="text-xs text-gray-400">por mês</div>
                  </div>
                </div>
              </div>

              <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-800 mb-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#0A84FF]/20 flex items-center justify-center">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path
                          d="M12 12C15.3137 12 18 9.31371 18 6C18 2.68629 15.3137 0 12 0C8.68629 0 6 2.68629 6 6C6 9.31371 8.68629 12 12 12ZM12 14C7.98065 14 4.60083 16.6882 3.11133 20.5C3.04688 20.6943 3 20.8979 3 21H21C21 20.8979 20.9531 20.6943 20.8887 20.5C19.3992 16.6882 16.0194 14 12 14Z"
                          fill="#0A84FF"
                        />
                      </svg>
                    </div>
                    <div>
                      <div className="text-sm font-medium">Plano Premium</div>
                      <div className="text-xs text-gray-400">Acesso total à plataforma</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-semibold">R$ 149,90</div>
                    <div className="text-xs text-gray-400">por mês</div>
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowOfferPopup(true)}
              className="w-full py-4 bg-gradient-to-r from-[#0A84FF] to-[#00D4FF] text-white font-bold rounded-xl text-lg hover:opacity-90 transition-opacity relative z-10"
            >
              🔥 VER PLANOS COM DESCONTO
            </button>

            <div className="text-xs text-gray-500 mt-6 relative z-10">
              Oferta especial válida por <span className="text-[#0A84FF]">{formatTime(countdown)}</span>.
            </div>
          </div>
        </div>

        {/* BLOCO FAQ */}
        <div className="mt-16">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold mb-2">Dúvidas Frequentes (FAQ)</h2>
            <p className="text-gray-400 text-sm sm:text-base">
              Tire suas principais dúvidas sobre o CriptoEasy
            </p>
          </div>

          <div className="max-w-4xl mx-auto space-y-4">
            {[
              {
                question: "Como funcionam os sinais da IA?",
                answer: "Nossa IA analisa o mercado em tempo real com leitura de volume, RSI, MACD e mais. Quando ela encontra uma oportunidade de entrada, você recebe um sinal com direção (compra ou venda), ponto de entrada e tempo estimado da operação."
              },
              {
                question: "Preciso ter experiência pra usar?",
                answer: "Não! O CriptoEasy foi feito pra quem nunca operou. Você recebe um mini curso junto com os sinais, e pode copiar e colar os comandos direto no seu app de trade. É só seguir."
              },
              {
                question: "Preciso pagar alguma corretora também?",
                answer: "Você vai precisar de uma conta em corretora (grátis) pra operar. A gente não opera por você — mas entrega os sinais prontos, com tudo o que você precisa pra clicar e lucrar."
              },
              {
                question: "Posso cancelar quando quiser?",
                answer: "Sim! Você cancela direto pelo painel, sem burocracia. E se cancelar nos primeiros 7 dias, devolvemos 100% do seu dinheiro, sem perguntas."
              },
              {
                question: "Quanto dá pra lucrar com os sinais?",
                answer: "Depende de quanto você opera e do seu gerenciamento. Temos usuários que começaram com R$50, outros com R$500. A IA tem média de 85% de acerto. Você escolhe o quanto quer arriscar."
              },
              {
                question: "Funciona no celular?",
                answer: "100%. Você pode operar pelo celular, ver os sinais, acessar gráficos e até usar o curso completo direto do navegador."
              },
              {
                question: "A IA opera por mim?",
                answer: "Não. A IA entrega os sinais com todos os dados de entrada. Você decide se quer seguir ou não, mantendo total controle."
              }
            ].map((faq, index) => (
              <FAQItem key={index} question={faq.question} answer={faq.answer} />
            ))}
          </div>
        </div>
      </div>
    )
  }

  
  if (currentScreen === "post-demo") {
    const totalInvested = trades.reduce((sum, trade) => sum + trade.amount, 0)
    const totalProfit = trades.reduce((sum, trade) => sum + (trade.profitLoss || 0), 0)
    const winningTrades = trades.filter((trade) => trade.success).length
    const totalTrades = trades.length
    const accuracy = totalTrades > 0 ? Math.round((winningTrades / totalTrades) * 100) : 0

    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-white relative overflow-hidden">

    // Calculate demo results
    const totalInvested = trades.reduce((sum, trade) => sum + trade.amount, 0)
    const totalProfit = trades.reduce((sum, trade) => sum + (trade.profitLoss || 0), 0)
    const winningTrades = trades.filter((trade) => trade.success).length
    const totalTrades = trades.length
    const accuracy = totalTrades > 0 ? Math.round((winningTrades / totalTrades) * 100) : 0

    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-white relative overflow-hidden">
        {/* Ambient effects */}
        <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-[#0A84FF]/5 rounded-full blur-3xl animate-pulse"></div>
        <div
          className="absolute bottom-1/4 right-1/4 w-24 h-24 bg-[#00D4FF]/5 rounded-full blur-2xl animate-pulse"
          style={{ animationDelay: "1s" }}
        ></div>

        {/* Header */}
        <header className="px-4 py-3 border-b border-gray-800/30 sticky top-0 bg-transparent z-10">
          <div className="flex justify-center items-center">
            <Image
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Design%20sem%20nome%20%2835%29-HgK147qMGVK4vvx4OgkveF7AFRFSBV.png"
              alt="CRIPTOEASY IA Logo"
              width={120}
              height={36}
              className="h-8 sm:h-10 w-auto"
              priority
            />
          </div>
        </header>

        <div className="relative z-10 px-4 py-8 max-w-6xl mx-auto">
          {/* BLOCO 1: Resultado Simulado */}
          <div className="mb-16">
            <div className="text-center mb-8">
              <div className="w-20 h-20 mx-auto rounded-full bg-[#0A84FF]/20 flex items-center justify-center mb-4">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M12 17.27L18.18 21L16.54 13.97L22 9.24L14.81 8.63L12 2L9.19 8.63L2 9.24L7.46 13.97L5.82 21L12 17.27Z"
                    fill="#0A84FF"
                  />
                </svg>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold mb-2">Simulação Finalizada com Sucesso!</h1>
              <p className="text-gray-400 text-sm sm:text-base">Confira agora quanto você teria lucrado com a IA operando por você.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {/* Valor Investido */}
              <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl border border-gray-800 p-6 text-center">
                <div className="w-12 h-12 mx-auto rounded-full bg-blue-500/20 flex items-center justify-center mb-3">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 1L13.5 2.5L16.17 5.17C15.24 5.06 14.32 5 13.4 5H10.6C9.68 5 8.76 5.06 7.83 5.17L10.5 2.5L9 1L3 7V9H21ZM12 8C16.42 8 20 10.79 20 14V16H4V14C4 10.79 7.58 8 12 8Z"
                      fill="#3B82F6"
                    />
                  </svg>
                </div>
                <h3 className="text-sm text-gray-400 mb-1">Valor Investido</h3>
                <p className="text-xl font-bold text-white">R$ {totalInvested.toFixed(2)}</p>
              </div>

              {/* Retorno */}
              <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl border border-gray-800 p-6 text-center">
                <div className="w-12 h-12 mx-auto rounded-full bg-green-500/20 flex items-center justify-center mb-3">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M16 6L18.29 8.29L13.41 13.17L9.41 9.17L2 16.59L3.41 18L9.41 12L13.41 16L19.71 9.71L22 12V6H16Z"
                      fill="#10B981"
                    />
                  </svg>
                </div>
                <h3 className="text-sm text-gray-400 mb-1">Retorno</h3>
                <p className="text-xl font-bold text-white">R$ {(totalInvested + totalProfit).toFixed(2)}</p>
              </div>

              {/* Lucro */}
              <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl border border-gray-800 p-6 text-center">
                <div
                  className={`w-12 h-12 mx-auto rounded-full ${totalProfit >= 0 ? "bg-green-500/20" : "bg-red-500/20"} flex items-center justify-center mb-3`}
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M11.8 10.9C9.53 10.31 8.8 9.7 8.8 8.75C8.8 7.66 9.81 6.9 11.5 6.9C13.28 6.9 13.94 7.75 14 9H16.21C16.14 7.28 15.09 5.7 13 5.19V3H10V5.16C8.06 5.58 6.5 6.84 6.5 8.77C6.5 11.08 8.41 12.23 11.2 12.9C13.7 13.5 14.2 14.38 14.2 15.31C14.2 16 13.71 17.1 11.5 17.1C9.44 17.1 8.63 16.18 8.5 15H6.32C6.44 17.19 8.08 18.42 10 18.83V21H13V18.85C14.95 18.5 16.5 17.35 16.5 15.3C16.5 12.46 14.07 11.5 11.8 10.9Z"
                      fill={totalProfit >= 0 ? "#10B981" : "#EF4444"}
                    />
                  </svg>
                </div>
                <h3 className="text-sm text-gray-400 mb-1">Lucro</h3>
                <p className={`text-xl font-bold ${totalProfit >= 0 ? "text-green-500" : "text-red-500"}`}>
                  {totalProfit >= 0 ? "+" : ""}R$ {totalProfit.toFixed(2)}
                </p>
              </div>

              {/* Precisão da IA */}
              <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl border border-gray-800 p-6 text-center">
                <div className="w-12 h-12 mx-auto rounded-full bg-[#0A84FF]/20 flex items-center justify-center mb-3">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2L13.09 8.26L22 9L13.09 9.74L12 16L10.91 9.74L2 9L10.91 8.26L12 2Z" fill="#0A84FF" />
                  </svg>
                </div>
                <h3 className="text-sm text-gray-400 mb-1">Precisão da IA</h3>
                <p className="text-xl font-bold text-[#0A84FF]">{accuracy}%</p>
              </div>
            </div>
          </div>

          {/* BLOCO 2: Chamada para ação */}
          <div className="mb-16">
            <div className="max-w-md mx-auto">
              <div className="text-center mb-8">
                <h2 className="text-2xl sm:text-3xl font-bold mb-2">Pronto para operar real?</h2>
                <p className="text-gray-400 text-sm sm:text-base">Crie sua conta e comece agora mesmo com os sinais da IA que te entregou esse resultado.</p>
              </div>

              <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl border border-gray-800 p-6">
            
                <form
                  className="space-y-4"
                  onSubmit={(e) => {
                    e.preventDefault()
                    // Navigate to plans page instead of conversion
                    audioManager.current.playSound("click")
                    setCurrentScreen("plans")
                  }}
                >
                  <div>
                    <label htmlFor="fullName" className="block text-sm font-medium text-gray-300 mb-2">
                      Nome completo
                    </label>
                    <input
                      type="text"
                      id="fullName"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg py-3 px-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0A84FF] focus:border-transparent"
                      placeholder="Digite seu nome completo"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                      E-mail
                    </label>
                    <input
                      type="email"
                      id="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg py-3 px-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0A84FF] focus:border-transparent"
                      placeholder="Digite seu e-mail"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                      Senha
                    </label>
                    <input
                      type="password"
                      id="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg py-3 px-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0A84FF] focus:border-transparent"
                      placeholder="Digite sua senha"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-4 bg-gradient-to-r from-[#0A84FF] to-[#00D4FF] text-white font-bold rounded-lg text-lg hover:opacity-90 transition-opacity"
                  >
                    CADASTRAR-SE
                  </button>
                </form>
              </div>
            </div>
          </div>

          {/* BLOCO 3: Por que escolher a CRIPTOEASY */}
          <div className="mb-16">
            <div className="text-center mb-12">
              <h2 className="text-2xl sm:text-3xl font-bold mb-2">Por que escolher a CRIPTOEASY?</h2>
              <p className="text-gray-400 text-sm sm:text-base">
                Nossa plataforma oferece as ferramentas mais avançadas para análise de criptomoedas
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Sinais Rápidos */}
              <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl border border-gray-800 p-6 text-center hover:border-[#0A84FF]/30 transition-colors">
                <div className="w-16 h-16 mx-auto rounded-full bg-[#0A84FF]/20 flex items-center justify-center mb-4">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M13 2.05V5.08C16.39 5.57 19 8.47 19 12C19 12.9 18.82 13.75 18.5 14.54L21.12 16.07C21.68 14.83 22 13.45 22 12C22 6.82 18.05 2.55 13 2.05ZM12 19C8.13 19 5 15.87 5 12C5 8.47 7.61 5.57 11 5.08V2.05C5.94 2.55 2 6.81 2 12C2 17.52 6.48 22 12 22C14.8 22 17.32 20.75 19 18.72L16.37 17.19C15.17 18.43 13.67 19 12 19Z"
                      fill="#0A84FF"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold mb-2 text-white">Sinais Rápidos</h3>
                <p className="text-sm text-gray-400">Análises em tempo real com resultados instantâneos.</p>
              </div>

              {/* Alta Precisão */}
              <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl border border-gray-800 p-6 text-center hover:border-[#0A84FF]/30 transition-colors">
                <div className="w-16 h-16 mx-auto rounded-full bg-green-500/20 flex items-center justify-center mb-4">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2L13.09 8.26L22 9L13.09 9.74L12 16L10.91 9.74L2 9L10.91 8.26L12 2Z" fill="#10B981" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold mb-2 text-white">Alta Precisão</h3>
                <p className="text-sm text-gray-400">IA com taxa de acerto superior a 80%.</p>
              </div>

              {/* Sem Complicações */}
              <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl border border-gray-800 p-6 text-center hover:border-[#0A84FF]/30 transition-colors">
                <div className="w-16 h-16 mx-auto rounded-full bg-purple-500/20 flex items-center justify-center mb-4">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M12 2C6.48 2 2 6.48 2 12S6.48 22 12 22 22 17.52 22 12 17.52 2 12 2ZM10 17L5 12L6.41 10.59L10 14.17L17.59 6.58L19 8L10 17Z"
                      fill="#8B5CF6"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold mb-2 text-white">Sem Complicações</h3>
                <p className="text-sm text-gray-400">Interface simples e intuitiva.</p>
              </div>

              {/* Operações Simplificadas */}
              <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl border border-gray-800 p-6 text-center hover:border-[#0A84FF]/30 transition-colors">
                <div className="w-16 h-16 mx-auto rounded-full bg-orange-500/20 flex items-center justify-center mb-4">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M3 13H11V3H3V13ZM3 21H11V15H3V21ZM13 21H21V11H13V21ZM13 3V9H21V3H13Z" fill="#F97316" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold mb-2 text-white">Operações Simplificadas</h3>
                <p className="text-sm text-gray-400">RSI, MACD, EMAs e mais no mesmo lugar.</p>
              </div>

              {/* Seguro e Confiável */}
              <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl border border-gray-800 p-6 text-center hover:border-[#0A84FF]/30 transition-colors">
                <div className="w-16 h-16 mx-auto rounded-full bg-red-500/20 flex items-center justify-center mb-4">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M12 1L3 5V11C3 16.55 6.84 21.74 12 23C17.16 21.74 21 16.55 21 11V5L12 1ZM10 17L5 12L6.41 10.59L10 14.17L17.59 6.58L19 8L10 17Z"
                      fill="#EF4444"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold mb-2 text-white">Seguro e Confiável</h3>
                <p className="text-sm text-gray-400">Conexões seguras e dados criptografados.</p>
              </div>

              {/* IA Avançada */}
              <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl border border-gray-800 p-6 text-center hover:border-[#0A84FF]/30 transition-colors">
                <div className="w-16 h-16 mx-auto rounded-full bg-cyan-500/20 flex items-center justify-center mb-4">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M12 2C6.48 2 2 6.48 2 12S6.48 22 12 22 22 17.52 22 12 17.52 2 12 2ZM12 6C13.93 6 15.5 7.57 15.5 9.5S13.93 13 12 13 8.5 11.43 8.5 9.5 10.07 6 12 6ZM12 20C9.97 20 8.18 19.17 6.81 17.89C7.21 16.65 9.31 15.9 12 15.9S16.79 16.65 17.19 17.89C15.82 19.17 14.03 20 12 20Z"
                      fill="#06B6D4"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold mb-2 text-white">IA Avançada</h3>
                <p className="text-sm text-gray-400">Algoritmos que aprendem com o mercado em tempo real.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Adicionar a nova tela de planos antes do return final
  if (currentScreen === "plans") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-white relative overflow-hidden">
        {/* Ambient light effects */}
        <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-[#0A84FF]/5 rounded-full blur-3xl animate-pulse"></div>
        <div
          className="absolute bottom-1/4 right-1/4 w-24 h-24 bg-[#00D4FF]/5 rounded-full blur-2xl animate-pulse"
          style={{ animationDelay: "1s" }}
        ></div>

{showSpecialOfferPopup && (
  <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
    <div className="relative w-full max-w-md bg-[#0a0a1a] border border-[#1f1f2e] rounded-2xl shadow-xl p-6 space-y-6 overflow-y-auto max-h-[80vh] scrollbar-thin scrollbar-thumb-[#0A84FF]/60 scrollbar-track-transparent">

      {/* 🔥 Selo de Urgência */}
      <div className="absolute top-0 left-0 right-0 flex justify-center z-20">
        <div className="bg-red-600 text-white text-xs font-bold px-4 py-1 rounded-b-full shadow-md">
          SOMENTE HOJE
        </div>
      </div>

      {/* Header */}
      <div className="text-center space-y-2">
        <div className="w-16 h-16 mx-auto bg-gradient-to-br from-[#0A84FF] to-[#00D4FF] rounded-full flex items-center justify-center text-2xl">
          🔓
        </div>
        <h2 className="text-2xl font-bold text-white">Oferta secreta liberada!</h2>
        <p className="text-gray-300 text-sm">
          Plano Anual por apenas <span className="text-white font-semibold">R$99,90</span> no primeiro ano
        </p>
        <p className="text-green-400 text-sm font-semibold">(economize 80%)</p>
      </div>

      {/* Preço Comparativo */}
      <div className="flex items-center justify-center gap-4 bg-black/30 rounded-xl py-2">
        <span className="text-red-500 line-through text-sm">R$499,90</span>
        <span className="text-lg font-bold text-white">
          <span className="text-[#00FF88]">R$99,90</span>
        </span>
      </div>

      {/* Benefícios */}
      <ul className="space-y-2 text-sm text-white">
        <li className="flex items-start gap-2"><span>✅</span> Tudo do plano mensal</li>
        <li className="flex items-start gap-2"><span>✅</span> Grupo VIP no Telegram</li>
        <li className="flex items-start gap-2"><span>✅</span> Aula de Alavancagem R$100 → R$10.000</li>
        <li className="flex items-start gap-2"><span>✅</span> Curso emocional e psicológico para traders</li>
        <li className="flex items-start gap-2"><span>✅</span> Relatórios futuros</li>
        <li className="flex items-start gap-2"><span>✅</span> Comunidade vitalícia</li>
        <li className="flex items-start gap-2"><span>✅</span> Suporte completo</li>
      </ul>

      {/* Urgência */}
      <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3">
        <p className="text-yellow-400 text-xs text-center">
          ⚠️ Esta oferta é exclusiva e não aparecerá novamente
        </p>
      </div>

      {/* Ações */}
      <div className="space-y-2">
        <button
          onClick={() => {
            setShowSpecialOfferPopup(false)
            window.open("https://pay.kirvano.com/684a50bf-6d0a-49ce-9f58-ba7eb65fba70", "_blank")
          }}
          className="w-full py-3 bg-green-500 text-white font-bold rounded-xl hover:bg-green-600 transition"
        >
          QUERO O PLANO ANUAL COM DESCONTO
        </button>

        <button
          onClick={() => {
            setShowSpecialOfferPopup(false)
            window.open("https://pay.kirvano.com/9304f9d2-7688-4bcd-a6bd-d49f9ec851a7", "_blank")
          }}
          className="w-full text-gray-400 text-sm hover:text-white transition"
        >
          Prefiro continuar com o plano mensal
        </button>
      </div>

    </div>
  </div>
)}


        <div className="max-w-6xl mx-auto px-4 py-12 relative z-10">
          {/* TOPO DA PÁGINA - Confirmação do Cadastro */}
          <div className="text-center mb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="w-20 h-20 mx-auto rounded-full bg-green-500/20 flex items-center justify-center mb-4 relative">
              <div className="absolute inset-0 rounded-full border-4 border-green-500/30 animate-ping"></div>
              <div className="text-3xl animate-bounce">✓</div>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold mb-2">Cadastro realizado com sucesso</h1>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Agora é hora de destravar sinais em tempo real com a nossa IA
            </p>
          </div>

          {/* BLOCO PRINCIPAL - Planos */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
           {/* Plano Mensal */}
<div className="bg-gray-900/50 backdrop-blur-sm rounded-xl border border-green-500/30 p-6 relative overflow-visible group hover:border-green-500/50 transition-all duration-300 hover:scale-[1.02]">
  
  {/* Selo "TRADER INICIANTE" no topo */}
  <div className="w-full bg-green-500 text-white text-[10px] font-semibold py-1 px-4 rounded-t-xl text-center tracking-wide mb-4">
    TRADER INICIANTE
  </div>

              {/* Efeito de brilho no canto */}
              <div className="absolute -top-10 -left-10 w-20 h-20 bg-green-500/20 rounded-full blur-xl"></div>

              <div className="text-center mb-6">
                <h2 className="text-xl font-bold text-green-400 mb-1">PLANO MENSAL</h2>
                <div className="text-3xl font-bold mb-1">
                  R$49,90<span className="text-sm text-gray-400"> / mês</span>
                </div>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex items-start gap-2">
                  <div className="text-green-400 flex-shrink-0 mt-0.5">✅</div>
                  <div className="text-sm">Sinais em Tempo Real e Sem Delay</div>
                </div>
                <div className="flex items-start gap-2">
                  <div className="text-green-400 flex-shrink-0 mt-0.5">✅</div>
                  <div className="text-sm">Leitura Baseada em Volume Real de Mercado</div>
                </div>
                <div className="flex items-start gap-2">
                  <div className="text-green-400 flex-shrink-0 mt-0.5">✅</div>
                  <div className="text-sm">Suporte 24h para tirar dúvidas</div>
                </div>
                <div className="flex items-start gap-2">
                  <div className="text-green-400 flex-shrink-0 mt-0.5">✅</div>
                  <div className="text-sm">Aulas para aprender a operar do absoluto zero com a IA</div>
                </div>
                <div className="flex items-start gap-2">
                  <div className="text-red-400 flex-shrink-0 mt-0.5">❌</div>
                  <div className="text-sm text-gray-400">Aula de alavancagem de R$100 a R$10.000</div>
                </div>
                <div className="flex items-start gap-2">
                  <div className="text-red-400 flex-shrink-0 mt-0.5">❌</div>
                  <div className="text-sm text-gray-400">Comunidade Exclusiva no Telegram</div>
                </div>
                <div className="flex items-start gap-2">
                  <div className="text-red-400 flex-shrink-0 mt-0.5">❌</div>
                  <div className="text-sm text-gray-400">Grupo de Oportunidades Diárias</div>
                </div>
              </div>

              <button
                onClick={() => setShowSpecialOfferPopup(true)}
                className="w-full py-3 bg-green-500 text-white font-medium rounded-lg hover:bg-green-600 transition-colors"
              >
                ASSINAR MENSAL
              </button>
            </div>

           {/* Plano Anual */}
<div className="bg-gray-900/50 backdrop-blur-sm rounded-xl border border-purple-500/30 p-6 relative overflow-visible group hover:border-purple-500/50 transition-all duration-300 hover:scale-[1.02]">
  
  {/* Selo "TRADER PROFISSIONAL" no topo */}
  <div className="w-full bg-purple-500 text-white text-[10px] font-semibold py-1 px-4 rounded-t-xl text-center tracking-wide mb-4">
    TRADER PROFISSIONAL
  </div>

              {/* Efeito de brilho no canto */}
              <div className="absolute -top-10 -left-10 w-20 h-20 bg-purple-500/20 rounded-full blur-xl"></div>

              <div className="text-center mb-6">
                <h2 className="text-xl font-bold text-purple-400 mb-1">PLANO ANUAL</h2>
                <div className="text-3xl font-bold mb-1">
                  R$499,90<span className="text-sm text-gray-400"> / ano</span>
                </div>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex items-start gap-2">
                  <div className="text-purple-400 flex-shrink-0 mt-0.5">✅</div>
                  <div className="text-sm">Sinais em Tempo Real e Sem Delay</div>
                </div>
                <div className="flex items-start gap-2">
                  <div className="text-purple-400 flex-shrink-0 mt-0.5">✅</div>
                  <div className="text-sm">Leitura Baseada em Volume Real de Mercado</div>
                </div>
                <div className="flex items-start gap-2">
                  <div className="text-purple-400 flex-shrink-0 mt-0.5">✅</div>
                  <div className="text-sm">Suporte 24h para tirar dúvidas</div>
                </div>
                <div className="flex items-start gap-2">
                  <div className="text-purple-400 flex-shrink-0 mt-0.5">✅</div>
                  <div className="text-sm">Aulas para aprender a operar do absoluto zero com a IA</div>
                </div>
                <div className="flex items-start gap-2">
                  <div className="text-purple-400 flex-shrink-0 mt-0.5">✅</div>
                  <div className="text-sm font-medium">Aula de alavancagem de R$100 a R$10.000 com IA</div>
                </div>
                <div className="flex items-start gap-2">
                  <div className="text-purple-400 flex-shrink-0 mt-0.5">✅</div>
                  <div className="text-sm font-medium">Comunidade Exclusiva no Telegram</div>
                </div>
                <div className="flex items-start gap-2">
                  <div className="text-purple-400 flex-shrink-0 mt-0.5">✅</div>
                  <div className="text-sm font-medium">Grupo de Oportunidades Diárias</div>
                </div>
                <div className="flex items-start gap-2">
                  <div className="text-purple-400 flex-shrink-0 mt-0.5">✅</div>
                  <div className="text-sm font-medium">Acesso vitalício aos bônus futuros</div>
                </div>
              </div>
            <button
  onClick={() =>
    window.open("https://pay.kirvano.com/e227c6fa-c767-4144-83fd-eafcd225e59e", "_blank")
  }
  className="w-full py-3 bg-purple-500 text-white font-medium rounded-lg hover:bg-purple-600 transition-colors"
>
  ASSINAR ANUAL
</button>
            </div>
          </div>
          {/* BLOCO FINAL - Garantia */}
          <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl border border-gray-800 p-6 text-center max-w-xl mx-auto">
            <div className="w-16 h-16 mx-auto rounded-full bg-blue-500/20 flex items-center justify-center mb-4">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M12 1L3 5V11C3 16.55 6.84 21.74 12 23C17.16 21.74 21 16.55 21 11V5L12 1ZM12 11.99H19C18.47 16.11 15.72 19.78 12 20.93V12H5V6.3L12 3.19V11.99Z"
                  fill="#0A84FF"
                />
              </svg>
            </div>
            <p className="text-gray-300 text-sm">
              Você está protegido por uma <span className="text-white font-medium">garantia de 7 dias</span>. Cancele
              quando quiser e receba <span className="text-white font-medium">100% do valor de volta</span>.
            </p>
          </div>

          {/* BLOCO FAQ */}
          <div className="mt-16">
            <div className="text-center mb-12">
              <h2 className="text-2xl sm:text-3xl font-bold mb-2">Dúvidas Frequentes (FAQ)</h2>
              <p className="text-gray-400 text-sm sm:text-base">
                Tire suas principais dúvidas sobre o CriptoEasy
              </p>
            </div>

            <div className="max-w-4xl mx-auto space-y-4">
              {[
                {
                  question: "Como funcionam os sinais da IA?",
                  answer: "Nossa IA analisa o mercado em tempo real com leitura de volume, RSI, MACD e mais. Quando ela encontra uma oportunidade de entrada, você recebe um sinal com direção (compra ou venda), ponto de entrada e tempo estimado da operação."
                },
                {
                  question: "Preciso ter experiência pra usar?",
                  answer: "Não! O CriptoEasy foi feito pra quem nunca operou. Você recebe um mini curso junto com os sinais, e pode copiar e colar os comandos direto no seu app de trade. É só seguir."
                },
                {
                  question: "Preciso pagar alguma corretora também?",
                  answer: "Você vai precisar de uma conta em corretora (grátis) pra operar. A gente não opera por você — mas entrega os sinais prontos, com tudo o que você precisa pra clicar e lucrar."
                },
                {
                  question: "Posso cancelar quando quiser?",
                  answer: "Sim! Você cancela direto pelo painel, sem burocracia. E se cancelar nos primeiros 7 dias, devolvemos 100% do seu dinheiro, sem perguntas."
                },
                {
                  question: "Quanto dá pra lucrar com os sinais?",
                  answer: "Depende de quanto você opera e do seu gerenciamento. Temos usuários que começaram com R$50, outros com R$500. A IA tem média de 85% de acerto. Você escolhe o quanto quer arriscar."
                },
                {
                  question: "Funciona no celular?",
                  answer: "100%. Você pode operar pelo celular, ver os sinais, acessar gráficos e até usar o curso completo direto do navegador."
                },
                {
                  question: "A IA opera por mim?",
                  answer: "Não. A IA entrega os sinais com todos os dados de entrada. Você decide se quer seguir ou não, mantendo total controle."
                }
              ].map((faq, index) => (
                <FAQItem key={index} question={faq.question} answer={faq.answer} />
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  
  if (currentScreen === "post-demo") {
    const totalInvested = trades.reduce((sum, trade) => sum + trade.amount, 0)
    const totalProfit = trades.reduce((sum, trade) => sum + (trade.profitLoss || 0), 0)
    const winningTrades = trades.filter((trade) => trade.success).length
    const totalTrades = trades.length
    const accuracy = totalTrades > 0 ? Math.round((winningTrades / totalTrades) * 100) : 0

    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-white relative overflow-hidden">

    // Calculate demo results
    const totalInvested = trades.reduce((sum, trade) => sum + trade.amount, 0)
    const totalProfit = trades.reduce((sum, trade) => sum + (trade.profitLoss || 0), 0)
    const winningTrades = trades.filter((trade) => trade.success).length
    const totalTrades = trades.length
    const accuracy = totalTrades > 0 ? Math.round((winningTrades / totalTrades) * 100) : 0

    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-white relative overflow-hidden">
        {/* Ambient effects */}
        <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-[#0A84FF]/5 rounded-full blur-3xl animate-pulse"></div>
        <div
          className="absolute bottom-1/4 right-1/4 w-24 h-24 bg-[#00D4FF]/5 rounded-full blur-2xl animate-pulse"
          style={{ animationDelay: "1s" }}
        ></div>

        {/* Header */}
        <header className="px-4 py-3 border-b border-gray-800/30 sticky top-0 bg-transparent z-10">
          <div className="flex justify-center items-center">
            <Image
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Design%20sem%20nome%20%2835%29-HgK147qMGVK4vvx4OgkveF7AFRFSBV.png"
              alt="CRIPTOEASY IA Logo"
              width={120}
              height={36}
              className="h-8 sm:h-10 w-auto"
              priority
            />
          </div>
        </header>

        <div className="relative z-10 px-4 py-8 max-w-6xl mx-auto">
          {/* BLOCO 1: Resultado Simulado */}
          <div className="mb-16">
            <div className="text-center mb-8">
              <div className="w-20 h-20 mx-auto rounded-full bg-[#0A84FF]/20 flex items-center justify-center mb-4">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M12 17.27L18.18 21L16.54 13.97L22 9.24L14.81 8.63L12 2L9.19 8.63L2 9.24L7.46 13.97L5.82 21L12 17.27Z"
                    fill="#0A84FF"
                  />
                </svg>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold mb-2">Simulação Finalizada com Sucesso!</h1>
              <p className="text-gray-400 text-sm sm:text-base">Confira agora quanto você teria lucrado com a IA operando por você.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {/* Valor Investido */}
              <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl border border-gray-800 p-6 text-center">
                <div className="w-12 h-12 mx-auto rounded-full bg-\
