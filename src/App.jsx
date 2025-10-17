import { useState, useEffect, useRef } from 'react'

function App() {
  // State管理
  const [height, setHeight] = useState(2)
  const [stripCount, setStripCount] = useState(5)
  const [pattern, setPattern] = useState('waterfall')
  const [color, setColor] = useState('#ffffff')
  const [speed, setSpeed] = useState(15)
  const [isPlaying, setIsPlaying] = useState(false)
  const [ledStates, setLedStates] = useState([])

  const frameRef = useRef(0)
  const animationRef = useRef(null)

  const ledCount = 40 // 2m ÷ 5cm間隔 = 40個

  // プリセットカラー
  const presetColors = [
    { name: '白', value: '#ffffff' },
    { name: 'シアン', value: '#00ffff' },
    { name: 'マゼンタ', value: '#ff0080' },
    { name: 'グリーン', value: '#00ff00' },
    { name: 'イエロー', value: '#ffff00' },
    { name: 'オレンジ', value: '#ff8800' },
    { name: 'パープル', value: '#8800ff' },
  ]

  // LED状態の初期化
  useEffect(() => {
    const initialStates = Array(stripCount).fill(0).map(() =>
      Array(ledCount).fill(0)
    )
    setLedStates(initialStates)
  }, [stripCount, ledCount])

  // アニメーションループ
  useEffect(() => {
    if (!isPlaying) {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
      return
    }

    const animate = () => {
      frameRef.current += speed / 100
      const newStates = Array(stripCount).fill(0).map(() =>
        Array(ledCount).fill(0)
      )

      switch(pattern) {
        case 'waterfall': {
          // 滝（上から下へ連続的に大量の水が流れる）
          for (let strip = 0; strip < stripCount; strip++) {
            const offset = strip * 5
            // 複数の水の流れを重ねて連続的な滝を表現
            for (let flow = 0; flow < 8; flow++) {
              const flowOffset = flow * 10
              for (let i = 0; i < ledCount; i++) {
                const position = (frameRef.current + offset + flowOffset) % (ledCount + 10)
                if (position >= i && position < i + 8) {
                  const distance = position - i
                  const intensity = Math.max(0, 1 - distance / 8)
                  newStates[strip][i] = Math.max(newStates[strip][i], intensity * 0.9)
                }
              }
            }
          }
          break
        }

        case 'reverse': {
          // 逆滝（下から上へ）
          for (let strip = 0; strip < stripCount; strip++) {
            const offset = strip * 10
            for (let i = 0; i < ledCount; i++) {
              const position = ledCount - 1 - ((frameRef.current + offset) % (ledCount + 20))
              if (position >= i - 15 && position <= i) {
                const distance = i - position
                newStates[strip][i] = Math.max(0, 1 - distance / 15)
              }
            }
          }
          break
        }

        case 'rain': {
          // 雨（複数の水滴が落ちる）
          for (let strip = 0; strip < stripCount; strip++) {
            for (let drop = 0; drop < 3; drop++) {
              const offset = drop * 25 + strip * 7
              const position = (frameRef.current + offset) % (ledCount + 10)
              if (position < ledCount) {
                newStates[strip][Math.floor(position)] = 1
                if (position > 0) {
                  newStates[strip][Math.floor(position) - 1] = 0.3
                }
              }
            }
          }
          break
        }

        case 'snow': {
          // 雪（ゆっくり落ちる雪の結晶）
          for (let strip = 0; strip < stripCount; strip++) {
            for (let flake = 0; flake < 4; flake++) {
              const offset = flake * 20 + strip * 7
              const position = (frameRef.current * 0.4 + offset) % (ledCount + 25)
              if (position < ledCount) {
                const idx = Math.floor(position)
                // 雪の結晶：中心が明るく、周辺が少し光る
                newStates[strip][idx] = 1.0
                if (idx > 0) {
                  newStates[strip][idx - 1] = Math.max(newStates[strip][idx - 1], 0.3)
                }
                if (idx < ledCount - 1) {
                  newStates[strip][idx + 1] = Math.max(newStates[strip][idx + 1], 0.3)
                }
              }
            }
          }
          break
        }

        case 'meteor': {
          // 流星（ポツリポツリと流れ星が流れる）
          for (let strip = 0; strip < stripCount; strip++) {
            // 長い間隔で流星が現れる（ledCountの3倍の周期）
            const offset = strip * 50
            const position = (frameRef.current * 1.2 + offset) % (ledCount * 3)

            // 流星が画面内にいる時だけ表示
            if (position < ledCount + 30) {
              for (let i = 0; i < ledCount; i++) {
                // 長い尾を引く流れ星
                if (position >= i && position < i + 30) {
                  const distance = position - i
                  // 先端が明るく、尾に向かって暗くなる
                  const intensity = Math.max(0, 1 - Math.pow(distance / 30, 1.5))
                  newStates[strip][i] = intensity
                }
              }
            }
          }
          break
        }

        case 'lightning': {
          // 雷（ランダムフラッシュ）
          if (Math.random() > 0.95) {
            for (let strip = 0; strip < stripCount; strip++) {
              for (let i = 0; i < ledCount; i++) {
                newStates[strip][i] = Math.random() > 0.3 ? 1 : 0
              }
            }
          }
          break
        }

        case 'fire': {
          // 炎（ゆらゆら揺れる）
          for (let strip = 0; strip < stripCount; strip++) {
            for (let i = 0; i < ledCount; i++) {
              const flicker = Math.sin(frameRef.current * 0.1 + i * 0.5 + strip) * 0.5 + 0.5
              const gradient = (ledCount - i) / ledCount
              newStates[strip][i] = gradient * flicker
            }
          }
          break
        }

        case 'wave': {
          // 波（サインカーブで上下）
          for (let strip = 0; strip < stripCount; strip++) {
            for (let i = 0; i < ledCount; i++) {
              const wave = Math.sin((i / ledCount) * Math.PI * 2 - frameRef.current / 20 + strip * 0.5) * 0.5 + 0.5
              newStates[strip][i] = wave
            }
          }
          break
        }

        case 'scanner': {
          // スキャナー（行ったり来たり）
          const position = (Math.sin(frameRef.current / 30) * 0.5 + 0.5) * ledCount
          for (let strip = 0; strip < stripCount; strip++) {
            for (let i = 0; i < ledCount; i++) {
              const distance = Math.abs(position - i)
              newStates[strip][i] = Math.max(0, 1 - distance / 5)
            }
          }
          break
        }

        case 'chase': {
          // チェイス（順番に点灯）
          for (let strip = 0; strip < stripCount; strip++) {
            const offset = strip * 5
            const position = (frameRef.current + offset) % ledCount
            for (let i = 0; i < ledCount; i++) {
              if (Math.floor(position) === i) {
                newStates[strip][i] = 1
              }
            }
          }
          break
        }

        case 'theater': {
          // シアターチェイス（3つおきに移動）
          const phase = Math.floor(frameRef.current / 10) % 3
          for (let strip = 0; strip < stripCount; strip++) {
            for (let i = 0; i < ledCount; i++) {
              if (i % 3 === phase) {
                newStates[strip][i] = 1
              }
            }
          }
          break
        }

        case 'arrow_down': {
          // 矢印（下向き）
          const pos = Math.floor(frameRef.current / 5) % ledCount
          for (let strip = 0; strip < stripCount; strip++) {
            for (let i = 0; i < ledCount; i++) {
              if (i === pos) {
                newStates[strip][i] = 1
              } else if (i === pos - 1 && strip > 0 && strip < stripCount - 1) {
                if (strip === Math.floor(stripCount / 2)) {
                  newStates[strip - 1][i] = 0.5
                  newStates[strip + 1][i] = 0.5
                }
              }
            }
          }
          break
        }

        case 'arrow_up': {
          // 矢印（上向き）
          const pos = ledCount - 1 - (Math.floor(frameRef.current / 5) % ledCount)
          for (let strip = 0; strip < stripCount; strip++) {
            for (let i = 0; i < ledCount; i++) {
              if (i === pos) {
                newStates[strip][i] = 1
              } else if (i === pos + 1 && strip > 0 && strip < stripCount - 1) {
                if (strip === Math.floor(stripCount / 2)) {
                  newStates[strip - 1][i] = 0.5
                  newStates[strip + 1][i] = 0.5
                }
              }
            }
          }
          break
        }

        case 'stripe': {
          // ストライプ（横縞スクロール）
          const offset = Math.floor(frameRef.current / 5) % 10
          for (let strip = 0; strip < stripCount; strip++) {
            for (let i = 0; i < ledCount; i++) {
              if ((i + offset) % 10 < 5) {
                newStates[strip][i] = 1
              }
            }
          }
          break
        }

        case 'dot': {
          // ドット（点滅パターン）
          const phase = Math.floor(frameRef.current / 10) % 2
          for (let strip = 0; strip < stripCount; strip++) {
            for (let i = 0; i < ledCount; i++) {
              if (i % 4 === 0 && phase === 0) {
                newStates[strip][i] = 1
              } else if (i % 4 === 2 && phase === 1) {
                newStates[strip][i] = 1
              }
            }
          }
          break
        }

        case 'gradient': {
          // グラデーション（波打つ）
          for (let strip = 0; strip < stripCount; strip++) {
            for (let i = 0; i < ledCount; i++) {
              const wave = Math.sin((i / ledCount) * Math.PI * 4 - frameRef.current / 20) * 0.5 + 0.5
              newStates[strip][i] = wave
            }
          }
          break
        }

        case 'sparkle': {
          // きらめき（ランダム点灯）
          for (let strip = 0; strip < stripCount; strip++) {
            for (let i = 0; i < ledCount; i++) {
              if (Math.random() > 0.95) {
                newStates[strip][i] = 1
              }
            }
          }
          break
        }

        case 'twinkle': {
          // ゆっくり点滅
          for (let strip = 0; strip < stripCount; strip++) {
            for (let i = 0; i < ledCount; i++) {
              const twinkle = Math.sin(frameRef.current / 20 + i * 0.5 + strip * 0.3) * 0.5 + 0.5
              if (twinkle > 0.7) {
                newStates[strip][i] = twinkle
              }
            }
          }
          break
        }

        case 'flash': {
          // フラッシュ（全体点滅）
          const flash = Math.floor(frameRef.current / 10) % 2
          for (let strip = 0; strip < stripCount; strip++) {
            for (let i = 0; i < ledCount; i++) {
              newStates[strip][i] = flash
            }
          }
          break
        }

        case 'heartbeat': {
          // 鼓動（ドクンドクン）
          const beat = Math.abs(Math.sin(frameRef.current / 15)) * Math.abs(Math.sin(frameRef.current / 15))
          for (let strip = 0; strip < stripCount; strip++) {
            for (let i = 0; i < ledCount; i++) {
              newStates[strip][i] = beat
            }
          }
          break
        }

        case 'text': {
          // テキスト表示（"LED"の文字が上から下にスクロール）
          // 各テープに文字パターンを表示（5x7ドットフォント風）
          const message = "LED"
          const charHeight = 10
          const gap = 5
          const totalHeight = message.length * (charHeight + gap)
          const scrollPos = Math.floor(frameRef.current / 3) % (ledCount + totalHeight)

          for (let strip = 0; strip < stripCount; strip++) {
            for (let i = 0; i < ledCount; i++) {
              // スクロール位置を計算
              const pos = (i + scrollPos) % (ledCount + totalHeight)

              // 簡単なパターン：各文字を点滅で表現
              if (pos < charHeight) {
                // "L"
                if (strip === 0 || strip === Math.floor(stripCount / 2) || strip === stripCount - 1) {
                  newStates[strip][i] = 1
                }
              } else if (pos >= charHeight + gap && pos < charHeight * 2 + gap) {
                // "E"
                if ((pos - charHeight - gap) % 3 === 0 || strip === 0 || strip === stripCount - 1) {
                  newStates[strip][i] = 1
                }
              } else if (pos >= charHeight * 2 + gap * 2 && pos < charHeight * 3 + gap * 2) {
                // "D"
                if (strip === 0 || strip === stripCount - 1 ||
                    (pos - charHeight * 2 - gap * 2) % 5 === 0) {
                  newStates[strip][i] = 1
                }
              }
            }
          }
          break
        }

        default:
          break
      }

      setLedStates(newStates)
      animationRef.current = requestAnimationFrame(animate)
    }

    animationRef.current = requestAnimationFrame(animate)

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [stripCount, pattern, speed, isPlaying])

  // RGB値を計算
  const hexToRgb = (hex) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : { r: 0, g: 255, b: 255 }
  }

  const rgb = hexToRgb(color)

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 text-white p-3 sm:p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* ヘッダー */}
        <header className="text-center mb-4 md:mb-6 lg:mb-8">
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-2">
            LEDイルミネーション シミュレーター
          </h1>
          <p className="text-gray-300 text-xs sm:text-sm md:text-base">
            建物から垂直に垂らすLEDテープの視覚効果を確認
          </p>
        </header>

        <div className="grid lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8">
          {/* コントロールパネル */}
          <div className="lg:col-span-1 space-y-4 md:space-y-6">
            {/* パターン選択 */}
            <div className="bg-gray-800 rounded-lg p-4 sm:p-5 md:p-6 shadow-xl">
              <h2 className="text-lg md:text-xl font-semibold mb-3 md:mb-4">パターン選択</h2>
              <select
                value={pattern}
                onChange={(e) => setPattern(e.target.value)}
                className="w-full bg-gray-700 text-white rounded px-4 py-2 border border-gray-600 focus:border-cyan-500 focus:outline-none"
              >
                <optgroup label="自然現象系">
                  <option value="waterfall">💧 滝</option>
                  <option value="reverse">⬆️ 逆滝</option>
                  <option value="rain">🌧️ 雨</option>
                  <option value="snow">❄️ 雪</option>
                  <option value="meteor">☄️ 流星</option>
                  <option value="lightning">⚡ 雷</option>
                  <option value="fire">🔥 炎</option>
                </optgroup>
                <optgroup label="波・動き系">
                  <option value="wave">🌊 波</option>
                  <option value="scanner">📡 スキャナー</option>
                  <option value="chase">🏃 チェイス</option>
                  <option value="theater">🎭 シアターチェイス</option>
                  <option value="arrow_down">⬇️ 矢印（下）</option>
                  <option value="arrow_up">⬆️ 矢印（上）</option>
                </optgroup>
                <optgroup label="パターン系">
                  <option value="stripe">📏 ストライプ</option>
                  <option value="dot">⚫ ドット</option>
                  <option value="gradient">🌈 グラデーション</option>
                </optgroup>
                <optgroup label="光の効果系">
                  <option value="sparkle">✨ きらめき</option>
                  <option value="twinkle">💫 トゥインクル</option>
                  <option value="flash">💥 フラッシュ</option>
                  <option value="heartbeat">💓 鼓動</option>
                </optgroup>
                <optgroup label="テキスト系">
                  <option value="text">📝 テキスト</option>
                </optgroup>
              </select>
            </div>

            {/* パラメータ調整 */}
            <div className="bg-gray-800 rounded-lg p-4 sm:p-5 md:p-6 shadow-xl space-y-3 md:space-y-4">
              <h2 className="text-lg md:text-xl font-semibold mb-3 md:mb-4">パラメータ調整</h2>

              <div>
                <label className="block text-sm mb-2">
                  高さ: {height}m
                </label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={height}
                  onChange={(e) => setHeight(Number(e.target.value))}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm mb-2">
                  テープ本数: {stripCount}本
                </label>
                <input
                  type="range"
                  min="1"
                  max="15"
                  value={stripCount}
                  onChange={(e) => setStripCount(Number(e.target.value))}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm mb-2">
                  速度: {speed}
                </label>
                <input
                  type="range"
                  min="0"
                  max="30"
                  value={speed}
                  onChange={(e) => setSpeed(Number(e.target.value))}
                  className="w-full"
                />
              </div>
            </div>

            {/* カラー選択 */}
            <div className="bg-gray-800 rounded-lg p-4 sm:p-5 md:p-6 shadow-xl">
              <h2 className="text-lg md:text-xl font-semibold mb-3 md:mb-4">カラー選択</h2>

              <div className="mb-4">
                <label className="block text-sm mb-2">カスタムカラー</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="w-16 h-10 rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="flex-1 bg-gray-700 text-white rounded px-3 py-2 border border-gray-600 focus:border-cyan-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm mb-2">プリセット</label>
                <div className="grid grid-cols-3 gap-2">
                  {presetColors.map((preset) => (
                    <button
                      key={preset.value}
                      onClick={() => setColor(preset.value)}
                      className="p-3 rounded border-2 transition-all hover:scale-105"
                      style={{
                        backgroundColor: preset.value,
                        borderColor: color === preset.value ? '#fff' : 'transparent'
                      }}
                      title={preset.name}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* 再生コントロール */}
            <div className="bg-gray-800 rounded-lg p-4 sm:p-5 md:p-6 shadow-xl">
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors text-sm sm:text-base"
              >
                {isPlaying ? '⏸️ 一時停止' : '▶️ 再生'}
              </button>
            </div>
          </div>

          {/* プレビュー画面 */}
          <div className="lg:col-span-2">
            <div className="bg-gray-800 rounded-lg p-4 sm:p-5 md:p-6 shadow-xl">
              <h2 className="text-lg md:text-xl font-semibold mb-3 md:mb-4">プレビュー</h2>
              <div className="bg-black rounded-lg p-4 sm:p-6 md:p-8 overflow-auto">
                <div
                  className="flex justify-center gap-2 sm:gap-3 md:gap-4"
                  style={{
                    minHeight: `${height * 80}px`,
                  }}
                >
                  {Array.from({ length: stripCount }).map((_, stripIndex) => (
                    <div
                      key={stripIndex}
                      className="flex flex-col gap-1"
                    >
                      {Array.from({ length: ledCount }).map((_, ledIndex) => {
                        const intensity = ledStates[stripIndex]?.[ledIndex] || 0
                        const ledWidth = window.innerWidth < 640 ? 8 : window.innerWidth < 768 ? 10 : 12
                        const ledHeight = (height * 80 / ledCount)
                        return (
                          <div
                            key={ledIndex}
                            className="rounded-full transition-opacity"
                            style={{
                              width: `${ledWidth}px`,
                              height: `${ledHeight}px`,
                              backgroundColor: intensity > 0 ? `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})` : 'transparent',
                              opacity: intensity > 0 ? intensity : 1,
                              border: '1px solid rgba(255, 255, 255, 0.1)',
                              boxShadow: intensity > 0.5 ? `0 0 10px rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${intensity})` : 'none',
                            }}
                          />
                        )
                      })}
                    </div>
                  ))}
                </div>
              </div>

              {/* 情報表示 */}
              <div className="mt-4 p-4 bg-gray-900 rounded text-sm text-gray-300">
                <div className="grid grid-cols-2 gap-2">
                  <div>LED数/テープ: <span className="text-cyan-400">{ledCount}個</span></div>
                  <div>総LED数: <span className="text-cyan-400">{ledCount * stripCount}個</span></div>
                  <div>高さ: <span className="text-cyan-400">{height}m</span></div>
                  <div>LED密度: <span className="text-cyan-400">{Math.floor(ledCount / height)}個/m</span></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* フッター */}
        <footer className="text-center mt-6 md:mt-8 text-gray-400 text-xs sm:text-sm">
          <p>© 2025 LED Illumination Simulator v1.0</p>
          <p className="mt-1">大学先生向け提案用シミュレーター</p>
        </footer>
      </div>
    </div>
  )
}

export default App
