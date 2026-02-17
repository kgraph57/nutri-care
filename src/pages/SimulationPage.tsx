import { useState, useCallback, useMemo } from "react";
import { GraduationCap } from "lucide-react";
import { Card } from "../components/ui";
import { CaseLibrary } from "../components/simulation/CaseLibrary";
import { CaseDetail } from "../components/simulation/CaseDetail";
import { SimulationWorkspace } from "../components/simulation/SimulationWorkspace";
import { ScoreResult } from "../components/simulation/ScoreResult";
import { ProgressDashboard } from "../components/simulation/ProgressDashboard";
import { SIMULATION_CASES } from "../data/simulationCases";
import {
  scoreSimulation,
  generateFeedback,
} from "../services/simulationScorer";
import {
  buildEducationContext,
  buildEducationSystemPrompt,
} from "../services/aiContextBuilder";
import { useSimulationProgress } from "../hooks/useSimulationProgress";
import type {
  SimulationCase,
  SimulationScore,
  FeedbackItem,
} from "../types/simulation";
import type { NutritionMenuData } from "../hooks/useNutritionMenus";
import styles from "./SimulationPage.module.css";

type ViewState = "library" | "detail" | "workspace" | "result";

export function SimulationPage() {
  const [viewState, setViewState] = useState<ViewState>("library");
  const [selectedCase, setSelectedCase] = useState<SimulationCase | null>(null);
  const [currentScore, setCurrentScore] = useState<SimulationScore | null>(
    null,
  );
  const [currentFeedback, setCurrentFeedback] = useState<
    readonly FeedbackItem[]
  >([]);
  const [currentMenu, setCurrentMenu] = useState<NutritionMenuData | null>(
    null,
  );

  const cases = useMemo(() => SIMULATION_CASES, []);
  const { progress, recordResult } = useSimulationProgress(cases);

  const handleSelectCase = useCallback((caseItem: SimulationCase) => {
    setSelectedCase(caseItem);
    setViewState("detail");
  }, []);

  const handleStartCase = useCallback(() => {
    setViewState("workspace");
  }, []);

  const handleSubmit = useCallback(
    (menuData: NutritionMenuData) => {
      if (!selectedCase) return;

      const score = scoreSimulation(
        menuData,
        selectedCase.idealAnswer,
        selectedCase,
      );
      const feedback = generateFeedback(
        menuData,
        selectedCase.idealAnswer,
        selectedCase,
        score,
      );

      setCurrentScore(score);
      setCurrentFeedback(feedback);
      setCurrentMenu(menuData);

      recordResult(selectedCase, score, feedback, menuData, 0);

      setViewState("result");
    },
    [selectedCase, recordResult],
  );

  const educationPrompt = useMemo(() => {
    if (!selectedCase || !currentScore) return "";
    const ctx = buildEducationContext(selectedCase, currentMenu, currentScore);
    return buildEducationSystemPrompt(ctx);
  }, [selectedCase, currentScore, currentMenu]);

  const handleRetry = useCallback(() => {
    setViewState("workspace");
  }, []);

  const handleBackToLibrary = useCallback(() => {
    setSelectedCase(null);
    setCurrentScore(null);
    setCurrentFeedback([]);
    setViewState("library");
  }, []);

  return (
    <div className={styles.page}>
      {viewState === "library" && (
        <>
          <header className={styles.header}>
            <div className={styles.headerTop}>
              <div className={styles.titleArea}>
                <div className={styles.headerIcon}>
                  <GraduationCap size={24} />
                </div>
                <div>
                  <h1 className={styles.title}>症例演習</h1>
                  <p className={styles.subtitle}>
                    臨床シナリオに基づいた栄養管理シミュレーション
                  </p>
                </div>
              </div>
            </div>
            <Card className={styles.progressCard}>
              <ProgressDashboard cases={cases} progress={progress} />
            </Card>
          </header>

          <CaseLibrary
            cases={cases}
            progress={progress}
            onSelectCase={handleSelectCase}
          />
        </>
      )}

      {viewState === "detail" && selectedCase && (
        <CaseDetail
          caseData={selectedCase}
          onBack={handleBackToLibrary}
          onStart={handleStartCase}
        />
      )}

      {viewState === "workspace" && selectedCase && (
        <SimulationWorkspace caseData={selectedCase} onSubmit={handleSubmit} />
      )}

      {viewState === "result" && selectedCase && currentScore && (
        <ScoreResult
          score={currentScore}
          feedback={currentFeedback}
          idealAnswer={selectedCase.idealAnswer}
          caseId={selectedCase.id}
          systemPrompt={educationPrompt}
          onRetry={handleRetry}
          onBackToLibrary={handleBackToLibrary}
        />
      )}
    </div>
  );
}
