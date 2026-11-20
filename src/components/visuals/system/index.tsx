import React from "react";
import { ContractExplorer } from "./ContractExplorer";
import { IntentLedger } from "./IntentLedger";
import { PortsSwitch } from "./PortsSwitch";
import { WalkForward } from "./WalkForward";
import { PromotionLadder } from "./PromotionLadder";
import { OperatorBoundary } from "./OperatorBoundary";
import { VerifyPipeline } from "./VerifyPipeline";

/**
 * Figures a case study's `deepDives[].visuals` can name in project.yaml.
 * Unknown names render nothing, so content and code can change independently.
 */
export const deepDiveVisuals: Record<string, React.FC> = {
  "contract-explorer": ContractExplorer,
  "intent-ledger": IntentLedger,
  "ports-switch": PortsSwitch,
  "walk-forward": WalkForward,
  "promotion-ladder": PromotionLadder,
  "operator-boundary": OperatorBoundary,
  "verify-pipeline": VerifyPipeline,
};
