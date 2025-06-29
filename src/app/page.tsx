"use client";

import { useState, useMemo, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableHeader, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { Info, Globe, PlayCircle, LoaderCircle } from "lucide-react";
import { DomainResultRow } from "@/components/domain-result-row";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { DomainResult } from "@/types";
import { checkAndDescribeDomain } from "@/app/actions";
import { Skeleton } from "@/components/ui/skeleton";

const MAX_CONCURRENT_CHECKS = 50;

export default function Home() {
  const [domainsInput, setDomainsInput] = useState("");
  const [submittedDomains, setSubmittedDomains] = useState<string[]>([]);
  const [results, setResults] = useState<Map<string, DomainResult>>(new Map());
  const [isChecking, setIsChecking] = useState(false);
  const [processingQueue, setProcessingQueue] = useState<string[]>([]);
  const [activeChecks, setActiveChecks] = useState<Set<string>>(new Set());

  const handleCheckDomains = () => {
    const domains = [
      ...new Set(
        domainsInput
          .split('\n')
          .map(d => d.trim())
          .filter(d => d.length > 0 && /^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(d))
      ),
    ];
    
    if (domains.length > 0) {
      setSubmittedDomains(domains);
      setResults(new Map());
      setProcessingQueue(domains);
      setActiveChecks(new Set());
      setIsChecking(true);
    }
  };

  useEffect(() => {
    if (!isChecking) return;

    if (processingQueue.length === 0 && activeChecks.size === 0) {
      if (isChecking) {
        setIsChecking(false);
      }
      return;
    }
    
    const canStartCount = MAX_CONCURRENT_CHECKS - activeChecks.size;
    
    if (canStartCount > 0 && processingQueue.length > 0) {
      const domainsToStart = processingQueue.slice(0, canStartCount);
      const newActiveChecks = new Set(activeChecks);
      domainsToStart.forEach(d => newActiveChecks.add(d));

      setProcessingQueue(q => q.slice(canStartCount));
      setActiveChecks(newActiveChecks);

      domainsToStart.forEach(domain => {
        checkAndDescribeDomain(domain)
          .then(result => {
            setResults(prev => new Map(prev).set(domain, result));
          })
          .catch(error => {
            console.error(`Error checking domain ${domain}:`, error);
            const errorResult: DomainResult = {
                domain,
                status: "Inactive",
                description: "Failed to check domain."
            };
            setResults(prev => new Map(prev).set(domain, errorResult));
          })
          .finally(() => {
            setActiveChecks(current => {
              const next = new Set(current);
              next.delete(domain);
              return next;
            });
          });
      });
    }
  }, [isChecking, processingQueue, activeChecks]);


  const resultsArray = useMemo(() => Array.from(results.values()), [results]);
  
  const progressValue = useMemo(() => {
    if (submittedDomains.length === 0) return 0;
    return (results.size / submittedDomains.length) * 100;
  }, [results, submittedDomains]);

  const activeResults = useMemo(() => resultsArray.filter(r => r.status === 'Active').sort((a,b) => a.domain.localeCompare(b.domain)), [resultsArray]);
  const inactiveResults = useMemo(() => resultsArray.filter(r => r.status === 'Inactive').sort((a,b) => a.domain.localeCompare(b.domain)), [resultsArray]);
  const isComplete = !isChecking && results.size > 0 && results.size === submittedDomains.length;

  const tableHeader = (
    <TableHeader className="bg-muted/50">
      <TableRow>
        <TableHead className="w-[30%] font-semibold text-foreground/80">Domain</TableHead>
        <TableHead className="w-[20%] font-semibold text-foreground/80">Status</TableHead>
        <TableHead className="font-semibold text-foreground/80">AI Description</TableHead>
      </TableRow>
    </TableHeader>
  );

  const LoadingRow = ({ domain }: { domain: string }) => (
    <TableRow>
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

  return (
    <main className="container mx-auto px-4 py-8 md:py-16">
      <div className="text-center max-w-3xl mx-auto">
        <div className="inline-flex items-center justify-center bg-primary/10 text-primary p-2 rounded-full mb-6">
           <Globe className="h-8 w-8" />
        </div>
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight bg-gradient-to-br from-primary to-secondary-foreground dark:from-primary dark:to-primary-foreground bg-clip-text text-transparent">
          Domain Sleuth
        </h1>
        <p className="text-muted-foreground mt-4 text-lg md:text-xl max-w-2xl mx-auto">
          Instantly check the status of multiple domains and get AI-powered descriptions for active websites. Perfect for research, investment, and monitoring.
        </p>
      </div>

      <div className="mt-12 max-w-4xl mx-auto space-y-12">
        <Card className="shadow-xl border-border/60">
          <CardHeader>
            <CardTitle className="text-2xl">Enter Domains to Analyze</CardTitle>
            <CardDescription>
              Enter one domain per line. Our tool will check their availability and generate insights.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="google.com
openai.com
yournextbigidea.com"
              className="min-h-[180px] text-base resize-y focus:shadow-outline"
              value={domainsInput}
              onChange={(e) => setDomainsInput(e.target.value)}
              disabled={isChecking}
            />
          </CardContent>
          <CardFooter>
            <Button onClick={handleCheckDomains} disabled={isChecking || domainsInput.trim().length === 0} size="lg">
              <PlayCircle className="mr-2 h-5 w-5" />
              {isChecking ? "Analyzing..." : "Analyze Domains"}
            </Button>
          </CardFooter>
        </Card>
      
        {submittedDomains.length > 0 && (
          <Card className="shadow-xl border-border/60">
            <CardHeader>
               <CardTitle className="text-2xl">
                  {isChecking ? "Analysis in Progress..." : "Analysis Complete"}
                </CardTitle>
              {isChecking && (
                <CardDescription>
                  Checking {submittedDomains.length} domains. This may take a moment...
                </CardDescription>
              )}
              {isComplete && (
                <CardDescription>
                  Finished analyzing {results.size} domains. See the results below.
                </CardDescription>
              )}
              {isChecking && <Progress value={progressValue} className="mt-4" />}
            </CardHeader>
            <CardContent className="pt-0">
              {isChecking && (
                <div className="border rounded-lg overflow-hidden">
                  <Table>
                    {tableHeader}
                    <TableBody>
                      {submittedDomains.map(domain => {
                        const result = results.get(domain);
                        return result ? (
                          <DomainResultRow key={domain} result={result} />
                        ) : (
                          <LoadingRow key={domain} domain={domain} />
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
              
              {isComplete && (
                <Tabs defaultValue="active" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="active">Active ({activeResults.length})</TabsTrigger>
                    <TabsTrigger value="inactive">Inactive ({inactiveResults.length})</TabsTrigger>
                  </TabsList>
                  <TabsContent value="active" className="mt-4">
                    <div className="border rounded-lg overflow-hidden">
                      <Table>
                        {tableHeader}
                        <TableBody>
                          {activeResults.length > 0 ? activeResults.map(result => (
                            <DomainResultRow key={result.domain} result={result} />
                          )) : <TableRow><TableCell colSpan={3} className="text-center text-muted-foreground py-8">No active domains found.</TableCell></TableRow>}
                        </TableBody>
                      </Table>
                    </div>
                  </TabsContent>
                  <TabsContent value="inactive" className="mt-4">
                    <div className="border rounded-lg overflow-hidden">
                      <Table>
                        {tableHeader}
                        <TableBody>
                           {inactiveResults.length > 0 ? inactiveResults.map(result => (
                            <DomainResultRow key={result.domain} result={result} />
                          )) : <TableRow><TableCell colSpan={3} className="text-center text-muted-foreground py-8">No inactive domains found.</TableCell></TableRow>}
                        </TableBody>
                      </Table>
                    </div>
                  </TabsContent>
                </Tabs>
              )}
            </CardContent>
          </Card>
        )}

        {isComplete && (
          <Card className="bg-muted/50 border-border/60">
              <CardHeader>
                <CardTitle className="flex items-center text-xl">
                  <Info className="h-5 w-5 mr-3 text-primary" />
                  Interpreting the Data
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground space-y-2">
                   <p><span className="font-semibold text-foreground">Active:</span> The domain has a running website that responded to our request. The AI description is a best-effort summary.</p>
                   <p><span className="font-semibold text-foreground">Inactive:</span> The domain did not respond. It might be unregistered, parked, or experiencing server issues.</p>
                </div>
              </CardContent>
            </Card>
        )}
      </div>
    </main>
  );
}
