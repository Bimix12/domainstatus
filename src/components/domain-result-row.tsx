"use client";

import { TableCell, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import type { DomainResult } from "@/types";
import { CheckCircle2, XCircle } from "lucide-react";

type DomainResultRowProps = {
  result: DomainResult;
};

export function DomainResultRow({ result }: DomainResultRowProps) {
  return (
    <TableRow>
      <TableCell className="font-medium">{result.domain}</TableCell>
      <TableCell>
        {result.status === 'Active' ? (
           <Badge>
             <CheckCircle2 className="mr-2 h-4 w-4" />
             Active
           </Badge>
        ) : (
          <Badge variant="destructive">
            <XCircle className="mr-2 h-4 w-4" />
            Inactive
          </Badge>
        )}
      </TableCell>
      <TableCell className="text-sm text-muted-foreground">{result.description}</TableCell>
    </TableRow>
  );
}
