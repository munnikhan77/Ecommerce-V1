import { Fragment } from 'react';

/**
 * Renders admin-written titles: *word* → italic, a new line → line break.
 *   <RichText text={'Find your *kind* of comfort'} />
 */
export default function RichText({ text = '' }) {
  return text.split('\n').map((line, i) => (
    <Fragment key={i}>
      {i > 0 && <br />}
      {line.split(/(\*[^*]+\*)/).map((part, j) =>
        part.startsWith('*') && part.endsWith('*') && part.length > 2 ? <em key={j}>{part.slice(1, -1)}</em> : part
      )}
    </Fragment>
  ));
}
