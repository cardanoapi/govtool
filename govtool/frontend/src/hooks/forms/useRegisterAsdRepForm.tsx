import { Dispatch, SetStateAction, useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useFormContext } from "react-hook-form";
import { blake2bHex } from "blakejs";
import { captureException } from "@sentry/react";

import {
  CIP_100,
  CIP_QQQ,
  DREP_CONTEXT,
  MetadataHashValidationErrors,
  PATHS,
  storageInformationErrorModals,
} from "@consts";
import { useCardano, useModal } from "@context";
import {
  canonizeJSON,
  downloadJson,
  generateJsonld,
  validateMetadataHash,
} from "@utils";
import { useGetVoterInfo } from "..";

export type RegisterAsDRepValues = {
  bio?: string;
  dRepName: string;
  email?: string;
  links?: { link: string }[];
  storeData?: boolean;
  storingURL: string;
};

export const defaultRegisterAsDRepValues: RegisterAsDRepValues = {
  bio: "",
  dRepName: "",
  email: "",
  links: [{ link: "" }],
  storeData: false,
  storingURL: "",
};

export const useRegisterAsdRepForm = (
  setStep?: Dispatch<SetStateAction<number>>,
) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [hash, setHash] = useState<string | null>(null);
  const { closeModal, openModal } = useModal();
  const { buildDRepRegCert, buildDRepUpdateCert, buildSignSubmitConwayCertTx } =
    useCardano();
  const { voter } = useGetVoterInfo();

  const backToForm = useCallback(() => {
    setStep?.(3);
    closeModal();
  }, [setStep]);

  const backToDashboard = useCallback(() => {
    navigate(PATHS.dashboard);
    closeModal();
  }, []);

  const {
    control,
    getValues,
    handleSubmit,
    formState: { errors, isValid },
    register,
    resetField,
    watch,
  } = useFormContext<RegisterAsDRepValues>();

  const dRepName = watch("dRepName");
  const isError = Object.keys(errors).length > 0;

  const generateMetadata = async (data: RegisterAsDRepValues) => {
    const acceptedKeys = ["dRepName", "bio", "email"];

    const filteredData = Object.entries(data)
      .filter(([key]) => acceptedKeys.includes(key))
      .map(([key, value]) => [CIP_QQQ + key, value]);

    const references = (data as RegisterAsDRepValues).links
      ?.filter((link) => link.link)
      .map((link) => ({
        "@type": "Other",
        [`${CIP_100}reference-label`]: "Label",
        [`${CIP_100}reference-uri`]: link.link,
      }));

    const body = {
      ...Object.fromEntries(filteredData),
      [`${CIP_QQQ}references`]: references,
    };

    const jsonld = await generateJsonld(body, DREP_CONTEXT);

    const canonizedJson = await canonizeJSON(jsonld);
    const hash = blake2bHex(canonizedJson, undefined, 32);

    setHash(hash);

    return jsonld;
  };

  const onClickDownloadJson = async () => {
    const data = getValues();
    const json = await generateMetadata(data);

    downloadJson(json, dRepName);
  };

  const validateHash = useCallback(
    async (storingUrl: string, hash: string | null) => {
      try {
        if (!hash) throw new Error(MetadataHashValidationErrors.INVALID_HASH);

        await validateMetadataHash(storingUrl, hash);
      } catch (error: any) {
        if (
          Object.values(MetadataHashValidationErrors).includes(error.message)
        ) {
          openModal({
            type: "statusModal",
            state: {
              ...storageInformationErrorModals[
                error.message as MetadataHashValidationErrors
              ],
              onSubmit: backToForm,
              onCancel: backToDashboard,
              // TODO: Open usersnap feedback
              onFeedback: backToDashboard,
            },
          });
        }
        throw error;
      }
    },
    [backToForm],
  );

  const createCert = useCallback(
    async (data: RegisterAsDRepValues) => {
      // if (!hash) return;
      // const url = data.storingURL;
      const urlSubmitValue =
        "https://raw.githubusercontent.com/Thomas-Upfield/test-metadata/main/placeholder.json";
      const hashSubmitValue =
        "654e483feefc4d208ea02637a981a2046e17c73c09583e9dd0c84c25dab42749";
      try {
        let certBuilder;
        if (voter?.isRegisteredAsSoleVoter) {
          certBuilder = await buildDRepUpdateCert(
            urlSubmitValue,
            hashSubmitValue,
          );
        } else {
          certBuilder = await buildDRepRegCert(urlSubmitValue, hashSubmitValue);
        }
        return certBuilder;
      } catch (error: any) {
        console.error(error);
        throw error;
      }
    },
    [
      buildDRepRegCert,
      buildDRepUpdateCert,
      hash,
      voter?.isRegisteredAsSoleVoter,
    ],
  );

  const showSuccessModal = useCallback(() => {
    openModal({
      type: "statusModal",
      state: {
        status: "success",
        title: t("modals.registration.title"),
        message: t("modals.registration.message"),
        buttonText: t("modals.common.goToDashboard"),
        dataTestId: "governance-action-submitted-modal",
        onSubmit: backToDashboard,
      },
    });
  }, []);

  const onSubmit = useCallback(
    async (data: RegisterAsDRepValues) => {
      try {
        setIsLoading(true);

        // await validateHash(data.storingURL, hash);
        const registerAsDRepCert = await createCert(data);
        await buildSignSubmitConwayCertTx({
          certBuilder: registerAsDRepCert,
          type: "registerAsDrep",
        });

        showSuccessModal();
      } catch (error: any) {
        captureException(error);
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    },
    [buildSignSubmitConwayCertTx, createCert, hash],
  );

  return {
    control,
    errors,
    getValues,
    isError,
    isRegistrationAsDRepLoading: isLoading,
    isValid,
    onClickDownloadJson,
    register,
    registerAsDrep: handleSubmit(onSubmit),
    resetField,
    watch,
  };
};
