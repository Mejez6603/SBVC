
'use client';

import { suggestRelevantPassages } from '@/ai/flows/suggest-relevant-passages';
import { useFormState, useFormStatus } from 'react-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAppContext } from '@/context/app-context';
import { useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from './ui/scroll-area';
import { Bot, Search } from 'lucide-react';

interface SuggestionState {
  passages: string[];
  error?: string | null;
}

const initialState: SuggestionState = {
  passages: [],
  error: null,
};

async function suggestPassagesAction(
  prevState: SuggestionState,
  formData: FormData
): Promise<SuggestionState> {
  const topic = formData.get('topic') as string;
  if (!topic || topic.trim().length < 3) {
    return { passages: [], error: 'Please enter a topic with at least 3 characters.' };
  }
  try {
    const result = await suggestRelevantPassages({ topic });
    if (result.passages.length === 0) {
      return { passages: [], error: 'No passages found for this topic.' };
    }
    return { passages: result.passages, error: null };
  } catch (error) {
    console.error(error);
    return { passages: [], error: 'An error occurred while fetching suggestions.' };
  }
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
      {pending ? 'Searching...' : <> <Search className="mr-2 h-4 w-4" /> Find Passages</>}
    </Button>
  );
}

export function PassageRecommender() {
  const [state, formAction] = useFormState(suggestPassagesAction, initialState);
  const { setPassage } = useAppContext();
  const { toast } = useToast();

  useEffect(() => {
    if (state.error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: state.error,
      });
    }
  }, [state.error, toast]);

  const handleSuggestionClick = (text: string) => {
    const reference = text.split(/-(.*)/s)[0].trim();
    const passageText = text.substring(reference.length + 1).trim();

    if (reference && passageText) {
        setPassage({ reference, text: passageText });
    } else {
        setPassage({ reference: 'AI Suggestion', text: text });
    }
  };

  return (
    <div className="flex flex-col h-full">
      <CardHeader className="pt-6">
        <div className="flex items-center gap-3 mb-2">
            <Bot className="w-8 h-8 text-primary" />
            <CardTitle className="font-headline text-2xl">Passage Finder</CardTitle>
        </div>
        <CardDescription>Enter a topic to find relevant Bible passages.</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col gap-4">
        <form action={formAction} className="space-y-4">
          <Input name="topic" placeholder="e.g., Faith, Love, Forgiveness" required />
          <SubmitButton />
        </form>
        <div className="flex-1 min-h-0">
          <ScrollArea className="h-full pr-4">
            <div className="space-y-3">
              {state.passages.map((passage, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestionClick(passage)}
                  className="w-full text-left"
                >
                  <Card className="hover:border-primary/80 hover:bg-primary/10 transition-colors duration-200">
                    <CardContent className="p-4 text-sm leading-relaxed">
                      <p>{passage}</p>
                    </CardContent>
                  </Card>
                </button>
              ))}
            </div>
          </ScrollArea>
        </div>
      </CardContent>
    </div>
  );
}
