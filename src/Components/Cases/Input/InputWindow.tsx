import * as React from "react";
import Line from "./Line";
import { Flex, VStack } from "@chakra-ui/react";

const InputWindow = () => {
  return (
    <VStack ml={5}>
      <Line />
      <Line />
      <Line hide />
      <Line />
      <Line />
    </VStack>
  );
};

export default InputWindow;