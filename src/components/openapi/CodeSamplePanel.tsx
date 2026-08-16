import type { OperationNode } from "@/types/openapi";
import {
  generateCurlSample,
  generateFetchSample,
  generatePythonSample,
} from "@/lib/openapi/code-samples";
import { Tabs, type TabItem } from "@/components/ui/Tabs";
import { CodeBlock } from "@/components/ui/CodeBlock";

export interface CodeSamplePanelProps {
  operation: OperationNode;
  baseUrl: string;
}

/**
 * Renders generated request examples for an operation across a fixed
 * set of common HTTP clients (curl, JavaScript fetch, Python requests).
 */
export function CodeSamplePanel({ operation, baseUrl }: CodeSamplePanelProps) {
  const tabs: TabItem[] = [
    {
      id: "curl",
      label: "cURL",
      content: (
        <CodeBlock code={generateCurlSample(operation, baseUrl)} language="bash" />
      ),
    },
    {
      id: "fetch",
      label: "JavaScript",
      content: (
        <CodeBlock
          code={generateFetchSample(operation, baseUrl)}
          language="javascript"
        />
      ),
    },
    {
      id: "python",
      label: "Python",
      content: (
        <CodeBlock
          code={generatePythonSample(operation, baseUrl)}
          language="python"
        />
      ),
    },
  ];

  return <Tabs items={tabs} />;
}
