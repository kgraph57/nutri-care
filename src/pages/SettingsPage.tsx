import { Settings, RotateCcw, Moon, Sun } from "lucide-react";
import { useSettings } from "../hooks/useSettings";
import { useTheme } from "../hooks/useTheme";
import { Card, Button } from "../components/ui";
import styles from "./SettingsPage.module.css";

export function SettingsPage() {
  const { settings, updateSettings, resetSettings } = useSettings();
  const { theme, toggleTheme } = useTheme();

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>
          <Settings size={22} />
          設定
        </h1>
      </header>

      <div className={styles.sections}>
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
