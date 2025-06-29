'use server';
/**
 * @fileOverview An AI agent that describes the likely content or purpose of a domain.
 *
 * - describeDomain - A function that describes the domain.
 * - DescribeDomainInput - The input type for the describeDomain function.
 * - DescribeDomainOutput - The return type for the describeDomain function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const DescribeDomainInputSchema = z.object({
  domain: z.string().describe('The domain name to describe.'),
});
export type DescribeDomainInput = z.infer<typeof DescribeDomainInputSchema>;

const DescribeDomainOutputSchema = z.object({
  description: z.string().describe('A short description of the domain content or purpose.'),
});
export type DescribeDomainOutput = z.infer<typeof DescribeDomainOutputSchema>;

export async function describeDomain(input: DescribeDomainInput): Promise<DescribeDomainOutput> {
  return describeDomainFlow(input);
}

const prompt = ai.definePrompt({
  name: 'describeDomainPrompt',
  input: {schema: DescribeDomainInputSchema},
  output: {schema: DescribeDomainOutputSchema},
  prompt: `You are an AI assistant that describes the likely content or purpose of a domain name.

  Given the domain name: {{{domain}}}, provide a short description of what the website is likely about.
  Be concise and informative.
  `,
});

const describeDomainFlow = ai.defineFlow(
  {
    name: 'describeDomainFlow',
    inputSchema: DescribeDomainInputSchema,
    outputSchema: DescribeDomainOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
