import CasesSection from "./components/Cases/CasesSection";
import BowtieInfoSection from "./components/BowtieInfo/BowtieInfoSection";
import RunInfoSection from "./components/RunInfo/RunInfoSection";
import SummarySection from "./components/Summary/SummarySection";
import { useMemo } from "react";
import {
  Implementation,
  ImplementationData,
  ReportData,
} from "./data/parseReportData.ts";
import { FilterSection } from "./components/FilterSection.tsx";
import { useSearchParams } from "./hooks/useSearchParams.ts";

export const DialectReportView = ({
  reportData,
  allImplementationsData,
}: {
  reportData: ReportData;
  allImplementationsData?: Record<string, Implementation>;
}) => {
  const params = useSearchParams();

  const languages = useMemo(() => {
    const langs = Array.from(reportData.implementations.values()).map(
      (impl) => impl.metadata.language,
    );
    return Array.from(new Set(langs).values());
  }, [reportData]);

  const filteredData = useMemo(() => {
    const filteredReportData = { ...reportData };
    let filteredOtherImplementationsData: Record<string, Implementation> = {};
    const selectedLanguages = params.getAll("language");

    if (selectedLanguages.length > 0) {
      const filteredReportArray = Array.from(
        reportData.implementations.entries(),
      ).filter(([, data]) =>
        selectedLanguages.includes(data.metadata.language),
      );
      const filteredReportImplementationsMap = new Map(filteredReportArray);
      filteredReportData.implementations = filteredReportImplementationsMap;
      if (allImplementationsData) {
        filteredOtherImplementationsData = filterOtherImplementations(
          allImplementationsData,
          selectedLanguages,
          filteredReportImplementationsMap,
        );
      }
    } else {
      const filteredReportArray = Array.from(
        reportData.implementations.entries(),
      );
      const filteredReportImplementationsMap = new Map(filteredReportArray);
      if (allImplementationsData) {
        filteredOtherImplementationsData = filterOtherImplementations(
          allImplementationsData,
          languages,
          filteredReportImplementationsMap,
        );
      }
    }
    return { filteredReportData, filteredOtherImplementationsData };
  }, [reportData, params, allImplementationsData, languages]);

  return (
    <div>
      <div className="container p-4">
        <BowtieInfoSection />
        <RunInfoSection runInfo={filteredData.filteredReportData.runInfo} />
        <FilterSection languages={languages} />
        <SummarySection
          reportData={filteredData.filteredReportData}
          otherImplementationsData={
            filteredData.filteredOtherImplementationsData
          }
        />
        <CasesSection reportData={filteredData.filteredReportData} />
      </div>
    </div>
  );
};

const filterOtherImplementations = (
  allImplementationsData: Record<string, Implementation>,
  langs: string[],
  filteredReportImplementationsMap: Map<string, ImplementationData>,
): Record<string, Implementation> => {
  const filteredOtherImplementationsArray: [string, Implementation][] =
    Object.entries(allImplementationsData).filter(
      ([, impl]: [string, Implementation]) => langs.includes(impl.language),
    );

  const filteredOtherImplementationsData: Record<string, Implementation> = {};
  filteredOtherImplementationsArray.forEach(([key, impl]) => {
    let isFiltered = false;
    for (const val of filteredReportImplementationsMap.values()) {
      if (impl.source === val.metadata.source) {
        isFiltered = true;
        break;
      }
    }
    if (!isFiltered) {
      filteredOtherImplementationsData[key] = impl;
    }
  });

  return filteredOtherImplementationsData;
};
