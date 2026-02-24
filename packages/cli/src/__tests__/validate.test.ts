import { describe, it, expect } from 'vitest';

/**
 * Tests for curly-quote detection in JSX props.
 *
 * The validation logic in validate.ts scans each line for:
 *   1. A JSX attribute pattern:  word= followed by a quote character
 *   2. A curly quote character:  \u201C \u201D \u2018 \u2019
 * A line must match BOTH to be flagged as an error.
 */

const curlyQuoteRe = /[\u201C\u201D\u2018\u2019]/;
const jsxAttrRe = /\w+=\s*["'\u201C\u201D\u2018\u2019]/;

function detectCurlyQuoteErrors(source: string): number[] {
  const lines = source.split('\n');
  const errorLines: number[] = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (jsxAttrRe.test(line) && curlyQuoteRe.test(line)) {
      errorLines.push(i + 1);
    }
  }
  return errorLines;
}

describe('curly quote detection in JSX props', () => {
  it('flags curly double quotes in JSX props', () => {
    const source = `<Hero title=\u201CHello World\u201D description="OK" />`;
    const errors = detectCurlyQuoteErrors(source);
    expect(errors).toEqual([1]);
  });

  it('flags curly single quotes in JSX props', () => {
    const source = `<Hero title=\u2018Hello World\u2019 />`;
    const errors = detectCurlyQuoteErrors(source);
    expect(errors).toEqual([1]);
  });

  it('flags mixed curly quotes in JSX props', () => {
    const source = `<Button href=\u201C/about\u201D label=\u2018Click\u2019 />`;
    const errors = detectCurlyQuoteErrors(source);
    expect(errors).toEqual([1]);
  });

  it('does not flag curly quotes in body text', () => {
    const source = `This is a \u201Cquoted\u201D paragraph with \u2018smart\u2019 quotes.`;
    const errors = detectCurlyQuoteErrors(source);
    expect(errors).toEqual([]);
  });

  it('does not flag straight quotes in JSX props', () => {
    const source = `<Hero title="Hello World" description='OK' />`;
    const errors = detectCurlyQuoteErrors(source);
    expect(errors).toEqual([]);
  });

  it('does not flag lines without any quotes', () => {
    const source = `## Hello World\n\nSome plain text here.`;
    const errors = detectCurlyQuoteErrors(source);
    expect(errors).toEqual([]);
  });

  it('reports correct line numbers for multiple violations', () => {
    const source = [
      '---',
      'title: "Page"',
      '---',
      '',
      `<Hero title=\u201CHello\u201D />`,
      'Some body text with \u201Cquotes\u201D.',
      `<Button label=\u2018Click\u2019 />`,
    ].join('\n');
    const errors = detectCurlyQuoteErrors(source);
    expect(errors).toEqual([5, 7]);
  });

  it('does not flag frontmatter with curly quotes (no JSX attr pattern)', () => {
    const source = [
      '---',
      'title: \u201CMy Page\u201D',
      '---',
    ].join('\n');
    const errors = detectCurlyQuoteErrors(source);
    expect(errors).toEqual([]);
  });
});
