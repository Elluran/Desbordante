import React, { useContext, useEffect } from "react";

import { FDAlgorithm } from "../../../types/types";
import Value from "../../Value/Value";
import Slider from "../../Slider/Slider";
import FormItem from "../../FormItem/FormItem";
import { AlgorithmConfigContext } from "../../AlgorithmConfigContext";
import { FileFormContext } from "../../FileFormContext";
import Selector from "../../Selector/Selector";

const FDAlgorithmProps = () => {
  const { algorithmProps, setAlgorithmProps } = useContext(FileFormContext)!;
  const { validators, allowedValues } = useContext(AlgorithmConfigContext)!;

  const changeAlgorithm = (newAlgorithm: FDAlgorithm) => {
    // @ts-ignore
    setAlgorithmProps((prevProps) => ({
      ...prevProps,
      algorithm: newAlgorithm,
    }));
  };

  const changeErrorThreshold = (newThreshold: string) => {
    setAlgorithmProps((prevProps) => ({
      ...prevProps,
      errorThreshold: newThreshold,
    }));
  };

  const changeArityConstraint = (newArityConstraint: string) => {
    setAlgorithmProps((prevProps) => ({
      ...prevProps,
      arityConstraint: newArityConstraint,
    }));
  };

  const changeThreadsCount = (newThreadsCount: string) => {
    setAlgorithmProps((prevProps) => ({
      ...prevProps,
      threadsCount: newThreadsCount,
    }));
  };

  useEffect(() => {
    if (allowedValues.allowedAlgorithms?.allowedFDAlgorithms[0]) {
      changeAlgorithm(allowedValues.allowedAlgorithms?.allowedFDAlgorithms[0]);
    }
  }, [allowedValues]);

  const { errorThreshold, arityConstraint, threadsCount } = algorithmProps;

  return (
    <>
      <FormItem>
        <h5 className="text-white mb-2 mx-2">Algorithm:</h5>
        <Selector
          options={allowedValues.allowedAlgorithms?.allowedFDAlgorithms || []}
          current={
            algorithmProps.algorithm || {
              name: "",
              properties: {
                hasArityConstraint: true,
                hasErrorThreshold: true,
                isMultiThreaded: true,
              },
            }
          }
          onSelect={changeAlgorithm}
          label={(algo) => algo.name}
          className="mx-2"
        />
      </FormItem>
      <FormItem
        enabled={algorithmProps.algorithm?.properties.hasErrorThreshold}
      >
        <h5 className="text-white mb-0 mx-2">Error threshold:</h5>
        <Value
          value={errorThreshold}
          onChange={changeErrorThreshold}
          size={8}
          inputValidator={validators.isBetweenZeroAndOne}
          className="mx-2"
        />
        <Slider
          value={errorThreshold}
          onChange={changeErrorThreshold}
          step={1e-6}
          className="mx-2"
        />
      </FormItem>
      <FormItem
        enabled={algorithmProps.algorithm?.properties.hasArityConstraint}
      >
        <h5 className="text-white mb-0 mx-2">Arity constraint:</h5>
        <Value
          value={arityConstraint}
          onChange={changeArityConstraint}
          size={3}
          inputValidator={validators.isInteger}
          className="mx-2"
        />
        <Slider
          value={arityConstraint}
          min={1}
          max={10}
          onChange={changeArityConstraint}
          step={1}
          className="mx-2"
        />
      </FormItem>
      <FormItem enabled={algorithmProps.algorithm?.properties.isMultiThreaded}>
        <h5 className="text-white mb-0 mx-2">Threads:</h5>
        <Value
          value={threadsCount}
          onChange={changeThreadsCount}
          size={2}
          inputValidator={validators.isInteger}
          className="mx-2"
        />
        <Slider
          value={threadsCount}
          min={1}
          max={8}
          onChange={changeThreadsCount}
          step={1}
          className="mx-2"
        />
      </FormItem>
    </>
  );
};

export default FDAlgorithmProps;
