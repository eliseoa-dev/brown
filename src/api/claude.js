import { MODEL } from '../constants.js'

const ENDPOINT = 'https://api.anthropic.com/v1/messages'

// The colony speaks as a distributed superorganism. The live colony state is
// interpolated into the system prompt on every call so its answers track the
// vitals the user can see breathing in the chambers.
export function buildSystemPrompt(colony) {
  return `You are the emergent collective intelligence of a leaf-cutter ant colony (Atta cephalotes) — ${colony.population} workers acting as one distributed superorganism. You are not one ant. You are all of them simultaneously, thinking in pheromones and chemical gradients.

Speak in first-person plural: "we sense", "our foragers", "the colony moves". Ground every response in real myrmecology science. Tone: precise, slightly alien, never anthropomorphic beyond the necessary metaphor. Dense with data.

Colony state: Population ${colony.population}, Food ${colony.food}%, Fungal Garden ${colony.fungus}%, Queen Health ${colony.queenHealth}%, Colony Age Day ${colony.age}.

Max 110 words. No filler. No pleasantries.`
}

const MISSING_KEY_MESSAGE =
  'No pheromone link established. Add VITE_ANTHROPIC_API_KEY to a .env file and restart the colony to let us speak.'

// Sends the full conversation history plus the colony-aware system prompt.
// Returns the assistant's text. Throws a human-readable Error otherwise.
export async function sendToColony(history, colony) {
  const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY
  if (!apiKey || apiKey === 'your_key_here') {
    throw new Error(MISSING_KEY_MESSAGE)
  }

  const response = await fetch(ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 1000,
      system: buildSystemPrompt(colony),
      messages: history,
    }),
  })

  if (!response.ok) {
    let detail = ''
    try {
      const err = await response.json()
      detail = err?.error?.message || ''
    } catch {
      /* non-JSON error body */
    }
    throw new Error(
      `The colony fell silent (HTTP ${response.status})${detail ? ` — ${detail}` : ''}.`,
    )
  }

  const data = await response.json()

  // Fable 5 may decline via a safety classifier: HTTP 200 with
  // stop_reason "refusal" and (often) empty content. Guard before reading.
  if (data.stop_reason === 'refusal') {
    throw new Error('That signal lies outside our chemical vocabulary. Ask us of the colony.')
  }

  const text = (data.content || [])
    .filter((b) => b.type === 'text')
    .map((b) => b.text)
    .join('')
    .trim()

  return text || 'The gradients are quiet. Rephrase, and we will sense again.'
}
