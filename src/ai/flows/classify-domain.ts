'use server';

/**
 * @fileOverview Classifies the topic of a domain using AI.
 *
 * - classifyDomain - A function that classifies a domain's topic.
 * - ClassifyDomainInput - The input type for the classifyDomain function.
 * - ClassifyDomainOutput - The return type for the classifyDomain function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ClassifyDomainInputSchema = z.object({
  domain: z.string().describe('The domain name to classify.'),
});
export type ClassifyDomainInput = z.infer<typeof ClassifyDomainInputSchema>;

const ClassifyDomainOutputSchema = z.object({
  classification: z
    .string()
    .describe('The classification of the domain, such as its primary topic or purpose.'),
});
export type ClassifyDomainOutput = z.infer<typeof ClassifyDomainOutputSchema>;

export async function classifyDomain(input: ClassifyDomainInput): Promise<ClassifyDomainOutput> {
  return classifyDomainFlow(input);
}

const classifyDomainPrompt = ai.definePrompt({
  name: 'classifyDomainPrompt',
  input: {schema: ClassifyDomainInputSchema},
  output: {schema: ClassifyDomainOutputSchema},
  prompt: `You are an AI assistant specialized in classifying domain names.

  Given a domain name, your task is to determine the primary topic or purpose of the website associated with that domain.

  Domain Name: {{{domain}}}
  `,
});

const classifyDomainFlow = ai.defineFlow(
  {
    name: 'classifyDomainFlow',
    inputSchema: ClassifyDomainInputSchema,
    outputSchema: ClassifyDomainOutputSchema,
  },
  async input => {
    const {output} = await classifyDomainPrompt(input);
    return output!;
  }
);
