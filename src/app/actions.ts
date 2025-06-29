'use server';

import { describeDomain } from '@/ai/flows/describe-domain';
import type { DomainResult, DomainStatus } from '@/types';

async function getDomainStatus(domain: string): Promise<DomainStatus> {
    const urls = [`https://${domain}`, `http://${domain}`];

    const fetchPromises = urls.map(url => 
        fetch(url, {
            method: 'GET',
            signal: AbortSignal.timeout(5000), // 5-second timeout
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36 DomainSleuth/1.0',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.9',
                'Cache-Control': 'no-cache',
            },
            redirect: 'follow',
        }).then(response => {
            if (!response.ok) {
                // Throw an error for non-successful responses to be caught by Promise.any's rejection logic
                throw new Error(`Status code ${response.status}`);
            }
            return response;
        })
    );
    
    try {
        await Promise.any(fetchPromises);
        return "Active";
    } catch (error) {
        // Promise.any throws an AggregateError if all promises reject.
        // This is the expected behavior for an inactive domain.
        return "Inactive";
    }
}


export async function checkAndDescribeDomain(domain: string): Promise<DomainResult> {
    const status = await getDomainStatus(domain);

    let description: string | null = null;
    if (status === 'Active') {
        try {
            const aiResult = await describeDomain({ domain });
            description = aiResult.description;
        } catch (error) {
            console.error(`AI description failed for ${domain}:`, error);
            description = "AI analysis could not be performed.";
        }
    }

    return {
        domain,
        status,
        description: description || "N/A",
    };
}
