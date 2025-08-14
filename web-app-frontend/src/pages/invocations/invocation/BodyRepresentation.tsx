import { Button, ButtonGroup, FormLabel } from 'react-bootstrap';
import { FloppyDiskIcon, MagicWand01Icon, TextWrapIcon } from 'hugeicons-react';
import { downloadBase64File } from '../../../utils/files';
import AceEditor from 'react-ace';
import React, { useEffect, useState } from 'react';
import { loadSettings } from '../../../settings/utils';
import { mimeToAceModeMap } from '../../../const/common.const';
import { Headers } from '../../../api/service';
import { getContentTypeFromMap } from '../../../utils/http';
import { IAceEditor } from 'react-ace/lib/types';
import { Base64 } from '@sibdevtools/frontend-common';

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

  const [decodedBody, setDecodedBody] = useState(Base64.Decoder.text2text(body));
  const contentType = getContentTypeFromMap(headers) ?? 'text/plain';
  const aceMode = mimeToAceModeMap.get(contentType) || '';

  useEffect(() => {
    setDecodedBody(Base64.Decoder.text2text(body));
  }, [body]);

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
      {
        aceMode === 'json' && (
          <Button
            variant="primary"
            type="button"
            title={'Beautify'}
            onClick={() => {
              if (!decodedBody) {
                return;
              }
              const json = JSON.parse(decodedBody);
              setDecodedBody(JSON.stringify(json, null, 4));
            }}
          >
            <MagicWand01Icon />
          </Button>
        )
      }
    </ButtonGroup>
    <AceEditor
      mode={aceMode}
      theme={settings['aceTheme'].value}
      onLoad={handleLoad}
      name={`bodyRepresentation-${invocationId}`}
      value={decodedBody}
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
