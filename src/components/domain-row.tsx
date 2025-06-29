"use client";

import { TableCell, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import type { DomainResult } from "@/types";
import { LoaderCircle } from "lucide-react";
import { DomainResultRow } from "./domain-result-row";

type DomainRowProps = {
  domain: string;
  result: DomainResult | null;
};

export function DomainRow({ domain, result }: DomainRowProps) {
  if (!result) {
    return (
      <TableRow className="animate-pulse">
        <TableCell className="font-medium">{domain}</TableCell>
        <TableCell>
          <div className="flex items-center gap-2">
            <LoaderCircle className="h-4 w-4 animate-spin text-muted-foreground" />
            <span className="text-muted-foreground">Checking...</span>
          </div>
        </TableCell>
        <TableCell>
          <Skeleton className="h-4 w-10/12 rounded-md" />
        </TableCell>
      </TableRow>
    );
  }

  return <DomainResultRow result={result} />;
}
