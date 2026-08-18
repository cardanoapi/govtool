import environments from "@constants/environments";
import { allStaticWallets } from "@constants/staticWallets";
import { setAllureEpic, setAllureStory } from "@helpers/allure";
import { skipIfBalanceIsInsufficient, skipIfMainnet } from "@helpers/cardano";
import { pollTransaction } from "@helpers/transaction";
import { expect } from "@playwright/test";
import { test as cleanup } from "@fixtures/walletExtension";
import kuberService from "@services/kuberService";
import { StaticWallet } from "@types";
import walletManager from "lib/walletManager";

cleanup.describe.configure({ timeout: 12 * environments.txTimeOut });

const MERGE_UTXO_BATCH_SIZE = 5;
cleanup.beforeEach(async () => {
  await setAllureEpic("Setup");
  await setAllureStory("Cleanup");
  await skipIfMainnet();
  await skipIfBalanceIsInsufficient(10);
});

cleanup("Refund faucet", async () => {
  const registerDRepWallets: StaticWallet[] =
    await walletManager.readWallets("registerDRepCopy");
  const registeredDRepWallets: StaticWallet[] =
    await walletManager.readWallets("registeredDRepCopy");
  const proposalSubmissionWallets: StaticWallet[] =
    await walletManager.readWallets("proposalSubmissionCopy");
  try {
    const walletsToMerge = [
      ...allStaticWallets,
      ...registerDRepWallets,
      ...registeredDRepWallets,
      ...proposalSubmissionWallets,
    ];
    const { errors } = await kuberService.mergeUtXosInBatches(walletsToMerge, {
      batchSize: MERGE_UTXO_BATCH_SIZE,
      continueOnError: true,
      onBatchSubmitted: async ({ txId, lockInfo }, context) => {
        console.log(
          `Submitted faucet merge batch ${context.batchNumber}/${context.totalBatches}, waiting for tx ${txId}`
        );
        await pollTransaction(txId, lockInfo);
      },
    });

    if (errors.length > 0) {
      const nonBadRequestErrors = errors.filter(({ error }) => {
        return !(
          typeof error === "object" &&
          error !== null &&
          "status" in error &&
          error.status === 400
        );
      });

      if (nonBadRequestErrors.length === 0) {
        expect(true, "Failed to transfer ADA").toBeTruthy();
        return;
      }

      const failureSummary = nonBadRequestErrors
        .map(
          ({ batchNumber, totalBatches, error }) =>
            `batch ${batchNumber}/${totalBatches}: ${
              error instanceof Error ? error.message : String(error)
            }`
        )
        .join("\n");

      throw new Error(
        `Faucet cleanup had failed batch merges:\n${failureSummary}`
      );
    }
  } catch (err) {
    console.log(err);
    if (
      typeof err === "object" &&
      err !== null &&
      "status" in err &&
      err.status === 400
    ) {
      expect(true, "Failed to transfer ADA").toBeTruthy();
    } else {
      throw err instanceof Error ? err : new Error(String(err));
    }
  }
});
