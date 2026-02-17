import { useState, useCallback } from "react";
import { Settings, RotateCcw, Moon, Sun, Bot, Eye, EyeOff } from "lucide-react";
import { useSettings } from "../hooks/useSettings";
import { useTheme } from "../hooks/useTheme";
import {
  getStoredApiKey,
  setStoredApiKey,
  isApiKeyConfigured,
} from "../lib/anthropic";
import { Card, Button } from "../components/ui";
import styles from "./SettingsPage.module.css";

export function SettingsPage() {
  const { settings, updateSettings, resetSettings } = useSettings();
  const { theme, toggleTheme } = useTheme();

  const [apiKey, setApiKey] = useState(getStoredApiKey);
  const [showKey, setShowKey] = useState(false);
  const [keySaved, setKeySaved] = useState(isApiKeyConfigured);

  const handleSaveKey = useCallback(() => {
    setStoredApiKey(apiKey.trim());
    setKeySaved(apiKey.trim().length > 0);
  }, [apiKey]);

  const handleClearKey = useCallback(() => {
    setStoredApiKey("");
    setApiKey("");
    setKeySaved(false);
  }, []);

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>
          <Settings size={22} />
          設定
        </h1>
      </header>

      <div className={styles.sections}>
        {/* AI Assistant Settings */}
        <Card className={styles.section}>
          <h2 className={styles.sectionTitle}>
            <Bot size={16} />
            AI アシスタント
          </h2>

          <div className={styles.settingRow}>
            <div className={styles.settingInfo}>
              <span className={styles.settingLabel}>Anthropic API キー</span>
              <span className={styles.settingDesc}>
                AIアシスタント機能に必要です。キーはブラウザのlocalStorageに保存されます。
              </span>
            </div>
          </div>
          <div className={styles.apiKeyRow}>
            <div className={styles.apiKeyInputWrap}>
              <input
                type={showKey ? "text" : "password"}
                className={styles.apiKeyInput}
                value={apiKey}
                onChange={(e) => {
                  setApiKey(e.target.value);
                  setKeySaved(false);
                }}
                placeholder="sk-ant-..."
                autoComplete="off"
              />
              <button
                className={styles.eyeButton}
                onClick={() => setShowKey((v) => !v)}
                type="button"
              >
                {showKey ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
            <div className={styles.apiKeyActions}>
              <Button
                variant="primary"
                size="sm"
                onClick={handleSaveKey}
                disabled={keySaved && apiKey === getStoredApiKey()}
              >
                保存
              </Button>
              {keySaved && (
                <Button variant="ghost" size="sm" onClick={handleClearKey}>
                  削除
                </Button>
              )}
            </div>
          </div>
          {keySaved && (
            <p className={styles.apiKeyStatus}>APIキー設定済み</p>
          )}

          <div className={styles.settingRow}>
            <div className={styles.settingInfo}>
              <span className={styles.settingLabel}>AIモデル</span>
              <span className={styles.settingDesc}>
                Haiku: 高速・低コスト / Sonnet: 高品質・詳細
              </span>
            </div>
            <select
              className={styles.select}
              value={settings.aiModel}
              onChange={(e) =>
                updateSettings({
                  aiModel: e.target.value as "haiku" | "sonnet",
                })
              }
            >
              <option value="haiku">Claude Haiku (高速)</option>
              <option value="sonnet">Claude Sonnet (高品質)</option>
            </select>
          </div>
        </Card>

        <Card className={styles.section}>
          <h2 className={styles.sectionTitle}>表示設定</h2>

          <div className={styles.settingRow}>
            <div className={styles.settingInfo}>
              <span className={styles.settingLabel}>テーマ</span>
              <span className={styles.settingDesc}>ライト / ダークモード切替</span>
            </div>
            <button className={styles.themeButton} onClick={toggleTheme}>
              {theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
              {theme === "light" ? "ダークモード" : "ライトモード"}
            </button>
          </div>

          <div className={styles.settingRow}>
            <div className={styles.settingInfo}>
              <span className={styles.settingLabel}>微量元素の表示</span>
              <span className={styles.settingDesc}>
                Fe, Zn, Cu等の詳細表示
              </span>
            </div>
            <label className={styles.toggle}>
              <input
                type="checkbox"
                checked={settings.showAdvancedNutrients}
                onChange={(e) =>
                  updateSettings({ showAdvancedNutrients: e.target.checked })
                }
              />
              <span className={styles.toggleSlider} />
            </label>
          </div>
        </Card>

        <Card className={styles.section}>
          <h2 className={styles.sectionTitle}>デフォルト設定</h2>

          <div className={styles.settingRow}>
            <div className={styles.settingInfo}>
              <span className={styles.settingLabel}>栄養タイプ</span>
            </div>
            <select
              className={styles.select}
              value={settings.defaultNutritionType}
              onChange={(e) =>
                updateSettings({
                  defaultNutritionType: e.target.value as "enteral" | "parenteral",
                })
              }
            >
              <option value="enteral">経腸栄養</option>
              <option value="parenteral">静脈栄養</option>
            </select>
          </div>

          <div className={styles.settingRow}>
            <div className={styles.settingInfo}>
              <span className={styles.settingLabel}>活動レベル</span>
            </div>
            <select
              className={styles.select}
              value={settings.defaultActivityLevel}
              onChange={(e) =>
                updateSettings({ defaultActivityLevel: e.target.value })
              }
            >
              <option value="bedrest">安静臥床</option>
              <option value="low">低活動</option>
              <option value="moderate">中活動</option>
              <option value="high">高活動</option>
            </select>
          </div>

          <div className={styles.settingRow}>
            <div className={styles.settingInfo}>
              <span className={styles.settingLabel}>ストレスレベル</span>
            </div>
            <select
              className={styles.select}
              value={settings.defaultStressLevel}
              onChange={(e) =>
                updateSettings({ defaultStressLevel: e.target.value })
              }
            >
              <option value="mild">軽度</option>
              <option value="moderate">中等度</option>
              <option value="severe">重度</option>
            </select>
          </div>
        </Card>

        <Card className={styles.section}>
          <h2 className={styles.sectionTitle}>データ管理</h2>

          <div className={styles.settingRow}>
            <div className={styles.settingInfo}>
              <span className={styles.settingLabel}>自動保存</span>
              <span className={styles.settingDesc}>
                メニュー作成中の下書き自動保存
              </span>
            </div>
            <label className={styles.toggle}>
              <input
                type="checkbox"
                checked={settings.autoSaveEnabled}
                onChange={(e) =>
                  updateSettings({ autoSaveEnabled: e.target.checked })
                }
              />
              <span className={styles.toggleSlider} />
            </label>
          </div>

          <div className={styles.settingRow}>
            <div className={styles.settingInfo}>
              <span className={styles.settingLabel}>設定リセット</span>
              <span className={styles.settingDesc}>全設定を初期値に戻す</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              icon={<RotateCcw size={14} />}
              onClick={resetSettings}
            >
              リセット
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
