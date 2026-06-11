/**
 * Ilu's School of Thoughts — AI debate adjudicator.
 *
 * Fires when a live human-vs-human debate doc transitions to status:'judging'.
 * Reads both debaters' transcripts, asks Claude to score the debate and declare
 * a winner (structured JSON output), and writes the verdict back to the doc.
 *
 * The Anthropic API key is held server-side as a Secret — clients never see it.
 */

import { onDocumentUpdated } from 'firebase-functions/v2/firestore';
import { defineSecret } from 'firebase-functions/params';
import { setGlobalOptions } from 'firebase-functions/v2';
import { logger } from 'firebase-functions';
import { initializeApp } from 'firebase-admin/app';
import { FieldValue } from 'firebase-admin/firestore';
import Anthropic from '@anthropic-ai/sdk';

initializeApp();
setGlobalOptions({ maxInstances: 10 });

const ANTHROPIC_API_KEY = defineSecret('ANTHROPIC_API_KEY');

const PHASES = [
  { key: 'opening', label: 'Opening Statement' },
  { key: 'cross',   label: 'Cross-Examination' },
  { key: 'closing', label: 'Closing Statement' },
];

// Structured-output contract for the verdict. Note Anthropic structured-output
// limitations: additionalProperties:false on every object, no min/max keywords.
const VERDICT_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  properties: {
    winnerSide: { type: 'string', enum: ['aff', 'neg', 'draw'] },
    scores: {
      type: 'object',
      additionalProperties: false,
      properties: {
        aff: {
          type: 'object',
          additionalProperties: false,
          properties: {
            argumentation: { type: 'integer' },
            evidence: { type: 'integer' },
            rebuttal: { type: 'integer' },
            clarity: { type: 'integer' },
            total: { type: 'integer' },
          },
          required: ['argumentation', 'evidence', 'rebuttal', 'clarity', 'total'],
        },
        neg: {
          type: 'object',
          additionalProperties: false,
          properties: {
            argumentation: { type: 'integer' },
            evidence: { type: 'integer' },
            rebuttal: { type: 'integer' },
            clarity: { type: 'integer' },
            total: { type: 'integer' },
          },
          required: ['argumentation', 'evidence', 'rebuttal', 'clarity', 'total'],
        },
      },
      required: ['aff', 'neg'],
    },
    summary: { type: 'string' },
    feedback: {
      type: 'object',
      additionalProperties: false,
      properties: {
        aff: { type: 'string' },
        neg: { type: 'string' },
      },
      required: ['aff', 'neg'],
    },
  },
  required: ['winnerSide', 'scores', 'summary', 'feedback'],
};

const SYSTEM_PROMPT = `You are the adjudicator of a formal debate at Ilu's School of Thoughts, a philosophy and freethought academy. You are rigorous, fair, and charitable — you judge ONLY the arguments actually presented, never your own opinion of the motion.

Score each side from 0–10 on four criteria:
- argumentation: strength, structure, and logical validity of the case
- evidence: use of reasons, examples, authorities, and sound premises
- rebuttal: how directly and effectively they engaged the opponent's case
- clarity: precision and persuasiveness of expression

"total" is the sum of the four criteria (0–40). Declare the side with the higher total the winner; use "draw" only when totals are genuinely tied. If a side left a phase blank or forfeited, score that phase low and say so. Keep "summary" to 2–4 sentences explaining the decision, and give each side one or two sentences of specific, constructive "feedback".`;

function buildTranscript(d) {
  const sideOf = d.sideOf || {};
  const names = d.names || {};
  let affName = 'Proposition', negName = 'Opposition';
  for (const uid of Object.keys(sideOf)) {
    if (sideOf[uid] === 'aff') affName = names[uid] || affName;
    else if (sideOf[uid] === 'neg') negName = names[uid] || negName;
  }
  const st = d.statements || {};
  const lines = [];
  lines.push(`MOTION: "${d.motion || '(no motion)'}"`);
  lines.push(`PROPOSITION (aff) — arguing FOR the motion — debater: ${affName}`);
  lines.push(`OPPOSITION (neg) — arguing AGAINST the motion — debater: ${negName}`);
  lines.push('');
  for (const ph of PHASES) {
    const phaseSt = st[ph.key] || {};
    lines.push(`=== ${ph.label} ===`);
    lines.push(`[PROPOSITION / ${affName}]: ${(phaseSt.aff || '').trim() || '(no statement submitted)'}`);
    lines.push(`[OPPOSITION / ${negName}]: ${(phaseSt.neg || '').trim() || '(no statement submitted)'}`);
    lines.push('');
  }
  return { text: lines.join('\n'), affName, negName };
}

export const judgeDebate = onDocumentUpdated(
  { document: 'debates/{debateId}', secrets: [ANTHROPIC_API_KEY] },
  async (event) => {
    const before = event.data?.before?.data();
    const after = event.data?.after?.data();
    if (!before || !after) return;

    // Only act on the transition into 'judging', and never re-judge.
    if (!(before.status !== 'judging' && after.status === 'judging' && !after.verdict)) return;

    const { text: transcript, affName, negName } = buildTranscript(after);
    logger.info(`Judging debate ${event.params.debateId}`, { affName, negName });

    const client = new Anthropic({ apiKey: ANTHROPIC_API_KEY.value() });

    try {
      const msg = await client.messages.create({
        model: 'claude-opus-4-8',
        max_tokens: 4000,
        thinking: { type: 'adaptive' },
        output_config: {
          effort: 'high',
          format: { type: 'json_schema', schema: VERDICT_SCHEMA },
        },
        system: SYSTEM_PROMPT,
        messages: [
          {
            role: 'user',
            content: `Judge the following debate and return your verdict.\n\n${transcript}`,
          },
        ],
      });

      const textBlock = msg.content.find((b) => b.type === 'text');
      if (!textBlock) throw new Error('No text block in Claude response');
      const verdict = JSON.parse(textBlock.text);
      verdict.affName = affName;
      verdict.negName = negName;
      verdict.model = 'claude-opus-4-8';

      await event.data.after.ref.update({
        verdict,
        status: 'complete',
        judgedAt: FieldValue.serverTimestamp(),
      });
      logger.info(`Debate ${event.params.debateId} judged: winner=${verdict.winnerSide}`);
    } catch (err) {
      logger.error(`Judging failed for ${event.params.debateId}`, err);
      await event.data.after.ref.update({
        status: 'error',
        judgeError: String(err?.message || err),
      });
    }
  }
);
