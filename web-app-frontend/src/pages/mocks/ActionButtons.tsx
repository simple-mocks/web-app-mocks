import React, { MouseEvent } from 'react';
import { Button, ButtonGroup, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { Clock01Icon, Copy01Icon, PencilEdit01Icon } from 'hugeicons-react';
import { Mock } from '../../api/service';
import { LineiconsTrash3 } from '../../const/icons';


export interface ActionButtonsProps {
  mock: Mock;
  onInvocations: () => void;
  onEdit: () => void;
  onCopy: (e: MouseEvent<HTMLButtonElement>) => void;
  onDelete: () => void;
  showTooltip: { [key: number]: boolean };
}

export const ActionButtons: React.FC<ActionButtonsProps> = ({
                                                              mock,
                                                              onInvocations,
                                                              onEdit,
                                                              onCopy,
                                                              onDelete,
                                                              showTooltip
                                                            }) => (
  <ButtonGroup>
    <Button
      variant="outline-primary"
      onClick={onInvocations}
      title={'Invocations'}
    >
      <Clock01Icon />
    </Button>
    <Button
      variant="primary"
      onClick={onEdit}
      title={'Edit'}
    >
      <PencilEdit01Icon />
    </Button>
    <OverlayTrigger show={mock.mockId in showTooltip && showTooltip[mock.mockId]} placement="top"
                    overlay={<Tooltip id={`tooltip-${mock.mockId}`}>Copied!</Tooltip>}>
      <Button
        variant="outline-info"
        onClick={onCopy}
        title={'Copy URL'}
      >
        <Copy01Icon />
      </Button>
    </OverlayTrigger>
    <Button
      variant="danger"
      onClick={onDelete}
      title={'Delete'}
    >
      <LineiconsTrash3 />
    </Button>
  </ButtonGroup>
);
