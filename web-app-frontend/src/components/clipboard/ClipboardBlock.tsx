import { Task01Icon, TaskDone01Icon } from 'hugeicons-react';
import React, { useState } from 'react';
import './ClipboardBlock.css';

export interface ClipboardBlockProps {
  value: string;
}

export const ClipboardBlock: React.FC<ClipboardBlockProps> = ({ value }) => {
  const [copied, setCopied] = useState<boolean>();

  return (
    <div className={'mock-clipboard'}>
      <div
        className={'mock-clipboard-button'}
        onClick={async (e) => {
          e.stopPropagation();
          e.preventDefault();
          setCopied(true);
          await navigator.clipboard.writeText(value);
          setTimeout(() => setCopied(false), 1500);
        }}
      >
        {copied ? (<TaskDone01Icon size={16} />) : (<Task01Icon size={16} />)}
      </div>
      <code>
        {value}
      </code>
    </div>
  );
};
