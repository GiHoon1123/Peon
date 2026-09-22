'use client';

import { useState, useSyncExternalStore } from 'react';
import { Button } from '@/components/ui/button';
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalDescription,
  ModalFooter,
  ModalHeader,
  ModalTitle,
} from '@/components/app/modal';
import {
  dismissWelcomeTutorial,
  shouldShowWelcomeTutorial,
} from '@/lib/welcome-tutorial';

const YOUTUBE_VIDEO_ID = 's-o9yqc1SUc';

function subscribeNoop() {
  return () => {};
}

function getServerSnapshot() {
  return false;
}

/**
 * One-shot YouTube tutorial after a user completes onboarding.
 * Triggered via localStorage flag set in the onboarding finish flow.
 *
 * Uses useSyncExternalStore (not an effect) to read the localStorage flag:
 * it safely renders `false` on the server/first client paint and only
 * reflects the real value after hydration, avoiding a hydration mismatch
 * without manually calling setState in an effect.
 */
export function WelcomeTutorialDialog() {
  const shouldShow = useSyncExternalStore(
    subscribeNoop,
    shouldShowWelcomeTutorial,
    getServerSnapshot,
  );
  const [dismissed, setDismissed] = useState(false);
  const open = shouldShow && !dismissed;

  const dismiss = () => {
    dismissWelcomeTutorial();
    setDismissed(true);
  };

  return (
    <Modal
      open={open}
      onOpenChange={(next) => {
        if (!next) dismiss();
      }}
    >
      <ModalContent size="xl" className="sm:max-w-3xl">
        <ModalHeader>
          <ModalTitle>Quick tour of Peon</ModalTitle>
          <ModalDescription>
            Watch this short walkthrough to see how to connect a server and deploy your first app.
          </ModalDescription>
        </ModalHeader>
        <ModalBody className="p-0 sm:px-4 sm:pb-2">
          <div className="bg-muted relative aspect-video w-full overflow-hidden rounded-md">
            <iframe
              src={`https://www.youtube.com/embed/${YOUTUBE_VIDEO_ID}?rel=0`}
              title="Peon product tutorial"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              className="absolute inset-0 h-full w-full border-0"
            />
          </div>
        </ModalBody>
        <ModalFooter>
          <Button type="button" onClick={dismiss}>
            Got it
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
