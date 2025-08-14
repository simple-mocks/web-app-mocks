import { Button, ButtonGroup, FormLabel } from 'react-bootstrap';
import { FloppyDiskIcon, TextWrapIcon } from 'hugeicons-react';
import { downloadBase64File } from '../../../utils/files';
import AceEditor from 'react-ace';
import { decodeToText } from '../../../utils/base64';
import React, { useState } from 'react';
import { loadSettings } from '../../../settings/utils';
import { mimeToAceModeMap } from '../../../const/common.const';
import { Headers } from '../../../api/service';
import { getContentTypeFromMap } from '../../../utils/http';
import { IAceEditor } from 'react-ace/lib/types';

export interface BodyRepresentationProps {
  title: string;
  invocationId: number;
  headers: Headers;
  body: string | null;
}

export const BodyRepresentation: React.FC<BodyRepresentationProps> = ({
                                                                        title,
                                                                        invocationId,
                                                                        headers,
                                                                        body,
                                                                      }) => {
  const settings = loadSettings();
  const [isWordWrapEnabled, setIsWordWrapEnabled] = useState(true);

  if (!body) return <>
    <FormLabel className={'h4'} htmlFor={`bodyRepresentation-${invocationId}`}>{title}: <code>N/A</code></FormLabel>
  </>;

  const contentType = getContentTypeFromMap(headers) ?? 'text/plain';
  const aceMode = mimeToAceModeMap.get(contentType) || '';

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

  if (!aceMode) {
    return (<>
        <FormLabel className={'h4'} htmlFor={`bodyRepresentation-${invocationId}`}>{title}</FormLabel>
        <ButtonGroup className={'float-end'}>
          <Button
            variant="outline-primary"
            onClick={() => downloadBase64File(body, `file.${invocationId}.bin`, contentType)}
            title={'Save'}
          >
            <FloppyDiskIcon />
          </Button>
        </ButtonGroup>
      </>
    );
  }
  return <>
    <FormLabel className={'h4'} htmlFor={`bodyRepresentation-${invocationId}`}>{title}</FormLabel>
    {/* Word Wrap Button */}
    <ButtonGroup className={'float-end'}>
      <Button
        variant="primary"
        active={isWordWrapEnabled}
        title={isWordWrapEnabled ? 'Unwrap' : 'Wrap'}
        onClick={() => setIsWordWrapEnabled((prev) => !prev)}
      >
        <TextWrapIcon />
      </Button>
      <Button
        variant="outline-primary"
        onClick={() => downloadBase64File(body, `file.${invocationId}.bin`, contentType)}
        title={'Save'}
      >
        <FloppyDiskIcon />
      </Button>
    </ButtonGroup>
    <AceEditor
      mode={aceMode}
      theme={settings['aceTheme'].value}
      onLoad={handleLoad}
      name={`bodyRepresentation-${invocationId}`}
      value={decodeToText(body)}
      className={'rounded'}
      style={{
        resize: 'vertical',
        overflow: 'auto',
        minHeight: '200px',
      }}
      fontSize={14}
      width="100%"
      height="640px"
      showPrintMargin={true}
      showGutter={true}
      highlightActiveLine={true}
      wrapEnabled={isWordWrapEnabled}
      setOptions={{
        showLineNumbers: true,
        wrap: isWordWrapEnabled,
        useWorker: false,
        readOnly: true,
      }}
      editorProps={{ $blockScrolling: true }}
    />
  </>;
};
