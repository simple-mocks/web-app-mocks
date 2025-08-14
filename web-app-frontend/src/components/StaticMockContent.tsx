import React, { useEffect, useState } from 'react';
import { mimeToAceModeMap } from '../const/common.const';
import AceEditor from 'react-ace';

import '../const/ace.imports';
import { loadSettings } from '../settings/utils';
import { Button, ButtonGroup, Form } from 'react-bootstrap';
import { getContentType } from '../utils/http';
import { IAceEditor } from 'react-ace/lib/types';
import { FluentTextWrap20Regular, FluentTextWrapOff20Regular } from '../const/icons';

export interface StaticMockContentProps {
  content: ArrayBuffer;
  setContent: (content: ArrayBuffer) => void;
  meta: { [key: string]: string };
  setMeta: (meta: { [key: string]: string }) => void;
  creation: boolean;
  disabled?: boolean;
}

const textEncoder = new TextEncoder();
const textDecoder = new TextDecoder();

const StaticMockContent: React.FC<StaticMockContentProps> = ({
                                                               content,
                                                               setContent,
                                                               meta,
                                                               disabled
                                                             }) => {
  const [aceType, setAceType] = useState('text');
  const settings = loadSettings();
  const [isWordWrapEnabled, setIsWordWrapEnabled] = useState(true);

  useEffect(() => {
    const httpHeadersJson = meta['HTTP_HEADERS'];
    const contentType = getContentType(httpHeadersJson);

    setAceType(mimeToAceModeMap.get(contentType ?? 'plain/text') ?? 'text');
  }, [meta]);

  const handleLoad = (editor: IAceEditor) => {
    editor.commands.addCommand({
      name: 'openSearch',
      bindKey: { win: 'Ctrl-F', mac: 'Command-F' },
      exec: (editor) => editor.execCommand('find'),
    });

    editor.commands.addCommand({
      name: 'openReplace',
      bindKey: { win: 'Ctrl-H', mac: 'Command-H' },
      exec: (editor) => editor.execCommand('replace'),
    });
  };

  return (
    <Form.Group className="mb-3">
      <Form.Label htmlFor="contentTextArea">Content</Form.Label>

      {/* Word Wrap Button */}
      <ButtonGroup className={'float-end'}>
        <Button
          variant="primary"
          active={isWordWrapEnabled}
          title={isWordWrapEnabled ? 'Unwrap' : 'Wrap'}
          onClick={() => setIsWordWrapEnabled((prev) => !prev)}
        >
          {isWordWrapEnabled && (<FluentTextWrap20Regular />)}
          {!isWordWrapEnabled && (<FluentTextWrapOff20Regular />)}
        </Button>
      </ButtonGroup>

      {/* Ace Editor */}
      <AceEditor
        mode={aceType}
        theme={settings['aceTheme'].value}
        onLoad={handleLoad}
        name="contentAceEditor"
        onChange={(it) => setContent(textEncoder.encode(it))}
        value={textDecoder.decode(content)}
        className={'rounded'}
        style={{
          resize: 'vertical',
          overflow: 'auto',
          minHeight: '200px',
        }}
        fontSize={14}
        width="100%"
        height="640px"
        readOnly={disabled}
        showPrintMargin={true}
        showGutter={true}
        highlightActiveLine={true}
        wrapEnabled={isWordWrapEnabled}
        setOptions={{
          enableBasicAutocompletion: true,
          enableLiveAutocompletion: true,
          showLineNumbers: true,
          enableSnippets: true,
          wrap: isWordWrapEnabled,
          useWorker: false,
        }}
        editorProps={{ $blockScrolling: true }}
      />
    </Form.Group>
  );
};

export default StaticMockContent;
